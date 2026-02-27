"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  ChevronUp,
  ChevronDown,
  Type,
  Zap,
  Save,
  RotateCw,
  Clock,
  BookOpen,
  Target,
  Gauge,
  Loader2,
} from "lucide-react";
import { useRSVP } from "@/hooks/useRSVP";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

type ReaderPhase = "input" | "reading" | "results";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function SpeedReader() {
  const [wpm, setWpm] = useState(300);
  const [chunkSize, setChunkSize] = useState(1);
  const [autoSpeed, setAutoSpeed] = useState(false);
  const [autoSpeedIncrement, setAutoSpeedIncrement] = useState(10);
  const [autoSpeedInterval, setAutoSpeedInterval] = useState(50);
  const [punctuationPause, setPunctuationPause] = useState(true);
  const [fontSize, setFontSize] = useState(48);
  const [textInput, setTextInput] = useState("");
  const [title, setTitle] = useState("");
  const [phase, setPhase] = useState<ReaderPhase>("input");
  const [saving, setSaving] = useState(false);
  const [comprehension, setComprehension] = useState<number | null>(null);

  const rsvp = useRSVP({
    wpm,
    chunkSize,
    autoSpeed,
    autoSpeedIncrement,
    autoSpeedInterval,
    punctuationPause,
  });

  const handleStart = useCallback(() => {
    if (!textInput.trim()) {
      toast.error("Lütfen bir metin girin");
      return;
    }
    rsvp.loadText(textInput);
    setPhase("reading");
    setTimeout(() => rsvp.play(), 500);
  }, [textInput, rsvp]);

  useEffect(() => {
    if (rsvp.isFinished && phase === "reading") {
      setPhase("results");
    }
  }, [rsvp.isFinished, phase]);

  const handleStop = useCallback(() => {
    rsvp.stop();
    setPhase("results");
  }, [rsvp]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/speed-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || null,
          wordCount: rsvp.totalWords,
          wordsRead: rsvp.wordsRead,
          initialWpm: rsvp.initialWpm,
          finalWpm: rsvp.currentWpm,
          chunkSize,
          autoSpeed,
          duration: rsvp.elapsedSeconds,
          completed: rsvp.isFinished,
          comprehension,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Oturum kaydedildi!");
    } catch {
      toast.error("Kaydetme başarısız");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    rsvp.restart();
    setPhase("input");
    setComprehension(null);
  };

  const comprehensionLabels: Record<number, string> = {
    1: "Hiç anlamadım",
    2: "Az anladım",
    3: "Orta düzeyde anladım",
    4: "İyi anladım",
    5: "Tamamen anladım",
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (phase !== "reading") return;
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLInputElement
      )
        return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          rsvp.isPlaying ? rsvp.pause() : rsvp.play();
          break;
        case "ArrowUp":
          e.preventDefault();
          rsvp.setCurrentWpm((w: number) => Math.min(w + 25, 1500));
          setWpm((w) => Math.min(w + 25, 1500));
          break;
        case "ArrowDown":
          e.preventDefault();
          rsvp.setCurrentWpm((w: number) => Math.max(w - 25, 50));
          setWpm((w) => Math.max(w - 25, 50));
          break;
        case "KeyR":
          e.preventDefault();
          rsvp.restart();
          break;
        case "Escape":
          e.preventDefault();
          handleStop();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, rsvp, handleStop]);

  const wordCount = textInput.trim()
    ? textInput.trim().split(/\s+/).length
    : 0;

  return (
    <AnimatePresence mode="wait">
      {/* =========== INPUT PHASE =========== */}
      {phase === "input" && (
        <motion.div
          key="input"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="space-y-5"
        >
          {/* Title */}
          <div className="glass-panel p-5 space-y-3">
            <label className="text-sm font-medium text-white/60">
              Başlık (isteğe bağlı)
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Metin başlığı..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-pink-500/30 focus:outline-none transition-colors"
            />
          </div>

          {/* Text Area */}
          <div className="glass-panel p-5 space-y-3">
            <label className="text-sm font-medium text-white/60">Metin</label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Okumak istediğiniz metni buraya yapıştırın..."
              rows={8}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-pink-500/30 focus:outline-none resize-none transition-colors"
            />
            {wordCount > 0 && (
              <p className="text-xs text-white/40">{wordCount} kelime</p>
            )}
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* WPM */}
            <div className="glass-panel p-5 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                  <Gauge size={16} className="text-pink-400" /> Hız (WPM)
                </label>
                <span className="text-lg font-bold text-pink-300 font-mono">
                  {wpm}
                </span>
              </div>
              <Slider
                value={[wpm]}
                onValueChange={([v]) => setWpm(v)}
                min={50}
                max={1500}
                step={25}
                className="[&_[data-slot=slider-range]]:bg-pink-500 [&_[data-slot=slider-thumb]]:border-pink-500"
              />
              <div className="flex justify-between text-xs text-white/30">
                <span>50</span>
                <span>1500</span>
              </div>
            </div>

            {/* Chunk Size */}
            <div className="glass-panel p-5 space-y-4">
              <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                <Type size={16} className="text-cyan-400" /> Kelime Grubu
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 5].map((size) => (
                  <button
                    key={size}
                    onClick={() => setChunkSize(size)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      chunkSize === size
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Speed */}
            <div className="glass-panel p-5 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                  <Zap size={16} className="text-amber-400" /> Otomatik Hızlanma
                </label>
                <button
                  onClick={() => setAutoSpeed(!autoSpeed)}
                  className={`w-12 h-6 rounded-full transition-all relative ${
                    autoSpeed
                      ? "bg-pink-500"
                      : "bg-white/10 border border-white/20"
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow transition-transform absolute top-0.5 ${
                      autoSpeed ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              {autoSpeed && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>
                      Her {autoSpeedInterval} kelimede +{autoSpeedIncrement} WPM
                    </span>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/40">
                      Artış miktarı: {autoSpeedIncrement} WPM
                    </label>
                    <Slider
                      value={[autoSpeedIncrement]}
                      onValueChange={([v]) => setAutoSpeedIncrement(v)}
                      min={5}
                      max={50}
                      step={5}
                      className="[&_[data-slot=slider-range]]:bg-amber-500 [&_[data-slot=slider-thumb]]:border-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/40">
                      Her {autoSpeedInterval} kelimede
                    </label>
                    <Slider
                      value={[autoSpeedInterval]}
                      onValueChange={([v]) => setAutoSpeedInterval(v)}
                      min={20}
                      max={200}
                      step={10}
                      className="[&_[data-slot=slider-range]]:bg-amber-500 [&_[data-slot=slider-thumb]]:border-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Font Size + Punctuation */}
            <div className="glass-panel p-5 space-y-4">
              <label className="text-sm font-medium text-white/60">
                Yazı Boyutu
              </label>
              <Slider
                value={[fontSize]}
                onValueChange={([v]) => setFontSize(v)}
                min={24}
                max={96}
                step={4}
                className="[&_[data-slot=slider-range]]:bg-white/30 [&_[data-slot=slider-thumb]]:border-white/50"
              />
              <p
                className="text-center text-white/50 transition-all"
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.2 }}
              >
                Aa
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <label className="text-xs text-white/50">
                  Noktalama durakları
                </label>
                <button
                  onClick={() => setPunctuationPause(!punctuationPause)}
                  className={`w-10 h-5 rounded-full transition-all relative ${
                    punctuationPause
                      ? "bg-pink-500"
                      : "bg-white/10 border border-white/20"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow transition-transform absolute top-0.5 ${
                      punctuationPause ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleStart}
            disabled={!textInput.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold text-lg shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <Play size={22} />
            Okumaya Başla
          </motion.button>
        </motion.div>
      )}

      {/* =========== READING PHASE =========== */}
      {phase === "reading" && (
        <motion.div
          key="reading"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="space-y-5"
        >
          {/* Word Display */}
          <div className="glass-panel p-8 md:p-16 flex items-center justify-center min-h-[280px] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />

            <AnimatePresence mode="wait">
              <motion.span
                key={rsvp.currentIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.04 }}
                className="text-white font-bold tracking-wide text-center leading-tight"
                style={{ fontSize: `${fontSize}px` }}
              >
                {rsvp.currentChunk || "..."}
              </motion.span>
            </AnimatePresence>

            {/* WPM Badge */}
            <div className="absolute top-4 right-4 bg-pink-500/15 border border-pink-500/25 rounded-full px-4 py-1.5 flex items-center gap-1.5">
              <Gauge size={14} className="text-pink-400" />
              <span className="text-pink-300 font-bold text-lg font-mono">
                {rsvp.currentWpm}
              </span>
              <span className="text-pink-300/50 text-xs">WPM</span>
            </div>
          </div>

          {/* Progress */}
          <Progress
            value={rsvp.progress}
            className="h-2.5 [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-pink-500 [&_[data-slot=progress-indicator]]:to-cyan-400"
          />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                icon: BookOpen,
                value: `${rsvp.wordsRead}/${rsvp.totalWords}`,
                label: "Kelime",
                color: "text-pink-400",
              },
              {
                icon: Clock,
                value: formatTime(rsvp.elapsedSeconds),
                label: "Geçen Süre",
                color: "text-cyan-400",
              },
              {
                icon: Target,
                value: formatTime(
                  Math.round(rsvp.estimatedRemainingSeconds)
                ),
                label: "Kalan",
                color: "text-amber-400",
              },
              {
                icon: Gauge,
                value: `${rsvp.currentWpm}`,
                label: "Anlık WPM",
                color: "text-emerald-400",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass-panel p-4 text-center space-y-1"
              >
                <stat.icon size={16} className={`mx-auto ${stat.color}`} />
                <p className="text-lg font-bold text-white/90 font-mono">
                  {stat.value}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                rsvp.setCurrentWpm((w: number) => Math.max(w - 25, 50));
                setWpm((w) => Math.max(w - 25, 50));
              }}
              className="glass p-3 rounded-full hover:bg-white/10 transition-colors"
              title="-25 WPM"
            >
              <ChevronDown size={20} className="text-white/70" />
            </button>

            <button
              onClick={() => (rsvp.isPlaying ? rsvp.pause() : rsvp.play())}
              className="bg-gradient-to-r from-pink-500 to-pink-600 p-5 rounded-full shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all"
            >
              {rsvp.isPlaying ? (
                <Pause size={24} className="text-white" />
              ) : (
                <Play size={24} className="text-white" />
              )}
            </button>

            <button
              onClick={() => {
                rsvp.setCurrentWpm((w: number) => Math.min(w + 25, 1500));
                setWpm((w) => Math.min(w + 25, 1500));
              }}
              className="glass p-3 rounded-full hover:bg-white/10 transition-colors"
              title="+25 WPM"
            >
              <ChevronUp size={20} className="text-white/70" />
            </button>

            <div className="w-px h-8 bg-white/10 mx-1" />

            <button
              onClick={() => rsvp.restart()}
              className="glass p-3 rounded-full hover:bg-white/10 transition-colors"
              title="Baştan"
            >
              <RotateCcw size={18} className="text-white/70" />
            </button>

            <button
              onClick={handleStop}
              className="glass p-3 rounded-full hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-all"
              title="Bitir"
            >
              <Square size={18} className="text-red-400" />
            </button>
          </div>

          {/* Keyboard Hints */}
          <div className="hidden md:flex justify-center gap-6 text-xs text-white/25">
            <span>Space: Oynat/Durdur</span>
            <span>↑↓: Hız</span>
            <span>R: Baştan</span>
            <span>Esc: Bitir</span>
          </div>
        </motion.div>
      )}

      {/* =========== RESULTS PHASE =========== */}
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
                className="inline-block text-6xl font-black text-gradient-candy font-mono"
              >
                {rsvp.currentWpm}
              </motion.span>
              <p className="text-sm text-white/40 uppercase tracking-widest">
                Son WPM
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
              <div className="text-center">
                <p className="text-2xl font-bold text-white/90 font-mono">
                  {rsvp.wordsRead}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  Okunan Kelime
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white/90 font-mono">
                  {formatTime(rsvp.elapsedSeconds)}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  Süre
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white/90">
                  {rsvp.isFinished ? "Tam" : "Yarıda"}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  Durum
                </p>
              </div>
            </div>

            {rsvp.initialWpm !== rsvp.currentWpm && (
              <div className="flex items-center justify-center gap-3 text-sm pt-2">
                <span className="text-white/40 font-mono">
                  {rsvp.initialWpm} WPM
                </span>
                <span className="text-pink-400">→</span>
                <span className="text-pink-300 font-bold font-mono">
                  {rsvp.currentWpm} WPM
                </span>
                {rsvp.currentWpm > rsvp.initialWpm && (
                  <span className="text-emerald-400 text-xs font-medium">
                    (+{rsvp.currentWpm - rsvp.initialWpm})
                  </span>
                )}
              </div>
            )}

            {/* Comprehension Self-Rating */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <label className="text-sm font-medium text-white/50 flex items-center justify-center gap-2">
                <BookOpen size={14} className="text-amber-400" />
                Anlama Seviyesi
              </label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setComprehension(level)}
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
                      comprehension === level
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10"
                        : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-lg font-bold">{level}</span>
                  </button>
                ))}
              </div>
              {comprehension && (
                <p className="text-xs text-center text-white/30">
                  {comprehensionLabels[comprehension]}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 disabled:opacity-50"
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
              onClick={handleReset}
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
