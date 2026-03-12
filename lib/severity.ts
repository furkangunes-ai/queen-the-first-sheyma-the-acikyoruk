/**
 * Kognitif Zafiyet Derinliği (Severity) Hesaplama Motoru
 *
 * Severity = TopicWeight × ErrorReason Katsayısı
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
 */

// Prisma enum tipiyle birebir eşleşen string union
export type ErrorReasonType =
  | 'BILGI_EKSIKLIGI'
  | 'ISLEM_HATASI'
  | 'DIKKATSIZLIK'
  | 'SURE_YETISMEDI'
  | 'KAVRAM_YANILGISI'
  | 'SORU_KOKUNU_YANLIS_OKUMA';

// ErrorReason katsayıları - kognitif onarım maliyeti
export const ERROR_REASON_COEFFICIENTS: Record<ErrorReasonType, number> = {
  KAVRAM_YANILGISI: 1.0,
  BILGI_EKSIKLIGI: 0.8,
  SURE_YETISMEDI: 0.4,
  ISLEM_HATASI: 0.3,
  SORU_KOKUNU_YANLIS_OKUMA: 0.3,
  DIKKATSIZLIK: 0.2,
};

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
export const VOID_STATUS_LABELS = {
  UNRESOLVED: 'Anlamadım',
  REVIEW: 'Tekrar Et',
  RESOLVED: 'Çözüldü',
} as const;

// VoidStatus renkleri
export const VOID_STATUS_COLORS = {
  UNRESOLVED: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  REVIEW: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  RESOLVED: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
} as const;

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
 * Severity hesapla
 * Severity = TopicWeight × ErrorReason Katsayısı × magnitude
 */
export function calculateSeverity(
  errorReason: ErrorReasonType,
  topicWeight: number = 2, // varsayılan orta
  magnitude: number = 1
): number {
  const coefficient = ERROR_REASON_COEFFICIENTS[errorReason];
  return Math.round(topicWeight * coefficient * magnitude * 100) / 100;
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
