// ==================== Bilisssel Motor Telemetrisi (Kara Kutu) ====================
//
// Aksiyom 1 (Telemetri Yasasi): Kapali bir kutunun icinde ne oldugunu,
// ancak disariya sizdirdigi sinyallerden bilebilirsin.
//
// Bu modul, Elastic Projection, Bayesyen guncelleme ve ROI motorunun
// kritik donusumlerini structured JSON formatinda loglar.
// Railway/Axiom/Datadog uzerinden gercek zamanli izlenebilir.
//
// Log seviyeleri:
//   info  → normal donusum (gamma 0.3 calisti, M degisti)
//   warn  → buyuk siccrama (delta > 0.3) veya anormal deger
//   error → motor hatasi (catch bloklarinda)

import { logger } from './logger';

// ── Elastic Projection Telemetrisi ──

interface ProjectionLog {
  userId: string;
  nodeId: string;
  topicId: string;
  bNew: number;      // Bayesyen ortalama (yeni)
  mOld: number;      // DAG mastery (eski)
  mNew: number;      // DAG mastery (yeni)
  delta: number;     // mNew - mOld
  gamma: number;     // kullanilan gamma katsayisi
  isNew: boolean;    // ilk kez olusturuldu mu
}

export function logProjection(entry: ProjectionLog): void {
  const absDelta = Math.abs(entry.delta);

  // Buyuk siccrama uyarisi: gamma=0.3 ile tek adimda 0.3'ten fazla degisim
  // = B_new ve M_old arasi uçurum → muhtemelen veri tutarsizligi
  if (absDelta > 0.25) {
    logger.warn(
      { event: 'elastic_projection', ...entry },
      `[EP] JUMP userId=${entry.userId} node=${entry.nodeId} B=${entry.bNew.toFixed(3)} M:${entry.mOld.toFixed(3)}→${entry.mNew.toFixed(3)} Δ=${entry.delta > 0 ? '+' : ''}${entry.delta.toFixed(3)} γ=${entry.gamma}`
    );
  } else {
    logger.info(
      { event: 'elastic_projection', ...entry },
      `[EP] userId=${entry.userId} node=${entry.nodeId} B=${entry.bNew.toFixed(3)} M:${entry.mOld.toFixed(3)}→${entry.mNew.toFixed(3)} Δ=${entry.delta > 0 ? '+' : ''}${entry.delta.toFixed(3)}`
    );
  }
}

export function logProjectionSummary(
  userId: string,
  topicCount: number,
  updated: number,
  created: number,
  source: 'exam' | 'study'
): void {
  logger.info(
    { event: 'elastic_projection_summary', userId, topicCount, updated, created, source },
    `[EP] Summary userId=${userId} src=${source} topics=${topicCount} updated=${updated} created=${created}`
  );
}

// ── Bayesyen Belief Telemetrisi ──

interface BeliefUpdateLog {
  userId: string;
  topicId: string;
  alphaOld: number;
  betaOld: number;
  alphaNew: number;
  betaNew: number;
  meanOld: number;
  meanNew: number;
  source: 'exam_error' | 'exam_implicit_positive' | 'study_session';
}

export function logBeliefUpdate(entry: BeliefUpdateLog): void {
  const meanDelta = entry.meanNew - entry.meanOld;

  logger.info(
    { event: 'belief_update', ...entry, meanDelta },
    `[BELIEF] userId=${entry.userId} topic=${entry.topicId} src=${entry.source} μ:${entry.meanOld.toFixed(3)}→${entry.meanNew.toFixed(3)} Δ=${meanDelta > 0 ? '+' : ''}${meanDelta.toFixed(3)} α=${entry.alphaNew.toFixed(2)} β=${entry.betaNew.toFixed(2)}`
  );
}

// ── ROI / Next-Action Telemetrisi ──

export function logNextActionFetch(
  userId: string,
  topicCount: number,
  primaryTopicId: string | null,
  primaryROI: number,
  dailyBudgetRemaining: number,
  latencyMs: number
): void {
  logger.info(
    { event: 'next_action_fetch', userId, topicCount, primaryTopicId, primaryROI, dailyBudgetRemaining, latencyMs },
    `[ROI] userId=${userId} topics=${topicCount} primary=${primaryTopicId} roi=${primaryROI.toFixed(3)} budget=${dailyBudgetRemaining}min latency=${latencyMs}ms`
  );
}

// ── Engagement / Churn Telemetrisi ──

export function logStudySessionStart(
  userId: string,
  topicId: string,
  source: 'system_recommendation' | 'self_planned' | 'manual'
): void {
  logger.info(
    { event: 'study_session_start', userId, topicId, source },
    `[ENGAGE] userId=${userId} started topic=${topicId} src=${source}`
  );
}

export function logStreakUpdate(
  userId: string,
  currentStreak: number,
  longestStreak: number
): void {
  if (currentStreak > 0 && currentStreak === longestStreak) {
    logger.info(
      { event: 'streak_record', userId, currentStreak, longestStreak },
      `[ENGAGE] userId=${userId} NEW RECORD streak=${currentStreak}`
    );
  }
}
