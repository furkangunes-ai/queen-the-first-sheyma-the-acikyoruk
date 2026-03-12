"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronLeft, Check, SkipForward } from "lucide-react";

interface TopicItem {
  id: string;
  name: string;
  subjectName: string;
  currentLevel?: number;
}

interface QuickAssessorProps {
  topics: TopicItem[];
  onComplete: (results: Map<string, number>) => void;
  onCancel: () => void;
}

const LEVEL_CONFIG = [
  { level: 0, label: "0", description: "Hiç bilmiyorum", color: "bg-red-500", hoverColor: "hover:bg-red-400", key: "0" },
  { level: 1, label: "1", description: "Çok az", color: "bg-orange-500", hoverColor: "hover:bg-orange-400", key: "1" },
  { level: 2, label: "2", description: "Temel", color: "bg-amber-500", hoverColor: "hover:bg-amber-400", key: "2" },
  { level: 3, label: "3", description: "Orta", color: "bg-yellow-500", hoverColor: "hover:bg-yellow-400", key: "3" },
  { level: 4, label: "4", description: "İyi", color: "bg-lime-500", hoverColor: "hover:bg-lime-400", key: "4" },
  { level: 5, label: "5", description: "Çok iyi", color: "bg-emerald-500", hoverColor: "hover:bg-emerald-400", key: "5" },
];

export function QuickAssessor({ topics, onComplete, onCancel }: QuickAssessorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Map<string, number>>(() => {
    // Pre-fill with existing levels
    const map = new Map<string, number>();
    for (const t of topics) {
      if (t.currentLevel !== undefined) {
        map.set(t.id, t.currentLevel);
      }
    }
    return map;
  });

  const currentTopic = topics[currentIndex];
  const isLast = currentIndex === topics.length - 1;
  const answered = results.size;
  const total = topics.length;
  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  const selectLevel = useCallback((level: number) => {
    if (!currentTopic) return;

    setResults((prev) => {
      const next = new Map(prev);
      next.set(currentTopic.id, level);
      return next;
    });

    // Auto-advance after short delay
    if (!isLast) {
      setTimeout(() => setCurrentIndex((i) => Math.min(i + 1, topics.length - 1)), 150);
    }
  }, [currentTopic, isLast, topics.length]);

  const goBack = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const skip = useCallback(() => {
    if (!isLast) {
      setCurrentIndex((i) => i + 1);
    }
  }, [isLast]);

  const handleFinish = useCallback(() => {
    onComplete(results);
  }, [results, onComplete]);

  // Keyboard support: 0-5 for levels, left/right arrows, Enter to finish, Escape to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key >= "0" && e.key <= "5") {
        e.preventDefault();
        selectLevel(parseInt(e.key));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goBack();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        skip();
      } else if (e.key === "Enter" && isLast && results.has(currentTopic?.id)) {
        e.preventDefault();
        handleFinish();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectLevel, goBack, skip, isLast, currentTopic, results, handleFinish, onCancel]);

  if (!currentTopic) return null;

  const selectedLevel = results.get(currentTopic.id);

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>{currentTopic.subjectName}</span>
          <span>{currentIndex + 1} / {total}</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-cyan-500 rounded-full"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      {/* Topic card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTopic.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.15 }}
          className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-6 text-center space-y-6"
        >
          {/* Topic name */}
          <div>
            <h2 className="text-xl font-semibold text-white">
              {currentTopic.name}
            </h2>
            {currentTopic.currentLevel !== undefined && (
              <p className="text-xs text-zinc-500 mt-1">
                Mevcut seviye: {currentTopic.currentLevel}/5
              </p>
            )}
          </div>

          {/* Level buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {LEVEL_CONFIG.map((cfg) => {
              const isSelected = selectedLevel === cfg.level;
              return (
                <button
                  key={cfg.level}
                  onClick={() => selectLevel(cfg.level)}
                  className={`
                    relative flex flex-col items-center justify-center gap-1 p-4 rounded-xl border-2 transition-all
                    ${isSelected
                      ? `${cfg.color} border-white/30 text-white scale-105 shadow-lg`
                      : `bg-zinc-800/50 border-zinc-700 text-zinc-300 ${cfg.hoverColor} hover:text-white hover:border-zinc-500`
                    }
                  `}
                >
                  <span className="text-2xl font-bold">{cfg.label}</span>
                  <span className="text-[10px] leading-tight opacity-80">{cfg.description}</span>
                  <span className="absolute top-1 right-1.5 text-[9px] text-zinc-500 font-mono">
                    {cfg.key}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Keyboard hint */}
          <p className="text-[11px] text-zinc-600">
            Klavyeden <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-400 text-[10px]">0</kbd>-<kbd className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-400 text-[10px]">5</kbd> ile seç
            {" · "}
            <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-400 text-[10px]">←</kbd> geri
            {" · "}
            <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-400 text-[10px]">→</kbd> atla
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={goBack}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-3 py-2 text-sm text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Geri
        </button>

        <div className="flex items-center gap-2">
          {!isLast && (
            <button
              onClick={skip}
              className="flex items-center gap-1 px-3 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Atla
              <SkipForward className="w-4 h-4" />
            </button>
          )}

          {(isLast || answered >= total * 0.5) && (
            <button
              onClick={handleFinish}
              disabled={answered === 0}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium transition-colors disabled:opacity-30"
            >
              <Check className="w-4 h-4" />
              Kaydet ({answered}/{total})
            </button>
          )}
        </div>

        {!isLast && (
          <button
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="flex items-center gap-1 px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            İleri
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {isLast && <div />}
      </div>

      {/* Cancel */}
      <button
        onClick={onCancel}
        className="w-full py-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
      >
        İptal (Esc)
      </button>
    </div>
  );
}
