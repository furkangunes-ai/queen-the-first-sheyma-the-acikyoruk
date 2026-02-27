import { prisma } from "@/lib/prisma";
import { getOpenAI, AI_MODEL, SYSTEM_PROMPT_ANALYSIS } from "@/lib/openai";
import { checkAIAccess, isAIGuardError } from "@/lib/ai-guard";
import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export async function POST(request: NextRequest) {
  try {
    const guard = await checkAIAccess();
    if (isAIGuardError(guard)) return guard;
    const { userId } = guard;

    const { weekStartDate, weekEndDate } = await request.json();
    if (!weekStartDate || !weekEndDate) {
      return NextResponse.json({ error: "weekStartDate and weekEndDate required" }, { status: 400 });
    }

    const start = new Date(weekStartDate);
    const end = new Date(weekEndDate);

    // 1. Get weekly plan items
    const plan = await prisma.weeklyPlan.findFirst({
      where: {
        userId,
        startDate: { lte: end },
        endDate: { gte: start },
      },
      include: {
        items: {
          include: { subject: true, topic: true },
        },
      },
    });

    const plannedItems = plan?.items.length || 0;
    const completedItems = plan?.items.filter((i) => i.completed).length || 0;

    // 2. Get study data for the week
    const studies = await prisma.dailyStudy.findMany({
      where: { userId, date: { gte: start, lt: end } },
      include: { subject: true, topic: true },
    });

    const reviews = await prisma.topicReview.findMany({
      where: { userId, date: { gte: start, lt: end } },
      include: { subject: true, topic: true },
    });

    const totalStudyMinutes =
      studies.reduce((sum, s) => sum + (s.duration || 0), 0) +
      reviews.reduce((sum, r) => sum + (r.duration || 0), 0);
    const totalQuestions = studies.reduce((sum, s) => sum + s.questionCount, 0);

    // 3. Get exam net score changes
    const recentExams = await prisma.exam.findMany({
      where: { userId, date: { gte: start, lt: end } },
      include: {
        subjectResults: { include: { subject: true } },
        examType: true,
      },
      orderBy: { date: "desc" },
    });

    const previousExam = await prisma.exam.findFirst({
      where: { userId, date: { lt: start } },
      include: {
        subjectResults: { include: { subject: true } },
      },
      orderBy: { date: "desc" },
    });

    const netScoreChanges = recentExams.flatMap((exam) =>
      exam.subjectResults.map((r) => {
        const prev = previousExam?.subjectResults.find(
          (p) => p.subjectId === r.subjectId
        );
        return {
          subjectName: r.subject.name,
          previousNet: prev?.netScore || 0,
          currentNet: r.netScore,
        };
      })
    );

    // 4. Build context for AI
    const studySummary = studies.reduce((acc, s) => {
      const key = s.subject.name;
      if (!acc[key]) acc[key] = { questions: 0, correct: 0, wrong: 0, minutes: 0 };
      acc[key].questions += s.questionCount;
      acc[key].correct += s.correctCount;
      acc[key].wrong += s.wrongCount;
      acc[key].minutes += s.duration || 0;
      return acc;
    }, {} as Record<string, { questions: number; correct: number; wrong: number; minutes: number }>);

    const contextMessage = `
Haftalık Veriler (${weekStartDate} — ${weekEndDate}):

Plan Durumu: ${completedItems}/${plannedItems} madde tamamlandı (%${plannedItems > 0 ? Math.round((completedItems / plannedItems) * 100) : 0})

Çalışma Özeti:
${Object.entries(studySummary)
  .map(([name, data]) => `- ${name}: ${data.questions} soru (${data.correct}D/${data.wrong}Y), ${data.minutes} dk`)
  .join("\n") || "Bu hafta soru çözülmedi."}

Konu Tekrarları: ${reviews.length} tekrar, ${reviews.reduce((s, r) => s + (r.duration || 0), 0)} dk

${netScoreChanges.length > 0 ? `Net Değişimleri:\n${netScoreChanges.map((n) => `- ${n.subjectName}: ${n.previousNet.toFixed(1)} → ${n.currentNet.toFixed(1)} (${n.currentNet > n.previousNet ? "+" : ""}${(n.currentNet - n.previousNet).toFixed(1)})`).join("\n")}` : "Bu hafta deneme sınavı yapılmadı."}

Toplam çalışma: ${totalStudyMinutes} dakika, ${totalQuestions} soru
`;

    // 5. Call OpenAI
    let aiSummary = "";
    let aiRecommendations = "";

    try {
      const completion = await getOpenAI().chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT_ANALYSIS },
          {
            role: "user",
            content: `Bu haftanın çalışma verilerini analiz et ve gelecek hafta için öneriler sun:\n${contextMessage}`,
          },
        ],
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content || "";
      // Split AI response into summary and recommendations
      const parts = response.split(/(?=##\s*Öneri|##\s*Gelecek|##\s*Tavsiye)/i);
      aiSummary = parts[0]?.trim() || response;
      aiRecommendations = parts.slice(1).join("\n").trim() || "";
    } catch (aiError) {
      console.error("OpenAI error:", aiError);
      aiSummary = "AI analizi şu an kullanılamıyor. Veriler aşağıda özetlenmiştir.";
      aiRecommendations = "";
    }

    // 6. Upsert analysis
    const analysis = await prisma.weeklyAnalysis.upsert({
      where: {
        userId_weekStartDate: { userId, weekStartDate: start },
      },
      update: {
        weekEndDate: end,
        plannedItems,
        completedItems,
        totalStudyMinutes,
        totalQuestions,
        netScoreChanges: netScoreChanges.length > 0 ? netScoreChanges : undefined,
        aiSummary,
        aiRecommendations,
      },
      create: {
        userId,
        weekStartDate: start,
        weekEndDate: end,
        plannedItems,
        completedItems,
        totalStudyMinutes,
        totalQuestions,
        netScoreChanges: netScoreChanges.length > 0 ? netScoreChanges : undefined,
        aiSummary,
        aiRecommendations,
      },
    });

    // 7. Save as AIInsight for future context
    if (aiSummary && !aiSummary.startsWith("AI analizi şu an")) {
      try {
        await prisma.aIInsight.create({
          data: {
            userId,
            type: "weekly_analysis",
            title: `Hafta ${format(start, "d MMM", { locale: tr })} - ${format(end, "d MMM", { locale: tr })} Analizi`,
            content: aiRecommendations
              ? `${aiSummary}\n\n${aiRecommendations}`
              : aiSummary,
            context: { studySummary, netScoreChanges, plannedItems, completedItems },
            metadata: { weekStart: weekStartDate, weekEnd: weekEndDate },
          },
        });
      } catch (insightError) {
        // Insight kaydetme hatası ana akışı bozmasın
        console.error("Error saving AI insight:", insightError);
      }
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error generating weekly analysis:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
