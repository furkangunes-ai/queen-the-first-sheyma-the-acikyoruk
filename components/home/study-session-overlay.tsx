"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Pause, Play, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import type { ActionType } from '@/lib/roi-engine';

interface StudySessionOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  topicName: string;
  subjectName: string;
  actionType: ActionType;
  actionLabel: string;
  sessionDuration: number; // dakika
  onSessionComplete: (data: { questionCount: number; correctCount: number; duration: number }) => void;
}

/**
 * Çalışma Oturumu Overlay'i
 *
 * Aksiyom 3: Navigasyon sürtünmedir → sayfa değiştirmek yok.
 * Öğrenci butona basar, timer başlar, oturum bitince veri girer.
 * Newton'un Eylemsizlik Prensibi: Tek buton = tek aksiyon.
 */
export default function StudySessionOverlay({
  isOpen,
  onClose,
  topicId,
  topicName,
  subjectName,
  actionType,
  actionLabel,
  sessionDuration,
  onSessionComplete,
}: StudySessionOverlayProps) {
  const [phase, setPhase] = useState<'timer' | 'feedback'>('timer');
  const [secondsLeft, setSecondsLeft] = useState(sessionDuration * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Feedback form
  const [questionCount, setQuestionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Timer
  useEffect(() => {
    if (!isOpen) return;
    setPhase('timer');
    setSecondsLeft(sessionDuration * 60);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    setQuestionCount(0);
    setCorrectCount(0);
  }, [isOpen, sessionDuration]);

  useEffect(() => {
    if (!isOpen || phase !== 'timer' || isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Süre doldu
          setPhase('feedback');
          const elapsed = Math.round((Date.now() - startTimeRef.current) / 60000);
          setElapsedMinutes(elapsed);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen, phase, isPaused]);

  const handleFinishEarly = useCallback(() => {
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 60000);
    setElapsedMinutes(Math.max(1, elapsed));
    setPhase('feedback');
  }, []);

  const handleSubmitFeedback = useCallback(async () => {
    setSubmitting(true);
    try {
      // DailyStudy kaydı oluştur
      await fetch('/api/daily-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          questionCount,
          correctCount,
          wrongCount: Math.max(0, questionCount - correctCount),
          emptyCount: 0,
          duration: elapsedMinutes,
          difficulty: 'orta',
          source: 'Sistem Önerisi',
        }),
      });

      onSessionComplete({
        questionCount,
        correctCount,
        duration: elapsedMinutes,
      });

      toast.success(`${topicName} oturumu tamamlandı!`);
      onClose();
    } catch {
      toast.error('Oturum kaydedilemedi');
    } finally {
      setSubmitting(false);
    }
  }, [topicId, topicName, questionCount, correctCount, elapsedMinutes, onSessionComplete, onClose]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-panel w-full max-w-sm mx-4 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div>
              <h3 className="text-sm font-bold text-white">{topicName}</h3>
              <p className="text-[10px] text-white/40 mt-0.5">{subjectName} · {actionLabel}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/30 hover:text-white/60 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Timer Phase */}
          {phase === 'timer' && (
            <div className="p-6 flex flex-col items-center gap-6">
              <div className="text-center">
                <div className={clsx(
                  "text-5xl font-black tracking-tight tabular-nums",
                  secondsLeft > 60 ? "text-white" : "text-amber-400"
                )}>
                  {formatTime(secondsLeft)}
                </div>
                <p className="text-[10px] text-white/30 mt-2">
                  {sessionDuration} dakikalık oturum
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all"
                >
                  {isPaused ? <Play size={20} /> : <Pause size={20} />}
                </button>
                <button
                  onClick={handleFinishEarly}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/80 to-cyan-500/80 text-white text-sm font-bold hover:brightness-110 transition-all"
                >
                  Bitirdim
                </button>
              </div>

              {isPaused && (
                <p className="text-[10px] text-amber-400/60">Duraklatıldı</p>
              )}
            </div>
          )}

          {/* Feedback Phase */}
          {phase === 'feedback' && (
            <div className="p-5">
              <div className="text-center mb-4">
                <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-white">Tamamlandı!</p>
                <p className="text-[10px] text-white/40">{elapsedMinutes} dakika çalıştın</p>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-[10px] text-white/40 font-bold block mb-1">
                    Çözülen soru sayısı
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={questionCount || ''}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                    className="w-full py-2 px-3 rounded-lg text-sm font-bold text-white bg-white/[0.04] border border-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-400/50"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 font-bold block mb-1">
                    Doğru sayısı
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={correctCount || ''}
                    onChange={(e) => setCorrectCount(Math.min(
                      parseInt(e.target.value.replace(/\D/g, '')) || 0,
                      questionCount
                    ))}
                    className="w-full py-2 px-3 rounded-lg text-sm font-bold text-white bg-white/[0.04] border border-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-400/50"
                    placeholder="0"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmitFeedback}
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500/80 to-amber-500/80 text-white text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50"
              >
                {submitting ? 'Kaydediliyor...' : 'Oturumu Kaydet'}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
