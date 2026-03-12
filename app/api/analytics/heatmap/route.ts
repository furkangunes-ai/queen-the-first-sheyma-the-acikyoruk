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

    // Tüm cognitive void'leri çek (konu ve ders bilgisiyle)
    const voids = await prisma.cognitiveVoid.findMany({
      where: {
        exam: {
          userId,
          ...(examTypeId && { examTypeId }),
        },
      },
      include: {
        subject: { select: { id: true, name: true, sortOrder: true } },
        topic: { select: { id: true, name: true, sortOrder: true } },
      },
    });

    // Ders → Konu → { unresolved, review, resolved, totalSeverity } haritası
    const subjectMap = new Map<
      string,
      {
        subjectId: string;
        subjectName: string;
        sortOrder: number;
        topics: Map<
          string,
          {
            topicId: string;
            topicName: string;
            sortOrder: number;
            unresolved: number;
            review: number;
            resolved: number;
            totalSeverity: number;
            totalMagnitude: number;
          }
        >;
      }
    >();

    for (const v of voids) {
      if (!v.topicId || !v.topic) continue;

      let subject = subjectMap.get(v.subjectId);
      if (!subject) {
        subject = {
          subjectId: v.subjectId,
          subjectName: v.subject.name,
          sortOrder: v.subject.sortOrder,
          topics: new Map(),
        };
        subjectMap.set(v.subjectId, subject);
      }

      let topic = subject.topics.get(v.topicId);
      if (!topic) {
        topic = {
          topicId: v.topicId,
          topicName: v.topic.name,
          sortOrder: v.topic.sortOrder ?? 0,
          unresolved: 0,
          review: 0,
          resolved: 0,
          totalSeverity: 0,
          totalMagnitude: 0,
        };
        subject.topics.set(v.topicId, topic);
      }

      topic.totalMagnitude += v.magnitude;
      topic.totalSeverity += v.severity;
      if (v.status === "UNRESOLVED") topic.unresolved += v.magnitude;
      else if (v.status === "REVIEW") topic.review += v.magnitude;
      else if (v.status === "RESOLVED") topic.resolved += v.magnitude;
    }

    // Serialize
    const heatmapData = Array.from(subjectMap.values())
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((subject) => ({
        subjectId: subject.subjectId,
        subjectName: subject.subjectName,
        topics: Array.from(subject.topics.values())
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(({ topicId, topicName, unresolved, review, resolved, totalSeverity, totalMagnitude }) => ({
            topicId,
            topicName,
            unresolved,
            review,
            resolved,
            totalSeverity: Number(totalSeverity.toFixed(1)),
            totalMagnitude,
          })),
      }));

    return NextResponse.json(heatmapData);
  } catch (error) {
    logApiError("analytics/heatmap", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
