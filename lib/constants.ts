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
