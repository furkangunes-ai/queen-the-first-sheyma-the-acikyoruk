// ==================== DAG Güncelleme (Event-Driven) ====================
//
// Öğrenci veri girdiğinde (deneme, çalışma, tekrar) tetiklenir.
// Sadece etkilenen node ve onun child'larını günceller (tüm DAG'ı değil).
//
// Kullanım:
//   - Deneme sonrası: yanlış soru → M düşür
//   - Çalışma sonrası: başarılı → M artır, S büyüt
//   - Spaced repetition review sonrası: quality'ye göre güncelle

import { prisma } from '@/lib/prisma';
import { calculateInitialStrength, calculateNewStrength, calculateStrengthAfterFailure } from './ebbinghaus';

/**
 * Bir node'un mastery'sini artır (başarılı çalışma/tekrar sonrası).
 * S değerini de büyütür (Fibonacci-benzeri).
 */
export async function recordSuccess(
  userId: string,
  nodeId: string,
  masteryIncrease: number = 0.1
): Promise<void> {
  const existing = await prisma.userCognitiveState.findUnique({
    where: { userId_nodeId: { userId, nodeId } },
  });

  if (existing) {
    const newMastery = Math.min(1.0, existing.masteryLevel + masteryIncrease);
    const newStrength = calculateNewStrength(existing.strength, existing.successCount);

    await prisma.userCognitiveState.update({
      where: { id: existing.id },
      data: {
        masteryLevel: newMastery,
        strength: newStrength,
        successCount: existing.successCount + 1,
        lastTestedAt: new Date(),
      },
    });
  } else {
    // İlk kez çalışıyor — yeni state oluştur
    const node = await prisma.conceptNode.findUnique({ where: { id: nodeId } });
    const initialStrength = node
      ? calculateInitialStrength(node.complexityScore)
      : 2.0;

    await prisma.userCognitiveState.create({
      data: {
        userId,
        nodeId,
        masteryLevel: Math.min(1.0, masteryIncrease),
        strength: initialStrength,
        successCount: 1,
        lastTestedAt: new Date(),
      },
    });
  }
}

/**
 * Bir node'un mastery'sini düşür (yanlış soru/başarısızlık sonrası).
 * S değerini de yarıya indirir.
 */
export async function recordFailure(
  userId: string,
  nodeId: string,
  masteryDecrease: number = 0.15
): Promise<void> {
  const existing = await prisma.userCognitiveState.findUnique({
    where: { userId_nodeId: { userId, nodeId } },
  });

  if (existing) {
    const newMastery = Math.max(0.0, existing.masteryLevel - masteryDecrease);
    const newStrength = calculateStrengthAfterFailure(existing.strength);

    await prisma.userCognitiveState.update({
      where: { id: existing.id },
      data: {
        masteryLevel: newMastery,
        strength: newStrength,
        lastTestedAt: new Date(),
      },
    });
  } else {
    // İlk veri — başarısız da olsa state oluştur
    await prisma.userCognitiveState.create({
      data: {
        userId,
        nodeId,
        masteryLevel: 0.0,
        strength: 1.0,
        successCount: 0,
        lastTestedAt: new Date(),
      },
    });
  }
}

/**
 * Bir çalışma oturumu sonrası mastery'yi başarı oranına göre güncelle.
 * correctRatio: 0.0-1.0 (doğru/toplam)
 */
export async function recordStudySession(
  userId: string,
  nodeId: string,
  correctRatio: number
): Promise<void> {
  if (correctRatio >= 0.7) {
    // Başarılı — %70+ doğru
    const gain = 0.05 + correctRatio * 0.1; // 0.12 - 0.15 arası
    await recordSuccess(userId, nodeId, gain);
  } else if (correctRatio >= 0.4) {
    // Orta — mastery çok az artar
    await recordSuccess(userId, nodeId, 0.03);
  } else {
    // Başarısız — mastery düşer
    await recordFailure(userId, nodeId, 0.05);
  }
}

/**
 * Belirli bir topic'e bağlı tüm ConceptNode'ları bul.
 * Mevcut Topic → ConceptNode bağlantısı üzerinden.
 */
export async function getConceptNodesForTopic(topicId: string): Promise<string[]> {
  const nodes = await prisma.conceptNode.findMany({
    where: { parentTopicId: topicId },
    select: { id: true },
  });
  return nodes.map(n => n.id);
}

/**
 * Bir topic'teki çalışma sonucunu o topic'e bağlı tüm ConceptNode'lara yay.
 * correctRatio: 0.0-1.0 (çalışma oturumu başarı oranı)
 */
export async function recordStudyForTopic(
  userId: string,
  topicId: string,
  correctRatio: number
): Promise<void> {
  const nodeIds = await getConceptNodesForTopic(topicId);

  // Eğer atomik node bağlantısı yoksa atla (henüz seed edilmemiş)
  if (nodeIds.length === 0) return;

  // Tüm node'lar için güncelle
  for (const nodeId of nodeIds) {
    await recordStudySession(userId, nodeId, correctRatio);
  }
}

/**
 * Bir topic'in bilgi seviyesini doğrudan (absolute) olarak ata.
 * topic-knowledge'dan çağrılır. Incremental değil, idempotent.
 */
export async function setAbsoluteMasteryForTopic(
  userId: string,
  topicId: string,
  mastery: number
): Promise<void> {
  const nodeIds = await getConceptNodesForTopic(topicId);
  if (nodeIds.length === 0) return;

  const clampedMastery = Math.max(0.0, Math.min(1.0, mastery));

  for (const nodeId of nodeIds) {
    await prisma.userCognitiveState.upsert({
      where: { userId_nodeId: { userId, nodeId } },
      update: {
        masteryLevel: clampedMastery,
        lastTestedAt: new Date(),
      },
      create: {
        userId,
        nodeId,
        masteryLevel: clampedMastery,
        strength: 2.0,
        successCount: 0,
        lastTestedAt: new Date(),
      },
    });
  }
}
