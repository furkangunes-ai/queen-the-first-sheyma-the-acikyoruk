import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/strategy/topic-stats
 *
 * Returns per-topic question stats:
 * - questionsSolved: total questions solved (from DailyStudy)
 * - correctCount: total correct (from DailyStudy)
 * - wrongCount: total wrong (from DailyStudy)
 * - examWrongCount: wrong questions linked to this topic (from ExamWrongQuestion)
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    // 1. Aggregate DailyStudy by topicId
    const dailyStudyStats = await prisma.dailyStudy.groupBy({
      by: ["topicId"],
      where: {
        userId,
        topicId: { not: null },
      },
      _sum: {
        questionCount: true,
        correctCount: true,
        wrongCount: true,
      },
    });

    // 2. Count ExamWrongQuestion per topicId (across all user's exams)
    const examWrongStats = await prisma.examWrongQuestion.groupBy({
      by: ["topicId"],
      where: {
        exam: { userId },
        topicId: { not: null },
      },
      _count: {
        id: true,
      },
    });

    // Build result map: topicId -> stats
    const statsMap: Record<
      string,
      {
        questionsSolved: number;
        correctCount: number;
        wrongCount: number;
        examWrongCount: number;
      }
    > = {};

    for (const entry of dailyStudyStats) {
      if (!entry.topicId) continue;
      statsMap[entry.topicId] = {
        questionsSolved: entry._sum.questionCount ?? 0,
        correctCount: entry._sum.correctCount ?? 0,
        wrongCount: entry._sum.wrongCount ?? 0,
        examWrongCount: 0,
      };
    }

    for (const entry of examWrongStats) {
      if (!entry.topicId) continue;
      if (!statsMap[entry.topicId]) {
        statsMap[entry.topicId] = {
          questionsSolved: 0,
          correctCount: 0,
          wrongCount: 0,
          examWrongCount: entry._count.id,
        };
      } else {
        statsMap[entry.topicId].examWrongCount = entry._count.id;
      }
    }

    return NextResponse.json(statsMap);
  } catch (error) {
    console.error("Error fetching topic stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
