// ==================== Elastic Projection (Bayes → DAG Sync) ====================
//
// Bilisssel Tekillik: TopicBelief (Bayesyen) ve UserCognitiveState (DAG)
// iki ayri mastery sistemi olarak calisiyordu. Elastic Projection bunlari
// tek bir tutarli gerceklik haline getirir.
//
// Formul: M_new,i = M_old,i + gamma * (B_new - M_old,i)
//   - M_old,i: ConceptNode'un mevcut mastery seviyesi (0-1)
//   - B_new: Topic'in yeni Bayesyen ortalamasi (alpha / (alpha + beta))
//   - gamma: yaklasma hizi (0.3 = her guncelleme %30 kapatir)
//
// gamma = 0.3 secimi:
//   - Cok kucuk (0.1): DAG deneme verisine cok yavas tepki verir
//   - Cok buyuk (0.7): DAG her denemede asiri sallanir
//   - 0.3: ~3-4 denemede anlamli yaklasma, stabil

import { prisma } from '@/lib/prisma';
import { betaMean } from '@/lib/bayesian-engine';
import { logProjection, logProjectionSummary } from '@/lib/telemetry';
import { detectMasteryJump } from '@/lib/anomaly-detector';

/** Elastic Projection gamma katsayisi */
const GAMMA = 0.3;

/**
 * Deneme sonrasi Bayesyen guncelleme yapildiktan sonra,
 * guncellenen TopicBelief'leri DAG'daki UserCognitiveState'lere yansit.
 *
 * Her topic icin:
 * 1. Topic'e bagli ConceptNode'lari bul (parentTopicId)
 * 2. Her node'un UserCognitiveState.masteryLevel'ini Elastic Projection ile guncelle
 *
 * @param userId - Kullanici ID
 * @param topicBeliefs - Guncellenmis TopicBelief listesi [{topicId, alpha, beta}]
 */
export async function applyElasticProjection(
  userId: string,
  topicBeliefs: Array<{ topicId: string; alpha: number; beta: number }>
): Promise<{ updated: number; created: number }> {
  if (topicBeliefs.length === 0) return { updated: 0, created: 0 };

  const topicIds = topicBeliefs.map(b => b.topicId);

  // Batch: topic'lere bagli tum ConceptNode'lari cek
  const nodes = await prisma.conceptNode.findMany({
    where: { parentTopicId: { in: topicIds } },
    select: { id: true, parentTopicId: true, complexityScore: true },
  });

  if (nodes.length === 0) return { updated: 0, created: 0 };

  // Mevcut UserCognitiveState'leri cek
  const nodeIds = nodes.map(n => n.id);
  const existingStates = await prisma.userCognitiveState.findMany({
    where: { userId, nodeId: { in: nodeIds } },
    select: { id: true, nodeId: true, masteryLevel: true },
  });

  const stateMap = new Map(existingStates.map(s => [s.nodeId, s]));

  // Belief map: topicId -> B_new (Bayesyen ortalama)
  const beliefMeanMap = new Map(
    topicBeliefs.map(b => [b.topicId, betaMean(b.alpha, b.beta)])
  );

  let updated = 0;
  let created = 0;

  const operations = nodes.map(node => {
    const bNew = beliefMeanMap.get(node.parentTopicId!) ?? 0.5;
    const existing = stateMap.get(node.id);

    if (existing) {
      // Elastic Projection: M_new = M_old + gamma * (B_new - M_old)
      const mOld = existing.masteryLevel;
      const mNew = Math.max(0, Math.min(1, mOld + GAMMA * (bNew - mOld)));

      // Anlamli degisiklik yoksa atla (floating point noise)
      if (Math.abs(mNew - mOld) < 0.001) return null;

      const mNewRounded = Math.round(mNew * 1000) / 1000;

      // Kara Kutu: her donusumu logla
      logProjection({
        userId,
        nodeId: node.id,
        topicId: node.parentTopicId!,
        bNew,
        mOld,
        mNew: mNewRounded,
        delta: mNewRounded - mOld,
        gamma: GAMMA,
        isNew: false,
      });

      // Sibernetik: mastery sıçrama anomali tespiti (fire-and-forget)
      detectMasteryJump(userId, node.id, node.parentTopicId!, mOld, mNewRounded, bNew).catch(() => {});

      updated++;
      return prisma.userCognitiveState.update({
        where: { id: existing.id },
        data: {
          masteryLevel: mNewRounded,
          lastTestedAt: new Date(),
        },
      });
    } else {
      // Ilk kez — B_new'u dogrudan ata (gamma uygulanmaz, baslangic)
      const mNewRounded = Math.round(Math.max(0, Math.min(1, bNew)) * 1000) / 1000;

      logProjection({
        userId,
        nodeId: node.id,
        topicId: node.parentTopicId!,
        bNew,
        mOld: 0,
        mNew: mNewRounded,
        delta: mNewRounded,
        gamma: GAMMA,
        isNew: true,
      });

      created++;
      return prisma.userCognitiveState.create({
        data: {
          userId,
          nodeId: node.id,
          masteryLevel: mNewRounded,
          strength: 2.0,
          successCount: 0,
          lastTestedAt: new Date(),
        },
      });
    }
  }).filter(Boolean);

  if (operations.length > 0) {
    await prisma.$transaction(operations as any);
  }

  // Ozet log
  logProjectionSummary(userId, topicBeliefs.length, updated, created, 'exam');

  return { updated, created };
}

/**
 * Calisma oturumu sonrasi Bayesyen guncelleme yapildiktan sonra
 * tek bir topic icin Elastic Projection uygula.
 *
 * daily-study POST'tan cagrilir.
 */
export async function applyElasticProjectionForTopic(
  userId: string,
  topicId: string,
  newAlpha: number,
  newBeta: number
): Promise<void> {
  await applyElasticProjection(userId, [{ topicId, alpha: newAlpha, beta: newBeta }]);
}
