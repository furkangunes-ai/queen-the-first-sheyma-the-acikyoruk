// ==================== Knapsack Planlama Algoritması ====================
//
// Haftalık plan oluşturmayı bir Sırt Çantası Problemi olarak çözer.
// - Kapasite (kısıt): Haftalık toplam çalışma dakikası
// - Öğeler: Çalışılması gereken kavramlar (node)
// - Değer: Her kavramın getireceği tahmini skor artışı
//
// Öncelik sırası:
// 1) DAG temelleri — parent'ları zayıf olan child'ların parent'ları
// 2) Kritik düğümler — R < 0.85 (unutulmak üzere)
// 3) Yeni konular — M=0 (hiç çalışılmamış)
// 4) Güçlendirme — Orta seviye konuların tekrarı

import type {
  ConceptNodeData,
  DependencyEdgeData,
  CognitiveStateData,
  PlanItem,
  PlanningContext,
  WeeklyPlanResult,
} from './types';
import { estimateDuration, CRITICAL_RETENTION_THRESHOLD } from './types';
import { calculateAllEffectiveMasteries } from './ceiling-penalty';
import { calculateRetention } from './ebbinghaus';
import { findWeakestRoot } from './root-cause';

/** İç kullanım: Aday çalışma öğesi */
interface CandidateItem {
  nodeId: string;
  nodeName: string;
  domain: string;
  duration: number;       // dakika
  value: number;          // Getiri skoru (yüksek = daha önemli)
  priority: PlanItem['priority'];
  reason: string;
  expectedGain: number;
}

/**
 * Greedy Knapsack ile haftalık çalışma planı oluştur.
 */
export function generateWeeklyPlan(ctx: PlanningContext): WeeklyPlanResult {
  const { nodes, edges, states, availableDays, dailyStudyMinutes } = ctx;

  // 1) Tüm efektif mastery'leri hesapla
  const nodeIds = nodes.map(n => n.id);
  const effectiveMap = calculateAllEffectiveMasteries(nodeIds, edges, states);

  // 2) State map oluştur
  const stateMap = new Map<string, CognitiveStateData>();
  for (const s of states) {
    stateMap.set(s.nodeId, s);
  }

  // 3) Node map oluştur
  const nodeMap = new Map<string, ConceptNodeData>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  // 4) Aday öğeleri oluştur
  const candidates: CandidateItem[] = [];

  for (const node of nodes) {
    // examType filtresi
    if (ctx.examType && ctx.examType !== 'both' && node.examType !== 'both' && node.examType !== ctx.examType) {
      continue;
    }

    const state = stateMap.get(node.id);
    const effectiveMastery = effectiveMap.get(node.id) ?? 0.0;
    const rawMastery = state?.masteryLevel ?? 0.0;
    const retention = state ? calculateRetention(state) : 0.0;
    const duration = estimateDuration(node.complexityScore);

    // Kök neden analizi: Bu node'un parent'ları zayıfsa, parent'a çalış
    if (effectiveMastery < rawMastery * 0.8 && rawMastery > 0.3) {
      // Parent'lar darboğaz yaratıyor — kök nedeni bul
      const rootCause = findWeakestRoot(node.id, nodes, edges, states);
      if (rootCause && rootCause.weakestNode.id !== node.id) {
        const rootNode = rootCause.weakestNode;
        // Kök neden zaten listede yoksa ekle
        if (!candidates.some(c => c.nodeId === rootNode.id)) {
          candidates.push({
            nodeId: rootNode.id,
            nodeName: rootNode.name,
            domain: rootNode.domain,
            duration: estimateDuration(rootNode.complexityScore),
            value: 100 + rootCause.penalty * 50, // En yüksek öncelik
            priority: 'critical',
            reason: `${node.name} konusunun temeli zayıf`,
            expectedGain: 0.15,
          });
        }
      }
    }

    // Kritik düğüm: R < 0.85 (unutulmak üzere)
    if (retention < CRITICAL_RETENTION_THRESHOLD && rawMastery > 0.2) {
      candidates.push({
        nodeId: node.id,
        nodeName: node.name,
        domain: node.domain,
        duration: Math.round(duration * 0.6), // Tekrar daha kısa
        value: 80 + (CRITICAL_RETENTION_THRESHOLD - retention) * 40,
        priority: 'review',
        reason: `Unutulmak üzere (R=${(retention * 100).toFixed(0)}%)`,
        expectedGain: 0.1,
      });
      continue;
    }

    // Yeni konu: M=0 (hiç çalışılmamış)
    if (rawMastery === 0.0) {
      candidates.push({
        nodeId: node.id,
        nodeName: node.name,
        domain: node.domain,
        duration,
        value: 60 + (10 - node.complexityScore) * 2, // Kolay yeniler önce
        priority: 'new',
        reason: 'Henüz çalışılmamış konu',
        expectedGain: 0.2,
      });
      continue;
    }

    // Güçlendirme: 0.3 < M < 0.7 (orta seviye)
    if (rawMastery > 0.2 && rawMastery < 0.7) {
      candidates.push({
        nodeId: node.id,
        nodeName: node.name,
        domain: node.domain,
        duration: Math.round(duration * 0.75),
        value: 40 + (0.7 - rawMastery) * 30,
        priority: 'reinforcement',
        reason: `Güçlendirme gerekiyor (M=${(rawMastery * 100).toFixed(0)}%)`,
        expectedGain: 0.12,
      });
    }
  }

  // 5) Değere göre azalan sırala (Greedy)
  candidates.sort((a, b) => b.value - a.value);

  // 6) Tekrar eden node'ları çıkar
  const seen = new Set<string>();
  const uniqueCandidates = candidates.filter(c => {
    if (seen.has(c.nodeId)) return false;
    seen.add(c.nodeId);
    return true;
  });

  // 7) Haftalık kapasiteyi günlere dağıt
  const totalWeeklyMinutes = availableDays.length * dailyStudyMinutes;
  const dayCapacities = new Map<number, number>();
  for (const day of availableDays) {
    dayCapacities.set(day, dailyStudyMinutes);
  }

  // 8) Greedy Knapsack: Adayları günlere yerleştir
  const planItems: PlanItem[] = [];
  let totalUsedMinutes = 0;

  // Gün döngüsü indeksi
  let dayIndex = 0;

  for (const candidate of uniqueCandidates) {
    if (totalUsedMinutes + candidate.duration > totalWeeklyMinutes) break;

    // Uygun gün bul (dolu olmayan)
    let placed = false;
    for (let attempt = 0; attempt < availableDays.length; attempt++) {
      const day = availableDays[(dayIndex + attempt) % availableDays.length];
      const remaining = dayCapacities.get(day) ?? 0;

      if (remaining >= candidate.duration) {
        planItems.push({
          nodeId: candidate.nodeId,
          nodeName: candidate.nodeName,
          domain: candidate.domain,
          duration: candidate.duration,
          dayOfWeek: day,
          priority: candidate.priority,
          reason: candidate.reason,
          expectedMasteryGain: candidate.expectedGain,
        });

        dayCapacities.set(day, remaining - candidate.duration);
        totalUsedMinutes += candidate.duration;
        dayIndex = (dayIndex + 1) % availableDays.length; // Round-robin
        placed = true;
        break;
      }
    }

    if (!placed) continue; // Bu öğeyi sığdıramadık, sonrakine geç
  }

  // 9) Günlere göre sırala
  planItems.sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  // 10) Sonuç
  return {
    items: planItems,
    totalMinutes: totalUsedMinutes,
    criticalNodesCount: planItems.filter(i => i.priority === 'critical').length,
    newNodesCount: planItems.filter(i => i.priority === 'new').length,
    reviewNodesCount: planItems.filter(i => i.priority === 'review').length,
  };
}
