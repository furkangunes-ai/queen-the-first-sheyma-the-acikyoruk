// ==================== Ebbinghaus Bozunma & Güçlenme ====================
//
// Aksiyom: İnsan hafızasındaki bilgi zamanla üstel olarak bozunur.
// Formül: R = e^(-t/S)
//   R: Tutma olasılığı (retention), 0.0-1.0
//   t: Son testten geçen gün sayısı
//   S: Sağlamlık gücü (strength) — her başarılı tekrarda büyür
//
// S Büyüme Stratejisi:
//   Başlangıç S = BASE_STRENGTH / (complexityScore / 5)
//   Her başarılı tekrarda S += STRENGTH_MULTIPLIERS[successCount]
//   Yani ilk günlerde S=3 iken, 7. başarılı tekrarda S=57 (bilgi kalıcı hafızaya geçer)

import type { CognitiveStateData, RetentionInfo } from './types';
import {
  CRITICAL_RETENTION_THRESHOLD,
  BASE_STRENGTH,
  STRENGTH_MULTIPLIERS,
} from './types';

/**
 * Bir kavramın tutma olasılığını (R) hesapla.
 * R = e^(-t/S)
 * t = now - lastTestedAt (gün cinsinden)
 */
export function calculateRetention(state: CognitiveStateData, now?: Date): number {
  if (!state.lastTestedAt) {
    // Hiç test edilmemiş — mastery 0 ise R anlamsız, 0 döndür
    return state.masteryLevel > 0 ? 0.5 : 0.0;
  }

  const currentTime = now ?? new Date();
  const diffMs = currentTime.getTime() - new Date(state.lastTestedAt).getTime();
  const daysSinceTest = diffMs / (1000 * 60 * 60 * 24);

  if (daysSinceTest <= 0) return 1.0; // Bugün test edilmiş

  const S = state.strength;
  if (S <= 0) return 0.0;

  const R = Math.exp(-daysSinceTest / S);
  return Math.max(0.0, Math.min(1.0, R));
}

/**
 * Başlangıç S değerini karmaşıklık skoruna göre hesapla.
 * Yüksek karmaşıklık → düşük S → hızlı unutulur.
 */
export function calculateInitialStrength(complexityScore: number): number {
  // complexity 1 → S=6, complexity 5 → S=3, complexity 10 → S=1.5
  const factor = Math.max(1, complexityScore) / 5;
  return BASE_STRENGTH / factor;
}

/**
 * Başarılı bir tekrar sonrası yeni S değerini hesapla.
 * Fibonacci-benzeri büyüme: her başarı S'i katlar.
 */
export function calculateNewStrength(currentStrength: number, successCount: number): number {
  const idx = Math.min(successCount, STRENGTH_MULTIPLIERS.length - 1);
  const multiplier = STRENGTH_MULTIPLIERS[idx];
  return currentStrength + multiplier;
}

/**
 * Başarısız bir tekrar sonrası S değerini hesapla.
 * Başarısızlık S'i yarıya indirir (ama minimum değerin altına düşmez).
 */
export function calculateStrengthAfterFailure(currentStrength: number): number {
  return Math.max(1.0, currentStrength * 0.5);
}

/**
 * Tüm state'ler için retention bilgisi hesapla.
 */
export function calculateAllRetentions(
  states: CognitiveStateData[],
  now?: Date
): RetentionInfo[] {
  const currentTime = now ?? new Date();

  return states.map(state => {
    const retention = calculateRetention(state, currentTime);
    const daysSinceTest = state.lastTestedAt
      ? (currentTime.getTime() - new Date(state.lastTestedAt).getTime()) / (1000 * 60 * 60 * 24)
      : Infinity;

    return {
      nodeId: state.nodeId,
      retention,
      daysSinceTest: Math.round(daysSinceTest * 10) / 10,
      isCritical: retention < CRITICAL_RETENTION_THRESHOLD && state.masteryLevel > 0,
    };
  });
}

/**
 * R < CRITICAL_THRESHOLD olan kritik düğümleri getir (en düşük R önce).
 */
export function getCriticalNodes(
  states: CognitiveStateData[],
  now?: Date
): RetentionInfo[] {
  return calculateAllRetentions(states, now)
    .filter(r => r.isCritical)
    .sort((a, b) => a.retention - b.retention);
}
