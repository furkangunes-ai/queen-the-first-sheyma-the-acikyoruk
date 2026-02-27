import { prisma } from "@/lib/prisma";
import { getOpenAI, AI_MODEL } from "@/lib/openai";
import { checkAIAccess, isAIGuardError } from "@/lib/ai-guard";
import { NextResponse } from "next/server";
import { startOfDay, endOfDay, format, startOfWeek, addDays } from "date-fns";
import { tr } from "date-fns/locale";

export async function GET() {
  try {
    const guard = await checkAIAccess();
    if (isAIGuardError(guard)) return guard;
    const { userId } = guard;

    const today = new Date();
    const dayStart = startOfDay(today);
    const dayEnd = endOfDay(today);

    // 1. Check if today's insight already exists (cache)
    const existingInsight = await prisma.aIInsight.findFirst({
      where: {
        userId,
        type: "dashboard",
        createdAt: { gte: dayStart, lte: dayEnd },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingInsight) {
      return NextResponse.json({
        insight: existingInsight.content,
        cached: true,
      });
    }

    // 2. Gather minimal context (~400 tokens)
    const [checkIn, todayPlan, weekProgress] = await Promise.all([
      // Today's check-in
      prisma.dailyCheckIn.findFirst({
        where: { userId, date: { gte: dayStart, lte: dayEnd } },
      }),
      // Today's plan items
      (async () => {
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const todayDayOfWeek = (today.getDay() + 6) % 7; // 0=Mon, 6=Sun
        const plan = await prisma.weeklyPlan.findFirst({
          where: {
            userId,
            startDate: { lte: endOfDay(addDays(weekStart, 6)) },
            endDate: { gte: dayStart },
          },
          include: { items: { include: { subject: true, topic: true } } },
        });
        if (!plan) return null;
        const todayItems = plan.items.filter((i) => i.dayOfWeek === todayDayOfWeek);
        const weekCompleted = plan.items.filter((i) => i.completed).length;
        return { todayItems, weekTotal: plan.items.length, weekCompleted };
      })(),
      // This week's study (total minutes)
      (async () => {
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const studies = await prisma.dailyStudy.aggregate({
          where: { userId, date: { gte: weekStart } },
          _sum: { duration: true, questionCount: true },
        });
        return studies._sum;
      })(),
    ]);

    // Build compact context
    let contextParts: string[] = [];
    contextParts.push(`Tarih: ${format(today, "d MMMM yyyy, EEEE", { locale: tr })}`);

    if (checkIn) {
      const moodLabels = ["", "Kötü", "Düşük", "Normal", "İyi", "Harika"];
      contextParts.push(
        `Bugün: Ruh hali ${moodLabels[checkIn.mood || 3]}, Enerji ${checkIn.energy || 3}/5, Uyku ${checkIn.sleep || "?"} saat`
      );
    }

    if (todayPlan) {
      const todayItemsStr = todayPlan.todayItems
        .map(
          (i) =>
            `${i.subject.name}${i.topic ? `-${i.topic.name}` : ""} (${i.duration || 60}dk)${i.completed ? " ✓" : ""}`
        )
        .join(", ");
      contextParts.push(
        `Bugünkü plan: ${todayItemsStr || "Bugün planlanmış madde yok"}`
      );
      contextParts.push(
        `Haftalık ilerleme: ${todayPlan.weekCompleted}/${todayPlan.weekTotal}`
      );
    }

    if (weekProgress) {
      contextParts.push(
        `Bu hafta: ${weekProgress.duration || 0} dk çalışma, ${weekProgress.questionCount || 0} soru`
      );
    }

    const contextMessage = contextParts.join("\n");

    // 3. Call OpenAI with minimal tokens
    let insightText = "";
    try {
      const completion = await getOpenAI().chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: "system",
            content:
              "Sen bir YKS motivasyon asistanısın. 2-3 cümle kısa motivasyon mesajı ve bugün odaklanılacak 1-2 konu önerisi yaz. Türkçe yaz. Samimi ve destekleyici ol. Emojiler kullan. Sadece düz metin yaz, markdown kullanma.",
          },
          { role: "user", content: contextMessage },
        ],
        max_tokens: 300,
        temperature: 0.8,
      });
      insightText = completion.choices[0]?.message?.content || "";
    } catch (aiError) {
      console.error("Dashboard AI error:", aiError);
      // Fallback: return without AI
      return NextResponse.json({ insight: null, cached: false });
    }

    if (!insightText) {
      return NextResponse.json({ insight: null, cached: false });
    }

    // 4. Save as AIInsight (daily cache)
    await prisma.aIInsight.create({
      data: {
        userId,
        type: "dashboard",
        title: `Günlük Özet — ${format(today, "d MMM", { locale: tr })}`,
        content: insightText,
        metadata: { date: format(today, "yyyy-MM-dd") },
      },
    });

    return NextResponse.json({ insight: insightText, cached: false });
  } catch (error) {
    console.error("Error generating dashboard insight:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
