import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { recordStudyForTopic } from "@/lib/cognitive-engine";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(request.url);
    const examTypeId = searchParams.get("examTypeId");

    const where: any = { userId };
    if (examTypeId) {
      where.topic = { subject: { examTypeId } };
    }

    const knowledge = await prisma.topicKnowledge.findMany({
      where,
      include: {
        topic: {
          include: {
            subject: {
              include: { examType: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(knowledge);
  } catch (error) {
    console.error("Error fetching topic knowledge:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { topicId, level } = await request.json();
    if (!topicId || level === undefined) {
      return NextResponse.json({ error: "Konu ve seviye gerekli" }, { status: 400 });
    }

    // Validate level range (0-5)
    const clampedLevel = Math.max(0, Math.min(5, Math.round(level)));

    const knowledge = await prisma.topicKnowledge.upsert({
      where: { userId_topicId: { userId, topicId } },
      update: { level: clampedLevel },
      create: { userId, topicId, level: clampedLevel },
      include: {
        topic: {
          include: {
            subject: { include: { examType: true } },
          },
        },
      },
    });

    // Bilişsel çizge senkronizasyonu: topic bilgi seviyesini mastery'ye dönüştür
    // Seviye 0→0.0, 1→0.2, 2→0.4, 3→0.6, 4→0.8, 5→1.0
    const correctRatio = clampedLevel / 5;
    recordStudyForTopic(userId, topicId, correctRatio).catch((err) =>
      console.error("Cognitive engine sync error:", err)
    );

    return NextResponse.json(knowledge);
  } catch (error) {
    console.error("Error updating topic knowledge:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
