"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Play,
  RotateCw,
  Save,
  Loader2,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  SkipForward,
  Zap,
  Brain,
  Send,
  Timer,
} from "lucide-react";
import { useMentalMath } from "@/hooks/useMentalMath";
import { DIFFICULTY_LABELS, DIFFICULTY_DESCRIPTIONS } from "@/lib/mental-math-data";
import { Slider } from "@/components/ui/slider";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function MentalMath() {
  const [difficulty, setDifficulty] = useState(2);
  const [questionCount, setQuestionCount] = useState(15);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  const [userInput, setUserInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const math = useMentalMath({ difficulty, questionCount, timeLimitSeconds });

  // Auto-focus input in playing phase
  useEffect(() => {
    if (math.phase === "playing" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [math.phase, math.currentIndex]);

  const handleSubmit = useCallback(() => {
    const num = parseInt(userInput);
    if (isNaN(num)) return;
    math.submitAnswer(num);
    setUserInput("");
  }, [userInput, math]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/speed-reading/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseType: "mental-math",
          difficulty,
          score: math.accuracy,
          duration: math.elapsedSeconds,
          completed: true,
          metadata: {
            questionCount: math.totalAnswered,
            correctCount: math.correctCount,
            wrongCount: math.wrongCount,
            skippedCount: math.skippedCount,
            avgResponseTimeMs: math.avgResponseTime,
            timeLimitSeconds,
          },
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Sonuc kaydedildi!");
    } catch {
      toast.error("Kaydetme basarisiz");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {/* =========== SETUP =========== */}
      {math.phase === "setup" && (
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
                <Brain size={20} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Islem Hizi Antrenmanı</h3>
                <p className="text-xs text-white/40">
                  Zihinsel aritmetik hizini gelistir
                </p>
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                  <Zap size={16} className="text-cyan-400" /> Zorluk
                </label>
                <span className="text-lg font-bold text-cyan-300 font-mono">
                  {DIFFICULTY_LABELS[difficulty]}
                </span>
              </div>
              <Slider
                value={[difficulty]}
                onValueChange={([v]) => setDifficulty(v)}
                min={1}
                max={5}
                step={1}
                className="[&_[data-slot=slider-range]]:bg-cyan-500 [&_[data-slot=slider-thumb]]:border-cyan-500"
              />
              <p className="text-xs text-white/30">{DIFFICULTY_DESCRIPTIONS[difficulty]}</p>
            </div>

            {/* Question Count */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-white/60">
                Soru Sayisi
              </label>
              <div className="flex gap-2">
                {[10, 15, 20, 30].map((count) => (
                  <button
                    key={count}
                    onClick={() => setQuestionCount(count)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      questionCount === count
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Limit */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                <Timer size={16} className="text-cyan-400" /> Sure Limiti
              </label>
              <div className="flex gap-2">
                {[
                  { value: 0, label: "Sinirsiz" },
                  { value: 60, label: "1dk" },
                  { value: 120, label: "2dk" },
                  { value: 180, label: "3dk" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTimeLimitSeconds(opt.value)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      timeLimitSeconds === opt.value
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/[0.03] rounded-xl p-4 text-sm text-white/50 space-y-2">
              <p>🧠 Ekranda gosterilen matematiksel ifadenin sonucunu hizlica hesapla.</p>
              <p>⏱ Yanlis cevaplar ve sure kaybi puanini dusurur.</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => math.start()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold text-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-3"
          >
            <Play size={22} />
            Baslat
          </motion.button>
        </motion.div>
      )}

      {/* =========== COUNTDOWN =========== */}
      {math.phase === "countdown" && (
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
            className="text-4xl font-bold text-cyan-400"
          >
            Hazirlan...
          </motion.span>
        </motion.div>
      )}

      {/* =========== PLAYING =========== */}
      {math.phase === "playing" && math.currentQuestion && (
        <motion.div
          key="playing"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="space-y-5"
        >
          {/* Status Bar */}
          <div className="flex items-center justify-between text-sm text-white/40">
            <span>
              Soru {math.currentIndex + 1}/{math.questionCount}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400">{math.correctCount}✓</span>
              <span className="text-red-400">{math.wrongCount}✗</span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {formatTime(math.elapsedSeconds)}
                {timeLimitSeconds > 0 && (
                  <span className="text-white/20">/{formatTime(timeLimitSeconds)}</span>
                )}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400"
              animate={{ width: `${((math.currentIndex) / math.questionCount) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Question Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={math.currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.15 }}
              className="glass-panel p-12 md:p-16 flex items-center justify-center min-h-[200px]"
            >
              <span className="text-3xl md:text-5xl font-bold text-white text-center font-mono tracking-wider">
                {math.currentQuestion.expression} = ?
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Answer Input */}
          <div className="glass-panel p-5 space-y-3">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                value={userInput}
                onChange={(e) => {
                  // Allow negative numbers and digits only
                  const val = e.target.value;
                  if (val === "" || val === "-" || /^-?\d+$/.test(val)) {
                    setUserInput(val);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Cevabini yaz..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-cyan-500/30 focus:outline-none transition-colors text-lg font-mono text-center"
                autoComplete="off"
                autoCorrect="off"
                inputMode="numeric"
              />
              <button
                onClick={handleSubmit}
                disabled={!userInput.trim() || userInput === "-"}
                className="px-5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors disabled:opacity-30"
              >
                <Send size={18} />
              </button>
              <button
                onClick={() => {
                  math.skip();
                  setUserInput("");
                }}
                className="px-4 rounded-xl bg-white/5 text-white/40 border border-white/10 hover:text-white/60 hover:bg-white/10 transition-all"
                title="Atla"
              >
                <SkipForward size={18} />
              </button>
            </div>
            <p className="text-xs text-white/30 text-center">
              Enter ile gonder, sag ok ile atla
            </p>
          </div>
        </motion.div>
      )}

      {/* =========== RESULTS =========== */}
      {math.phase === "results" && (
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
                %{math.accuracy}
              </motion.span>
              <p className="text-sm text-white/40 uppercase tracking-widest">
                Dogruluk
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3 pt-4 border-t border-white/5">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400 font-mono">
                  {math.correctCount}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  Dogru
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400 font-mono">
                  {math.wrongCount}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  Yanlis
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white/50 font-mono">
                  {math.skippedCount}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  Atlanan
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white/90 font-mono">
                  {formatTime(math.elapsedSeconds)}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  Sure
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm text-white/50">
              <div className="flex items-center gap-1.5">
                <Target size={14} className="text-cyan-400" />
                <span>Ort. {(math.avgResponseTime / 1000).toFixed(1)}s/soru</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap size={14} className="text-cyan-400" />
                <span>Zorluk: {DIFFICULTY_LABELS[difficulty]}</span>
              </div>
            </div>

            {/* Attempt Details */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pt-3 border-t border-white/5">
              {math.attempts.map((attempt, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-white/[0.02]"
                >
                  <span className="text-white/50 font-mono">
                    {attempt.question.expression}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 font-mono">
                      = {attempt.question.answer}
                    </span>
                    {attempt.skipped ? (
                      <SkipForward size={12} className="text-white/30" />
                    ) : attempt.correct ? (
                      <CheckCircle size={12} className="text-emerald-400" />
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-red-300/70 font-mono">
                          ({attempt.userAnswer})
                        </span>
                        <XCircle size={12} className="text-red-400" />
                      </div>
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
              onClick={() => math.reset()}
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
