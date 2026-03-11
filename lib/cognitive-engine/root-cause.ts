// ==================== Kök Neden Analizi (Root Cause Analysis) ====================
//
// Öğrenci "Türevde hata yaptım" dediğinde, sistem körü körüne türev çözdürmez.
// DAG üzerindeki W değerlerini takip edip sorunun aslında
// "Çarpanlara Ayırma"daki bir zafiyetten kaynaklandığını bulur.
//
// Algoritma: Recursive BFS — child'dan parent'lara doğru geriye giderek
// en düşük efektif mastery'ye sahip kök düğümü bul.

import type { ConceptNodeData, DependencyEdgeData, CognitiveStateData, RootCauseResult } from './types';
import { calculateCeilingFromParent } from './ceiling-penalty';

/**
 * Bir node'da hata yapıldığında, DAG üzerinde geriye doğru giderek
 * en zayıf kök nedeni (parent zincirindeki en düşük M'li node) bul.
 */
export function findWeakestRoot(
  targetNodeId: string,
  nodes: ConceptNodeData[],
  edges: DependencyEdgeData[],
  states: CognitiveStateData[]
): RootCauseResult | null {
  const stateMap = new Map<string, number>();
  for (const s of states) {
    stateMap.set(s.nodeId, s.masteryLevel);
  }

  const nodeMap = new Map<string, ConceptNodeData>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  // Hedef node'un kendisi
  const targetNode = nodeMap.get(targetNodeId);
  if (!targetNode) return null;

  // BFS ile tüm ancestor'ları keşfet
  type PathEntry = { nodeId: string; path: string[]; cumulativePenalty: number };
  const queue: PathEntry[] = [{ nodeId: targetNodeId, path: [targetNodeId], cumulativePenalty: 0 }];
  const visited = new Set<string>();

  let weakestResult: RootCauseResult | null = null;
  let lowestEffective = Infinity;

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (visited.has(current.nodeId)) continue;
    visited.add(current.nodeId);

    const currentMastery = stateMap.get(current.nodeId) ?? 0.0;
    const currentNode = nodeMap.get(current.nodeId);

    // Bu node'un parent'larını bul
    const incomingEdges = edges.filter(e => e.childNodeId === current.nodeId);

    if (incomingEdges.length === 0) {
      // Kök düğüme ulaştık — efektif mastery'si en düşük mü?
      if (currentMastery < lowestEffective) {
        lowestEffective = currentMastery;
        weakestResult = {
          weakestNode: currentNode!,
          effectiveMastery: currentMastery,
          penalty: 1.0 - currentMastery,
          path: current.path,
        };
      }
      continue;
    }

    // Parent'lara doğru ilerle
    for (const edge of incomingEdges) {
      const parentMastery = stateMap.get(edge.parentNodeId) ?? 0.0;
      const ceiling = calculateCeilingFromParent(parentMastery, edge.dependencyWeight);
      const penalty = 1.0 - ceiling;

      // Parent zayıfsa ve bu child'ı ciddi şekilde etkiliyorsa → kuyruğa ekle
      if (parentMastery < 0.8 || penalty > 0.1) {
        queue.push({
          nodeId: edge.parentNodeId,
          path: [...current.path, edge.parentNodeId],
          cumulativePenalty: current.cumulativePenalty + penalty,
        });
      }

      // Bu parent'ı direkt aday olarak da değerlendir
      const parentNode = nodeMap.get(edge.parentNodeId);
      if (parentNode && parentMastery < lowestEffective) {
        lowestEffective = parentMastery;
        weakestResult = {
          weakestNode: parentNode,
          effectiveMastery: parentMastery,
          penalty,
          path: [...current.path, edge.parentNodeId],
        };
      }
    }
  }

  return weakestResult;
}

/**
 * Bir node için tüm zayıf parent zincirlerini bul (en çok 5 sonuç).
 * Kök neden analizi raporlama için kullanılır.
 */
export function findAllWeakRoots(
  targetNodeId: string,
  nodes: ConceptNodeData[],
  edges: DependencyEdgeData[],
  states: CognitiveStateData[],
  maxResults: number = 5
): RootCauseResult[] {
  const stateMap = new Map<string, number>();
  for (const s of states) {
    stateMap.set(s.nodeId, s.masteryLevel);
  }

  const nodeMap = new Map<string, ConceptNodeData>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  const results: RootCauseResult[] = [];
  const visited = new Set<string>();

  function dfs(nodeId: string, path: string[]): void {
    if (visited.has(nodeId) || results.length >= maxResults) return;
    visited.add(nodeId);

    const mastery = stateMap.get(nodeId) ?? 0.0;
    const node = nodeMap.get(nodeId);
    if (!node) return;

    const incomingEdges = edges.filter(e => e.childNodeId === nodeId);

    // Zayıf kök düğüm → sonuçlara ekle
    if (mastery < 0.6) {
      const maxPenalty = incomingEdges.length > 0
        ? Math.max(...edges
            .filter(e => e.parentNodeId === nodeId)
            .map(e => e.dependencyWeight * (1 - mastery)))
        : 1 - mastery;

      results.push({
        weakestNode: node,
        effectiveMastery: mastery,
        penalty: maxPenalty,
        path: [...path],
      });
    }

    // Parent'lara devam
    for (const edge of incomingEdges) {
      if (!visited.has(edge.parentNodeId)) {
        dfs(edge.parentNodeId, [...path, edge.parentNodeId]);
      }
    }
  }

  dfs(targetNodeId, [targetNodeId]);

  // En düşük efektif mastery'ye göre sırala
  return results.sort((a, b) => a.effectiveMastery - b.effectiveMastery);
}
