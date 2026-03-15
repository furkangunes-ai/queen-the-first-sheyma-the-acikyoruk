import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";
import {
  betaMean,
  betaCI95,
  categorize,
  evidenceCount,
  CATEGORY_LABELS,
  type MasteryCategory,
} from "@/lib/bayesian-engine";

/**
 * GET /api/student/mastery
 *
 * Tüm konuların Bayesyen posterior + güven aralığı + fuzzy kategori bilgisini döndürür.
 *
 * Query params:
 *   - examTypeId?: TYT/AYT filtresi
 *   - subjectId?: Tek ders filtresi
 *
 * Performans: Tüm veriler tek seferde çekilip memory'de hesaplanır (batch query).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;

    const { searchParams } = new URL(request.url);
    const examTypeId = searchParams.get("examTypeId");
    const subjectId = searchParams.get("subjectId");

    // Kullanıcının exam track'i (AYT filtreleme için)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { examTrack: true },
    });
    const examTrack = user?.examTrack;

    // Topic filtresi oluştur
    const topicWhere: Record<string, unknown> = {};
    if (subjectId) {
      topicWhere.subjectId = subjectId;
    } else if (examTypeId) {
      topicWhere.subject = { examTypeId };
    }

    // Batch query — tüm verileri tek seferde çek
    const [allTopics, beliefs] = await Promise.all([
      prisma.topic.findMany({
        where: topicWhere,
        include: {
          subject: { include: { examType: true } },
        },
        orderBy: [{ subject: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      }),
      prisma.topicBelief.findMany({
        where: { userId },
      }),
    ]);

    // Exam track filtreleme (AYT'de gereksiz dersleri çıkar)
    const topics = examTrack
      ? allTopics.filter((t) => {
          const isAYT =
            t.subject.examType.slug === "ayt" ||
            t.subject.examType.name === "AYT";
          if (!isAYT) return true;
          const excluded: Record<string, string[]> = {
            sayisal: ["Edebiyat", "Tarih", "Coğrafya"],
            ea: ["Fizik", "Kimya", "Biyoloji"],
            sozel: ["Fizik", "Kimya", "Biyoloji", "Matematik"],
          };
          return !(excluded[examTrack] || []).includes(t.subject.name);
        })
      : allTopics;

    // Belief map oluştur
    const beliefMap = new Map(
      beliefs.map((b) => [b.topicId, { alpha: b.alpha, beta: b.beta }])
    );

    // Her topic için mastery estimate hesapla
    const categoryCounters: Record<MasteryCategory, number> = {
      unknown: 0,
      weak: 0,
      developing: 0,
      strong: 0,
      mastered: 0,
    };

    const results = topics.map((topic) => {
      const belief = beliefMap.get(topic.id) ?? { alpha: 1.0, beta: 1.0 };
      const mean = betaMean(belief.alpha, belief.beta);
      const ci = betaCI95(belief.alpha, belief.beta);
      const evidence = evidenceCount(belief.alpha, belief.beta);
      const category = categorize(belief.alpha, belief.beta);

      categoryCounters[category]++;

      return {
        topicId: topic.id,
        topicName: topic.name,
        subjectId: topic.subjectId,
        subjectName: topic.subject.name,
        examTypeName: topic.subject.examType.name,
        alpha: Math.round(belief.alpha * 100) / 100,
        beta: Math.round(belief.beta * 100) / 100,
        mean: Math.round(mean * 1000) / 1000,
        ci95Lower: Math.round(ci.lower * 1000) / 1000,
        ci95Upper: Math.round(ci.upper * 1000) / 1000,
        category,
        categoryLabel: CATEGORY_LABELS[category],
        evidenceCount: Math.round(evidence * 10) / 10,
      };
    });

    return NextResponse.json({
      beliefs: results,
      meta: {
        totalTopics: topics.length,
        ...categoryCounters,
      },
    });
  } catch (error) {
    logApiError("student/mastery", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
