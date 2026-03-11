// ==================== Tavan Cezası Formülü (Ceiling Penalty) ====================
//
// Aksiyom: Bir hedef düğümün (child) efektif mastery'si, onu besleyen
// önkoşulların (parent) mastery'leri ve bağımlılık ağırlıkları (W) ile sınırlıdır.
//
// Formül: M_cap = min_i( 1.0 - W_i * (1.0 - M_i) )
//
// Örnek:
//   Parent A: W=0.9, M=0.6 → Tavan = 1 - 0.9*(1-0.6) = 0.64
//   Parent C: W=0.5, M=0.8 → Tavan = 1 - 0.5*(1-0.8) = 0.90
//   Sonuç: M_cap = min(0.64, 0.90) = 0.64

import type { DependencyEdgeData, CognitiveStateData } from './types';

/**
 * Tek bir parent'ın child üzerindeki tavan cezasını hesapla.
 * Dönüş: 0.0-1.0 arası child'ın bu parent yüzünden ulaşabileceği max M.
 */
export function calculateCeilingFromParent(
  parentMastery: number,
  dependencyWeight: number
): number {
  const deficit = 1.0 - parentMastery;
  const penalty = dependencyWeight * deficit;
  return 1.0 - penalty;
}

/**
 * Bir child node'un tüm parent'larından gelen efektif mastery tavanını hesapla.
 * Eğer parent yoksa (kök düğüm), tavan = 1.0 (sınırsız).
 */
export function calculateEffectiveMasteryCap(
  childNodeId: string,
  edges: DependencyEdgeData[],
  stateMap: Map<string, number> // nodeId → masteryLevel
): number {
  // Bu node'a giren kenarları bul (parent → child)
  const incomingEdges = edges.filter(e => e.childNodeId === childNodeId);

  if (incomingEdges.length === 0) {
    // Kök düğüm — sınır yok
    return 1.0;
  }

  let minCeiling = 1.0;

  for (const edge of incomingEdges) {
    const parentMastery = stateMap.get(edge.parentNodeId) ?? 0.0;
    const ceiling = calculateCeilingFromParent(parentMastery, edge.dependencyWeight);
    if (ceiling < minCeiling) {
      minCeiling = ceiling;
    }
  }

  return Math.max(0.0, minCeiling);
}

/**
 * Bir node'un efektif mastery'sini hesapla:
 * min(kendi raw mastery, parent'lardan gelen tavan)
 */
export function getEffectiveMastery(
  nodeId: string,
  edges: DependencyEdgeData[],
  stateMap: Map<string, number> // nodeId → masteryLevel
): number {
  const rawMastery = stateMap.get(nodeId) ?? 0.0;
  const cap = calculateEffectiveMasteryCap(nodeId, edges, stateMap);
  return Math.min(rawMastery, cap);
}

/**
 * Tüm node'lar için efektif mastery hesapla.
 * Topolojik sıralama ile — parent'lar önce hesaplanır, child'lar sonra.
 */
export function calculateAllEffectiveMasteries(
  nodeIds: string[],
  edges: DependencyEdgeData[],
  states: CognitiveStateData[]
): Map<string, number> {
  // Raw mastery map
  const rawMap = new Map<string, number>();
  for (const s of states) {
    rawMap.set(s.nodeId, s.masteryLevel);
  }

  // Topolojik sıralama (Kahn's algorithm)
  const sorted = topologicalSort(nodeIds, edges);

  // Efektif mastery map — topolojik sırayla hesapla
  const effectiveMap = new Map<string, number>();

  for (const nodeId of sorted) {
    const rawMastery = rawMap.get(nodeId) ?? 0.0;

    // Bu node'un parent'larının efektif mastery'lerini kullan (zaten hesaplanmış)
    const incomingEdges = edges.filter(e => e.childNodeId === nodeId);

    if (incomingEdges.length === 0) {
      effectiveMap.set(nodeId, rawMastery);
      continue;
    }

    let minCeiling = 1.0;
    for (const edge of incomingEdges) {
      const parentEffective = effectiveMap.get(edge.parentNodeId) ?? 0.0;
      const ceiling = calculateCeilingFromParent(parentEffective, edge.dependencyWeight);
      if (ceiling < minCeiling) {
        minCeiling = ceiling;
      }
    }

    effectiveMap.set(nodeId, Math.min(rawMastery, Math.max(0.0, minCeiling)));
  }

  return effectiveMap;
}

/**
 * DAG üzerinde topolojik sıralama (Kahn's algorithm).
 * Parent'lar child'lardan önce gelir.
 */
function topologicalSort(nodeIds: string[], edges: DependencyEdgeData[]): string[] {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  // Başlat
  for (const id of nodeIds) {
    inDegree.set(id, 0);
    adjacency.set(id, []);
  }

  // Kenarları ekle
  for (const edge of edges) {
    const current = inDegree.get(edge.childNodeId) ?? 0;
    inDegree.set(edge.childNodeId, current + 1);
    const adj = adjacency.get(edge.parentNodeId) ?? [];
    adj.push(edge.childNodeId);
    adjacency.set(edge.parentNodeId, adj);
  }

  // Kuyruğa in-degree=0 olanları ekle
  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    sorted.push(node);

    for (const child of adjacency.get(node) ?? []) {
      const newDeg = (inDegree.get(child) ?? 1) - 1;
      inDegree.set(child, newDeg);
      if (newDeg === 0) queue.push(child);
    }
  }

  // Kalan (döngüde kalmış) node'ları da ekle (güvenlik)
  for (const id of nodeIds) {
    if (!sorted.includes(id)) sorted.push(id);
  }

  return sorted;
}
