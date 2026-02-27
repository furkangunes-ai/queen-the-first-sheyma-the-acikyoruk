"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  RotateCw,
  Loader2,
  CheckCircle,
  XCircle,
  Brain,
  Clock,
  Zap,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Trophy,
  ChevronRight,
  BookOpen,
} from "lucide-react";

interface SpacedItem {
  id: string;
  wrongQuestion: {
    questionNumber: number;
    notes: string | null;
    photoUrl: string | null;
    difficulty: string | null;
    exam: { title: string };
    errorReason: { label: string } | null;
  };
  subject: { id: string; name: string };
  topic: { id: string; name: string } | null;
  interval: number;
  repetitionCount: number;
  easeFactor: number;
  nextReviewDate: string;
}

interface SpacedStats {
  dueToday: number;
  totalPending: number;
  totalMastered: number;
}

export default function SpacedRepetition() {
  const [dueItems, setDueItems] = useState<SpacedItem[]>([]);
  const [stats, setStats] = useState<SpacedStats>({ dueToday: 0, totalPending: 0, totalMastered: 0 });
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const currentItem = dueItems[currentIndex] || null;
  const isFinished = reviewedCount > 0 && currentIndex >= dueItems.length;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/spaced-repetition");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDueItems(data.dueItems);
      setStats(data.stats);
    } catch {
      toast.error("Tekrar verileri yuklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleReview = useCallback(
    async (quality: "easy" | "hard" | "wrong") => {
      if (!currentItem) return;
      setSubmitting(true);
      try {
        const res = await fetch("/api/spaced-repetition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId: currentItem.id, quality }),
        });
        if (!res.ok) throw new Error();

        setReviewedCount((c) => c + 1);
        setShowAnswer(false);
        setCurrentIndex((i) => i + 1);
      } catch {
        toast.error("Güncelleme başarısız");
      } finally {
        setSubmitting(false);
      }
    },
    [currentItem]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-pink-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-panel p-4 text-center">
          <p className="text-2xl font-bold text-amber-400 font-mono">{stats.dueToday}</p>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Bugun</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="text-2xl font-bold text-pink-400 font-mono">{stats.totalPending}</p>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Bekleyen</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400 font-mono">{stats.totalMastered}</p>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Ogrenildi</p>
        </div>
      </div>

      {/* No items state */}
      {dueItems.length === 0 && !isFinished && (
        <div className="glass-panel p-10 text-center">
          <Trophy size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/50 mb-2">Bugun icin tekrar yapilacak soru yok!</p>
          <p className="text-xs text-white/30">
            Deneme sınavı yanlışlarını "Hata Tekrar" kuyruğuna ekleyerek burada tekrar edebilirsin.
          </p>
        </div>
      )}

      {/* Finished state */}
      {isFinished && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-10 text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
          >
            <CheckCircle size={48} className="mx-auto text-emerald-400" />
          </motion.div>
          <h3 className="text-xl font-bold text-white">Tebrikler!</h3>
          <p className="text-sm text-white/50">
            Bugunun {reviewedCount} tekrarini tamamladin.
          </p>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setReviewedCount(0);
              fetchItems();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
          >
            <RotateCw size={16} />
            Yenile
          </button>
        </motion.div>
      )}

      {/* Review Card */}
      {currentItem && !isFinished && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="glass-panel p-6 space-y-5"
          >
            {/* Progress */}
            <div className="flex items-center justify-between text-sm text-white/40">
              <span>
                {currentIndex + 1} / {dueItems.length}
              </span>
              <span className="flex items-center gap-1.5">
                <RotateCw size={12} />
                Tekrar #{currentItem.repetitionCount + 1}
              </span>
            </div>

            {/* Question Info */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-pink-500/15 text-pink-300 text-xs font-bold border border-pink-500/20">
                  {currentItem.subject.name}
                </span>
                {currentItem.topic && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 text-white/60 text-xs border border-white/10">
                    {currentItem.topic.name}
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-lg bg-white/5 text-white/40 text-xs border border-white/10">
                  {currentItem.wrongQuestion.exam.title}
                </span>
              </div>

              <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-white/30" />
                  <span className="text-sm font-semibold text-white/80">
                    Soru #{currentItem.wrongQuestion.questionNumber}
                  </span>
                  {currentItem.wrongQuestion.difficulty && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      currentItem.wrongQuestion.difficulty === "zor"
                        ? "bg-red-500/15 text-red-300"
                        : currentItem.wrongQuestion.difficulty === "orta"
                        ? "bg-amber-500/15 text-amber-300"
                        : "bg-emerald-500/15 text-emerald-300"
                    }`}>
                      {currentItem.wrongQuestion.difficulty}
                    </span>
                  )}
                </div>

                {currentItem.wrongQuestion.errorReason && (
                  <p className="text-xs text-white/40 flex items-center gap-1.5">
                    <AlertTriangle size={11} className="text-amber-400/60" />
                    {currentItem.wrongQuestion.errorReason.label}
                  </p>
                )}

                {currentItem.wrongQuestion.notes && (
                  <p className="text-xs text-white/50 italic">
                    &ldquo;{currentItem.wrongQuestion.notes}&rdquo;
                  </p>
                )}

                {currentItem.wrongQuestion.photoUrl && (
                  <div className="mt-2">
                    <img
                      src={currentItem.wrongQuestion.photoUrl}
                      alt="Soru fotoğrafı"
                      className="rounded-lg max-h-48 w-auto border border-white/10"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Show Answer / Rate */}
            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500/20 to-amber-500/20 border border-pink-500/20 text-white font-bold text-sm hover:from-pink-500/30 hover:to-amber-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Brain size={18} />
                Cevabi Dusundun mu? Devam Et
                <ChevronRight size={16} />
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <p className="text-sm font-semibold text-white/70 text-center">
                  Bu soruyu ne kadar bildin?
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleReview("easy")}
                    disabled={submitting}
                    className="py-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 font-bold text-sm hover:bg-emerald-500/25 transition-all disabled:opacity-40 flex flex-col items-center gap-1.5"
                  >
                    <ThumbsUp size={18} />
                    <span>Kolay</span>
                    <span className="text-[9px] text-emerald-400/50">
                      {Math.round(currentItem.interval * currentItem.easeFactor)} gun sonra
                    </span>
                  </button>
                  <button
                    onClick={() => handleReview("hard")}
                    disabled={submitting}
                    className="py-3.5 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-300 font-bold text-sm hover:bg-amber-500/25 transition-all disabled:opacity-40 flex flex-col items-center gap-1.5"
                  >
                    <Zap size={18} />
                    <span>Zor ama bildim</span>
                    <span className="text-[9px] text-amber-400/50">
                      {Math.max(1, Math.round(currentItem.interval * 1.5))} gun sonra
                    </span>
                  </button>
                  <button
                    onClick={() => handleReview("wrong")}
                    disabled={submitting}
                    className="py-3.5 rounded-xl bg-red-500/15 border border-red-500/25 text-red-300 font-bold text-sm hover:bg-red-500/25 transition-all disabled:opacity-40 flex flex-col items-center gap-1.5"
                  >
                    <ThumbsDown size={18} />
                    <span>Bilmedim</span>
                    <span className="text-[9px] text-red-400/50">Yarin tekrar</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Interval info */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-white/25">
              <Clock size={10} />
              <span>Mevcut aralik: {currentItem.interval} gun</span>
              <span>|</span>
              <span>Kolaylik: {currentItem.easeFactor.toFixed(1)}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
