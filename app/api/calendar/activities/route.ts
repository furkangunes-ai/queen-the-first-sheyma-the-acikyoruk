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
    const monthParam = searchParams.get("month");

    // Parse month param (YYYY-MM) or default to current month
    let year: number;
    let month: number;
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split("-").map(Number);
      year = y;
      month = m - 1; // JS months are 0-indexed
    } else {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
    }

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // Fetch all data in parallel
    const [studies, exercises, reviews, weeklyPlans, checkIns] =
      await Promise.all([
        prisma.dailyStudy.findMany({
          where: {
            userId,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          orderBy: { date: "asc" },
        }),
        prisma.speedReadingExercise.findMany({
          where: {
            userId,
            createdAt: { gte: startOfMonth, lte: endOfMonth },
          },
          orderBy: { createdAt: "asc" },
        }),
        prisma.topicReview.findMany({
          where: {
            userId,
            createdAt: { gte: startOfMonth, lte: endOfMonth },
          },
          orderBy: { createdAt: "asc" },
        }),
        prisma.weeklyPlan.findMany({
          where: {
            userId,
            startDate: { lte: endOfMonth },
            endDate: { gte: startOfMonth },
          },
          include: { items: true },
        }),
        prisma.dailyCheckIn.findMany({
          where: {
            userId,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          orderBy: { date: "asc" },
        }),
      ]);

    // Initialize days map
    const days: Record<
      string,
      {
        studies: typeof studies;
        exercises: typeof exercises;
        reviews: typeof reviews;
        planItems: { item: (typeof weeklyPlans)[0]["items"][0]; planId: string }[];
        checkIn: (typeof checkIns)[0] | null;
      }
    > = {};

    const formatDateKey = (d: Date): string => {
      const dt = new Date(d);
      const yy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, "0");
      const dd = String(dt.getDate()).padStart(2, "0");
      return `${yy}-${mm}-${dd}`;
    };

    const ensureDay = (key: string) => {
      if (!days[key]) {
        days[key] = {
          studies: [],
          exercises: [],
          reviews: [],
          planItems: [],
          checkIn: null,
        };
      }
    };

    // Group studies by day
    for (const study of studies) {
      const key = formatDateKey(study.date);
      ensureDay(key);
      days[key].studies.push(study);
    }

    // Group exercises by day (uses createdAt)
    for (const exercise of exercises) {
      const key = formatDateKey(exercise.createdAt);
      ensureDay(key);
      days[key].exercises.push(exercise);
    }

    // Group reviews by day (uses createdAt)
    for (const review of reviews) {
      const key = formatDateKey(review.createdAt);
      ensureDay(key);
      days[key].reviews.push(review);
    }

    // Group weekly plan items by actual date
    // dayOfWeek: 0=Monday, 6=Sunday
    // weekStartDate is the plan's startDate (should be a Monday)
    for (const plan of weeklyPlans) {
      for (const item of plan.items) {
        const itemDate = new Date(plan.startDate);
        itemDate.setDate(itemDate.getDate() + item.dayOfWeek);

        // Only include items that fall within the requested month
        if (itemDate >= startOfMonth && itemDate <= endOfMonth) {
          const key = formatDateKey(itemDate);
          ensureDay(key);
          days[key].planItems.push({ item, planId: plan.id });
        }
      }
    }

    // Group check-ins by day
    for (const checkIn of checkIns) {
      const key = formatDateKey(checkIn.date);
      ensureDay(key);
      days[key].checkIn = checkIn;
    }

    // Compute summary
    const studyDays = new Set<string>();
    let totalDuration = 0;

    for (const study of studies) {
      studyDays.add(formatDateKey(study.date));
      if (study.duration) {
        totalDuration += study.duration * 60; // convert minutes to seconds
      }
    }

    for (const exercise of exercises) {
      totalDuration += exercise.duration; // already in seconds
    }

    for (const review of reviews) {
      if (review.duration) {
        totalDuration += review.duration * 60; // convert minutes to seconds
      }
    }

    return NextResponse.json({
      days,
      summary: {
        totalStudyDays: studyDays.size,
        totalDuration,
        totalExercises: exercises.length,
      },
    });
  } catch (error) {
    console.error("Error fetching calendar activities:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
