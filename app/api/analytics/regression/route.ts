import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getTurkeyDateString } from "@/lib/utils";

// ─── OLS Linear Regression (pure TypeScript) ───────────────────────

interface DataPoint {
  x: number; // days since first exam
  y: number; // total net score
  date: string;
  examTitle: string;
}

interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  standardError: number;
  n: number;
  dataPoints: DataPoint[];
  trendLine: Array<{ date: string; predicted: number; lower: number; upper: number }>;
  predictions: Array<{
    targetNet: number;
    estimatedDate: string | null;
    daysFromNow: number | null;
    confidence: number; // percentage
    lowerDate: string | null;
    upperDate: string | null;
  }>;
  weeklyGrowth: number;
  dailyGrowth: number;
  currentEstimate: number;
}

function linearRegression(points: DataPoint[]): {
  slope: number;
  intercept: number;
  rSquared: number;
  standardError: number;
  meanX: number;
  ssX: number;
} {
  const n = points.length;
  if (n < 2) {
    return { slope: 0, intercept: points[0]?.y || 0, rSquared: 0, standardError: 0, meanX: 0, ssX: 0 };
  }

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) {
    return { slope: 0, intercept: sumY / n, rSquared: 0, standardError: 0, meanX: sumX / n, ssX: 0 };
  }

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // R-squared
  const meanY = sumY / n;
  let ssTot = 0, ssRes = 0;
  for (const p of points) {
    const predicted = slope * p.x + intercept;
    ssTot += (p.y - meanY) ** 2;
    ssRes += (p.y - predicted) ** 2;
  }
  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  // Standard error of estimate
  const standardError = n > 2 ? Math.sqrt(ssRes / (n - 2)) : 0;

  const meanX = sumX / n;
  const ssX = sumX2 - (sumX * sumX) / n;

  return { slope, intercept, rSquared, standardError, meanX, ssX };
}

// t-distribution critical value approximation (two-tailed, 95%)
function tCritical(df: number): number {
  if (df <= 0) return 2.0;
  // Approximate t-distribution critical values for 95% CI
  const tValues: Record<number, number> = {
    1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
    6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
    15: 2.131, 20: 2.086, 25: 2.060, 30: 2.042, 40: 2.021,
    60: 2.000, 120: 1.980,
  };
  if (tValues[df]) return tValues[df];
  // Find closest
  const keys = Object.keys(tValues).map(Number).sort((a, b) => a - b);
  for (let i = 0; i < keys.length - 1; i++) {
    if (df >= keys[i] && df <= keys[i + 1]) {
      // Linear interpolation
      const ratio = (df - keys[i]) / (keys[i + 1] - keys[i]);
      return tValues[keys[i]] + ratio * (tValues[keys[i + 1]] - tValues[keys[i]]);
    }
  }
  return 1.96; // large sample approximation
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  return getTurkeyDateString(date);
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(request.url);
    const examTypeId = searchParams.get("examTypeId");
    const targetsParam = searchParams.get("targets") || "70,80,90,100";
    const targets = targetsParam.split(",").map(Number).filter(n => !isNaN(n));

    // Fetch exams with subject results
    const exams = await prisma.exam.findMany({
      where: {
        userId,
        ...(examTypeId && { examTypeId }),
      },
      include: {
        examType: true,
        subjectResults: {
          include: { subject: true },
        },
      },
      orderBy: { date: "asc" },
    });

    if (exams.length === 0) {
      return NextResponse.json({
        slope: 0,
        intercept: 0,
        rSquared: 0,
        standardError: 0,
        n: 0,
        dataPoints: [],
        trendLine: [],
        predictions: [],
        weeklyGrowth: 0,
        dailyGrowth: 0,
        currentEstimate: 0,
      });
    }

    // Convert exams to data points
    const firstDate = new Date(exams[0].date);
    const dataPoints: DataPoint[] = exams.map(exam => {
      const totalNet = exam.subjectResults.reduce((sum, sr) => sum + sr.netScore, 0);
      const daysDiff = Math.round(
        (new Date(exam.date).getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        x: daysDiff,
        y: totalNet,
        date: formatDate(new Date(exam.date)),
        examTitle: exam.title,
      };
    });

    // Run regression
    const { slope, intercept, rSquared, standardError, meanX, ssX } = linearRegression(dataPoints);

    const n = dataPoints.length;
    const today = new Date();
    const todayX = Math.round(
      (today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const t = tCritical(Math.max(1, n - 2));

    // Generate trend line: from first exam to 90 days in the future
    const lastX = dataPoints[dataPoints.length - 1].x;
    const futureEnd = todayX + 90;
    const trendLine: Array<{ date: string; predicted: number; lower: number; upper: number }> = [];

    // Sample points for the trend line
    const step = Math.max(1, Math.round((futureEnd - 0) / 60)); // ~60 data points
    for (let x = 0; x <= futureEnd; x += step) {
      const predicted = slope * x + intercept;
      // Prediction interval
      const margin = n > 2
        ? t * standardError * Math.sqrt(1 + 1 / n + ((x - meanX) ** 2) / (ssX || 1))
        : standardError * 2;
      trendLine.push({
        date: formatDate(addDays(firstDate, x)),
        predicted: Number(predicted.toFixed(2)),
        lower: Number((predicted - margin).toFixed(2)),
        upper: Number((predicted + margin).toFixed(2)),
      });
    }

    // Predictions for target nets
    const predictions = targets.map(targetNet => {
      if (slope <= 0) {
        // No positive progress — can't predict
        return {
          targetNet,
          estimatedDate: null,
          daysFromNow: null,
          confidence: 0,
          lowerDate: null,
          upperDate: null,
        };
      }

      const targetX = (targetNet - intercept) / slope;
      const targetDate = addDays(firstDate, Math.round(targetX));
      const daysFromNow = Math.round(targetX) - todayX;

      // Is the target already achieved?
      const currentEstimate = slope * todayX + intercept;
      if (currentEstimate >= targetNet) {
        return {
          targetNet,
          estimatedDate: formatDate(today),
          daysFromNow: 0,
          confidence: Math.min(100, Math.round(rSquared * 100)),
          lowerDate: formatDate(today),
          upperDate: formatDate(today),
        };
      }

      // Confidence interval on the date
      let lowerDate: string | null = null;
      let upperDate: string | null = null;
      if (n > 2 && standardError > 0) {
        // Upper bound net arrives earlier (optimistic)
        const marginAtTarget = t * standardError * Math.sqrt(
          1 + 1 / n + ((targetX - meanX) ** 2) / (ssX || 1)
        );
        const optimisticX = (targetNet - marginAtTarget - intercept) / slope;
        const pessimisticX = (targetNet + marginAtTarget - intercept) / slope;

        if (optimisticX > 0) {
          lowerDate = formatDate(addDays(firstDate, Math.round(Math.min(optimisticX, pessimisticX))));
        }
        upperDate = formatDate(addDays(firstDate, Math.round(Math.max(optimisticX, pessimisticX))));
      }

      return {
        targetNet,
        estimatedDate: daysFromNow > -3650 && daysFromNow < 3650 ? formatDate(targetDate) : null,
        daysFromNow: daysFromNow > -3650 && daysFromNow < 3650 ? daysFromNow : null,
        confidence: Math.min(100, Math.round(rSquared * 100)),
        lowerDate,
        upperDate,
      };
    });

    const currentEstimate = slope * todayX + intercept;

    const result: RegressionResult = {
      slope,
      intercept,
      rSquared,
      standardError,
      n,
      dataPoints,
      trendLine,
      predictions,
      weeklyGrowth: Number((slope * 7).toFixed(2)),
      dailyGrowth: Number(slope.toFixed(4)),
      currentEstimate: Number(currentEstimate.toFixed(1)),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error computing regression:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
