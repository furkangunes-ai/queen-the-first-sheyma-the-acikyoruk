/**
 * Öğrencinin sınav alanına (sayısal/ea/sözel) göre ders filtreleme.
 *
 * TYT dersleri herkes için gösterilir.
 * AYT dersleri öğrenci alanına göre filtrelenir:
 *   - Sayısal: Edebiyat, Tarih, Coğrafya GİZLENİR
 *   - EA:      Fizik, Kimya, Biyoloji GİZLENİR
 *   - Sözel:   Fizik, Kimya, Biyoloji, Matematik GİZLENİR
 */

export type ExamTrack = "sayisal" | "ea" | "sozel" | null | undefined;

// AYT'de gösterilmeyecek dersler (alan bazlı)
const EXCLUDED_AYT_SUBJECTS: Record<string, string[]> = {
  sayisal: ["Edebiyat", "Tarih", "Coğrafya"],
  ea: ["Fizik", "Kimya", "Biyoloji"],
  sozel: ["Fizik", "Kimya", "Biyoloji", "Matematik"],
};

/**
 * Düz subject listesini examTrack'e göre filtrele.
 * examTrack null/undefined ise tüm dersler gösterilir (henüz seçilmemiş).
 */
export function filterSubjectsByTrack<
  T extends { name: string; examType?: { name?: string; slug?: string } | null }
>(subjects: T[], examTrack: ExamTrack): T[] {
  if (!examTrack) return subjects;
  const excluded = EXCLUDED_AYT_SUBJECTS[examTrack] || [];
  return subjects.filter((s) => {
    const isAYT =
      s.examType?.slug === "ayt" || s.examType?.name === "AYT";
    if (!isAYT) return true; // TYT dersleri her zaman göster
    return !excluded.includes(s.name);
  });
}

/**
 * ExamType listesindeki subjects'ı filtrele (nested yapı için).
 */
export function filterExamTypesByTrack<
  ET extends {
    name: string;
    slug?: string;
    subjects: { name: string }[];
  }
>(examTypes: ET[], examTrack: ExamTrack): ET[] {
  if (!examTrack) return examTypes;
  const excluded = EXCLUDED_AYT_SUBJECTS[examTrack] || [];
  return examTypes.map((et) => {
    const isAYT = et.slug === "ayt" || et.name === "AYT";
    if (!isAYT) return et;
    return {
      ...et,
      subjects: et.subjects.filter((s) => !excluded.includes(s.name)),
    };
  });
}

/**
 * Alan adını Türkçe etiket olarak döndür.
 */
export function getExamTrackLabel(track: ExamTrack): string {
  switch (track) {
    case "sayisal":
      return "Sayısal";
    case "ea":
      return "Eşit Ağırlık";
    case "sozel":
      return "Sözel";
    default:
      return "Belirlenmemiş";
  }
}
