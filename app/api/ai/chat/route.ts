import { prisma } from "@/lib/prisma";
import { getOpenAI, AI_MODEL, SYSTEM_PROMPT_CHAT } from "@/lib/openai";
import { checkAIAccess, isAIGuardError } from "@/lib/ai-guard";
import { NextRequest } from "next/server";
import { format } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const guard = await checkAIAccess();
    if (isAIGuardError(guard)) return guard;
    const { userId } = guard;

    const { message, metadata } = await request.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "message required" }), { status: 400 });
    }

    // 1. Save user message
    await prisma.aIChatMessage.create({
      data: { userId, role: "user", content: message, metadata: metadata || undefined },
    });

    // 2. Load conversation history (last 20 messages)
    const history = await prisma.aIChatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    history.reverse();

    // 3. Build user context summary (parallel queries for efficiency)
    const [knowledgeSummary, recentExams, currentPlan, recentInsights] = await Promise.all([
      getKnowledgeSummary(userId),
      getRecentExamSummary(userId),
      getCurrentPlanSummary(userId),
      getRecentInsightsSummary(userId),
    ]);

    const contextBlock = `
Öğrenci Bağlam Bilgisi:
${knowledgeSummary}
${recentExams}
${currentPlan}
${recentInsights}
`.trim();

    // 4. Stream response from OpenAI
    const stream = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: `${SYSTEM_PROMPT_CHAT}\n\n${contextBlock}` },
        ...history.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
      ],
      max_tokens: 1000,
      stream: true,
    });

    // 5. Create readable stream for SSE
    let fullResponse = "";
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              fullResponse += content;
              controller.enqueue(encoder.encode(content));
            }
          }

          // Save assistant message to DB after streaming completes
          await prisma.aIChatMessage.create({
            data: { userId, role: "assistant", content: fullResponse },
          });

          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Error in AI chat:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

async function getKnowledgeSummary(userId: string): Promise<string> {
  const knowledge = await prisma.topicKnowledge.findMany({
    where: { userId },
    include: { topic: { include: { subject: true } } },
  });

  if (knowledge.length === 0) return "Konu bilgi seviyeleri henüz girilmemiş.";

  const weakTopics = knowledge
    .filter((k) => k.level <= 2)
    .map((k) => `${k.topic.subject.name} - ${k.topic.name} (${k.level}/5)`)
    .slice(0, 10);

  const strongTopics = knowledge
    .filter((k) => k.level >= 4)
    .map((k) => `${k.topic.subject.name} - ${k.topic.name} (${k.level}/5)`)
    .slice(0, 5);

  return `Zayıf konular: ${weakTopics.join(", ") || "Yok"}
Güçlü konular: ${strongTopics.join(", ") || "Yok"}`;
}

async function getRecentExamSummary(userId: string): Promise<string> {
  const exam = await prisma.exam.findFirst({
    where: { userId },
    include: {
      subjectResults: { include: { subject: true } },
      examType: true,
    },
    orderBy: { date: "desc" },
  });

  if (!exam) return "Henüz deneme sınavı kaydı yok.";

  const totalNet = exam.subjectResults.reduce(
    (sum, r) => sum + r.netScore, 0
  );
  const details = exam.subjectResults
    .map((r) => `${r.subject.name}: ${r.netScore.toFixed(1)}`)
    .join(", ");

  return `Son deneme: ${exam.title} (${exam.examType.name}) — Toplam: ${totalNet.toFixed(1)} net — ${details}`;
}

async function getCurrentPlanSummary(userId: string): Promise<string> {
  const now = new Date();
  const plan = await prisma.weeklyPlan.findFirst({
    where: {
      userId,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: { items: true },
  });

  if (!plan) return "Aktif haftalık plan yok.";

  const completed = plan.items.filter((i) => i.completed).length;
  return `Haftalık plan: "${plan.title}" — ${completed}/${plan.items.length} tamamlandı`;
}

async function getRecentInsightsSummary(userId: string): Promise<string> {
  const insights = await prisma.aIInsight.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { type: true, title: true, content: true, createdAt: true },
  });

  if (insights.length === 0) return "";

  // Her insight'tan sadece ilk 80 kelime — token tasarrufu
  return `Son AI Analizleri:\n${insights
    .map(
      (i) =>
        `- ${i.title} (${format(i.createdAt, "d MMM")}): ${i.content
          .split(" ")
          .slice(0, 80)
          .join(" ")}...`
    )
    .join("\n")}`;
}
