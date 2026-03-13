import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";
import { ERROR_REASON_LABELS, type ErrorReasonType } from "@/lib/severity";

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

    // CognitiveVoid'lerden hata kök neden analizi
    const voids = await prisma.cognitiveVoid.findMany({
      where: {
        exam: {
          userId,
          ...(examTypeId && { examTypeId }),
        },
        ...(subjectId && { subjectId }),
      },
      include: {
        subject: true,
      },
    });

    // ErrorReason'a göre grupla (magnitude'u say)
    const reasonMap = new Map<
      string,
      {
        errorReason: string;
        errorReasonLabel: string;
        totalMagnitude: number;
        voidCount: number;
        subjectBreakdown: Map<string, { subjectId: string; subjectName: string; totalMagnitude: number }>;
      }
    >();

    for (const v of voids) {
      // RAW void'ları (errorReason=null) atla
      if (!v.errorReason) continue;
      const key = v.errorReason;
      const existing = reasonMap.get(key);
      const label = ERROR_REASON_LABELS[key as ErrorReasonType] || key;

      if (existing) {
        existing.totalMagnitude += v.magnitude;
        existing.voidCount += 1;
        const subjectEntry = existing.subjectBreakdown.get(v.subjectId);
        if (subjectEntry) {
          subjectEntry.totalMagnitude += v.magnitude;
        } else {
          existing.subjectBreakdown.set(v.subjectId, {
            subjectId: v.subjectId,
            subjectName: v.subject.name,
            totalMagnitude: v.magnitude,
          });
        }
      } else {
        const subjectBreakdown = new Map<string, { subjectId: string; subjectName: string; totalMagnitude: number }>();
        subjectBreakdown.set(v.subjectId, {
          subjectId: v.subjectId,
          subjectName: v.subject.name,
          totalMagnitude: v.magnitude,
        });

        reasonMap.set(key, {
          errorReason: key,
          errorReasonLabel: label,
          totalMagnitude: v.magnitude,
          voidCount: 1,
          subjectBreakdown,
        });
      }
    }

    const errorAnalysis = Array.from(reasonMap.values())
      .sort((a, b) => b.totalMagnitude - a.totalMagnitude)
      .map(({ subjectBreakdown, ...rest }) => ({
        ...rest,
        subjectBreakdown: Array.from(subjectBreakdown.values()).sort(
          (a, b) => b.totalMagnitude - a.totalMagnitude
        ),
      }));

    const totalVoids = voids.reduce((sum, v) => sum + v.magnitude, 0);

    return NextResponse.json({
      totalVoids,
      errorReasons: errorAnalysis,
    });
  } catch (error) {
    logApiError("analytics/errors", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
