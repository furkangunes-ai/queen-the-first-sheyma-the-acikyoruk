"use client";

import React, { useState, useCallback, useMemo } from "react";
import { ChevronDown, ChevronUp, Terminal } from "lucide-react";
import OpticalGrid, { type QuestionState } from "./optical-grid";
import { parseVectorInput, type QuestionSource } from "@/lib/vector-parser";

interface SubjectBlockProps {
  subjectId: string;
  subjectName: string;
  questionCount: number;
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
  /** questionNumber → 'WRONG' | 'EMPTY' | null */
  questionStates: Map<number, QuestionState>;
  onMacroChange: (field: "correctCount" | "wrongCount" | "emptyCount", value: number) => void;
  onQuestionStateChange: (questionNumber: number, state: QuestionState) => void;
  onBulkQuestionStates: (states: Map<number, QuestionState>) => void;
  net: number;
  disabled?: boolean;
  /** Ders bazı süre (dakika) — opsiyonel, Aksiyom 2: Hız ağırlığı */
  durationMinutes?: number;
  onDurationChange?: (minutes: number) => void;
}

/**
 * Subject Block — Ders Kartı
 * Üst: Ders adı + Makro input (D/Y/B) + Net
 * Alt: Optik Grid (accordion, varsayılan kapalı) + Vektörel Input
 */
export default function SubjectBlock({
  subjectName,
  questionCount,
  correctCount,
  wrongCount,
  emptyCount,
  questionStates,
  onMacroChange,
  onQuestionStateChange,
  onBulkQuestionStates,
  net,
  disabled = false,
  durationMinutes,
  onDurationChange,
}: SubjectBlockProps) {
  const [gridOpen, setGridOpen] = useState(false);
  const [vectorInput, setVectorInput] = useState("");
  const [vectorError, setVectorError] = useState<string[]>([]);

  // Mikro giriş sayıları (grid'den hesapla)
  const microCounts = useMemo(() => {
    let wrong = 0;
    let empty = 0;
    questionStates.forEach((state) => {
      if (state === "WRONG") wrong++;
      else if (state === "EMPTY") empty++;
    });
    return { wrong, empty };
  }, [questionStates]);

  const hasMicroEntries = microCounts.wrong > 0 || microCounts.empty > 0;

  // Integer input handler
  function handleIntegerInput(
    field: "correctCount" | "wrongCount" | "emptyCount",
    rawValue: string
  ) {
    const cleaned = rawValue.replace(/[^0-9]/g, "").replace(/^0+/, "") || "0";
    const value = Math.max(0, parseInt(cleaned, 10) || 0);
    onMacroChange(field, value);
  }

  // Grid state değişikliğini handle et
  const handleGridChange = useCallback(
    (questionNumber: number, state: QuestionState) => {
      onQuestionStateChange(questionNumber, state);
    },
    [onQuestionStateChange]
  );

  // Vector input'u parse et ve grid'e uygula
  function applyVectorInput() {
    if (!vectorInput.trim()) return;

    const result = parseVectorInput(vectorInput);
    setVectorError(result.invalid);

    if (result.valid.length > 0) {
      const newStates = new Map(questionStates);
      for (const q of result.valid) {
        if (q.questionNumber <= questionCount) {
          newStates.set(q.questionNumber, q.source);
        }
      }
      onBulkQuestionStates(newStates);

      if (result.invalid.length === 0) {
        setVectorInput("");
      }
    }
  }

  function handleVectorKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      applyVectorInput();
    }
  }

  const inputBase =
    "w-full py-2 px-1 rounded-lg text-center text-[15px] font-bold text-white focus:outline-none focus:ring-1 transition-colors";

  return (
    <div className="glass-panel p-4 sm:p-5 relative overflow-hidden">
      {/* Ders adı */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white/90 tracking-wide">
          {subjectName}
          <span className="text-[10px] text-white/30 ml-2 font-normal">
            {questionCount} soru
          </span>
        </h3>
        <div className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
          {net.toFixed(2)}
        </div>
      </div>

      {/* Makro input satırı */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <label className="block text-[9px] font-bold text-emerald-400/70 uppercase tracking-widest mb-1 text-center">
            Doğru
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={correctCount === 0 ? "" : correctCount}
            onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
            onChange={(e) => handleIntegerInput("correctCount", e.target.value)}
            onBlur={(e) => !e.target.value && handleIntegerInput("correctCount", "0")}
            disabled={disabled}
            className={`${inputBase} bg-emerald-500/10 border border-emerald-500/20 focus:ring-emerald-400 hover:border-emerald-500/40`}
          />
        </div>
        <div>
          <label className="block text-[9px] font-bold text-rose-400/70 uppercase tracking-widest mb-1 text-center">
            Yanlış
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={wrongCount === 0 ? "" : wrongCount}
            onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
            onChange={(e) => handleIntegerInput("wrongCount", e.target.value)}
            onBlur={(e) => !e.target.value && handleIntegerInput("wrongCount", "0")}
            disabled={disabled}
            className={`${inputBase} bg-rose-500/10 border border-rose-500/20 focus:ring-rose-400 hover:border-rose-500/40`}
          />
          {hasMicroEntries && microCounts.wrong !== wrongCount && (
            <div className="text-[9px] text-amber-400/70 text-center mt-0.5">
              Grid: {microCounts.wrong}
            </div>
          )}
        </div>
        <div>
          <label className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1 text-center">
            Boş
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={emptyCount === 0 ? "" : emptyCount}
            onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
            onChange={(e) => handleIntegerInput("emptyCount", e.target.value)}
            onBlur={(e) => !e.target.value && handleIntegerInput("emptyCount", "0")}
            disabled={disabled}
            className={`${inputBase} bg-white/[0.04] border border-white/10 focus:ring-white/30 hover:border-white/20`}
          />
          {hasMicroEntries && microCounts.empty !== emptyCount && (
            <div className="text-[9px] text-amber-400/70 text-center mt-0.5">
              Grid: {microCounts.empty}
            </div>
          )}
        </div>
      </div>

      {/* Süre girişi — Aksiyom 2: Hız ağırlığı (opsiyonel) */}
      {onDurationChange && (
        <div className="flex items-center gap-2 mb-3">
          <label className="text-[10px] text-white/30 font-bold whitespace-nowrap">
            Süre
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="dk"
            value={durationMinutes || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              onDurationChange(val ? parseInt(val, 10) : 0);
            }}
            disabled={disabled}
            className="w-16 py-1.5 px-2 rounded-lg text-center text-[13px] font-bold text-white/70 bg-white/[0.04] border border-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors"
          />
          <span className="text-[9px] text-white/20">dk (opsiyonel)</span>
        </div>
      )}

      {/* Mikro Giriş Toggle */}
      <button
        type="button"
        onClick={() => setGridOpen(!gridOpen)}
        className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-bold text-white/30 hover:text-white/50 transition-colors border-t border-white/5"
      >
        {gridOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {gridOpen ? "Optik Gridi Kapat" : "Soru Bazlı İşaretle"}
        {hasMicroEntries && (
          <span className="text-pink-400 ml-1">
            ({microCounts.wrong + microCounts.empty} işaretli)
          </span>
        )}
      </button>

      {/* Optik Grid + Vector Input */}
      {gridOpen && (
        <div className="mt-3 space-y-3">
          {/* Vector Input */}
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-white/30 flex-shrink-0" />
            <input
              type="text"
              placeholder='3y, 5b, 12y veya 3-7y'
              value={vectorInput}
              onChange={(e) => {
                setVectorInput(e.target.value);
                setVectorError([]);
              }}
              onKeyDown={handleVectorKeyDown}
              onBlur={applyVectorInput}
              disabled={disabled}
              className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-400/30 transition-all font-mono"
            />
          </div>
          {vectorError.length > 0 && (
            <div className="text-[10px] text-rose-400">
              Anlaşılamadı: {vectorError.join(", ")}
            </div>
          )}

          {/* Grid */}
          <OpticalGrid
            questionCount={questionCount}
            questionStates={questionStates}
            onChange={handleGridChange}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
