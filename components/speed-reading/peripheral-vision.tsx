"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Play,
  RotateCw,
  Maximize2,
  Save,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  Eye,
  Send,
} from "lucide-react";
import { usePeripheralVision } from "@/hooks/usePeripheralVision";
import { Slider } from "@/components/ui/slider";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function PeripheralVision() {
  const [level, setLevel] = useState(3);
  const [saving, setSaving] = useState(false);

  const pv = usePeripheralVision({ level });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/speed-reading/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseType: "peripheral",
          difficulty: level,
          score: pv.accuracy,
          duration: pv.elapsedSeconds,
          completed: true,
          metadata: {
            level,
            correctCount: pv.correctCount,
            totalCount: pv.totalRounds,
            spanWidth: pv.levelParams.spreadPercent,
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

  const levelDescription = (l: number) => {
    if (l <= 3) return "Başlangıç";
    if (l <= 6) return "Orta";
    if (l <= 8) return "İleri";
    return "Uzman";
  };

  return (
    <AnimatePresence mode="wait">
      {/* =========== SETUP =========== */}
      {pv.phase === "setup" && (
        <motion.div
          key="setup"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="space-y-5"
        >
          <div className="glass-panel p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                <Maximize2 size={20} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Görüş Alanı Eğitimi
                </h3>
                <p className="text-xs text-white/40">
                  Çevresel görüşünü genişlet, periferik algıyı güçlendir
                </p>
              </div>
            </div>

            {/* Level Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                  <Target size={16} className="text-emerald-400" /> Seviye
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-emerald-300 font-mono">
                    {level}
                  </span>
                  <span className="text-xs text-white/40">
                    / 10 — {levelDescription(level)}
                  </span>
                </div>
              </div>
              <Slider
                value={[level]}
                onValueChange={([v]) => setLevel(v)}
                min={1}
                max={10}
                step={1}
                className="[&_[data-slot=slider-range]]:bg-emerald-500 [&_[data-slot=slider-thumb]]:border-emerald-500"
              />
              <div className="flex justify-between text-xs text-white/30">
                <span>1 (Kolay)</span>
                <span>10 (Çok Zor)</span>
              </div>
            </div>

            {/* Level Details */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-emerald-300 font-mono">
                  {pv.levelParams.wordCount}
                </p>
                <p className="text-[9px] text-white/40 uppercase">Kelime</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-emerald-300 font-mono">
                  {pv.levelParams.displayMs}ms
                </p>
                <p className="text-[9px] text-white/40 uppercase">Süre</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-emerald-300 font-mono">
                  %{pv.levelParams.spreadPercent}
                </p>
                <p className="text-[9px] text-white/40 uppercase">Yayılım</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/[0.03] rounded-xl p-4 text-sm text-white/50 space-y-2">
              <p>
                👁 Gözlerini <strong className="text-white/70">merkeze</strong>{" "}
                sabit tut, bakmadan çevredeki kelimeleri fark et.
              </p>
              <p>
                🎯 Her turda kısa süre gösterilen kelimeleri seçeneklerden bul.
              </p>
              <p>📈 {pv.totalRounds} tur — seviye arttıkça zorluk artar.</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => pv.start()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-3"
          >
            <Play size={22} />
            Başlat
          </motion.button>
        </motion.div>
      )}

      {/* =========== FIXATION =========== */}
      {pv.phase === "fixation" && (
        <motion.div
          key="fixation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-5"
        >
          <div className="flex items-center justify-between text-sm text-white/40">
            <span>
              Tur {pv.currentRound + 1}/{pv.totalRounds}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {formatTime(pv.elapsedSeconds)}
            </span>
          </div>

          <div className="glass-panel p-16 flex items-center justify-center min-h-[280px] relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-4 h-4 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
              <span className="text-xs text-emerald-400/60 uppercase tracking-widest">
                Odaklan
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* =========== SHOWING =========== */}
      {pv.phase === "showing" && (
        <motion.div
          key="showing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-5"
        >
          <div className="flex items-center justify-between text-sm text-white/40">
            <span>
              Tur {pv.currentRound + 1}/{pv.totalRounds}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye size={14} className="text-emerald-400" />
              {pv.levelParams.displayMs}ms
            </span>
          </div>

          <div className="glass-panel p-8 md:p-16 flex items-center justify-center min-h-[280px] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

            {/* Center fixation point */}
            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 z-10" />

            {/* Peripheral words */}
            {pv.targetWords.map((word, idx) => {
              const count = pv.targetWords.length;
              // Calculate position: spread words evenly on both sides
              let offsetPercent: number;
              if (count === 1) {
                // Single word: randomly left or right
                offsetPercent =
                  (Math.random() > 0.5 ? 1 : -1) *
                  pv.levelParams.spreadPercent;
              } else if (count === 2) {
                offsetPercent =
                  (idx === 0 ? -1 : 1) * pv.levelParams.spreadPercent;
              } else {
                // 3 words: left, center-offset, right
                const positions = [-1, 0.3, 1];
                offsetPercent =
                  positions[idx] * pv.levelParams.spreadPercent;
              }

              return (
                <motion.span
                  key={`${word}-${idx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute text-xl md:text-2xl font-bold text-white/90"
                  style={{
                    left: `${50 + offsetPercent}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {word}
                </motion.span>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* =========== ANSWERING =========== */}
      {pv.phase === "answering" && (
        <motion.div
          key="answering"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="space-y-5"
        >
          <div className="flex items-center justify-between text-sm text-white/40">
            <span>
              Tur {pv.currentRound + 1}/{pv.totalRounds}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400">{pv.correctCount}✓</span>
              <span className="text-red-400">
                {pv.rounds.length - pv.correctCount}✗
              </span>
            </div>
          </div>

          <div className="glass-panel p-8 space-y-5">
            <p className="text-sm text-white/60 text-center">
              Hangi kelime{pv.levelParams.wordCount > 1 ? "leri" : "yi"}{" "}
              gördün?
              {pv.levelParams.wordCount > 1 && (
                <span className="text-emerald-300 ml-1">
                  ({pv.levelParams.wordCount} kelime seç)
                </span>
              )}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {pv.options.map((word) => {
                const isSelected = pv.selectedWords.includes(word);
                return (
                  <motion.button
                    key={word}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => pv.toggleWord(word)}
                    className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                        : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {word}
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => pv.submitAnswer()}
              disabled={pv.selectedWords.length === 0}
              className="w-full py-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium flex items-center justify-center gap-2 hover:bg-emerald-500/30 transition-colors disabled:opacity-30"
            >
              <Send size={16} />
              Onayla
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* =========== FEEDBACK =========== */}
      {pv.phase === "feedback" && (
        <motion.div
          key="feedback"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-5"
        >
          <div className="glass-panel p-12 md:p-16 flex flex-col items-center justify-center min-h-[280px] gap-4">
            {pv.rounds.length > 0 &&
              (() => {
                const lastRound = pv.rounds[pv.rounds.length - 1];
                return (
                  <>
                    {lastRound.correct ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-3 text-emerald-400"
                      >
                        <CheckCircle size={32} />
                        <span className="text-xl font-bold">Doğru!</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="space-y-3 text-center"
                      >
                        <div className="flex items-center justify-center gap-3 text-red-400">
                          <XCircle size={32} />
                          <span className="text-xl font-bold">Yanlış</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-white/40">Doğru kelimeler: </span>
                          <span className="text-emerald-300 font-bold">
                            {lastRound.targetWords.join(", ")}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </>
                );
              })()}
          </div>
        </motion.div>
      )}

      {/* =========== RESULTS =========== */}
      {pv.phase === "results" && (
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
                className="inline-block text-6xl font-black text-gradient-candy font-mono"
              >
                %{pv.accuracy}
              </motion.span>
              <p className="text-sm text-white/40 uppercase tracking-widest">
                Doğruluk
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400 font-mono">
                  {pv.correctCount}/{pv.totalRounds}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  Doğru Tur
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white/90 font-mono">
                  Sv. {level}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  Seviye
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white/90 font-mono">
                  {formatTime(pv.elapsedSeconds)}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  Süre
                </p>
              </div>
            </div>

            {pv.accuracy >= 80 && level < 10 && (
              <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm">
                <Target size={16} />
                <span>Harika! Seviye {level + 1}&apos;i denemeye hazırsın!</span>
              </div>
            )}

            {/* Round Details */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pt-3 border-t border-white/5">
              {pv.rounds.map((round, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-white/[0.02]"
                >
                  <span className="text-white/40">Tur {idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/50">
                      {round.targetWords.join(", ")}
                    </span>
                    {round.correct ? (
                      <CheckCircle size={12} className="text-emerald-400" />
                    ) : (
                      <XCircle size={12} className="text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
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
              onClick={() => pv.reset()}
              className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white/70 font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
            >
              <RotateCw size={16} />
              Tekrar
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
