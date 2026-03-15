"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ActionType } from '@/lib/roi-engine';

interface StudySessionOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  topicName: string;
  subjectName: string;
  actionType: ActionType;
  actionLabel: string;
  onSessionComplete: (data: { questionCount: number; correctCount: number; duration: number }) => void;
}

/**
 * Çalışma Bilgisi Kayıt Overlay'i
 *
 * Timer kaldırıldı — sadece konu bilgisi + soru/doğru girişi + kaydet.
 */
export default function StudySessionOverlay({
  isOpen,
  onClose,
  topicId,
  topicName,
  subjectName,
  actionLabel,
  onSessionComplete,
}: StudySessionOverlayProps) {
  const [questionCount, setQuestionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuestionCount(0);
      setCorrectCount(0);
      setDuration(0);
      setSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      await fetch('/api/daily-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          questionCount,
          correctCount,
          wrongCount: Math.max(0, questionCount - correctCount),
          emptyCount: 0,
          duration: duration || null,
          difficulty: 'orta',
          source: 'Sistem Önerisi',
        }),
      });

      onSessionComplete({
        questionCount,
        correctCount,
        duration,
      });

      toast.success(`${topicName} kaydedildi!`);
      onClose();
    } catch {
      toast.error('Kayıt sırasında hata oluştu');
    } finally {
      setSubmitting(false);
    }
  }, [topicId, topicName, questionCount, correctCount, duration, onSessionComplete, onClose]);

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

          {/* Form */}
          <div className="p-5">
            <div className="text-center mb-4">
              <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-white">Çalışma Bilgisi</p>
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
              <div>
                <label className="text-[10px] text-white/40 font-bold block mb-1">
                  Süre (dakika) <span className="text-white/20">— opsiyonel</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={duration || ''}
                  onChange={(e) => setDuration(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                  className="w-full py-2 px-3 rounded-lg text-sm font-bold text-white bg-white/[0.04] border border-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-400/50"
                  placeholder="0"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500/80 to-amber-500/80 text-white text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50"
            >
              {submitting ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
