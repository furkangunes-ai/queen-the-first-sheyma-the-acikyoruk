import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";
import { buildExamCategoryWhere } from "@/lib/exam-metrics";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(request.url);
    const examTypeId = searchParams.get("examTypeId");
    const examCategory = searchParams.get("examCategory");

    // Tüm cognitive void'leri çek (konu ve ders bilgisiyle)
    const voids = await prisma.cognitiveVoid.findMany({
      where: {
        exam: {
          userId,
          ...(examTypeId && { examTypeId }),
          ...buildExamCategoryWhere(examCategory),
        },
      },
      include: {
        subject: { select: { id: true, name: true, sortOrder: true } },
        topic: { select: { id: true, name: true, sortOrder: true } },
      },
    });

    // Ders → Konu → { raw, unresolved, review, resolved, totalSeverity } haritası
    // RAW void'lar (topicId=null) ayrı "Bilinmeyen Bölge" sütununda toplanır
    const subjectMap = new Map<
      string,
      {
        subjectId: string;
        subjectName: string;
        sortOrder: number;
        rawCount: number;
        rawSeverity: number;
        rawMagnitude: number;
        topics: Map<
          string,
          {
            topicId: string;
            topicName: string;
            sortOrder: number;
            raw: number;
            unresolved: number;
            review: number;
            resolved: number;
            totalSeverity: number;
            totalMagnitude: number;
          }
        >;
      }
    >();

    let totalVoids = 0;
    let rawVoids = 0;

    for (const v of voids) {
      totalVoids++;

      let subject = subjectMap.get(v.subjectId);
      if (!subject) {
        subject = {
          subjectId: v.subjectId,
          subjectName: v.subject.name,
          sortOrder: v.subject.sortOrder,
          rawCount: 0,
          rawSeverity: 0,
          rawMagnitude: 0,
          topics: new Map(),
        };
        subjectMap.set(v.subjectId, subject);
      }

      // RAW void'lar (topicId yok) → subject seviyesinde "Bilinmeyen Bölge"
      if (!v.topicId || !v.topic) {
        subject.rawCount += v.magnitude;
        subject.rawSeverity += v.severity;
        subject.rawMagnitude += v.magnitude;
        rawVoids++;
        continue;
      }

      let topic = subject.topics.get(v.topicId);
      if (!topic) {
        topic = {
          topicId: v.topicId,
          topicName: v.topic.name,
          sortOrder: v.topic.sortOrder ?? 0,
          raw: 0,
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
      if (v.status === "RAW") topic.raw += v.magnitude;
      else if (v.status === "UNRESOLVED") topic.unresolved += v.magnitude;
      else if (v.status === "REVIEW") topic.review += v.magnitude;
      else if (v.status === "RESOLVED") topic.resolved += v.magnitude;
    }

    // Clarity score: RAW olmayan / toplam
    const clarityScore = totalVoids === 0 ? 1 : (totalVoids - rawVoids) / totalVoids;

    // Serialize
    const heatmapData = Array.from(subjectMap.values())
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((subject) => ({
        subjectId: subject.subjectId,
        subjectName: subject.subjectName,
        rawCount: subject.rawCount,
        rawSeverity: Number(subject.rawSeverity.toFixed(1)),
        rawMagnitude: subject.rawMagnitude,
        topics: Array.from(subject.topics.values())
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(({ topicId, topicName, raw, unresolved, review, resolved, totalSeverity, totalMagnitude }) => ({
            topicId,
            topicName,
            raw,
            unresolved,
            review,
            resolved,
            totalSeverity: Number(totalSeverity.toFixed(1)),
            totalMagnitude,
          })),
      }));

    return NextResponse.json({
      subjects: heatmapData,
      meta: {
        totalVoids,
        rawVoids,
        clarityScore: Number(clarityScore.toFixed(2)),
      },
    });
  } catch (error) {
    logApiError("analytics/heatmap", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
