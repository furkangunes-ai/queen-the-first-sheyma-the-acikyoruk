"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Check,
  List,
  X,
} from "lucide-react";
import { LEVEL_COLORS, LEVEL_LABELS } from "@/lib/constants";

interface TopicItem {
  id: string;
  name: string;
  subjectName: string;
  currentLevel?: number;
}

interface SerialAssessorProps {
  topics: TopicItem[];
  onComplete: (results: Map<string, number>) => void;
  onCancel: () => void;
  initialTopicIndex?: number;
}

const LEVELS = [
  { level: 1, label: "1", description: "Tanıdık", color: "bg-orange-500", ring: "ring-orange-500", textColor: "text-orange-400" },
  { level: 2, label: "2", description: "Anlıyorum", color: "bg-amber-500", ring: "ring-amber-500", textColor: "text-amber-400" },
  { level: 3, label: "3", description: "Uyguluyorum", color: "bg-yellow-500", ring: "ring-yellow-500", textColor: "text-yellow-400" },
  { level: 4, label: "4", description: "Analiz", color: "bg-emerald-500", ring: "ring-emerald-500", textColor: "text-emerald-400" },
  { level: 5, label: "5", description: "Uzman", color: "bg-cyan-500", ring: "ring-cyan-500", textColor: "text-cyan-400" },
];

export function SerialAssessor({
  topics,
  onComplete,
  onCancel,
  initialTopicIndex = 0,
}: SerialAssessorProps) {
  const [currentIndex, setCurrentIndex] = useState(initialTopicIndex);
  const [results, setResults] = useState<Map<string, number>>(() => {
    const map = new Map<string, number>();
    for (const t of topics) {
      if (t.currentLevel !== undefined) {
        map.set(t.id, t.currentLevel);
      }
    }
    return map;
  });
  const [showNavigator, setShowNavigator] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const navigatorRef = useRef<HTMLDivElement>(null);

  const currentTopic = topics[currentIndex];
  const currentLevel = results.get(currentTopic?.id);
  const filledCount = results.size;
  const changedCount = Array.from(results.entries()).filter(([id, level]) => {
    const topic = topics.find((t) => t.id === id);
    return topic && topic.currentLevel !== level;
  }).length;

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(Math.max(0, Math.min(index, topics.length - 1)));
      setShowNavigator(false);
    },
    [currentIndex, topics.length]
  );

  const goNext = useCallback(() => {
    if (currentIndex < topics.length - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, topics.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const selectLevel = useCallback(
    (level: number) => {
      setResults((prev) => {
        const next = new Map(prev);
        next.set(currentTopic.id, level);
        return next;
      });
      // Auto-advance after short delay
      setTimeout(() => {
        if (currentIndex < topics.length - 1) {
          setDirection(1);
          setCurrentIndex((i) => i + 1);
        }
      }, 300);
    },
    [currentTopic, currentIndex, topics.length]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (showNavigator) {
        if (e.key === "Escape") {
          e.preventDefault();
          setShowNavigator(false);
        }
        return;
      }

      if (e.key >= "1" && e.key <= "5") {
        e.preventDefault();
        selectLevel(parseInt(e.key));
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      } else if (e.key === "Enter" && filledCount > 0) {
        e.preventDefault();
        onComplete(results);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectLevel, goNext, goPrev, onCancel, onComplete, results, filledCount, showNavigator]);

  // Scroll navigator to current topic
  useEffect(() => {
    if (showNavigator && navigatorRef.current) {
      const el = navigatorRef.current.querySelector(`[data-index="${currentIndex}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [showNavigator, currentIndex]);

  if (!currentTopic) return null;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>{currentTopic.subjectName}</span>
          <span>
            {currentIndex + 1} / {topics.length}
          </span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
            animate={{ width: `${((currentIndex + 1) / topics.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Topic navigator toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowNavigator(!showNavigator)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors border border-zinc-700/50"
        >
          <List className="w-3.5 h-3.5" />
          Konu Seç
        </button>
        <div className="flex items-center gap-1 text-xs text-zinc-600">
          <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 font-mono">1</kbd>-
          <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 font-mono">5</kbd>
          <span className="ml-1">veya tıkla</span>
        </div>
      </div>

      {/* Navigator dropdown */}
      <AnimatePresence>
        {showNavigator && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              ref={navigatorRef}
              className="max-h-[40vh] overflow-y-auto rounded-xl border border-zinc-700/50 bg-zinc-900/80 backdrop-blur divide-y divide-zinc-800/50"
            >
              {topics.map((topic, index) => {
                const level = results.get(topic.id);
                const isActive = index === currentIndex;
                return (
                  <button
                    key={topic.id}
                    data-index={index}
                    onClick={() => goTo(index)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                      isActive
                        ? "bg-cyan-500/10 border-l-2 border-l-cyan-500"
                        : "border-l-2 border-l-transparent hover:bg-zinc-800/50"
                    }`}
                  >
                    <span className="text-[10px] text-zinc-600 font-mono w-5 text-right shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm text-zinc-300 truncate flex-1">{topic.name}</span>
                    {level !== undefined && (
                      <span
                        className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center text-white ${
                          LEVELS.find((l) => l.level === level)?.color || "bg-zinc-700"
                        }`}
                      >
                        {level}
                      </span>
                    )}
                    {level === undefined && (
                      <span className="w-5 h-5 rounded border border-zinc-700 text-[10px] text-zinc-600 flex items-center justify-center">
                        —
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main card - current topic */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: direction * 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 60 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-zinc-700/50 bg-zinc-900/50 p-6 sm:p-8 text-center space-y-6"
        >
          {/* Topic name */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {currentTopic.name}
            </h2>
            {currentTopic.currentLevel !== undefined && (
              <p className="text-xs text-zinc-500">
                Mevcut seviye: <span className={LEVELS.find((l) => l.level === currentTopic.currentLevel)?.textColor || "text-zinc-400"}>
                  {currentTopic.currentLevel} — {LEVEL_LABELS[currentTopic.currentLevel]}
                </span>
              </p>
            )}
          </div>

          {/* Big level buttons */}
          <div className="flex justify-center gap-3 sm:gap-4">
            {LEVELS.map((l) => {
              const isSelected = currentLevel === l.level;
              return (
                <motion.button
                  key={l.level}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selectLevel(l.level)}
                  className={`
                    w-14 h-14 sm:w-16 sm:h-16 rounded-xl text-lg sm:text-xl font-bold transition-all flex flex-col items-center justify-center gap-0.5
                    ${
                      isSelected
                        ? `${l.color} text-white ring-3 ${l.ring} ring-offset-2 ring-offset-zinc-900 shadow-lg`
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 border border-zinc-700"
                    }
                  `}
                >
                  <span>{l.label}</span>
                  <span className="text-[8px] sm:text-[9px] font-normal opacity-70">{l.description}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Önceki
            </button>

            {currentLevel !== undefined && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 text-xs text-emerald-400"
              >
                <Check className="w-3.5 h-3.5" />
                Kaydedildi
              </motion.div>
            )}

            <button
              onClick={goNext}
              disabled={currentIndex === topics.length - 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              Sonraki
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

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
            onClick={() => onComplete(results)}
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
