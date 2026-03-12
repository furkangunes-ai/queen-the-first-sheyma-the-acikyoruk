import { prisma } from "@/lib/prisma";
import { getOpenAI, AI_MODEL } from "@/lib/openai";
import { checkPremiumAIAccess, isAIGuardError } from "@/lib/ai-guard";
import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { logApiError } from "@/lib/logger";
import { ERROR_REASON_LABELS, type ErrorReasonType } from "@/lib/severity";

const SYSTEM_PROMPT_EXAM = `Sen bir YKS deneme sınavı analisti ve kognitif zafiyet uzmanısın. Türkçe konuş.
Deneme sonuçlarını ve kognitif zafiyetleri (Cognitive Voids) detaylı analiz et:
- Güçlü ve zayıf yönleri belirle
- Konu bazlı zafiyet dağılımını ve severity (şiddet) skorlarını yorumla
- Hata kök nedenlerini (ErrorReason) değerlendir ve birbirleriyle karşılaştır
- Çevresel bağlamı (zaman, ortam, enerji durumu) performansla ilişkilendir
- Geçmiş deneme trendini yorumla (varsa)
- Somut ve eyleme geçirilebilir (actionable) çalışma önerileri sun
- En yüksek severity'ye sahip zafiyetleri önceliklendir

Kısa ve öz ol. Markdown formatında yanıtla. Başlıklar ve listeler kullan.`;

export async function POST(request: NextRequest) {
  try {
    const guard = await checkPremiumAIAccess();
    if (isAIGuardError(guard)) return guard;
    const { userId } = guard;

    const { examId } = await request.json();
    if (!examId) {
      return NextResponse.json({ error: "Sınav seçimi gerekli" }, { status: 400 });
    }

    // Check if insight already exists for this exam
    const existingInsight = await prisma.aIInsight.findFirst({
      where: { userId, type: "exam_analysis", metadata: { path: ["examId"], equals: examId } },
    });
    if (existingInsight) {
      return NextResponse.json({
        analysis: existingInsight.content,
        insightId: existingInsight.id,
        cached: true,
      });
    }

    // 1. Load exam data with cognitive voids
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        examType: true,
        subjectResults: {
          include: { subject: true },
          orderBy: { subject: { sortOrder: "asc" } },
        },
        cognitiveVoids: {
          include: {
            subject: true,
            topic: true,
          },
          orderBy: { severity: "desc" },
        },
      },
    });

    if (!exam || exam.userId !== userId) {
      return NextResponse.json({ error: "Deneme bulunamadı" }, { status: 404 });
    }

    // 2. Get previous exams for trend comparison
    const previousExams = await prisma.exam.findMany({
      where: {
        userId,
        examTypeId: exam.examTypeId,
        date: { lt: exam.date },
      },
      include: {
        subjectResults: { include: { subject: true } },
      },
      orderBy: { date: "desc" },
      take: 3,
    });

    // 3. Build context
    const totalNet = exam.subjectResults.reduce((sum, r) => sum + r.netScore, 0);

    const resultsStr = exam.subjectResults
      .map(
        (r) =>
          `${r.subject.name}: ${r.correctCount}D/${r.wrongCount}Y/${r.emptyCount}B = ${r.netScore.toFixed(1)} net`
      )
      .join("\n");

    // Group cognitive voids by subject
    const voidsBySubject: Record<string, string[]> = {};
    for (const v of exam.cognitiveVoids) {
      const key = v.subject.name;
      if (!voidsBySubject[key]) voidsBySubject[key] = [];
      const reasonLabel = ERROR_REASON_LABELS[v.errorReason as ErrorReasonType] || v.errorReason;
      const detail = [
        v.topic?.name || "Belirtilmemiş",
        `(${reasonLabel})`,
        v.magnitude > 1 ? `x${v.magnitude}` : "",
        `[severity: ${v.severity.toFixed(1)}]`,
        `[${v.status}]`,
        v.source === "EMPTY" ? "[Boş]" : "",
      ]
        .filter(Boolean)
        .join(" ");
      voidsBySubject[key].push(detail);
    }

    const voidsStr = Object.entries(voidsBySubject)
      .map(([subj, details]) => `${subj}: ${details.join(", ")}`)
      .join("\n");

    // Context fields
    const contextFields = [
      exam.timeOfDay && `Zaman: ${exam.timeOfDay}`,
      exam.environment && `Ortam: ${exam.environment}`,
      exam.perceivedDifficulty && `Algılanan Zorluk: ${exam.perceivedDifficulty}/5`,
      exam.biologicalState && `Biyolojik Durum: ${exam.biologicalState}`,
    ].filter(Boolean).join(", ");

    // Trend info
    let trendStr = "";
    if (previousExams.length > 0) {
      const prevTotals = previousExams.map((pe) => {
        const total = pe.subjectResults.reduce((sum, r) => sum + r.netScore, 0);
        return `${format(pe.date, "d MMM", { locale: tr })}: ${total.toFixed(1)} net`;
      });
      trendStr = `Geçmiş denemeler (${exam.examType.name}): ${prevTotals.join(", ")} → Bu deneme: ${totalNet.toFixed(1)} net`;
    }

    const contextMessage = `Deneme: ${exam.title} (${exam.examType.name}) — ${format(exam.date, "d MMMM yyyy", { locale: tr })}
Toplam Net: ${totalNet.toFixed(1)}
${contextFields ? `Bağlam: ${contextFields}` : ""}

Ders Bazlı Sonuçlar:
${resultsStr}

Kognitif Zafiyetler (Severity sıralı):
${voidsStr || "Zafiyet analizi henüz yapılmamış."}

${trendStr}`.trim();

    // 4. Call OpenAI
    const completion = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT_EXAM },
        { role: "user", content: `Bu deneme sonuçlarını analiz et:\n\n${contextMessage}` },
      ],
    });

    const analysis = completion.choices[0]?.message?.content || "";

    // 5. Save as AI Insight
    const insight = await prisma.aIInsight.create({
      data: {
        userId,
        type: "exam_analysis",
        title: `${exam.title} Analizi`,
        content: analysis,
        context: { totalNet, subjectCount: exam.subjectResults.length, voidCount: exam.cognitiveVoids.length },
        metadata: { examId: exam.id, examTypeId: exam.examTypeId },
      },
    });

    return NextResponse.json({
      analysis,
      insightId: insight.id,
      cached: false,
    });
  } catch (error) {
    logApiError("ai/exam-analysis", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
