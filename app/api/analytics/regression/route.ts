import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getTurkeyDateString } from "@/lib/utils";
import { logApiError } from "@/lib/logger";
import { buildExamCategoryWhere } from "@/lib/exam-metrics";

// ─── OLS Linear Regression + Asimptotik Sönümleme ───────────────────

interface DataPoint {
  x: number; // days since first exam
  y: number; // total net score
  date: string;
  examTitle: string;
}

// Response type — inline kullanılıyor, tip sadece referans olarak tutuluyor
// predictions[].beyondYKS: true ise hedef YKS'den sonra ulaşılabilir
// yksDate, daysToYKS, yksEstimate: YKS 2026 bilgileri

// ─── Tavan (Ceiling) Değerleri ───
// TYT: 120 net mutlak sınır (40 Türkçe + 40 Mat + 20 Fen + 20 Sosyal)
// AYT: Branş bazlı tavanlar:
//   - AYT Fen (Fizik+Kimya+Biyoloji) = 40 net
//   - AYT Sosyal = 40 net
//   - AYT Matematik = 40 net
//   - AYT Edebiyat-Sosyal1 = 40 net
//   - AYT genel (tüm dersler) = 80 net
// Ders bazlı: dersin questionCount değeri
const CEILING_TYT = 120;
const CEILING_AYT_GENEL = 80;
const DEFAULT_CEILING = 120;

// Branş deneme tavanları (examCategory → ceiling)
const BRANS_CEILINGS: Record<string, number> = {
  'brans-fen': 40,
  'brans-sosyal': 40,
  'brans-matematik': 40,
  'brans-edebiyat-sosyal1': 40,
  'brans-sosyal2': 40,
  'brans': 40, // tek ders branş
};

// ─── YKS 2026 Sınır Tarihi ───
// Projeksiyon bu tarihten sonrası için anlamsız
const YKS_2026_DATE = new Date('2026-06-21T00:00:00+03:00');

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

  const meanY = sumY / n;
  let ssTot = 0, ssRes = 0;
  for (const p of points) {
    const predicted = slope * p.x + intercept;
    ssTot += (p.y - meanY) ** 2;
    ssRes += (p.y - predicted) ** 2;
  }
  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  const standardError = n > 2 ? Math.sqrt(ssRes / (n - 2)) : 0;

  const meanX = sumX / n;
  const ssX = sumX2 - (sumX * sumX) / n;

  return { slope, intercept, rSquared, standardError, meanX, ssX };
}

/**
 * Asimptotik Sönümleme (Damping) Fonksiyonu
 *
 * Aksiyom: İnsan öğrenmesi doğrusal değildir. Tavana yaklaştıkça eğim azalır.
 * Model: damped_y = ceiling * (1 - e^(-k * linear_y / ceiling))
 *
 * Bu, lineer tahmin değerini lojistik benzeri bir eğriye dönüştürür.
 * - linear_y düşükken: damped_y ≈ linear_y (neredeyse lineer)
 * - linear_y tavana yaklaştıkça: damped_y → ceiling (asimptotik)
 *
 * k parametresi: sönümleme agresifliği (1.0-2.0 arası)
 */
function applyDamping(linearY: number, ceiling: number, k: number = 1.5): number {
  if (ceiling <= 0) return linearY;
  if (linearY <= 0) return 0;

  // Normalize: linearY'nin tavana oranı
  const ratio = linearY / ceiling;

  // Sönümlenmiş değer: ceiling * (1 - e^(-k * ratio))
  const dampedRatio = 1 - Math.exp(-k * ratio);
  const dampedY = ceiling * dampedRatio;

  // Negatif olamaz, tavandan büyük olamaz
  return Math.max(0, Math.min(ceiling, dampedY));
}

/**
 * Sönümlenmiş modelden "hedef nete kaç gün?" hesapla
 * Lineer modelde: x = (target - intercept) / slope
 * Sönümlenmiş modelde: ters fonksiyon ile çöz
 *
 * damped_y = ceiling * (1 - e^(-k * (slope * x + intercept) / ceiling))
 * Ters çöz: x = (ceiling * (-ln(1 - target/ceiling)) / k - intercept) / slope
 */
function inverseDamping(targetY: number, ceiling: number, k: number = 1.5): number | null {
  if (targetY >= ceiling) return null; // Tavana ulaşılamaz
  if (targetY <= 0) return 0;

  const ratio = targetY / ceiling;
  if (ratio >= 1) return null;

  // Ters formül: linear_y = ceiling * (-ln(1 - ratio)) / k
  const linearY = ceiling * (-Math.log(1 - ratio)) / k;
  return linearY;
}

function tCritical(df: number): number {
  if (df <= 0) return 2.0;
  const tValues: Record<number, number> = {
    1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
    6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
    15: 2.131, 20: 2.086, 25: 2.060, 30: 2.042, 40: 2.021,
    60: 2.000, 120: 1.980,
  };
  if (tValues[df]) return tValues[df];
  const keys = Object.keys(tValues).map(Number).sort((a, b) => a - b);
  for (let i = 0; i < keys.length - 1; i++) {
    if (df >= keys[i] && df <= keys[i + 1]) {
      const ratio = (df - keys[i]) / (keys[i + 1] - keys[i]);
      return tValues[keys[i]] + ratio * (tValues[keys[i + 1]] - tValues[keys[i]]);
    }
  }
  return 1.96;
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
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(request.url);
    const examTypeId = searchParams.get("examTypeId");
    const subjectId = searchParams.get("subjectId");
    const examCategory = searchParams.get("examCategory");
    const targetsParam = searchParams.get("targets");
    // Hedef netler: kullanıcı belirtmezse ceiling'e göre otomatik oluştur
    let targets: number[];
    if (targetsParam) {
      targets = targetsParam.split(",").map(Number).filter(n => !isNaN(n));
    } else {
      targets = []; // will be filled after ceiling is determined
    }

    const exams = await prisma.exam.findMany({
      where: {
        userId,
        ...(examTypeId && { examTypeId }),
        ...buildExamCategoryWhere(examCategory),
        ...(subjectId && {
          subjectResults: {
            some: { subjectId },
          },
        }),
      },
      include: {
        examType: true,
        subjectResults: {
          include: { subject: true },
          ...(subjectId && {
            where: { subjectId },
          }),
        },
      },
      orderBy: { date: "asc" },
    });

    if (exams.length === 0) {
      return NextResponse.json({
        slope: 0, intercept: 0, rSquared: 0, standardError: 0, n: 0,
        dataPoints: [], trendLine: [], predictions: [],
        weeklyGrowth: 0, dailyGrowth: 0, currentEstimate: 0, ceiling: DEFAULT_CEILING,
      });
    }

    // Determine ceiling — branş + ders bazlı doğru tavanlar
    let ceiling = DEFAULT_CEILING;
    if (subjectId) {
      // Ders bazlı: dersin soru sayısı (questionCount)
      const subject = await prisma.subject.findUnique({ where: { id: subjectId }, select: { questionCount: true } });
      if (subject) ceiling = subject.questionCount;
    } else if (examCategory && BRANS_CEILINGS[examCategory]) {
      // Branş denemesi: sabit tavan
      ceiling = BRANS_CEILINGS[examCategory];
    } else if (examTypeId) {
      const examType = await prisma.examType.findUnique({ where: { id: examTypeId }, select: { slug: true } });
      ceiling = examType?.slug === 'ayt' ? CEILING_AYT_GENEL : CEILING_TYT;
    }

    // Auto-generate targets based on ceiling if not provided
    if (targets.length === 0) {
      if (ceiling <= 40) {
        // Branş/ders bazlı: 15, 20, 25, 30, 35, 40
        targets = [15, 20, 25, 30, 35, Math.min(40, ceiling)].filter(t => t <= ceiling);
      } else if (ceiling <= 80) {
        // AYT genel: 30, 40, 50, 60, 70, 80
        targets = [30, 40, 50, 60, 70, Math.min(80, ceiling)].filter(t => t <= ceiling);
      } else {
        // TYT: 50, 60, 70, 80, 90, 100, 110, 120
        targets = [50, 60, 70, 80, 90, 100, 110, 120].filter(t => t <= ceiling);
      }
    }
    // Filter out targets that exceed ceiling
    targets = targets.filter(t => t <= ceiling);

    // Convert exams to data points
    const firstDate = new Date(exams[0].date);
    const dataPoints: DataPoint[] = exams.map(exam => {
      const totalNet = exam.subjectResults.reduce((sum, sr) => sum + sr.netScore, 0);
      const daysDiff = Math.round(
        (new Date(exam.date).getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return { x: daysDiff, y: totalNet, date: formatDate(new Date(exam.date)), examTitle: exam.title };
    });

    // Run OLS regression (lineer temel)
    const { slope, intercept, rSquared, standardError, meanX, ssX } = linearRegression(dataPoints);

    const n = dataPoints.length;
    const today = new Date();
    const todayX = Math.round((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
    const t = tCritical(Math.max(1, n - 2));

    // Sönümleme parametresi (agresiflik)
    const k = 1.5;

    // Trend line: lineer tahmin → sönümlenmiş tahmin
    // YKS 2026 tarihine kadar göster (sonrası anlamsız)
    const yksX = Math.round((YKS_2026_DATE.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
    const futureEnd = Math.min(todayX + 180, yksX); // YKS tarihi veya max 6 ay
    const trendLine: Array<{ date: string; predicted: number; lower: number; upper: number }> = [];
    const step = Math.max(1, Math.round((futureEnd - 0) / 60));

    for (let x = 0; x <= futureEnd; x += step) {
      const linearY = slope * x + intercept;
      const predicted = applyDamping(linearY, ceiling, k);

      // Confidence interval: sönümlenmiş sınırlar
      const margin = n > 2
        ? t * standardError * Math.sqrt(1 + 1 / n + ((x - meanX) ** 2) / (ssX || 1))
        : standardError * 2;

      const lower = applyDamping(linearY - margin, ceiling, k);
      const upper = applyDamping(linearY + margin, ceiling, k);

      trendLine.push({
        date: formatDate(addDays(firstDate, x)),
        predicted: Number(predicted.toFixed(2)),
        lower: Number(lower.toFixed(2)),
        upper: Number(upper.toFixed(2)),
      });
    }

    // Predictions with damping
    const predictions = targets.map(targetNet => {
      if (slope <= 0 || targetNet >= ceiling) {
        return {
          targetNet,
          estimatedDate: targetNet >= ceiling ? null : null,
          daysFromNow: null,
          confidence: 0,
          lowerDate: null,
          upperDate: null,
        };
      }

      // Current damped estimate
      const currentLinearY = slope * todayX + intercept;
      const currentDampedY = applyDamping(currentLinearY, ceiling, k);

      if (currentDampedY >= targetNet) {
        return {
          targetNet,
          estimatedDate: formatDate(today),
          daysFromNow: 0,
          confidence: Math.min(100, Math.round(rSquared * 100)),
          lowerDate: formatDate(today),
          upperDate: formatDate(today),
        };
      }

      // Inverse damping: hedef nete karşılık gelen lineer Y değerini bul
      const requiredLinearY = inverseDamping(targetNet, ceiling, k);
      if (requiredLinearY === null) {
        // Tavana çok yakın, ulaşılamaz
        return {
          targetNet,
          estimatedDate: null,
          daysFromNow: null,
          confidence: 0,
          lowerDate: null,
          upperDate: null,
        };
      }

      // Lineer modelde bu Y'ye ne zaman ulaşılır?
      const targetX = (requiredLinearY - intercept) / slope;
      const targetDate = addDays(firstDate, Math.round(targetX));
      const daysFromNow = Math.round(targetX) - todayX;

      // YKS tarihi sınırı: tahmin YKS'den sonraysa "YKS'ye kadar ulaşılamaz" olarak işaretle
      const daysToYKS = Math.round((YKS_2026_DATE.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysFromNow > daysToYKS && daysToYKS > 0) {
        return {
          targetNet,
          estimatedDate: formatDate(targetDate),
          daysFromNow,
          confidence: Math.min(100, Math.round(rSquared * 100)),
          lowerDate: null,
          upperDate: null,
          beyondYKS: true,
        };
      }

      // Confidence interval
      let lowerDate: string | null = null;
      let upperDate: string | null = null;
      if (n > 2 && standardError > 0) {
        const marginAtTarget = t * standardError * Math.sqrt(
          1 + 1 / n + ((targetX - meanX) ** 2) / (ssX || 1)
        );
        const optimisticLinearY = inverseDamping(targetNet, ceiling, k);
        if (optimisticLinearY !== null) {
          const optimisticX = (optimisticLinearY - marginAtTarget - intercept) / slope;
          const pessimisticX = (optimisticLinearY + marginAtTarget - intercept) / slope;
          if (optimisticX > 0) {
            lowerDate = formatDate(addDays(firstDate, Math.round(Math.min(optimisticX, pessimisticX))));
          }
          upperDate = formatDate(addDays(firstDate, Math.round(Math.max(optimisticX, pessimisticX))));
        }
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

    // Current damped estimate
    const currentLinearY = slope * todayX + intercept;
    const currentEstimate = applyDamping(currentLinearY, ceiling, k);

    // YKS'ye kalan gün
    const daysToYKS = Math.round((YKS_2026_DATE.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // YKS günündeki tahmini net
    const yksLinearY = slope * yksX + intercept;
    const yksEstimate = slope > 0 ? applyDamping(yksLinearY, ceiling, k) : currentEstimate;

    const result = {
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
      ceiling,
      yksDate: formatDate(YKS_2026_DATE),
      daysToYKS: Math.max(0, daysToYKS),
      yksEstimate: Number(yksEstimate.toFixed(1)),
    };

    return NextResponse.json(result);
  } catch (error) {
    logApiError("analytics/regression", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
