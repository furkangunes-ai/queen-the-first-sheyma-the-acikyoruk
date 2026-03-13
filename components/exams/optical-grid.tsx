"use client";

import React, { useCallback, useRef } from "react";
import type { QuestionSource } from "@/lib/vector-parser";

export type QuestionState = QuestionSource | null; // null = doğru (default)

interface OpticalGridProps {
  questionCount: number;
  /** questionNumber → 'WRONG' | 'EMPTY' | null */
  questionStates: Map<number, QuestionState>;
  onChange: (questionNumber: number, state: QuestionState) => void;
  disabled?: boolean;
}

/**
 * Optik Grid — Numaralı kutular
 * Tek tıklama: Yanlış (kırmızı)
 * Çift tıklama: Boş (gri)
 * Tekrar tıklama: Sıfırla (doğru)
 *
 * Cycle: null → WRONG → EMPTY → null
 */
export default function OpticalGrid({
  questionCount,
  questionStates,
  onChange,
  disabled = false,
}: OpticalGridProps) {
  const lastTapRef = useRef<{ num: number; time: number }>({ num: 0, time: 0 });
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = useCallback(
    (num: number) => {
      if (disabled) return;

      const now = Date.now();
      const last = lastTapRef.current;
      const isDoubleTap = last.num === num && now - last.time < 300;

      lastTapRef.current = { num, time: now };

      if (isDoubleTap) {
        // Çift tıklama: EMPTY yap
        if (tapTimerRef.current) {
          clearTimeout(tapTimerRef.current);
          tapTimerRef.current = null;
        }
        const current = questionStates.get(num) ?? null;
        if (current === "EMPTY") {
          onChange(num, null); // Zaten EMPTY ise sıfırla
        } else {
          onChange(num, "EMPTY");
        }
      } else {
        // Tek tıklama: 300ms bekle (çift tıklama kontrolü)
        if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
        tapTimerRef.current = setTimeout(() => {
          tapTimerRef.current = null;
          const current = questionStates.get(num) ?? null;
          if (current === null) {
            onChange(num, "WRONG");
          } else if (current === "WRONG") {
            onChange(num, null); // WRONG ise sıfırla
          } else {
            // EMPTY ise → WRONG
            onChange(num, "WRONG");
          }
        }, 300);
      }
    },
    [disabled, questionStates, onChange]
  );

  const boxes = [];
  for (let i = 1; i <= questionCount; i++) {
    const state = questionStates.get(i) ?? null;

    let bgClass: string;
    let textClass: string;
    let borderClass: string;

    if (state === "WRONG") {
      bgClass = "bg-rose-500/25";
      textClass = "text-rose-300 font-bold";
      borderClass = "border-rose-500/40";
    } else if (state === "EMPTY") {
      bgClass = "bg-white/[0.06]";
      textClass = "text-white/40 font-bold";
      borderClass = "border-white/20";
    } else {
      bgClass = "bg-white/[0.02]";
      textClass = "text-white/20";
      borderClass = "border-white/[0.06]";
    }

    boxes.push(
      <button
        key={i}
        type="button"
        onClick={() => handleTap(i)}
        disabled={disabled}
        className={`
          w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm
          border transition-all select-none
          ${bgClass} ${textClass} ${borderClass}
          ${!disabled ? "hover:border-white/30 active:scale-95 cursor-pointer" : "cursor-default opacity-60"}
        `}
      >
        {i}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {boxes}
      {questionCount > 0 && (
        <div className="w-full flex items-center gap-3 mt-2 text-[10px] text-white/30">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-rose-500/25 border border-rose-500/40" />
            Yanlış
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-white/[0.06] border border-white/20" />
            Boş
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-white/[0.02] border border-white/[0.06]" />
            Doğru
          </span>
        </div>
      )}
    </div>
  );
}
