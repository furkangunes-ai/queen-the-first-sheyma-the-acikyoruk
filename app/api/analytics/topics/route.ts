import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";

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

    // CognitiveVoid'lerden konu bazlı zafiyet analizi
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
        topic: true,
      },
    });

    // Konu bazında grupla
    const topicMap = new Map<
      string,
      {
        topicId: string;
        topicName: string;
        subjectId: string;
        subjectName: string;
        totalMagnitude: number;
        totalSeverity: number;
        unresolvedCount: number;
        resolvedCount: number;
      }
    >();

    for (const v of voids) {
      const key = v.topicId || "unknown";
      const existing = topicMap.get(key);

      if (existing) {
        existing.totalMagnitude += v.magnitude;
        existing.totalSeverity += v.severity;
        if (v.status === 'UNRESOLVED') existing.unresolvedCount += v.magnitude;
        if (v.status === 'RESOLVED') existing.resolvedCount += v.magnitude;
      } else {
        topicMap.set(key, {
          topicId: v.topicId || "unknown",
          topicName: v.topic?.name || "Belirtilmemiş",
          subjectId: v.subjectId,
          subjectName: v.subject.name,
          totalMagnitude: v.magnitude,
          totalSeverity: v.severity,
          unresolvedCount: v.status === 'UNRESOLVED' ? v.magnitude : 0,
          resolvedCount: v.status === 'RESOLVED' ? v.magnitude : 0,
        });
      }
    }

    // Severity'ye göre sırala (en acil zafiyet en üstte)
    const topicAnalysis = Array.from(topicMap.values())
      .sort((a, b) => b.totalSeverity - a.totalSeverity);

    return NextResponse.json(topicAnalysis);
  } catch (error) {
    logApiError("analytics/topics", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
