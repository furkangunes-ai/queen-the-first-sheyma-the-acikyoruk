"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Play,
  RotateCw,
  Eye,
  Save,
  Loader2,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  Zap,
  Send,
} from "lucide-react";
import {
  useTachistoscope,
  type TachistoscopeMode,
} from "@/hooks/useTachistoscope";
import { Slider } from "@/components/ui/slider";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function Tachistoscope() {
  const [mode, setMode] = useState<TachistoscopeMode>("word");
  const [displayMs, setDisplayMs] = useState(300);
  const [itemCount, setItemCount] = useState(10);
  const [difficulty, setDifficulty] = useState(2);
  const [saving, setSaving] = useState(false);
  const [userInput, setUserInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const tach = useTachistoscope({ mode, displayMs, itemCount, difficulty });

  // Auto-focus input in answering phase
  useEffect(() => {
    if (tach.phase === "answering" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [tach.phase]);

  const handleSubmitAnswer = useCallback(() => {
    if (!userInput.trim()) return;
    tach.submitAnswer(userInput);
    setUserInput("");
  }, [userInput, tach]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmitAnswer();
      }
    },
    [handleSubmitAnswer]
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/speed-reading/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseType: "tachistoscope",
          difficulty,
          score: tach.accuracy,
          duration: tach.elapsedSeconds,
          completed: true,
          metadata: {
            mode,
            displayMs: tach.displayMs,
            correctCount: tach.correctCount,
            totalCount: tach.totalAnswered,
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

  const modeLabels: Record<TachistoscopeMode, string> = {
    word: "Kelime",
    phrase: "İfade",
    number: "Sayı",
  };

  return (
    <AnimatePresence mode="wait">
      {/* =========== SETUP =========== */}
      {tach.phase === "setup" && (
        <motion.div
          key="setup"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="space-y-5"
        >
          <div className="glass-panel p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
                <Eye size={20} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Hızlı Tanıma</h3>
                <p className="text-xs text-white/40">
                  Kısa süre gösterilen kelime/sayıları hatırla
                </p>
              </div>
            </div>

            {/* Mode Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-white/60">Mod</label>
              <div className="flex gap-2">
                {(["word", "phrase", "number"] as TachistoscopeMode[]).map(
                  (m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        mode === m
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {modeLabels[m]}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Display Duration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                  <Zap size={16} className="text-amber-400" /> Gösterim Süresi
                </label>
                <span className="text-lg font-bold text-amber-300 font-mono">
                  {displayMs}ms
                </span>
              </div>
              <Slider
                value={[displayMs]}
                onValueChange={([v]) => setDisplayMs(v)}
                min={100}
                max={1000}
                step={50}
                className="[&_[data-slot=slider-range]]:bg-amber-500 [&_[data-slot=slider-thumb]]:border-amber-500"
              />
              <div className="flex justify-between text-xs text-white/30">
                <span>100ms (Zor)</span>
                <span>1000ms (Kolay)</span>
              </div>
            </div>

            {/* Item Count */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-white/60">
                Tur Sayısı
              </label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map((count) => (
                  <button
                    key={count}
                    onClick={() => setItemCount(count)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      itemCount === count
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/[0.03] rounded-xl p-4 text-sm text-white/50 space-y-2">
              <p>
                ⚡ Ekranda kısa süre gösterilen{" "}
                {mode === "word"
                  ? "kelimeyi"
                  : mode === "phrase"
                  ? "ifadeyi"
                  : "sayıyı"}{" "}
                doğru hatırla ve yaz.
              </p>
              <p>
                📈 Doğruluk oranın yüksekse gösterim süresi otomatik kısalır.
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => tach.start()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-lg shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all flex items-center justify-center gap-3"
          >
            <Play size={22} />
            Başlat
          </motion.button>
        </motion.div>
      )}

      {/* =========== COUNTDOWN =========== */}
      {tach.phase === "countdown" && (
        <motion.div
          key="countdown"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          className="glass-panel p-16 flex items-center justify-center min-h-[300px]"
        >
          <motion.span
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-amber-400"
          >
            Hazırlan...
          </motion.span>
        </motion.div>
      )}

      {/* =========== SHOWING =========== */}
      {tach.phase === "showing" && (
        <motion.div
          key="showing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-5"
        >
          <div className="flex items-center justify-between text-sm text-white/40">
            <span>
              Tur {tach.currentIndex + 1}/{tach.itemCount}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {tach.displayMs}ms
            </span>
          </div>

          <motion.div
            initial={{ backgroundColor: "rgba(255,191,36,0.05)" }}
            animate={{ backgroundColor: "rgba(255,191,36,0.15)" }}
            transition={{ duration: tach.displayMs / 1000 }}
            className="glass-panel p-12 md:p-16 flex items-center justify-center min-h-[280px] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-3xl md:text-5xl font-bold text-white text-center leading-tight"
            >
              {tach.currentItem}
            </motion.span>
          </motion.div>
        </motion.div>
      )}

      {/* =========== ANSWERING =========== */}
      {tach.phase === "answering" && (
        <motion.div
          key="answering"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="space-y-5"
        >
          <div className="flex items-center justify-between text-sm text-white/40">
            <span>
              Tur {tach.currentIndex + 1}/{tach.itemCount}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400">
                {tach.correctCount}✓
              </span>
              <span className="text-red-400">
                {tach.totalAnswered - tach.correctCount}✗
              </span>
            </div>
          </div>

          <div className="glass-panel p-12 md:p-16 flex items-center justify-center min-h-[280px]">
            <span className="text-3xl text-white/20">?</span>
          </div>

          <div className="glass-panel p-5 space-y-4">
            <label className="text-sm font-medium text-white/60">
              Ne gördün?
            </label>
            <div className="flex gap-3">
              <input
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Cevabını yaz..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-amber-500/30 focus:outline-none transition-colors text-lg"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={!userInput.trim()}
                className="px-5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors disabled:opacity-30"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-xs text-white/30 text-center">
              Enter tuşuyla gönder
            </p>
          </div>
        </motion.div>
      )}

      {/* =========== FEEDBACK =========== */}
      {tach.phase === "feedback" && (
        <motion.div
          key="feedback"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-5"
        >
          <div className="flex items-center justify-between text-sm text-white/40">
            <span>
              Tur {tach.currentIndex + 1}/{tach.itemCount}
            </span>
          </div>

          <div className="glass-panel p-12 md:p-16 flex flex-col items-center justify-center min-h-[280px] gap-4">
            {tach.items.length > 0 &&
              (() => {
                const lastItem = tach.items[tach.items.length - 1];
                return (
                  <>
                    {lastItem.correct ? (
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
                          <span className="text-white/40">Doğrusu: </span>
                          <span className="text-white font-bold">
                            {lastItem.shown}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-white/40">Senin cevabın: </span>
                          <span className="text-red-300">{lastItem.answer}</span>
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
      {tach.phase === "results" && (
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
                %{tach.accuracy}
              </motion.span>
              <p className="text-sm text-white/40 uppercase tracking-widest">
                Doğruluk
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400 font-mono">
                  {tach.correctCount}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  Doğru
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400 font-mono">
                  {tach.totalAnswered - tach.correctCount}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  Yanlış
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white/90 font-mono">
                  {formatTime(tach.elapsedSeconds)}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  Süre
                </p>
              </div>
            </div>

            <div className="text-sm text-white/50">
              <span className="text-white/30">Gösterim süresi: </span>
              <span className="text-amber-300 font-mono font-medium">
                {tach.displayMs}ms
              </span>
              {tach.displayMs < displayMs && (
                <span className="text-emerald-400 ml-1">
                  (↓{displayMs - tach.displayMs}ms)
                </span>
              )}
            </div>

            {/* Item Details */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pt-3 border-t border-white/5">
              {tach.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-white/[0.02]"
                >
                  <span className="text-white/50">{item.shown}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        item.correct ? "text-white/30" : "text-red-300/70"
                      }
                    >
                      {item.answer}
                    </span>
                    {item.correct ? (
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
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
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
              onClick={() => tach.reset()}
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
