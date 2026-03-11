import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { setAbsoluteMasteryForTopic } from "@/lib/cognitive-engine";
import { logApiError } from "@/lib/logger";

interface TopicAssessment {
  topicId: string;
  suggestedLevel: number;
  kazanimlar?: Array<{
    kazanimId: string;
    checked: boolean;
    note?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { topics } = (await request.json()) as { topics: TopicAssessment[] };

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json(
        { error: "En az bir konu değerlendirmesi gerekli" },
        { status: 400 }
      );
    }

    const results = {
      topicKnowledgeUpdated: 0,
      kazanimProgressUpdated: 0,
      errors: [] as string[],
    };

    // Process each topic
    for (const topic of topics) {
      try {
        const clampedLevel = Math.max(0, Math.min(5, Math.round(topic.suggestedLevel)));

        // 1. Upsert TopicKnowledge
        await prisma.topicKnowledge.upsert({
          where: { userId_topicId: { userId, topicId: topic.topicId } },
          update: { level: clampedLevel },
          create: { userId, topicId: topic.topicId, level: clampedLevel },
        });
        results.topicKnowledgeUpdated++;

        // 2. Sync cognitive graph
        const mastery = clampedLevel / 5;
        setAbsoluteMasteryForTopic(userId, topic.topicId, mastery).catch((err) =>
          logApiError("voice-assessment-save-mastery", err)
        );

        // 3. Upsert KazanimProgress if provided
        if (topic.kazanimlar && topic.kazanimlar.length > 0) {
          for (const k of topic.kazanimlar) {
            try {
              await prisma.kazanimProgress.upsert({
                where: { userId_kazanimId: { userId, kazanimId: k.kazanimId } },
                update: {
                  checked: k.checked,
                  ...(k.note !== undefined ? { notes: k.note } : {}),
                },
                create: {
                  userId,
                  kazanimId: k.kazanimId,
                  checked: k.checked,
                  notes: k.note ?? null,
                },
              });
              results.kazanimProgressUpdated++;
            } catch (err) {
              results.errors.push(`Kazanım ${k.kazanimId}: ${String(err)}`);
            }
          }
        }
      } catch (err) {
        results.errors.push(`Konu ${topic.topicId}: ${String(err)}`);
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    logApiError("voice-assessment-save", error);
    return NextResponse.json(
      { error: "Kaydetme sırasında hata oluştu" },
      { status: 500 }
    );
  }
}
