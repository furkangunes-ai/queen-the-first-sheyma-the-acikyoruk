import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(request.url);
    const examTypeId = searchParams.get("examTypeId");

    // Get latest DailyStudy per topic
    const dailyStudies = await prisma.dailyStudy.groupBy({
      by: ["topicId"],
      where: {
        userId,
        topicId: { not: null },
        ...(examTypeId ? { subject: { examTypeId } } : {}),
      },
      _max: { date: true },
    });

    // Get latest TopicReview per topic
    const topicReviews = await prisma.topicReview.groupBy({
      by: ["topicId"],
      where: {
        userId,
        ...(examTypeId ? { subject: { examTypeId } } : {}),
      },
      _max: { date: true },
    });

    // Merge: take the latest date from either source
    const lastStudiedMap = new Map<string, Date>();

    for (const ds of dailyStudies) {
      if (ds.topicId && ds._max.date) {
        lastStudiedMap.set(ds.topicId, ds._max.date);
      }
    }

    for (const tr of topicReviews) {
      const existing = lastStudiedMap.get(tr.topicId);
      if (tr._max.date && (!existing || tr._max.date > existing)) {
        lastStudiedMap.set(tr.topicId, tr._max.date);
      }
    }

    const now = new Date();
    const result = Array.from(lastStudiedMap.entries()).map(([topicId, lastDate]) => ({
      topicId,
      lastStudiedDate: lastDate.toISOString(),
      daysSince: Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching last studied:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
