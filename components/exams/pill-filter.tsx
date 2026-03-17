"use client";

import React, { useMemo } from "react";

// ==================== Types ====================

export type ExamTypeFilter = string; // examType ID or 'all'
export type ExamModeFilter =
  | "all"
  | "genel"
  | "brans"
  | "brans-fen"
  | "brans-sosyal"
  | "brans-matematik"
  | "brans-edebiyat-sosyal1"
  | "brans-sosyal2"
  | "brans-tek";
export type SubjectFilter = string; // subject name or 'all'

interface ExamType {
  id: string;
  name: string; // "TYT" | "AYT"
}

interface SubjectOption {
  name: string;
  count: number; // kaç deneme bu dersi içeriyor
}

interface PillFilterProps {
  examTypes: ExamType[];
  /** Mevcut sınavlardaki ders adları + sayıları */
  availableSubjects: SubjectOption[];
  // State
  typeFilter: ExamTypeFilter;
  modeFilter: ExamModeFilter;
  subjectFilter: SubjectFilter;
  // Callbacks
  onTypeChange: (type: ExamTypeFilter) => void;
  onModeChange: (mode: ExamModeFilter) => void;
  onSubjectChange: (subject: SubjectFilter) => void;
}

// ==================== Constants ====================

const MODE_PILLS: { key: ExamModeFilter; label: string; row: 1 | 2 }[] = [
  // Row 1: examType filter (TYT/AYT) — handled separately
  // Row 2: mode filter
  { key: "all", label: "Hepsi", row: 2 },
  { key: "genel", label: "Genel", row: 2 },
  { key: "brans", label: "Tüm Branş", row: 2 },
  { key: "brans-fen", label: "Fen", row: 2 },
  { key: "brans-sosyal", label: "Sosyal", row: 2 },
  { key: "brans-matematik", label: "Matematik", row: 2 },
  { key: "brans-tek", label: "Tek Ders", row: 2 },
];

// Subject emojis (best-effort matching)
const SUBJECT_EMOJI: Record<string, string> = {
  Matematik: "📐",
  Geometri: "📐",
  Fizik: "🧲",
  Kimya: "🧪",
  Biyoloji: "🧬",
  "Türkçe": "📖",
  Tarih: "🏛️",
  "Coğrafya": "🌍",
  Felsefe: "💭",
  Edebiyat: "📜",
  "Din Kültürü ve Ahlak Bilgisi": "☪️",
  Psikoloji: "🧠",
  Sosyoloji: "👥",
  "Mantık": "🔗",
};

function getSubjectEmoji(name: string): string {
  return SUBJECT_EMOJI[name] || "📚";
}

// ==================== Pill Button ====================

function Pill({
  active,
  onClick,
  children,
  size = "md",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "px-3 py-1.5 text-[11px]" : "px-4 py-2 text-xs";

  return (
    <button
      onClick={onClick}
      className={`${sizeClass} rounded-xl font-bold tracking-wide transition-all border whitespace-nowrap ${
        active
          ? "bg-pink-500/20 text-pink-300 border-pink-500/30 shadow-[0_2px_12px_-2px_rgba(244,114,182,0.3)]"
          : "bg-white/[0.02] text-white/50 border-white/5 hover:bg-white/[0.04] hover:text-white/80"
      }`}
    >
      {children}
    </button>
  );
}

// ==================== Main Component ====================

/**
 * Kademeli Pill Segmentasyonu
 *
 * Satır 1: [ Tümü ] [ TYT ] [ AYT ]
 * Satır 2: [ Hepsi ] [ Genel ] [ Tüm Branş ] [ Fen ] [ Sosyal ] [ Matematik ] [ Tek Ders ]
 * Satır 3: [ Tüm Dersler ] [ 📐 Mat (5) ] [ 🧲 Fiz (3) ] [ 🧪 Kim (3) ] ...
 *
 * Satır 3 her zaman görünür (Lens Effect desteği).
 */
export default function PillFilter({
  examTypes,
  availableSubjects,
  typeFilter,
  modeFilter,
  subjectFilter,
  onTypeChange,
  onModeChange,
  onSubjectChange,
}: PillFilterProps) {
  // Subjects sorted by count (desc)
  const sortedSubjects = useMemo(
    () => [...availableSubjects].sort((a, b) => b.count - a.count),
    [availableSubjects]
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Row 1: Exam Type (TYT / AYT) */}
      <div className="flex gap-2 flex-wrap items-center">
        <Pill active={typeFilter === "all"} onClick={() => onTypeChange("all")}>
          Tümü
        </Pill>
        {examTypes.map((et) => (
          <Pill
            key={et.id}
            active={typeFilter === et.id}
            onClick={() => onTypeChange(et.id)}
          >
            {et.name}
          </Pill>
        ))}

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Row 2 pills inline on wider screens */}
        {MODE_PILLS.map((pill) => (
          <Pill
            key={pill.key}
            active={modeFilter === pill.key}
            onClick={() => onModeChange(pill.key)}
            size="sm"
          >
            {pill.label}
          </Pill>
        ))}
      </div>

      {/* Row 3: Subject Filter (always visible) — Lens Effect trigger */}
      {sortedSubjects.length > 0 && (
        <div className="flex gap-1.5 flex-wrap items-center">
          <button
            onClick={() => onSubjectChange("all")}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wide transition-all border whitespace-nowrap ${
              subjectFilter === "all"
                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/25"
                : "bg-white/[0.02] text-white/40 border-white/5 hover:text-white/60"
            }`}
          >
            Tüm Dersler
          </button>
          {sortedSubjects.map((s) => (
            <button
              key={s.name}
              onClick={() => onSubjectChange(subjectFilter === s.name ? "all" : s.name)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold tracking-wide transition-all border whitespace-nowrap flex items-center gap-1 ${
                subjectFilter === s.name
                  ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/25 shadow-[0_2px_10px_-2px_rgba(0,240,255,0.2)]"
                  : "bg-white/[0.02] text-white/40 border-white/5 hover:text-white/60"
              }`}
            >
              <span>{getSubjectEmoji(s.name)}</span>
              <span>{s.name}</span>
              <span className="text-[9px] text-white/25 ml-0.5">({s.count})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
