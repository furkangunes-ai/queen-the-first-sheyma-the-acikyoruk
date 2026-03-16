import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";
import {
  updateFromExamErrorWeighted,
  updateFromImplicitPositiveWithCoverage,
  calculateSpeedWeight,
  estimateDiscrimination,
} from "@/lib/bayesian-engine";
import { applyElasticProjection } from "@/lib/cognitive-engine";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;

    const exam = await prisma.exam.findFirst({
      where: { id, userId },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Sınav bulunamadı" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { results } = body;

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: "Sonuç dizisi gerekli" },
        { status: 400 }
      );
    }
    if (results.length > 30) {
      return NextResponse.json(
        { error: "En fazla 30 ders sonucu gönderilebilir" },
        { status: 400 }
      );
    }

    // Validate each result entry
    for (const result of results) {
      if (!result.subjectId || result.correctCount === undefined || result.wrongCount === undefined || result.emptyCount === undefined) {
        return NextResponse.json(
          { error: "Her sonuçta subjectId, correctCount, wrongCount ve emptyCount olmalı" },
          { status: 400 }
        );
      }
      // Sayısal validasyon
      const { correctCount, wrongCount, emptyCount } = result;
      if (!Number.isInteger(correctCount) || !Number.isInteger(wrongCount) || !Number.isInteger(emptyCount)) {
        return NextResponse.json(
          { error: "correctCount, wrongCount ve emptyCount tam sayı olmalı" },
          { status: 400 }
        );
      }
      if (correctCount < 0 || wrongCount < 0 || emptyCount < 0) {
        return NextResponse.json(
          { error: "Sayılar negatif olamaz" },
          { status: 400 }
        );
      }
    }

    // Validate all subjectIds exist and belong to the exam's examType
    const subjectIds = results.map((r: any) => r.subjectId);
    const validSubjects = await prisma.subject.findMany({
      where: { id: { in: subjectIds }, examTypeId: exam.examTypeId },
      select: { id: true },
    });
    const validSubjectIds = new Set(validSubjects.map((s) => s.id));
    const invalidIds = subjectIds.filter((id: string) => !validSubjectIds.has(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: "Geçersiz ders seçimi: bazı dersler bu sınav türüne ait değil" },
        { status: 400 }
      );
    }

    // ── Fetch old results for void sync comparison ──
    const oldResults = await prisma.examSubjectResult.findMany({
      where: { examId: id },
      select: { subjectId: true, wrongCount: true, emptyCount: true },
    });
    const oldMap = new Map(oldResults.map(r => [r.subjectId, r]));

    // Delete existing results for this exam, then create new ones
    await prisma.examSubjectResult.deleteMany({
      where: { examId: id },
    });

    const subjectResults = await prisma.examSubjectResult.createMany({
      data: results.map((result: { subjectId: string; correctCount: number; wrongCount: number; emptyCount: number; durationMinutes?: number }) => ({
        examId: id,
        subjectId: result.subjectId,
        correctCount: result.correctCount,
        wrongCount: result.wrongCount,
        emptyCount: result.emptyCount,
        netScore: result.correctCount - (result.wrongCount / 4),
        durationMinutes: result.durationMinutes != null ? Math.round(result.durationMinutes) : null,
      })),
    });

    // ── Void Senkronizasyonu ──
    // Yanlış/boş sayısı arttıysa yeni RAW void oluştur
    // Azaldıysa fazla RAW void'ları sil (en düşük bilgi değerindekileri)
    const voidSyncSummary: Array<{ subjectId: string; created: number; removed: number }> = [];

    for (const result of results as Array<{ subjectId: string; correctCount: number; wrongCount: number; emptyCount: number }>) {
      const old = oldMap.get(result.subjectId);
      const oldWrong = old?.wrongCount ?? 0;
      const oldEmpty = old?.emptyCount ?? 0;
      const newWrong = result.wrongCount;
      const newEmpty = result.emptyCount;

      let created = 0;
      let removed = 0;

      // Handle WRONG count changes
      const wrongDiff = newWrong - oldWrong;
      if (wrongDiff > 0) {
        // Create new RAW voids for added wrong answers
        const voidData = Array.from({ length: wrongDiff }, () => ({
          examId: id,
          subjectId: result.subjectId,
          source: "WRONG" as const,
          status: "RAW" as const,
          magnitude: 1,
          severity: 0.1,
          relapseCount: 0,
        }));
        await prisma.cognitiveVoid.createMany({ data: voidData });
        created += wrongDiff;
      } else if (wrongDiff < 0) {
        // Remove excess RAW WRONG voids (only unclassified ones)
        const excessRawVoids = await prisma.cognitiveVoid.findMany({
          where: {
            examId: id,
            subjectId: result.subjectId,
            source: "WRONG",
            status: "RAW",
            topicId: null,
            errorReason: null,
          },
          orderBy: { createdAt: "desc" },
          take: Math.abs(wrongDiff),
          select: { id: true },
        });
        if (excessRawVoids.length > 0) {
          await prisma.cognitiveVoid.deleteMany({
            where: { id: { in: excessRawVoids.map(v => v.id) } },
          });
          removed += excessRawVoids.length;
        }
      }

      // Handle EMPTY count changes
      const emptyDiff = newEmpty - oldEmpty;
      if (emptyDiff > 0) {
        const voidData = Array.from({ length: emptyDiff }, () => ({
          examId: id,
          subjectId: result.subjectId,
          source: "EMPTY" as const,
          status: "RAW" as const,
          magnitude: 1,
          severity: 0.1,
          relapseCount: 0,
        }));
        await prisma.cognitiveVoid.createMany({ data: voidData });
        created += emptyDiff;
      } else if (emptyDiff < 0) {
        const excessRawVoids = await prisma.cognitiveVoid.findMany({
          where: {
            examId: id,
            subjectId: result.subjectId,
            source: "EMPTY",
            status: "RAW",
            topicId: null,
            errorReason: null,
          },
          orderBy: { createdAt: "desc" },
          take: Math.abs(emptyDiff),
          select: { id: true },
        });
        if (excessRawVoids.length > 0) {
          await prisma.cognitiveVoid.deleteMany({
            where: { id: { in: excessRawVoids.map(v => v.id) } },
          });
          removed += excessRawVoids.length;
        }
      }

      if (created > 0 || removed > 0) {
        voidSyncSummary.push({ subjectId: result.subjectId, created, removed });
      }
    }

    // Compute total net score locally for the response
    const totalNet = results.reduce(
      (sum: number, r: { correctCount: number; wrongCount: number }) =>
        sum + (r.correctCount - (r.wrongCount / 4)),
      0
    );

    // Fetch the created results with relations
    const createdResults = await prisma.examSubjectResult.findMany({
      where: { examId: id },
      include: { subject: true },
    });

    // ── Bayesyen Biliş Güncellemesi (Post-Exam Signal Processing) ──
    // Aksiyom 1: Her deneme gürültülü sinyal → Bayesyen posterior güncelleme
    // Aksiyom 2: Hız ağırlığı → durationMinutes kullanılarak speed weight hesaplanır
    // + Elastic Projection: Bayes → DAG sync (Bilişsel Tekillik)
    try {
      const updatedBeliefs = await processPostExamBeliefUpdates(userId, id, results as Array<{
        subjectId: string;
        correctCount: number;
        wrongCount: number;
        emptyCount: number;
        durationMinutes?: number;
      }>);

      // Elastic Projection: Bayesyen güncellemeleri DAG'a yansıt
      if (updatedBeliefs.length > 0) {
        await applyElasticProjection(userId, updatedBeliefs);
      }
    } catch (beliefError) {
      // Belief güncellemesi başarısız olursa sınav sonuçlarını etkilememeli
      console.error("Belief update error (non-critical):", beliefError);
    }

    // Fetch updated voids
    const updatedVoids = await prisma.cognitiveVoid.findMany({
      where: { examId: id },
      include: { subject: true, topic: true },
      orderBy: [{ severity: "desc" }, { magnitude: "desc" }],
    });

    return NextResponse.json(
      { results: createdResults, totalNet, voidSyncSummary, cognitiveVoids: updatedVoids },
      { status: 201 }
    );
  } catch (error) {
    logApiError("exams/:id/results", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

// ==================== Post-Exam Bayesian Belief Update ====================

/**
 * Deneme sonuçları girildiğinde tüm sınanan konuların TopicBelief'ini günceller.
 *
 * Her subject result için:
 * 1. O dersteki tüm topic'leri getir
 * 2. O sınavdaki CognitiveVoid'ları getir (topic ile eşleşmiş olanlar)
 * 3. Speed weight hesapla (durationMinutes varsa)
 * 4. Her topic için:
 *    - CognitiveVoid VARSA → updateFromExamError (negatif sinyal)
 *    - CognitiveVoid YOKSA → updateFromImplicitPositive (gürültülü pozitif sinyal)
 * 5. TopicBelief upsert
 */
async function processPostExamBeliefUpdates(
  userId: string,
  examId: string,
  results: Array<{
    subjectId: string;
    correctCount: number;
    wrongCount: number;
    emptyCount: number;
    durationMinutes?: number;
  }>
): Promise<Array<{ topicId: string; alpha: number; beta: number }>> {
  // Batch: tüm topic'leri ve mevcut void'ları çek
  const subjectIds = results.map((r) => r.subjectId);

  const [topics, voids, existingBeliefs] = await Promise.all([
    prisma.topic.findMany({
      where: { subjectId: { in: subjectIds } },
      select: { id: true, subjectId: true, difficulty: true },
    }),
    prisma.cognitiveVoid.findMany({
      where: { examId, topicId: { not: null } },
      select: { topicId: true, severity: true, source: true, errorReason: true },
    }),
    prisma.topicBelief.findMany({
      where: { userId, topic: { subjectId: { in: subjectIds } } },
      select: { id: true, topicId: true, alpha: true, beta: true },
    }),
  ]);

  // Map'ler
  const topicsBySubject = new Map<string, typeof topics>();
  for (const topic of topics) {
    const existing = topicsBySubject.get(topic.subjectId) ?? [];
    existing.push(topic);
    topicsBySubject.set(topic.subjectId, existing);
  }

  // Void'ları topic bazlı grupla (severity + errorReason)
  const voidsByTopic = new Map<string, Array<{ severity: number; errorReason: string | null }>>();
  for (const v of voids) {
    if (v.topicId) {
      const existing = voidsByTopic.get(v.topicId) ?? [];
      existing.push({ severity: v.severity, errorReason: v.errorReason });
      voidsByTopic.set(v.topicId, existing);
    }
  }

  // Mevcut belief'ler
  const beliefMap = new Map(existingBeliefs.map((b) => [b.topicId, b]));

  // Her subject result için güncelle
  const upserts: Array<{
    userId: string;
    topicId: string;
    alpha: number;
    beta: number;
  }> = [];

  for (const result of results) {
    const subjectTopics = topicsBySubject.get(result.subjectId) ?? [];
    if (subjectTopics.length === 0) continue;

    const totalQuestions = result.correctCount + result.wrongCount + result.emptyCount;
    const successRate = totalQuestions > 0 ? result.correctCount / totalQuestions : 0.5;
    const attempted = result.correctCount + result.wrongCount;

    for (const topic of subjectTopics) {
      const existing = beliefMap.get(topic.id);
      let alpha = existing?.alpha ?? 1.0;
      let beta = existing?.beta ?? 1.0;

      const speedWeight = calculateSpeedWeight(
        result.durationMinutes ?? null,
        attempted,
        topic.difficulty
      );

      const topicVoids = voidsByTopic.get(topic.id);

      if (topicVoids && topicVoids.length > 0) {
        // Bu konuda yanlış/boş var → hata türüne göre ağırlıklı negatif sinyal
        for (const v of topicVoids) {
          const updated = updateFromExamErrorWeighted(alpha, beta, v.severity, v.errorReason, speedWeight, topic.difficulty);
          alpha = updated.alpha;
          beta = updated.beta;
        }
      } else {
        // Bu konuda yanlış yok → kapsam faktörlü gürültülü pozitif sinyal
        // VARSAYIM YIKIMI: yanlış yapmamak ≠ biliyor
        // 40 soruluk sınavda 50 konu → hepsine artı vermek yanlış
        const discrimination = estimateDiscrimination(
          successRate,
          topic.difficulty,
          subjectTopics.length
        );
        const updated = updateFromImplicitPositiveWithCoverage(
          alpha, beta, discrimination, speedWeight, attempted, subjectTopics.length, successRate
        );
        alpha = updated.alpha;
        beta = updated.beta;
      }

      upserts.push({ userId, topicId: topic.id, alpha, beta });
    }
  }

  // Batch upsert (Prisma transaction)
  if (upserts.length > 0) {
    await prisma.$transaction(
      upserts.map((u) =>
        prisma.topicBelief.upsert({
          where: { userId_topicId: { userId: u.userId, topicId: u.topicId } },
          update: { alpha: u.alpha, beta: u.beta },
          create: { userId: u.userId, topicId: u.topicId, alpha: u.alpha, beta: u.beta },
        })
      )
    );
  }

  // Elastic Projection icin guncellenmis belief'leri don
  return upserts.map(u => ({ topicId: u.topicId, alpha: u.alpha, beta: u.beta }));
}
