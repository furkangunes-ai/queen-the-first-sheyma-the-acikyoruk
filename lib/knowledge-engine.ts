// ==================== Knowledge Engine (Logaritmik Öğrenme Eğrisi) ====================
//
// TopicKnowledge.effectiveLevel hesaplama motoru.
//
// Aksiyom: Öğrenme logaritmiktir — düşükten orta seviyeye hızlı, yüksekten
// uzmanlaşmaya yavaş ilerlenir. 3 saat güzel çalışma 2/5'ten 4/5'e çıkarabilir,
// ama 4/5'ten 5/5'e gitmek çok daha fazla kanıt gerektirir.
//
// Formül:
//   bayesianScore = (μ × 4) + 1          → 0-1'den 1-5 ölçeğine
//   rawBlend = manual × (1 - w) + bayesian × w
//   effectiveLevel = manual + (target - manual) × (1 - e^(-k × evidence))
//
// k = 0.35 → logaritmik hız katsayısı
//   - evidence=2 → %50 kapatma (başta hızlı sıçrama)
//   - evidence=6 → %88 kapatma (neredeyse tamamen veri bazlı)
//   - evidence=10 → %97 kapatma

import { prisma } from '@/lib/prisma';
import { betaMean } from '@/lib/bayesian-engine';

/** Logaritmik yaklaşma hız katsayısı */
const K = 0.35;

/** Comprehension seçenekleri ve değerleri */
export const COMPREHENSION_LEVELS = [
  { value: 0.2, label: 'Anlamadım', key: 'none' },
  { value: 0.4, label: 'Kısmen anladım', key: 'partial' },
  { value: 0.7, label: 'Çoğunu anladım', key: 'mostly' },
  { value: 1.0, label: 'Tam anladım', key: 'full' },
] as const;

// ── Hesaplama ──

/**
 * Logaritmik öğrenme eğrisi ile effectiveLevel hesapla.
 *
 * @param manualLevel - Öğrencinin girdiği 0-5 tam sayı (baz çizgisi)
 * @param alpha - TopicBelief alpha (pozitif kanıt)
 * @param beta - TopicBelief beta (negatif kanıt)
 * @returns effectiveLevel (1.0 - 5.0 arası, 1 decimal)
 */
export function calculateEffectiveLevel(
  manualLevel: number,
  alpha: number,
  beta: number
): number {
  // Bayesyen ortalama → 1-5 ölçeğine çevir
  const mu = betaMean(alpha, beta); // 0-1
  const bayesianScore = mu * 4 + 1; // 1-5

  // Net kanıt miktarı (prior Beta(1,1) çıkarılmış)
  const evidence = Math.max(0, (alpha + beta) - 2);

  // Manuel level 0 ise (hiç bilmiyorum), baz çizgisi 1 olarak al
  const base = Math.max(1, manualLevel);

  if (evidence < 0.01) {
    // Henüz veri yok — tamamen manuel
    return roundLevel(base);
  }

  // Logaritmik yaklaşma: base'den bayesianScore'a doğru
  // effectiveLevel = base + (target - base) × (1 - e^(-k × evidence))
  // Bu formül:
  //   - evidence az → base'e yakın (e^(-k*evidence) ≈ 1, çarpan ≈ 0)
  //   - evidence çok → bayesianScore'a yakın (e^(-k*evidence) ≈ 0, çarpan ≈ 1)
  //   - Düşükten yükselirken: (target - base) büyük → büyük sıçrama
  //   - Yukarıda: (target - base) küçük → küçük sıçrama
  const approachFactor = 1 - Math.exp(-K * evidence);
  const effective = base + (bayesianScore - base) * approachFactor;

  // 1-5 sınırları
  return roundLevel(Math.max(1, Math.min(5, effective)));
}

/**
 * 1 ondalık basamağa yuvarla (örn: 3.7, 4.2)
 */
function roundLevel(value: number): number {
  return Math.round(value * 10) / 10;
}

// ── Veritabanı İşlemleri ──

/**
 * Bir topic için effectiveLevel'ı yeniden hesapla ve kaydet.
 * KnowledgeLog kaydı oluşturur.
 *
 * @param userId
 * @param topicId
 * @param source - Tetikleyici: "study_session" | "exam_error" | "exam_implicit_positive" | "manual" | "initial"
 * @param detail - Opsiyonel JSON detay (correctRatio, comprehension, examId vb.)
 * @returns {oldLevel, newLevel, delta}
 */
export async function recalculateEffectiveLevel(
  userId: string,
  topicId: string,
  source: string,
  detail?: Record<string, unknown>
): Promise<{ oldLevel: number; newLevel: number; delta: number }> {
  // Mevcut TopicKnowledge ve TopicBelief'i getir
  const [knowledge, belief] = await Promise.all([
    prisma.topicKnowledge.findUnique({
      where: { userId_topicId: { userId, topicId } },
    }),
    prisma.topicBelief.findUnique({
      where: { userId_topicId: { userId, topicId } },
    }),
  ]);

  const manualLevel = knowledge?.level ?? 0;
  const oldEffective = knowledge?.effectiveLevel ?? (manualLevel || 1);
  const alpha = belief?.alpha ?? 1.0;
  const beta = belief?.beta ?? 1.0;

  // Yeni effectiveLevel hesapla
  const newLevel = calculateEffectiveLevel(manualLevel, alpha, beta);
  const delta = roundLevel(newLevel - oldEffective);

  // Anlamlı değişiklik yoksa (< 0.05) atla
  if (Math.abs(delta) < 0.05) {
    return { oldLevel: oldEffective, newLevel: oldEffective, delta: 0 };
  }

  // TopicKnowledge.effectiveLevel güncelle (yoksa oluştur)
  await prisma.topicKnowledge.upsert({
    where: { userId_topicId: { userId, topicId } },
    update: { effectiveLevel: newLevel },
    create: {
      userId,
      topicId,
      level: manualLevel,
      effectiveLevel: newLevel,
    },
  });

  // KnowledgeLog kaydı oluştur
  await prisma.knowledgeLog.create({
    data: {
      userId,
      topicId,
      source,
      oldLevel: oldEffective,
      newLevel,
      delta,
      detail: detail ? JSON.stringify(detail) : null,
    },
  });

  return { oldLevel: oldEffective, newLevel, delta };
}

/**
 * Birden fazla topic için batch effectiveLevel güncelleme.
 * Deneme sonrası tüm etkilenen topic'ler için çağrılır.
 */
export async function recalculateEffectiveLevelBatch(
  userId: string,
  topicIds: string[],
  source: string,
  detailFn?: (topicId: string) => Record<string, unknown> | undefined
): Promise<Array<{ topicId: string; oldLevel: number; newLevel: number; delta: number }>> {
  const results: Array<{ topicId: string; oldLevel: number; newLevel: number; delta: number }> = [];

  // Batch fetch
  const [knowledgeList, beliefList] = await Promise.all([
    prisma.topicKnowledge.findMany({
      where: { userId, topicId: { in: topicIds } },
    }),
    prisma.topicBelief.findMany({
      where: { userId, topicId: { in: topicIds } },
    }),
  ]);

  const knowledgeMap = new Map(knowledgeList.map(k => [k.topicId, k]));
  const beliefMap = new Map(beliefList.map(b => [b.topicId, b]));

  const upserts: Array<any> = [];
  const logs: Array<any> = [];

  for (const topicId of topicIds) {
    const knowledge = knowledgeMap.get(topicId);
    const belief = beliefMap.get(topicId);

    const manualLevel = knowledge?.level ?? 0;
    const oldEffective = knowledge?.effectiveLevel ?? (manualLevel || 1);
    const alpha = belief?.alpha ?? 1.0;
    const beta = belief?.beta ?? 1.0;

    const newLevel = calculateEffectiveLevel(manualLevel, alpha, beta);
    const delta = roundLevel(newLevel - oldEffective);

    if (Math.abs(delta) < 0.05) continue;

    upserts.push(
      prisma.topicKnowledge.upsert({
        where: { userId_topicId: { userId, topicId } },
        update: { effectiveLevel: newLevel },
        create: { userId, topicId, level: manualLevel, effectiveLevel: newLevel },
      })
    );

    const detail = detailFn?.(topicId);
    logs.push(
      prisma.knowledgeLog.create({
        data: {
          userId,
          topicId,
          source,
          oldLevel: oldEffective,
          newLevel,
          delta,
          detail: detail ? JSON.stringify(detail) : null,
        },
      })
    );

    results.push({ topicId, oldLevel: oldEffective, newLevel, delta });
  }

  if (upserts.length > 0) {
    await prisma.$transaction([...upserts, ...logs]);
  }

  return results;
}
