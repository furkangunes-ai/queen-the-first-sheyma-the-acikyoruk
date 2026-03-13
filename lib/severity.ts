/**
 * Kognitif Zafiyet Derinliği (Severity) Hesaplama Motoru
 *
 * Severity = TopicWeight × ErrorReason Katsayısı × Magnitude × Recidivism
 *
 * TopicWeight: Konunun DAG'daki önkoşul ağırlığı
 *   - Temel/Önkoşul (Fonksiyonlar, Dört İşlem vb.) = 3
 *   - Orta düzey konular = 2
 *   - Bağımsız/İleri konular = 1
 *
 * ErrorReason Katsayıları (kognitif onarım maliyeti):
 *   - KAVRAM_YANILGISI: 1.0 (yanlış inşa edilmiş bina → yıkıp yeniden yap)
 *   - BILGI_EKSIKLIGI: 0.8 (eksik temel → doldurulması gereken boşluk)
 *   - SURE_YETISMEDI: 0.4 (zaman yönetimi → pratikle çözülür)
 *   - ISLEM_HATASI: 0.3 (teknik hata → alıştırmayla düzelir)
 *   - SORU_KOKUNU_YANLIS_OKUMA: 0.3 (okuma/dikkat → farkındalıkla düzelir)
 *   - DIKKATSIZLIK: 0.2 (odak kaybı → en düşük maliyet)
 *
 * RAW void'lar (errorReason=null): severity = 0.1 × magnitude
 * Recidivism (nüksetme): severity *= 1.5^relapseCount
 */

// Prisma enum tipiyle birebir eşleşen string union
export type ErrorReasonType =
  | 'BILGI_EKSIKLIGI'
  | 'ISLEM_HATASI'
  | 'DIKKATSIZLIK'
  | 'SURE_YETISMEDI'
  | 'KAVRAM_YANILGISI'
  | 'SORU_KOKUNU_YANLIS_OKUMA';

// VoidStatus tipi (Prisma enum ile eşleşir)
export type VoidStatusType = 'RAW' | 'UNRESOLVED' | 'REVIEW' | 'RESOLVED';

// ErrorReason katsayıları - kognitif onarım maliyeti
export const ERROR_REASON_COEFFICIENTS: Record<ErrorReasonType, number> = {
  KAVRAM_YANILGISI: 1.0,
  BILGI_EKSIKLIGI: 0.8,
  SURE_YETISMEDI: 0.4,
  ISLEM_HATASI: 0.3,
  SORU_KOKUNU_YANLIS_OKUMA: 0.3,
  DIKKATSIZLIK: 0.2,
};

// RAW void'lar için varsayılan severity katsayısı
export const RAW_DEFAULT_SEVERITY = 0.1;

// ErrorReason Türkçe etiketleri (UI'da kullanılacak)
export const ERROR_REASON_LABELS: Record<ErrorReasonType, string> = {
  BILGI_EKSIKLIGI: 'Bilgi Eksikliği',
  ISLEM_HATASI: 'İşlem Hatası',
  DIKKATSIZLIK: 'Dikkatsizlik / Odak Kaybı',
  SURE_YETISMEDI: 'Süre Yetişmedi',
  KAVRAM_YANILGISI: 'Kavram Yanılgısı',
  SORU_KOKUNU_YANLIS_OKUMA: 'Soru Kökünü Yanlış Okuma',
};

// Tüm ErrorReason'lar sıralı (UI butonları için - en yüksek katsayıdan düşüğe)
export const ERROR_REASONS_ORDERED: ErrorReasonType[] = [
  'KAVRAM_YANILGISI',
  'BILGI_EKSIKLIGI',
  'SURE_YETISMEDI',
  'ISLEM_HATASI',
  'SORU_KOKUNU_YANLIS_OKUMA',
  'DIKKATSIZLIK',
];

// VoidStatus Türkçe etiketleri
export const VOID_STATUS_LABELS: Record<VoidStatusType, string> = {
  RAW: 'Ham Veri',
  UNRESOLVED: 'Anlamadım',
  REVIEW: 'Tekrar Et',
  RESOLVED: 'Çözüldü',
};

// VoidStatus renkleri
export const VOID_STATUS_COLORS: Record<VoidStatusType, { bg: string; text: string; border: string }> = {
  RAW: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
  UNRESOLVED: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  REVIEW: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  RESOLVED: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
};

/**
 * TopicWeight: Şu an heuristic map.
 * DAG gerçek ağırlıkları geldiğinde sadece bu fonksiyon değişecek.
 *
 * @param topicDifficulty - Topic modelindeki difficulty (1-5)
 * @param hasPrerequisites - Bu konunun bağımlı (child) olduğu konu var mı?
 * @returns TopicWeight (1-3)
 */
export function getTopicWeight(topicDifficulty: number, hasPrerequisites: boolean): number {
  // Temel konular (düşük zorluk + başka konuların önkoşulu) = 3
  // Yani zorluk düşük ama önemli → yüksek ağırlık
  if (topicDifficulty <= 2 && hasPrerequisites) return 3;

  // Orta düzey konular = 2
  if (topicDifficulty <= 3) return 2;

  // İleri/bağımsız konular = 1
  return 1;
}

/**
 * Nüksetme (Recidivism) ceza çarpanı
 * Öğrenci bir zafiyeti "Çözüldü" yapıp aynı hatayı tekrarlarsa
 * severity acımasızca fırlar: 1.5^n
 *
 * @param relapseCount - Nüksetme sayısı (0 = ilk sefer)
 * @returns Ceza çarpanı (1.0, 1.5, 2.25, 3.375, ...)
 */
export function getRecidivismMultiplier(relapseCount: number): number {
  return Math.pow(1.5, relapseCount);
}

/**
 * Severity hesapla
 * RAW void'lar (errorReason=null): severity = RAW_DEFAULT_SEVERITY × magnitude
 * Sınıflandırılmış void'lar: severity = topicWeight × errorReasonCoeff × magnitude × recidivism
 */
export function calculateSeverity(
  errorReason: ErrorReasonType | null,
  topicWeight: number = 2, // varsayılan orta
  magnitude: number = 1,
  relapseCount: number = 0
): number {
  if (!errorReason) {
    return Math.round(RAW_DEFAULT_SEVERITY * magnitude * 100) / 100;
  }
  const coefficient = ERROR_REASON_COEFFICIENTS[errorReason];
  const recidivism = getRecidivismMultiplier(relapseCount);
  return Math.round(topicWeight * coefficient * magnitude * recidivism * 100) / 100;
}

/**
 * Sıcak faz bağlam alanları
 */
export const TIME_OF_DAY_OPTIONS = [
  { value: 'sabah', label: 'Sabah' },
  { value: 'ogle', label: 'Öğle' },
  { value: 'aksam', label: 'Akşam' },
] as const;

export const ENVIRONMENT_OPTIONS = [
  { value: 'sessiz', label: 'Sessiz' },
  { value: 'gurultulu', label: 'Gürültülü' },
] as const;

export const BIOLOGICAL_STATE_OPTIONS = [
  { value: 'dinc', label: 'Dinç' },
  { value: 'normal', label: 'Normal' },
  { value: 'yorgun', label: 'Yorgun' },
] as const;

// Algılanan zorluk 1-5
export const PERCEIVED_DIFFICULTY_OPTIONS = [1, 2, 3, 4, 5] as const;

/**
 * Soğuk faz için friction gate - minimum bekleme süresi (saat)
 */
export const COLD_PHASE_MIN_HOURS = 6;

/**
 * Soğuk faz friction gate mesajı
 */
export function getColdPhaseFrictionMessage(hoursSinceExam: number): string | null {
  if (hoursSinceExam >= COLD_PHASE_MIN_HOURS) return null;

  const remainingHours = Math.ceil(COLD_PHASE_MIN_HOURS - hoursSinceExam);
  return `Kognitif yorgunluk analiz verisini %40 oranında saptırabilir. Sinapslarının dinlenmesi için ${remainingHours} saat daha beklemen matematiksel olarak daha kârlı. Yine de analiz edeyim mi?`;
}
