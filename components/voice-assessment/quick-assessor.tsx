"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Check, Save } from "lucide-react";

interface TopicItem {
  id: string;
  name: string;
  subjectName: string;
  currentLevel?: number;
  effectiveLevel?: number | null;
}

interface QuickAssessorProps {
  topics: TopicItem[];
  onComplete: (results: Map<string, number>) => void;
  onCancel: () => void;
}

const LEVELS = [
  { level: 0, label: "0", short: "Yok", color: "bg-red-500/80", ring: "ring-red-500" },
  { level: 1, label: "1", short: "Az", color: "bg-orange-500/80", ring: "ring-orange-500" },
  { level: 2, label: "2", short: "Temel", color: "bg-amber-500/80", ring: "ring-amber-500" },
  { level: 3, label: "3", short: "Orta", color: "bg-yellow-500/80", ring: "ring-yellow-500" },
  { level: 4, label: "4", short: "İyi", color: "bg-lime-500/80", ring: "ring-lime-500" },
  { level: 5, label: "5", short: "Tam", color: "bg-emerald-500/80", ring: "ring-emerald-500" },
];

export function QuickAssessor({ topics, onComplete, onCancel }: QuickAssessorProps) {
  const [results, setResults] = useState<Map<string, number>>(() => {
    const map = new Map<string, number>();
    for (const t of topics) {
      if (t.currentLevel !== undefined) {
        map.set(t.id, t.currentLevel);
      }
    }
    return map;
  });

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const changed = new Set<string>();
  for (const [id, level] of results) {
    const topic = topics.find((t) => t.id === id);
    if (topic && topic.currentLevel !== level) changed.add(id);
    if (topic && topic.currentLevel === undefined) changed.add(id);
  }
  const changedCount = changed.size;
  const filledCount = results.size;

  const selectLevel = useCallback((topicId: string, level: number) => {
    setResults((prev) => {
      const next = new Map(prev);
      next.set(topicId, level);
      return next;
    });
  }, []);

  const handleFinish = useCallback(() => {
    onComplete(results);
  }, [results, onComplete]);

  // Keyboard: 0-5 sets level for focused topic, Escape cancels
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key >= "0" && e.key <= "5" && focusedIndex !== null) {
        e.preventDefault();
        selectLevel(topics[focusedIndex].id, parseInt(e.key));
        // Auto-advance focus
        if (focusedIndex < topics.length - 1) {
          setFocusedIndex(focusedIndex + 1);
          // Scroll the next item into view
          setTimeout(() => {
            document.getElementById(`topic-row-${focusedIndex + 1}`)?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }, 50);
        }
      } else if (e.key === "ArrowDown" && focusedIndex !== null) {
        e.preventDefault();
        const next = Math.min(focusedIndex + 1, topics.length - 1);
        setFocusedIndex(next);
        document.getElementById(`topic-row-${next}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (e.key === "ArrowUp" && focusedIndex !== null) {
        e.preventDefault();
        const prev = Math.max(focusedIndex - 1, 0);
        setFocusedIndex(prev);
        document.getElementById(`topic-row-${prev}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      } else if (e.key === "Enter" && filledCount > 0) {
        e.preventDefault();
        handleFinish();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedIndex, topics, selectLevel, onCancel, handleFinish, filledCount]);

  // "Select all same level" helper
  const setAllToLevel = (level: number) => {
    setResults((prev) => {
      const next = new Map(prev);
      for (const t of topics) {
        if (!next.has(t.id)) {
          next.set(t.id, level);
        }
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Header with quick-fill and legend */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-zinc-500">
          Konuya tıkla, sonra <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-400">0</kbd>-<kbd className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-400">5</kbd> ile seviye seç
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-zinc-600 mr-1">Boşları doldur:</span>
          {LEVELS.map((l) => (
            <button
              key={l.level}
              onClick={() => setAllToLevel(l.level)}
              className={`w-6 h-6 rounded text-[10px] font-bold text-white/80 hover:scale-110 transition-transform ${l.color}`}
              title={`Boş konuları ${l.level} yap`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable topic list */}
      <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-zinc-700/50 bg-zinc-900/30 divide-y divide-zinc-800/50">
        {topics.map((topic, index) => {
          const selectedLevel = results.get(topic.id);
          const isFocused = focusedIndex === index;

          return (
            <div
              key={topic.id}
              id={`topic-row-${index}`}
              onClick={() => setFocusedIndex(index)}
              className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors ${
                isFocused
                  ? "bg-cyan-500/5 border-l-2 border-l-cyan-500"
                  : "border-l-2 border-l-transparent hover:bg-zinc-800/30"
              }`}
            >
              {/* Topic number + name + effectiveLevel */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-zinc-600 font-mono w-5 text-right shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm text-zinc-200 truncate">{topic.name}</span>
                  {topic.effectiveLevel != null && (
                    <span className={`text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded ${
                      topic.effectiveLevel >= 4 ? 'bg-emerald-500/15 text-emerald-400' :
                      topic.effectiveLevel >= 3 ? 'bg-blue-500/15 text-blue-400' :
                      topic.effectiveLevel >= 2 ? 'bg-amber-500/15 text-amber-400' :
                      'bg-red-500/15 text-red-400'
                    }`}>
                      {topic.effectiveLevel.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Level buttons */}
              <div className="flex gap-1 shrink-0">
                {LEVELS.map((l) => {
                  const isSelected = selectedLevel === l.level;
                  return (
                    <button
                      key={l.level}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectLevel(topic.id, l.level);
                        setFocusedIndex(index);
                      }}
                      className={`
                        w-8 h-8 rounded-md text-xs font-bold transition-all
                        ${isSelected
                          ? `${l.color} text-white ring-2 ${l.ring} ring-offset-1 ring-offset-zinc-900 scale-110`
                          : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
                        }
                      `}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer: save + stats */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onCancel}
          className="px-3 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          İptal
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">
            {filledCount}/{topics.length} dolduruldu
            {changedCount > 0 && (
              <span className="text-cyan-400"> · {changedCount} değişiklik</span>
            )}
          </span>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleFinish}
            disabled={filledCount === 0}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Kaydet
          </motion.button>
        </div>
      </div>
    </div>
  );
}
