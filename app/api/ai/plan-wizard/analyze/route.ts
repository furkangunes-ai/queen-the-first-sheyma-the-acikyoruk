import { prisma } from "@/lib/prisma";
import { getOpenAI, AI_MODEL } from "@/lib/openai";
import { checkAIAccess, isAIGuardError } from "@/lib/ai-guard";
import { NextResponse } from "next/server";
import { format, subDays } from "date-fns";
import { tr } from "date-fns/locale";

const SYSTEM_PROMPT_ANALYZE = `Sen bir YKS stratejistisin. Öğrencinin verilerini analiz et. Türkçe konuş. Öğrenciye "sen" diye hitap et.

Görevin:
1. Öğrencinin son 2-4 haftalık çalışma verilerini, deneme sonuçlarını ve konu haritasını analiz et.
2. Kısa ve samimi bir analiz özeti yaz (4-6 cümle). Somut sayılarla destekle.
3. Analiz sonucuna göre **TAM OLARAK 2 veya 3 KİŞİSEL soru** üret (ASLA daha fazla olmasın). Bu sorular:
   - Öğrencinin gerçek durumuna özel olmalı (genel şablon DEĞİL)
   - Verilerden çıkan tespitlere dayanmalı
   - Her biri 2-4 şık içermeli
   - Strateji belirlemeye yönelik olmalı
   - "Bu hafta..." veya "Önümüzdeki hafta..." gibi başlamalı

ÖNEMLİ: TYT/AYT tercihi ve ders seçimi gibi sorular SORMA — bunlar ayrıca sorulacak. Sen sadece çalışma düzeni ve strateji soruları sor:
- Çalışma düzenini sor (kaç saat, hangi günler)
- Müsait olmayan günleri sor
- Mola/dinlenme tercihini sor
- Zayıf konulara odaklanma stratejisi sor
- Varsa deneme performansına göre strateji sor

JSON formatında yanıt ver, başka bir şey yazma:
{
  "analysis": "Analiz özeti metni... (4-6 cümle, samimi ton)",
  "weakAreas": ["Matematik - Türev", "Fizik - Optik"],
  "strongAreas": ["Türkçe - Paragraf", "Biyoloji - Hücre"],
  "stats": {
    "avgDailyHours": 2.5,
    "totalStudyDays": 10,
    "mostStudiedSubject": "Matematik",
    "leastStudiedSubject": "Fizik"
  },
  "questions": [
    {
      "id": "q1",
      "question": "Soru metni...",
      "options": ["Şık 1", "Şık 2", "Şık 3"],
      "context": "Bu soru neden soruldu (kısa)"
    }
  ]
}`;

export async function POST() {
  try {
    const guard = await checkAIAccess();
    if (isAIGuardError(guard)) return guard;
    const { userId } = guard;

    // Fetch user's exam track for subject filtering
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { examTrack: true } });
    const examTrack = user?.examTrack;

    const now = new Date();
    const fourWeeksAgo = subDays(now, 28);
    const twoWeeksAgo = subDays(now, 14);

    // Gather all student data in parallel
    const [
      weakTopics,
      strongTopics,
      recentExams,
      studyDistribution,
      dailyStudyDetails,
      topicReviews,
      recentInsights,
      allSubjects,
    ] = await Promise.all([
      // Weak topics (knowledge level 0-3)
      prisma.topicKnowledge.findMany({
        where: { userId, level: { lte: 3 } },
        include: { topic: { include: { subject: { include: { examType: true } } } } },
        orderBy: { level: "asc" },
        take: 25,
      }),
      // Strong topics (knowledge level 4-5)
      prisma.topicKnowledge.findMany({
        where: { userId, level: { gte: 4 } },
        include: { topic: { include: { subject: true } } },
        orderBy: { level: "desc" },
        take: 10,
      }),
      // Last 2 exams with wrong/empty questions
      prisma.exam.findMany({
        where: { userId },
        include: {
          subjectResults: { include: { subject: true } },
          wrongQuestions: { include: { subject: true, topic: true } },
          emptyQuestions: { include: { subject: true, topic: true } },
          examType: true,
        },
        orderBy: { date: "desc" },
        take: 2,
      }),
      // Last 4 weeks study distribution by subject
      prisma.dailyStudy.groupBy({
        by: ["subjectId"],
        where: {
          userId,
          date: { gte: fourWeeksAgo },
        },
        _sum: { duration: true, questionCount: true, correctCount: true, wrongCount: true },
        _count: true,
      }),
      // Daily study details for pattern analysis (last 2 weeks)
      prisma.dailyStudy.findMany({
        where: {
          userId,
          date: { gte: twoWeeksAgo },
        },
        include: { subject: true, topic: true },
        orderBy: { date: "desc" },
      }),
      // Topic reviews (last 4 weeks)
      prisma.topicReview.findMany({
        where: {
          userId,
          date: { gte: fourWeeksAgo },
        },
        include: { subject: true, topic: true },
        orderBy: { date: "desc" },
        take: 30,
      }),
      // Recent AI insights
      prisma.aIInsight.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 2,
        select: { title: true, content: true },
      }),
      // All subjects for reference
      prisma.subject.findMany({
        include: { topics: true, examType: true },
      }),
    ]);

    // Filter subjects by exam track
    // TYT subjects always shown; AYT subjects filtered by track
    const filteredSubjects = examTrack ? allSubjects.filter(s => {
      const isAYT = s.examType.slug === "ayt" || s.examType.name === "AYT";
      if (!isAYT) return true;
      const excluded: Record<string, string[]> = {
        sayisal: ["Edebiyat", "Tarih", "Coğrafya"],
        ea: ["Fizik", "Kimya", "Biyoloji"],
        sozel: ["Fizik", "Kimya", "Biyoloji", "Matematik"],
      };
      return !(excluded[examTrack] || []).includes(s.name);
    }) : allSubjects;

    // Build subject ID → name map
    const subjectIdToName = new Map<string, string>();
    for (const subject of filteredSubjects) {
      subjectIdToName.set(subject.id, subject.name);
    }

    // --- Build context strings ---

    // Weak topics
    const weakTopicsStr = weakTopics
      .map((tk) => `${tk.topic.subject.name} - ${tk.topic.name} (seviye ${tk.level})`)
      .join(", ");

    // Strong topics
    const strongTopicsStr = strongTopics
      .map((tk) => `${tk.topic.subject.name} - ${tk.topic.name} (seviye ${tk.level})`)
      .join(", ");

    // Exam results
    const examsStr = recentExams
      .map((exam) => {
        const results = exam.subjectResults
          .map((r) => `${r.subject.name}: ${r.netScore.toFixed(1)} net`)
          .join(", ");
        const wrongTopics = exam.wrongQuestions
          .filter((w) => w.topic)
          .map((w) => `${w.subject.name}-${w.topic!.name}`)
          .join(", ");
        return `${exam.examType.name} "${exam.title}" (${format(exam.date, "d MMM", { locale: tr })}): ${results}${wrongTopics ? ` | Yanlış konular: ${wrongTopics}` : ""}`;
      })
      .join("\n");

    // Study distribution
    const studyStr = studyDistribution
      .map((s) => {
        const name = subjectIdToName.get(s.subjectId) || "?";
        const totalMin = s._sum.duration || 0;
        const totalQ = s._sum.questionCount || 0;
        const totalCorrect = s._sum.correctCount || 0;
        const totalWrong = s._sum.wrongCount || 0;
        const accuracy = totalQ > 0 ? Math.round(((totalCorrect) / totalQ) * 100) : 0;
        return `${name}: ${Math.round(totalMin / 60)}sa ${totalMin % 60}dk, ${totalQ} soru (${accuracy}% doğru), ${s._count} gün`;
      })
      .join("\n");

    // Daily study pattern (which days studied, how much)
    const studyDays = new Set(dailyStudyDetails.map((d) => format(d.date, "yyyy-MM-dd")));
    const daysSinceStart = Math.max(1, Math.round((now.getTime() - twoWeeksAgo.getTime()) / (24 * 60 * 60 * 1000)));
    const studyDayCount = studyDays.size;
    const avgDailyMinutes = dailyStudyDetails.reduce((sum, d) => sum + (d.duration || 0), 0) / Math.max(1, studyDayCount);

    // Topics studied recently (for context)
    const recentTopicStudy = dailyStudyDetails
      .filter((d) => d.topic)
      .slice(0, 15)
      .map((d) => `${d.subject.name}-${d.topic!.name}: ${d.questionCount} soru, ${d.duration || 0}dk`)
      .join(", ");

    // Topic reviews
    const reviewsStr = topicReviews
      .slice(0, 10)
      .map((r) => `${r.subject.name}-${r.topic.name} (${r.confidence || "?"})`)
      .join(", ");

    // Subjects NOT studied at all
    const studiedSubjectIds = new Set(studyDistribution.map((s) => s.subjectId));
    const unstudiedSubjects = filteredSubjects
      .filter((s) => !studiedSubjectIds.has(s.id))
      .map((s) => `${s.examType.name}-${s.name}`)
      .join(", ");

    // Past insights
    const insightsStr = recentInsights
      .map((i) => i.content.split(" ").slice(0, 40).join(" "))
      .join(" | ");

    // Build the context message
    const examTrackLabel = examTrack === "sayisal" ? "Sayısal" : examTrack === "ea" ? "Eşit Ağırlık" : examTrack === "sozel" ? "Sözel" : "Belirlenmedi";
    const contextMessage = `Tarih: ${format(now, "d MMMM yyyy", { locale: tr })}
Alan: ${examTrackLabel}

=== ÇALIŞMA VERİLERİ (Son 4 Hafta) ===
Ders bazlı dağılım:
${studyStr || "Henüz çalışma verisi yok."}

Çalışma düzeni: Son 14 günde ${studyDayCount}/${daysSinceStart} gün çalışılmış, günlük ortalama ${Math.round(avgDailyMinutes)} dakika.
${unstudiedSubjects ? `Hiç çalışılmamış dersler: ${unstudiedSubjects}` : ""}

${recentTopicStudy ? `Son çalışılan konular: ${recentTopicStudy}` : ""}

=== KONU HAKİMİYET HARİTASI ===
Zayıf konular (seviye 0-3): ${weakTopicsStr || "Henüz belirlenmemiş"}
Güçlü konular (seviye 4-5): ${strongTopicsStr || "Henüz belirlenmemiş"}

=== DENEME SONUÇLARI ===
${examsStr || "Henüz deneme kaydı yok."}

=== KONU TEKRARLARİ ===
${reviewsStr || "Henüz tekrar kaydı yok."}

${insightsStr ? `=== GEÇMİŞ AI ÖNERİLERİ ===\n${insightsStr}` : ""}`.trim();

    // Call OpenAI
    const completion = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT_ANALYZE },
        { role: "user", content: contextMessage },
      ],
    });

    const rawResponse = completion.choices[0]?.message?.content || "";

    // Parse JSON response
    let parsed;
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse AI analyze response:", rawResponse);
      return NextResponse.json(
        { error: "AI yanıtı işlenemedi. Lütfen tekrar deneyin." },
        { status: 500 }
      );
    }

    // Validate structure
    if (!parsed.analysis || !Array.isArray(parsed.questions)) {
      return NextResponse.json(
        { error: "AI yanıtı geçersiz format. Lütfen tekrar deneyin." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      analysis: parsed.analysis,
      weakAreas: parsed.weakAreas || [],
      strongAreas: parsed.strongAreas || [],
      stats: parsed.stats || {},
      questions: parsed.questions.slice(0, 3).map((q: any, idx: number) => ({
        id: q.id || `q${idx + 1}`,
        question: q.question,
        options: q.options || [],
        context: q.context || "",
      })),
    });
  } catch (error) {
    console.error("Error in plan wizard analyze:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
