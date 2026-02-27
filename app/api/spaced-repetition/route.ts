import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/spaced-repetition
 * Returns today's due review items + stats
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        wrongQuestion: {
          include: {
            exam: { select: { title: true } },
            errorReason: true,
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
    console.error("Error fetching spaced repetition items:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;

    const { itemId, quality } = await request.json();
    if (!itemId || !quality) {
      return NextResponse.json(
        { error: "itemId and quality required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const item = await prisma.spacedRepetitionItem.findFirst({
      where: { id: itemId, userId },
    });
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // SM-2 simplified algorithm
    let newInterval = item.interval;
    let newEaseFactor = item.easeFactor;
    let newStatus = item.status;

    switch (quality) {
      case "easy":
        // Correct + easy: interval * easeFactor, increase ease
        newInterval = Math.round(item.interval * item.easeFactor);
        newEaseFactor = Math.min(3.0, item.easeFactor + 0.15);
        // Master if interval > 60 days
        if (newInterval > 60) {
          newStatus = "mastered";
        }
        break;
      case "hard":
        // Correct but hard: interval * 1.5, decrease ease slightly
        newInterval = Math.max(1, Math.round(item.interval * 1.5));
        newEaseFactor = Math.max(1.3, item.easeFactor - 0.1);
        break;
      case "wrong":
        // Wrong: reset to 1 day, decrease ease
        newInterval = 1;
        newEaseFactor = Math.max(1.3, item.easeFactor - 0.2);
        break;
      default:
        return NextResponse.json({ error: "Invalid quality" }, { status: 400 });
    }

    // Calculate next review date
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating spaced repetition:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/spaced-repetition
 * Enqueue wrong questions from an exam into spaced repetition
 * Body: { examId } — adds all wrong questions from that exam
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;

    const { examId } = await request.json();
    if (!examId) {
      return NextResponse.json({ error: "examId required" }, { status: 400 });
    }

    // Get wrong questions from the exam
    const wrongQuestions = await prisma.examWrongQuestion.findMany({
      where: {
        examId,
        exam: { userId },
      },
    });

    if (wrongQuestions.length === 0) {
      return NextResponse.json({ added: 0 });
    }

    // Check which are already in the queue
    const existingIds = new Set(
      (
        await prisma.spacedRepetitionItem.findMany({
          where: {
            userId,
            wrongQuestionId: { in: wrongQuestions.map((q) => q.id) },
          },
          select: { wrongQuestionId: true },
        })
      ).map((e) => e.wrongQuestionId)
    );

    // Add new items
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const newItems = wrongQuestions
      .filter((q) => !existingIds.has(q.id))
      .map((q) => ({
        userId,
        wrongQuestionId: q.id,
        subjectId: q.subjectId,
        topicId: q.topicId || undefined,
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
    console.error("Error enqueuing spaced repetition items:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
