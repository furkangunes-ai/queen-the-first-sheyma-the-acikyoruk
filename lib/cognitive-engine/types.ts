// ==================== Bilişsel Çizge Motoru — Tip Tanımları ====================

/** Atomik kavram düğümü (DB'den gelen haliyle) */
export interface ConceptNodeData {
  id: string;
  name: string;
  slug: string;
  domain: string;
  examType: string;
  complexityScore: number;
  parentTopicId: string | null;
  sortOrder: number;
}

/** DAG kenarı */
export interface DependencyEdgeData {
  id: string;
  parentNodeId: string;
  childNodeId: string;
  dependencyWeight: number; // W: 0.0-1.0
  isAdaptive: boolean;
}

/** Kullanıcının bir düğümdeki bilişsel durumu */
export interface CognitiveStateData {
  id: string;
  userId: string;
  nodeId: string;
  masteryLevel: number;  // M: 0.0-1.0
  strength: number;      // S: Ebbinghaus sağlamlık gücü
  successCount: number;
  lastTestedAt: Date | null;
}

/** Bozunma hesabı sonucu */
export interface RetentionInfo {
  nodeId: string;
  retention: number;      // R: 0.0-1.0
  daysSinceTest: number;
  isCritical: boolean;    // R < CRITICAL_THRESHOLD
}

/** Kök neden analizi sonucu */
export interface RootCauseResult {
  weakestNode: ConceptNodeData;
  effectiveMastery: number;
  penalty: number;          // Ne kadar ceza veriyor (1 - ceiling)
  path: string[];           // node id'leri: child → ... → weakest root
}

/** Haftalık plan öğesi (motor çıktısı) */
export interface PlanItem {
  nodeId: string;
  nodeName: string;
  domain: string;
  duration: number;           // Dakika
  dayOfWeek: number;          // 0-6 (Pazartesi-Pazar)
  priority: 'critical' | 'review' | 'new' | 'reinforcement';
  reason: string;             // Neden bu konu? (kök neden, bozunma, yeni konu)
  expectedMasteryGain: number; // Tahmini M artışı
}

/** Planlama bağlamı (Knapsack girdisi) */
export interface PlanningContext {
  userId: string;
  nodes: ConceptNodeData[];
  edges: DependencyEdgeData[];
  states: CognitiveStateData[];
  availableDays: number[];       // [0,1,2,3,4] — müsait günler
  dailyStudyMinutes: number;     // Günlük çalışma dakikası
  examType?: string;             // "tyt" | "ayt" | "both"
}

/** Planlama sonucu */
export interface WeeklyPlanResult {
  items: PlanItem[];
  totalMinutes: number;
  criticalNodesCount: number;
  newNodesCount: number;
  reviewNodesCount: number;
}

// ==================== Sabitler ====================

/** Bozunma eşiği: R bu değerin altına düşerse konu "Kritik İhtiyaç Kuyruğu"na girer */
export const CRITICAL_RETENTION_THRESHOLD = 0.85;

/** Başlangıç S değeri (düşük karmaşıklık → yüksek S, yüksek karmaşıklık → düşük S) */
export const BASE_STRENGTH = 3.0;

/** Fibonacci-benzeri S büyüme çarpanları: successCount'a göre */
export const STRENGTH_MULTIPLIERS = [1, 1, 2, 3, 5, 8, 13, 21];

/** Bir kavram için tahmini çalışma süresi (dakika) — karmaşıklığa göre */
export function estimateDuration(complexityScore: number): number {
  // 1 → 15dk, 5 → 30dk, 10 → 60dk
  return Math.round(15 + (complexityScore - 1) * 5);
}
