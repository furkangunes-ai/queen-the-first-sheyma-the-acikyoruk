// Paylaşımlı sabitler — topic-map, weekly-plan ve diğer componentlerden import edilir

export const LEVEL_COLORS: Record<number, string> = {
  0: "bg-red-500",
  1: "bg-orange-500",
  2: "bg-amber-400",
  3: "bg-yellow-400",
  4: "bg-emerald-400",
  5: "bg-cyan-400",
};

export const LEVEL_BORDER_COLORS: Record<number, string> = {
  0: "border-red-500/50 text-red-400",
  1: "border-orange-500/50 text-orange-400",
  2: "border-amber-400/50 text-amber-300",
  3: "border-yellow-400/50 text-yellow-300",
  4: "border-emerald-400/50 text-emerald-300",
  5: "border-cyan-400/50 text-cyan-300",
};

export const LEVEL_LABELS: Record<number, string> = {
  0: "Bilmiyorum",
  1: "Tanıdık",
  2: "Anlıyorum",
  3: "Uyguluyorum",
  4: "Analiz",
  5: "Uzman",
};

export const LEVEL_BG_TINTS: Record<number, string> = {
  0: "bg-red-500/5",
  1: "bg-orange-500/5",
  2: "bg-amber-400/5",
  3: "bg-yellow-400/5",
  4: "bg-emerald-400/5",
  5: "bg-cyan-400/5",
};

// ---------------------------------------------------------------------------
// Subject Groupings — ders grupları (topic-map, exam-entry-form vb.)
// ---------------------------------------------------------------------------

export interface SubjectGroup {
  label: string; // boşsa standalone, header gösterilmez
  subjectNames: string[];
}

export const SUBJECT_GROUPS: Record<string, SubjectGroup[]> = {
  TYT: [
    { label: "", subjectNames: ["Türkçe"] },
    { label: "Temel Matematik", subjectNames: ["Matematik", "Geometri"] },
    { label: "Fen Bilimleri", subjectNames: ["Fizik", "Kimya", "Biyoloji"] },
    { label: "Sosyal Bilimler", subjectNames: ["Tarih", "Coğrafya", "Felsefe", "Din Kültürü ve Ahlak Bilgisi"] },
  ],
  AYT: [
    { label: "Matematik", subjectNames: ["Matematik", "Geometri"] },
    { label: "Fen Bilimleri", subjectNames: ["Fizik", "Kimya", "Biyoloji"] },
    { label: "Edebiyat \u2013 Sosyal 1", subjectNames: ["Edebiyat", "Tarih", "Coğrafya"] },
    { label: "Sosyal 2", subjectNames: ["Felsefe", "Mantık", "Psikoloji", "Sosyoloji", "Din Kültürü ve Ahlak Bilgisi"] },
  ],
};

// ---------------------------------------------------------------------------
// Branch Groups — branş deneme türleri (exam-entry-form vb.)
// ---------------------------------------------------------------------------

export interface BranchGroup {
  key: string;
  label: string;
  subjectNames: string[];
}

export const BRANCH_GROUPS: Record<string, BranchGroup[]> = {
  TYT: [
    { key: "fen", label: "Fen Bilimleri", subjectNames: ["Fizik", "Kimya", "Biyoloji"] },
    { key: "sosyal", label: "Sosyal Bilimler", subjectNames: ["Tarih", "Coğrafya", "Felsefe", "Din Kültürü ve Ahlak Bilgisi"] },
    { key: "matematik", label: "Temel Matematik", subjectNames: ["Matematik", "Geometri"] },
  ],
  AYT: [
    { key: "fen", label: "Fen Bilimleri", subjectNames: ["Fizik", "Kimya", "Biyoloji"] },
    { key: "matematik", label: "Matematik", subjectNames: ["Matematik", "Geometri"] },
    { key: "edebiyat-sosyal1", label: "Edebiyat \u2013 Sosyal 1", subjectNames: ["Edebiyat", "Tarih", "Coğrafya"] },
    { key: "sosyal2", label: "Sosyal 2", subjectNames: ["Felsefe", "Mantık", "Psikoloji", "Sosyoloji", "Din Kültürü ve Ahlak Bilgisi"] },
  ],
};

// Helper: branş grubunun label'ını examCategory string'inden al
export function getBranchGroupLabel(examCategory: string | null): string | null {
  if (!examCategory || !examCategory.startsWith("brans-")) return null;
  const key = examCategory.replace("brans-", "");
  for (const groups of Object.values(BRANCH_GROUPS)) {
    const found = groups.find((g) => g.key === key);
    if (found) return found.label;
  }
  return null;
}
