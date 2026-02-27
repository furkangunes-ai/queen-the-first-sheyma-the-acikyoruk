"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Play,
  RotateCw,
  Grid3X3,
  Save,
  Loader2,
  Clock,
  Target,
  XCircle,
  Trophy,
  Shuffle,
} from "lucide-react";
import { useSchulteTable } from "@/hooks/useSchulteTable";

type GridSize = 3 | 4 | 5;
type Phase = "setup" | "playing" | "results";

function formatMs(ms: number): string {
  const totalSeconds = ms / 1000;
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins > 0) {
    return `${mins}:${secs.toFixed(1).padStart(4, "0")}`;
  }
  return `${secs.toFixed(1)}s`;
}

export default function SchulteTable() {
  const [gridSize, setGridSize] = useState<GridSize>(4);
  const [phase, setPhase] = useState<Phase>("setup");
  const [saving, setSaving] = useState(false);
  const [lastClickedCorrect, setLastClickedCorrect] = useState<number | null>(
    null
  );
  const [lastClickedWrong, setLastClickedWrong] = useState<number | null>(null);

  const schulte = useSchulteTable({ gridSize });
  const wrongTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStart = useCallback(() => {
    schulte.start();
    setPhase("playing");
    setLastClickedCorrect(null);
    setLastClickedWrong(null);
  }, [schulte]);

  const handleCellClick = useCallback(
    (index: number) => {
      const correct = schulte.handleCellClick(index);
      if (correct) {
        setLastClickedCorrect(index);
        setLastClickedWrong(null);
        // Check if finished
        if (schulte.currentTarget >= schulte.totalCells) {
          setPhase("results");
        }
      } else {
        setLastClickedWrong(index);
        // Clear wrong highlight after 500ms
        if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);
        wrongTimeoutRef.current = setTimeout(() => {
          setLastClickedWrong(null);
        }, 500);
      }
    },
    [schulte]
  );

  // Watch for finish
  React.useEffect(() => {
    if (schulte.isFinished && phase === "playing") {
      setPhase("results");
    }
  }, [schulte.isFinished, phase]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/speed-reading/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseType: "schulte",
          difficulty: gridSize === 3 ? 1 : gridSize === 4 ? 3 : 5,
          score: schulte.score,
          duration: Math.round(schulte.elapsedMs / 1000),
          completed: true,
          metadata: {
            gridSize,
            completionTimeMs: Math.round(schulte.elapsedMs),
            errors: schulte.errors,
          },
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Sonuç kaydedildi!");
    } catch {
      toast.error("Kaydetme başarısız");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    schulte.reset();
    setPhase("setup");
    setLastClickedCorrect(null);
    setLastClickedWrong(null);
  };

  return (
    <AnimatePresence mode="wait">
      {/* =========== SETUP =========== */}
      {phase === "setup" && (
        <motion.div
          key="setup"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="space-y-5"
        >
          <div className="glass-panel p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
                <Grid3X3 size={20} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Schulte Tablosu
                </h3>
                <p className="text-xs text-white/40">
                  Sayıları sırayla bul — çevresel görüşünü geliştir
                </p>
              </div>
            </div>

            {/* Grid Size Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-white/60">
                Tablo Boyutu
              </label>
              <div className="flex gap-2">
                {([3, 4, 5] as GridSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setGridSize(size)}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                      gridSize === size
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10"
                        : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-lg font-bold">
                      {size}×{size}
                    </span>
                    <span className="block text-[10px] text-white/40 mt-0.5">
                      {size * size} sayı
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/[0.03] rounded-xl p-4 text-sm text-white/50 space-y-2">
              <p>
                📋 Tablodaki sayıları <strong className="text-white/70">1&apos;den {gridSize * gridSize}&apos;e</strong> kadar sırayla bul ve tıkla.
              </p>
              <p>
                🎯 Gözlerini tablonun <strong className="text-white/70">merkezine</strong> sabit tut, çevresel görüşünle sayıları bul.
              </p>
              <p>
                ⚡ Pilot adayları ve sporcular tarafından kullanılan bir teknik!
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleStart}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold text-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-3"
          >
            <Play size={22} />
            Başlat
          </motion.button>
        </motion.div>
      )}

      {/* =========== PLAYING =========== */}
      {phase === "playing" && (
        <motion.div
          key="playing"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-cyan-500/15 border border-cyan-500/25 rounded-full px-4 py-1.5 flex items-center gap-2">
                <Target size={14} className="text-cyan-400" />
                <span className="text-cyan-300 font-bold text-lg font-mono">
                  {schulte.currentTarget}
                </span>
              </div>
              <span className="text-xs text-white/30">Bul</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm">
                <Clock size={14} className="text-white/40" />
                <span className="text-white/70 font-mono">
                  {formatMs(schulte.elapsedMs)}
                </span>
              </div>
              {schulte.errors > 0 && (
                <div className="flex items-center gap-1.5 text-sm">
                  <XCircle size={14} className="text-red-400" />
                  <span className="text-red-300 font-mono">
                    {schulte.errors}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Grid */}
          <div className="glass-panel p-4 md:p-6">
            <div
              className="grid gap-2 max-w-md mx-auto"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              }}
            >
              {schulte.grid.map((num, idx) => {
                const isFound = schulte.foundCells.has(idx);
                const isCorrectClick = lastClickedCorrect === idx;
                const isWrongClick = lastClickedWrong === idx;

                return (
                  <motion.button
                    key={`${idx}-${num}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: isWrongClick ? [1, 1.1, 0.9, 1] : 1,
                      opacity: 1,
                    }}
                    transition={{
                      delay: idx * 0.02,
                      duration: isWrongClick ? 0.3 : 0.15,
                    }}
                    onClick={() => !isFound && handleCellClick(idx)}
                    disabled={isFound}
                    className={`
                      aspect-square rounded-xl text-lg md:text-xl font-bold font-mono
                      min-w-[48px] min-h-[48px]
                      flex items-center justify-center
                      transition-all duration-150
                      ${
                        isFound
                          ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300/50 cursor-default"
                          : isWrongClick
                          ? "bg-red-500/20 border border-red-500/30 text-red-300"
                          : isCorrectClick
                          ? "bg-emerald-500/30 border border-emerald-400/40 text-emerald-300"
                          : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20 active:scale-95 cursor-pointer"
                      }
                    `}
                  >
                    {num}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 text-xs text-white/30 justify-center">
            <span>
              {schulte.foundCells.size}/{schulte.totalCells} bulundu
            </span>
          </div>
        </motion.div>
      )}

      {/* =========== RESULTS =========== */}
      {phase === "results" && (
        <motion.div
          key="results"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="max-w-lg mx-auto space-y-6"
        >
          <div className="glass-panel p-8 text-center space-y-6">
            <div className="space-y-2">
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="inline-block text-5xl font-black text-gradient-candy font-mono"
              >
                {formatMs(schulte.elapsedMs)}
              </motion.span>
              <p className="text-sm text-white/40 uppercase tracking-widest">
                Tamamlanma Süresi
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
              <div className="text-center">
                <p className="text-2xl font-bold text-white/90 font-mono">
                  {gridSize}×{gridSize}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  Tablo
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white/90 font-mono">
                  {schulte.errors}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  Hata
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white/90 font-mono">
                  %{schulte.score}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  Skor
                </p>
              </div>
            </div>

            {schulte.errors === 0 && (
              <div className="flex items-center justify-center gap-2 text-amber-400 text-sm">
                <Trophy size={16} />
                <span>Mükemmel! Hatasız tamamladın!</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                schulte.newGame();
                setPhase("playing");
                setLastClickedCorrect(null);
                setLastClickedWrong(null);
              }}
              className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white/70 font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
            >
              <Shuffle size={16} />
              Yeni Oyun
            </motion.button>
          </div>
          <button
            onClick={handleReset}
            className="w-full py-2.5 text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            <RotateCw size={14} className="inline mr-1.5" />
            Ayarlara Dön
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
