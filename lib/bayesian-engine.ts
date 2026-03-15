// ==================== Olasılıksal Biliş Motoru (Bayesian Cognition Engine) ====================
//
// Aksiyom 1: Sinyal ve Gürültü — Deneme sonucu mutlak gerçek değil, gürültülü sinyaldir.
// Aksiyom 2: Hız = Nöral Miyelinasyon — Hızlı doğru > yavaş doğru.
// Aksiyom 3: Minimum Direnç Yolu — Kesin yargı yok, olasılıksal güven aralığı.
//
// Model: Her (userId, topicId) çifti için Beta(α, β) dağılımı.
//   - Prior: Beta(1, 1) = uniform
//   - α: "bilgi var" yönünde biriken kanıt gücü
//   - β: "bilgi yok" yönünde biriken kanıt gücü
//   - Mean: μ = α / (α + β)
//   - CI: Normal yaklaşımı ile %95 güven aralığı
//
// Saf fonksiyonlar: side-effect yok, test edilebilir.

// ==================== Temel Beta Hesaplamaları ====================

/** Beta dağılımının ortalaması: μ = α / (α + β) */
export function betaMean(alpha: number, beta: number): number {
  if (alpha + beta <= 0) return 0.5;
  return alpha / (alpha + beta);
}

/** Beta dağılımının varyansı: σ² = αβ / ((α+β)²(α+β+1)) */
export function betaVariance(alpha: number, beta: number): number {
  const sum = alpha + beta;
  if (sum <= 0) return 0.25;
  return (alpha * beta) / (sum * sum * (sum + 1));
}

/** Beta dağılımının standart sapması */
export function betaStdDev(alpha: number, beta: number): number {
  return Math.sqrt(betaVariance(alpha, beta));
}

/** %95 güven aralığı (Normal yaklaşımı) */
export function betaCI95(alpha: number, beta: number): { lower: number; upper: number } {
  const mean = betaMean(alpha, beta);
  const std = betaStdDev(alpha, beta);
  return {
    lower: Math.max(0, mean - 1.96 * std),
    upper: Math.min(1, mean + 1.96 * std),
  };
}

/** Toplam kanıt miktarı (prior çıkarılmış) */
export function evidenceCount(alpha: number, beta: number): number {
  return Math.max(0, alpha + beta - 2);
}

// ==================== Fuzzy Kategori Eşlemesi ====================

export type MasteryCategory = 'unknown' | 'weak' | 'developing' | 'strong' | 'mastered';

export const CATEGORY_LABELS: Record<MasteryCategory, string> = {
  unknown: 'Belirsiz',
  weak: 'Zayıf',
  developing: 'Gelişiyor',
  strong: 'Güçlü',
  mastered: 'Uzman',
};

export const CATEGORY_COLORS: Record<MasteryCategory, { bg: string; text: string; border: string }> = {
  unknown: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
  weak: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  developing: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  strong: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  mastered: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
};

/**
 * Beta posteriorundan fuzzy kategori belirle.
 * CI ALT SINIRI baz alınır (kötümser tahmin — gerçekçi).
 * Yüzeyde psikolojik sadelik, derinde matematiksel şeffaflık.
 */
export function categorize(alpha: number, beta: number): MasteryCategory {
  const evidence = evidenceCount(alpha, beta);

  // Yetersiz veri → "Belirsiz"
  if (evidence < 3) return 'unknown';

  const ci = betaCI95(alpha, beta);

  if (ci.lower < 0.25) return 'weak';
  if (ci.lower < 0.50) return 'developing';
  if (ci.lower < 0.75) return 'strong';
  return 'mastered';
}

// ==================== Tam Mastery Estimate ====================

export interface MasteryEstimate {
  mean: number;
  ci95Lower: number;
  ci95Upper: number;
  category: MasteryCategory;
  categoryLabel: string;
  evidenceCount: number;
}

export function computeMasteryEstimate(alpha: number, beta: number): MasteryEstimate {
  const ci = betaCI95(alpha, beta);
  const category = categorize(alpha, beta);
  return {
    mean: Math.round(betaMean(alpha, beta) * 1000) / 1000,
    ci95Lower: Math.round(ci.lower * 1000) / 1000,
    ci95Upper: Math.round(ci.upper * 1000) / 1000,
    category,
    categoryLabel: CATEGORY_LABELS[category],
    evidenceCount: Math.round(evidenceCount(alpha, beta) * 10) / 10,
  };
}

// ==================== Bayesyen Güncelleme Fonksiyonları ====================

/** Güncelleme sonucu */
export interface BeliefUpdate {
  alpha: number;
  beta: number;
}

/**
 * Sinyal 1: Denemede yanlış yapma (negatif kanıt).
 *
 * severity: CognitiveVoid severity değeri (severity.ts'den)
 * speedWeight: 0.3-2.0 arası (yavaş yanlış = daha negatif, hızlı yanlış = acele)
 *
 * Yavaş yanlış → düşünüp yapamamış → güçlü negatif sinyal
 * Hızlı yanlış → acele etmiş olabilir → zayıf negatif sinyal
 */
export function updateFromExamError(
  alpha: number,
  beta: number,
  severity: number,
  speedWeight: number = 1.0
): BeliefUpdate {
  // Negatif sinyal için ters hız ağırlığı:
  // hızlı (speedWeight=1.5) → negativeSpeedWeight=0.7 (daha az ceza)
  // yavaş (speedWeight=0.5) → negativeSpeedWeight=1.5 (daha fazla ceza)
  const negativeSpeedWeight = Math.max(0.3, 2.0 - speedWeight);
  const negativeDelta = Math.max(0.1, severity * negativeSpeedWeight);

  return {
    alpha,
    beta: beta + negativeDelta,
  };
}

/**
 * Sinyal 2: Denemede yanlış yapmama (gürültülü pozitif kanıt).
 *
 * VARSAYIM YIKIMI: Yanlış yapmamak ≠ biliyor.
 * Pozitif sinyalin gücü discrimination factor'e bağlı.
 *
 * discrimination: 0.1-1.0 (düşük = kolay soru, yüksek = zor/ayırt edici soru)
 * speedWeight: 0.3-2.0 (hızlı doğru = güçlü pozitif, yavaş doğru = zayıf pozitif)
 */
export function updateFromImplicitPositive(
  alpha: number,
  beta: number,
  discriminationFactor: number,
  speedWeight: number = 1.0
): BeliefUpdate {
  const positiveDelta = Math.max(0.05, discriminationFactor * speedWeight);

  return {
    alpha: alpha + positiveDelta,
    beta,
  };
}

/**
 * Sinyal 3: Self-rating (öğrencinin kendi değerlendirmesi).
 *
 * Zayıf sinyal (öğrenci kendini yanıltabilir) ama hiç veri yokken değerli (warm start).
 * Ağırlık: 2.0 — sınav verisinin ~1/3'ü kadar güçlü.
 */
export function updateFromSelfRating(
  alpha: number,
  beta: number,
  level: number // 0-5
): BeliefUpdate {
  const selfWeight = 2.0;
  const selfMastery = Math.max(0, Math.min(1, level / 5));

  return {
    alpha: alpha + selfMastery * selfWeight,
    beta: beta + (1 - selfMastery) * selfWeight,
  };
}

/**
 * Sinyal 4: Çalışma oturumu (DailyStudy / TopicReview).
 *
 * Her doğru soru zayıf pozitif, her yanlış soru zayıf negatif.
 * Çalışma sinyali sınav sinyalinin ~1/3'ü kadar güçlü (kontrollü ortam, sınav stresi yok).
 */
export function updateFromStudySession(
  alpha: number,
  beta: number,
  correctRatio: number, // 0-1
  questionCount: number
): BeliefUpdate {
  const studyWeight = 0.3;
  const clampedRatio = Math.max(0, Math.min(1, correctRatio));
  const positives = clampedRatio * questionCount * studyWeight;
  const negatives = (1 - clampedRatio) * questionCount * studyWeight;

  return {
    alpha: alpha + positives,
    beta: beta + negatives,
  };
}

// ==================== Hız Ağırlığı (Speed Weight) — Aksiyom 2 ====================

/**
 * Ders bazında ortalama hızdan speed weight hesapla.
 *
 * durationMinutes: ders bazında toplam harcanan süre
 * attemptedQuestions: correct + wrong (empty hariç — zaman harcamamış)
 * topicDifficulty: 1-5
 *
 * Dönen değer: 0.3-2.0 arası
 *   Hızlı çözüm → yüksek (>1) → pozitif güncelleme güçlenir
 *   Yavaş çözüm → düşük (<1) → pozitif güncelleme zayıflar
 */
export function calculateSpeedWeight(
  durationMinutes: number | null,
  attemptedQuestions: number,
  topicDifficulty: number
): number {
  // Süre verisi yoksa nötr
  if (!durationMinutes || durationMinutes <= 0 || attemptedQuestions <= 0) {
    return 1.0;
  }

  const avgMinutesPerQuestion = durationMinutes / attemptedQuestions;

  // Beklenen soru başına dakika (konu zorluğuna göre)
  // Difficulty 1-2: ~1.2dk, Difficulty 3: ~1.8dk, Difficulty 4-5: ~2.5dk
  const baseExpected = 1.0 + topicDifficulty * 0.35;

  // Hız oranı: <1 = hızlı, >1 = yavaş
  const speedRatio = avgMinutesPerQuestion / baseExpected;

  // Dönüşüm: speedRatio → speedWeight (ters orantı, sınırlı)
  // speedRatio 0.5 → speedWeight 1.7
  // speedRatio 1.0 → speedWeight 1.0
  // speedRatio 2.0 → speedWeight 0.5
  return Math.max(0.3, Math.min(2.0, 1.0 / speedRatio));
}

// ==================== Ayırt Edicilik Katsayısı (Discrimination Factor) ====================

/**
 * Bir konunun o sınavdaki "ayırt edicilik" tahmini.
 *
 * Proxy hesaplama — gerçek item discrimination verisi yok (sınav dışarıdan geliyor).
 *
 * successRate: o dersteki genel başarı oranı (correct / total)
 * topicDifficulty: 1-5
 * totalTopicsInSubject: o dersteki toplam konu sayısı
 *
 * Dönen değer: 0.1-1.0
 *   Zor sınav + zor konu + az konu = yüksek discrimination
 *   Kolay sınav + kolay konu + çok konu = düşük discrimination
 */
export function estimateDiscrimination(
  successRate: number,
  topicDifficulty: number,
  totalTopicsInSubject: number
): number {
  // Sınav zorluğu: düşük başarı → zor → doğru yapmak daha anlamlı
  const examDifficultyFactor = 1.0 - Math.max(0, Math.min(1, successRate)) * 0.5;

  // Konu zorluğu
  const topicDifficultyFactor = Math.max(0.2, topicDifficulty / 5);

  // Kapsam: çok konulu derstte tek konuda yanlış yapmamak daha az şey söyler
  const coverageFactor = Math.min(1.0, 3 / Math.max(1, totalTopicsInSubject));

  return Math.max(0.1, Math.min(1.0, examDifficultyFactor * topicDifficultyFactor * coverageFactor));
}

// ==================== Toplu Sinyal İşleme ====================

export type BeliefSignal =
  | { type: 'exam_error'; severity: number; speedWeight: number }
  | { type: 'implicit_positive'; discrimination: number; speedWeight: number }
  | { type: 'self_rating'; level: number }
  | { type: 'study_session'; correctRatio: number; questionCount: number };

/**
 * Birden fazla sinyali sırayla uygula.
 * Sıralama önemli değil (commutative) çünkü Beta'ya toplama yapıyoruz.
 */
export function applySignals(
  alpha: number,
  beta: number,
  signals: BeliefSignal[]
): BeliefUpdate {
  let a = alpha;
  let b = beta;

  for (const signal of signals) {
    let result: BeliefUpdate;
    switch (signal.type) {
      case 'exam_error':
        result = updateFromExamError(a, b, signal.severity, signal.speedWeight);
        break;
      case 'implicit_positive':
        result = updateFromImplicitPositive(a, b, signal.discrimination, signal.speedWeight);
        break;
      case 'self_rating':
        result = updateFromSelfRating(a, b, signal.level);
        break;
      case 'study_session':
        result = updateFromStudySession(a, b, signal.correctRatio, signal.questionCount);
        break;
    }
    a = result.alpha;
    b = result.beta;
  }

  return { alpha: a, beta: b };
}
