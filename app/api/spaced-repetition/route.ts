import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { recordStudyForTopic } from "@/lib/cognitive-engine";
import { logApiError } from "@/lib/logger";

/**
 * GET /api/spaced-repetition
 * Returns today's due review items + stats
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;

    const now = new Date();
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // Get due items (nextReviewDate <= today, not mastered)
    const dueItems = await prisma.spacedRepetitionItem.findMany({
      where: {
        userId,
        status: "pending",
        nextReviewDate: { lte: todayEnd },
      },
      include: {
        cognitiveVoid: {
          include: {
            exam: { select: { title: true } },
          },
        },
        subject: true,
        topic: true,
      },
      orderBy: { nextReviewDate: "asc" },
    });

    // Stats
    const stats = await prisma.spacedRepetitionItem.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    });

    const pendingCount = stats.find((s) => s.status === "pending")?._count ?? 0;
    const masteredCount = stats.find((s) => s.status === "mastered")?._count ?? 0;

    return NextResponse.json({
      dueItems,
      stats: {
        dueToday: dueItems.length,
        totalPending: pendingCount,
        totalMastered: masteredCount,
      },
    });
  } catch (error) {
    logApiError("spaced-repetition", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

/**
 * POST /api/spaced-repetition
 * Submit a review result
 * Body: { itemId, quality } where quality = "easy" | "hard" | "wrong"
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;

    const { itemId, quality } = await request.json();
    if (!itemId || !quality) {
      return NextResponse.json(
        { error: "Öğe ve kalite seçimi gerekli" },
        { status: 400 }
      );
    }

    // Verify ownership
    const item = await prisma.spacedRepetitionItem.findFirst({
      where: { id: itemId, userId },
    });
    if (!item) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }

    // SM-2 algorithm with proper initial intervals
    let newInterval = item.interval;
    let newEaseFactor = item.easeFactor;
    let newStatus = item.status;
    const rep = item.repetitionCount;

    switch (quality) {
      case "easy":
        if (rep === 0) {
          newInterval = 1;
        } else if (rep === 1) {
          newInterval = 6;
        } else {
          newInterval = Math.round(item.interval * item.easeFactor);
        }
        newEaseFactor = Math.min(3.0, item.easeFactor + 0.15);
        if (newInterval > 60) {
          newStatus = "mastered";
        }
        break;
      case "hard":
        if (rep === 0) {
          newInterval = 1;
        } else if (rep === 1) {
          newInterval = 3;
        } else {
          newInterval = Math.max(1, Math.round(item.interval * 1.2));
        }
        newEaseFactor = Math.max(1.3, item.easeFactor - 0.1);
        break;
      case "wrong":
        newInterval = 1;
        newEaseFactor = Math.max(1.3, item.easeFactor - 0.2);
        break;
      default:
        return NextResponse.json({ error: "Geçersiz kalite değeri" }, { status: 400 });
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    const updated = await prisma.spacedRepetitionItem.update({
      where: { id: itemId },
      data: {
        interval: newInterval,
        easeFactor: newEaseFactor,
        repetitionCount: { increment: 1 },
        nextReviewDate,
        status: newStatus,
      },
      include: {
        subject: true,
        topic: true,
      },
    });

    // Bilişsel çizge güncelleme
    if (updated.topicId) {
      const correctRatio = quality === "easy" ? 1.0 : quality === "hard" ? 0.6 : 0.0;
      recordStudyForTopic(userId, updated.topicId, correctRatio).catch((err) =>
        logApiError("spaced-repetition", err)
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    logApiError("spaced-repetition", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

/**
 * PUT /api/spaced-repetition
 * Enqueue cognitive voids from an exam into spaced repetition
 * Body: { examId } — adds all unresolved voids from that exam
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;

    const { examId } = await request.json();
    if (!examId) {
      return NextResponse.json({ error: "Sınav seçimi gerekli" }, { status: 400 });
    }

    // Get cognitive voids from the exam (only unresolved)
    const voids = await prisma.cognitiveVoid.findMany({
      where: {
        examId,
        exam: { userId },
        status: { not: "RESOLVED" },
      },
    });

    if (voids.length === 0) {
      return NextResponse.json({ added: 0 });
    }

    // Check which are already in the queue
    const existingIds = new Set(
      (
        await prisma.spacedRepetitionItem.findMany({
          where: {
            userId,
            cognitiveVoidId: { in: voids.map((v) => v.id) },
          },
          select: { cognitiveVoidId: true },
        })
      ).map((e) => e.cognitiveVoidId)
    );

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const newItems = voids
      .filter((v) => !existingIds.has(v.id))
      .map((v) => ({
        userId,
        cognitiveVoidId: v.id,
        subjectId: v.subjectId,
        topicId: v.topicId || undefined,
        nextReviewDate: tomorrow,
        interval: 1,
        repetitionCount: 0,
        easeFactor: 2.5,
        status: "pending",
      }));

    if (newItems.length > 0) {
      await prisma.spacedRepetitionItem.createMany({ data: newItems as any });
    }

    return NextResponse.json({
      added: newItems.length,
      alreadyExists: existingIds.size,
    });
  } catch (error) {
    logApiError("spaced-repetition", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
