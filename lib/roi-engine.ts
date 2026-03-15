// ==================== ROI Motoru (Return on Investment Engine) ====================
//
// Aksiyom 3: Minimum Direnç Yolu — Sistem çevre mimarı, diktatör değil.
// Newton'un Eylemsizlik Prensibi: Duran cisim durmaya devam eder.
// Her ekstra tıklama = vazgeçme olasılığı.
//
// Bu motor, öğrencinin önüne "en verimli tek aksiyonu" koyar.
// "Ne yapman gerektiğini söylemiyor, en yüksek ROI hamlesini seçiyor."
//
// ROI = examWeight × gainPotential × dagLeverage × urgencyMultiplier

import {
  betaMean,
  betaCI95,
  categorize,
  evidenceCount,
  CATEGORY_LABELS,
  type MasteryCategory,
} from './bayesian-engine';
import { calculateRetention } from './cognitive-engine/ebbinghaus';
import { CRITICAL_RETENTION_THRESHOLD, type CognitiveStateData } from './cognitive-engine/types';

// ==================== Tip Tanımları ====================

export type ROIReason =
  | 'retention_critical'   // Ebbinghaus eşiği: R < 0.85 (unutmak üzere)
  | 'dag_bottleneck'       // DAG darboğazı: parent zayıf, child'ları kilitleniyor
  | 'high_weight_weak'     // Yüksek sınav ağırlığı + zayıf belief
  | 'quick_win'            // CI %50-75, az çabayla güçlü'ye çıkar
  | 'new_topic'            // Hiç veri yok (unknown), keşfedilmeli
  | 'spaced_review';       // Spaced repetition zamanlama geldi

export type ActionType =
  | 'focused_practice'     // Soru çöz
  | 'concept_study'        // Konu anlatımı
  | 'spaced_review'        // Aralıklı tekrar
  | 'explore';             // Keşfet (hiç veri yok)

export const ACTION_LABELS: Record<ActionType, string> = {
  focused_practice: 'Odaklanmış Pratik',
  concept_study: 'Konu Çalışması',
  spaced_review: 'Aralıklı Tekrar',
  explore: 'Keşfet',
};

export const REASON_LABELS: Record<ROIReason, string> = {
  retention_critical: 'Unutma eşiğine yaklaşıyor',
  dag_bottleneck: 'Temel konu darboğazı',
  high_weight_weak: 'Yüksek sınav ağırlığı',
  quick_win: 'Hızlı kazanım fırsatı',
  new_topic: 'Keşfedilmemiş konu',
  spaced_review: 'Tekrar zamanı geldi',
};

export interface TopicROI {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  examTypeName: string;
  roi: number;
  reason: ROIReason;
  reasonLabel: string;
  estimatedDuration: number;
  actionType: ActionType;
  actionLabel: string;
  belief: {
    alpha: number;
    beta: number;
    mean: number;
    ci95Lower: number;
    ci95Upper: number;
    category: MasteryCategory;
    categoryLabel: string;
    evidenceCount: number;
  };
}

export interface NextAction {
  primary: TopicROI;
  alternatives: TopicROI[];
  sessionDuration: number;
  dailyBudgetRemaining: number;
  todayCompleted: {
    sessions: number;
    totalMinutes: number;
  };
}

// ==================== Girdi Tipleri ====================

export interface TopicInput {
  id: string;
  name: string;
  difficulty: number;
  subjectId: string;
  subjectName: string;
  subjectQuestionCount: number;
  examTypeName: string;
}

export interface DAGContext {
  childCount: number;       // Bu konunun ConceptNode'larının DAG'daki child sayısı
  ceilingPenalty: number;    // Bu konunun zayıflığının child'lara verdiği ceza (0-1)
}

export interface BeliefInput {
  alpha: number;
  beta: number;
}

export type StudyGoal = 'new' | 'improve' | 'review' | 'auto';

// ==================== Knowledge Modifier ====================

/**
 * TopicKnowledge level (öğrenci beyanı) + TopicBelief (Bayesyen veri) →
 * ROI çarpanı.
 *
 * studyGoal'a göre farklı ağırlıklandırma:
 * - 'new': düşük level konulara bonus, yükseklere ceza
 * - 'improve': orta level konulara bonus
 * - 'review': yüksek level + retention düşen konulara bonus
 * - 'auto': tutarsızlık + genel ağırlıklama
 */
export function calculateKnowledgeModifier(
  topicKnowledgeLevel: number | null, // 0-5 veya null
  beliefMean: number,                  // 0-1
  evidenceCount: number,
  studyGoal: StudyGoal = 'auto'
): number {
  // Hiç bilgi yoksa nötr
  if (topicKnowledgeLevel === null || topicKnowledgeLevel === undefined) {
    return 1.0;
  }

  const level = topicKnowledgeLevel;
  const selfRating = level / 5; // 0-1 skalası

  // Temel modifier (auto mode)
  let baseModifier: number;

  // Tutarsızlık tespiti: öğrenci yüksek puanlamış ama veriler düşük → DİKKAT
  const isOverrated = level >= 4 && beliefMean < 0.4 && evidenceCount >= 3;
  if (isOverrated) {
    baseModifier = 1.5; // Tutarsız! Yüksek öncelik ver
  } else if (level <= 1 && beliefMean < 0.3) {
    baseModifier = 1.4; // Bilmiyor ve veri de teyit ediyor
  } else if (level <= 1 && beliefMean > 0.5) {
    baseModifier = 0.8; // Bilmiyor diyor ama veri iyi (underrated)
  } else if (level >= 4 && beliefMean > 0.6) {
    baseModifier = 0.4; // Biliyor ve veri teyit ediyor — düşük öncelik
  } else {
    baseModifier = 1.0; // Orta — standart ROI
  }

  // studyGoal'a göre ek ayarlama
  switch (studyGoal) {
    case 'new':
      if (selfRating <= 0.3) baseModifier *= 1.5;        // Bilmediği konulara bonus
      else if (selfRating >= 0.7) baseModifier *= 0.3;   // Bildiği konulara ağır ceza
      break;
    case 'improve':
      if (selfRating >= 0.3 && selfRating <= 0.7) baseModifier *= 1.4; // Orta seviye bonus
      else if (selfRating < 0.2) baseModifier *= 0.5;     // Bilmiyor → geliştirmek değil
      break;
    case 'review':
      if (selfRating >= 0.6) baseModifier *= 1.5;         // Biliyor + tekrar
      else if (selfRating < 0.3) baseModifier *= 0.3;     // Bilmiyor → tekrar değil
      break;
    case 'auto':
    default:
      break;
  }

  return Math.max(0.1, Math.min(3.0, baseModifier));
}

// ==================== ROI Hesaplama ====================

/**
 * Tek bir konu için ROI hesapla.
 *
 * ROI = examWeight × gainPotential × dagLeverage × urgencyMultiplier × knowledgeModifier
 */
export function calculateTopicROI(
  topic: TopicInput,
  belief: BeliefInput,
  dagContext: DAGContext,
  cognitiveState: CognitiveStateData | null,
  hasSpacedRepItems: boolean,
  totalQuestions: number,
  knowledgeModifier: number = 1.0
): TopicROI {
  const mean = betaMean(belief.alpha, belief.beta);
  const ci = betaCI95(belief.alpha, belief.beta);
  const evidence = evidenceCount(belief.alpha, belief.beta);
  const category = categorize(belief.alpha, belief.beta);

  // 1. Sınav Ağırlığı
  const examWeight = topic.subjectQuestionCount / Math.max(totalQuestions, 1);

  // 2. Kazanım Potansiyeli
  // Çok düşük mastery: temelden başlamak yavaş
  // Orta mastery: en yüksek marjinal getiri
  // Yüksek mastery: artık çok az kazanım
  let gainPotential: number;
  if (mean < 0.15) {
    gainPotential = 0.5; // Temelden başlamak zaman alır
  } else if (mean < 0.5) {
    gainPotential = 1.0 - mean * 0.5; // Orta alan: yüksek getiri
  } else {
    gainPotential = 1.0 - mean; // Diminishing returns
  }

  // 3. DAG Kaldıracı
  const dagLeverage = 1.0 + dagContext.ceilingPenalty * dagContext.childCount * 0.3;

  // 4. Aciliyet Çarpanı
  let urgencyMultiplier = 1.0;
  let reason: ROIReason = 'high_weight_weak';

  // Retention kritiği (Ebbinghaus eşiği)
  if (cognitiveState && mean > 0.3) {
    const retention = calculateRetention(cognitiveState);
    if (retention < CRITICAL_RETENTION_THRESHOLD) {
      urgencyMultiplier = 2.0;
      reason = 'retention_critical';
    }
  }

  // DAG darboğazı
  if (reason === 'high_weight_weak' && dagContext.ceilingPenalty > 0.3 && dagContext.childCount >= 2) {
    urgencyMultiplier = 1.8;
    reason = 'dag_bottleneck';
  }

  // Spaced repetition zamanı
  if (reason === 'high_weight_weak' && hasSpacedRepItems) {
    urgencyMultiplier = 1.5;
    reason = 'spaced_review';
  }

  // Quick win
  if (reason === 'high_weight_weak' && ci.lower >= 0.35 && ci.lower < 0.60 && evidence >= 5) {
    urgencyMultiplier = 1.3;
    reason = 'quick_win';
  }

  // Keşfedilmemiş konu
  if (reason === 'high_weight_weak' && evidence < 3) {
    urgencyMultiplier = 0.8;
    reason = 'new_topic';
  }

  // ROI (knowledgeModifier: müfredat bilgi seviyesinden gelen ağırlık)
  const roi = examWeight * gainPotential * dagLeverage * urgencyMultiplier * knowledgeModifier;

  // Aksiyon tipi
  const actionType = determineAction(mean, evidence, reason);

  return {
    topicId: topic.id,
    topicName: topic.name,
    subjectId: topic.subjectId,
    subjectName: topic.subjectName,
    examTypeName: topic.examTypeName,
    roi: Math.round(roi * 1000) / 1000,
    reason,
    reasonLabel: REASON_LABELS[reason],
    estimatedDuration: estimateStudyDuration(mean, topic.difficulty),
    actionType,
    actionLabel: ACTION_LABELS[actionType],
    belief: {
      alpha: Math.round(belief.alpha * 100) / 100,
      beta: Math.round(belief.beta * 100) / 100,
      mean: Math.round(mean * 1000) / 1000,
      ci95Lower: Math.round(ci.lower * 1000) / 1000,
      ci95Upper: Math.round(ci.upper * 1000) / 1000,
      category,
      categoryLabel: CATEGORY_LABELS[category],
      evidenceCount: Math.round(evidence * 10) / 10,
    },
  };
}

/**
 * Aksiyon tipi belirleme (deterministik kurallar).
 */
function determineAction(mean: number, evidence: number, reason: ROIReason): ActionType {
  if (reason === 'spaced_review') return 'spaced_review';
  if (evidence < 3) return 'explore';
  if (mean < 0.3) return 'concept_study';
  if (mean < 0.65) return 'focused_practice';
  return 'spaced_review';
}

/**
 * Tahmini çalışma süresi (dakika).
 */
function estimateStudyDuration(mean: number, difficulty: number): number {
  const base = 20;
  const masteryFactor = 1 + (1 - mean) * 0.5;
  const difficultyFactor = 0.8 + difficulty * 0.1;
  return Math.round(base * masteryFactor * difficultyFactor);
}

// ==================== Next Action Seçici ====================

/**
 * ROI listesinden en optimal aksiyonu seç.
 *
 * Çeşitlilik kısıtı: art arda aynı dersten 2 konu önerme
 * (cognitive interleaving — farklı dersler arası geçiş öğrenmeyi güçlendirir).
 */
export function selectNextAction(
  allROIs: TopicROI[],
  dailyStudyHours: number,
  todayCompletedMinutes: number,
  todayCompletedSessions: number
): NextAction {
  if (allROIs.length === 0) {
    throw new Error('No ROI data available');
  }

  // ROI'ye göre azalan sırala
  const sorted = [...allROIs].sort((a, b) => b.roi - a.roi);

  // Çeşitlilik kısıtı uygula: ilk 3'te aynı dersten max 2 konu
  const diversified = applyDiversityConstraint(sorted);

  const dailyBudget = dailyStudyHours * 60;
  const remaining = Math.max(0, dailyBudget - todayCompletedMinutes);

  const primary = diversified[0];
  const sessionDuration = Math.min(primary.estimatedDuration, Math.max(15, remaining));

  return {
    primary,
    alternatives: diversified.slice(1, 3),
    sessionDuration,
    dailyBudgetRemaining: remaining,
    todayCompleted: {
      sessions: todayCompletedSessions,
      totalMinutes: todayCompletedMinutes,
    },
  };
}

/**
 * Çeşitlilik kısıtı: ilk 5 öneride aynı dersten max 2 konu olsun.
 */
function applyDiversityConstraint(sorted: TopicROI[]): TopicROI[] {
  const result: TopicROI[] = [];
  const subjectCounts = new Map<string, number>();

  for (const item of sorted) {
    const count = subjectCounts.get(item.subjectName) ?? 0;
    if (count < 2 || result.length >= 5) {
      result.push(item);
      subjectCounts.set(item.subjectName, count + 1);
    }
    if (result.length >= 5) break;
  }

  // Eğer çeşitlilik yüzünden 5'ten az seçtiyse, geri kalanları ekle
  if (result.length < 3) {
    for (const item of sorted) {
      if (!result.includes(item)) {
        result.push(item);
        if (result.length >= 3) break;
      }
    }
  }

  return result;
}
