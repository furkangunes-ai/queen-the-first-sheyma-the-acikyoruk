import { prisma } from "@/lib/prisma";
import { getOpenAI, AI_MODEL } from "@/lib/openai";
import { checkAIAccess, isAIGuardError } from "@/lib/ai-guard";
import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const SYSTEM_PROMPT_EXAM = `Sen bir YKS deneme sınavı analisti. Türkçe konuş.
Deneme sonuçlarını detaylı analiz et:
- Güçlü ve zayıf yönleri belirle
- Konu bazlı yanlış dağılımını yorumla
- Hata nedenlerini değerlendir (dikkatsizlik vs bilgi eksikliği)
- Geçmiş deneme trendini yorumla (varsa)
- Somut çalışma önerileri sun

Kısa ve öz ol. Markdown formatında yanıtla. Başlıklar ve listeler kullan.`;

export async function POST(request: NextRequest) {
  try {
    const guard = await checkAIAccess();
    if (isAIGuardError(guard)) return guard;
    const { userId } = guard;

    const { examId } = await request.json();
    if (!examId) {
      return NextResponse.json({ error: "examId required" }, { status: 400 });
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

    // 1. Load exam data
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        examType: true,
        subjectResults: {
          include: { subject: true },
          orderBy: { subject: { sortOrder: "asc" } },
        },
        wrongQuestions: {
          include: {
            subject: true,
            topic: true,
            errorReason: true,
          },
        },
        emptyQuestions: {
          include: { subject: true, topic: true },
        },
      },
    });

    if (!exam || exam.userId !== userId) {
      return NextResponse.json({ error: "Deneme bulunamadı" }, { status: 404 });
    }

    // 2. Get previous exams for trend comparison (same exam type, last 3)
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

    // 3. Build compact context (~600 tokens)
    const totalNet = exam.subjectResults.reduce((sum, r) => sum + r.netScore, 0);

    const resultsStr = exam.subjectResults
      .map(
        (r) =>
          `${r.subject.name}: ${r.correctCount}D/${r.wrongCount}Y/${r.emptyCount}B = ${r.netScore.toFixed(1)} net`
      )
      .join("\n");

    // Group wrong questions by subject and topic
    const wrongBySubject: Record<string, string[]> = {};
    for (const wq of exam.wrongQuestions) {
      const key = wq.subject.name;
      if (!wrongBySubject[key]) wrongBySubject[key] = [];
      const detail = [
        wq.topic?.name || "Belirtilmemiş",
        wq.errorReason ? `(${wq.errorReason.label})` : "",
      ]
        .filter(Boolean)
        .join(" ");
      wrongBySubject[key].push(detail);
    }

    const wrongStr = Object.entries(wrongBySubject)
      .map(([subj, details]) => {
        // Count occurrences
        const counts: Record<string, number> = {};
        for (const d of details) {
          counts[d] = (counts[d] || 0) + 1;
        }
        const summary = Object.entries(counts)
          .map(([desc, count]) => (count > 1 ? `${desc} x${count}` : desc))
          .join(", ");
        return `${subj}: ${summary}`;
      })
      .join("\n");

    const emptyStr = exam.emptyQuestions.length > 0
      ? `Boş bırakılanlar: ${exam.emptyQuestions
          .map((eq) => `${eq.subject.name}-${eq.topic?.name || "?"}`)
          .join(", ")}`
      : "";

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

Ders Bazlı Sonuçlar:
${resultsStr}

Yanlış Soru Detayları:
${wrongStr || "Yanlış soru detayı girilmemiş."}

${emptyStr}

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
        context: { totalNet, subjectCount: exam.subjectResults.length, wrongCount: exam.wrongQuestions.length },
        metadata: { examId: exam.id, examTypeId: exam.examTypeId },
      },
    });

    return NextResponse.json({
      analysis,
      insightId: insight.id,
      cached: false,
    });
  } catch (error) {
    console.error("Error generating exam analysis:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
