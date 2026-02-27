"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  X, Camera, CheckCircle, AlertTriangle, RefreshCw, Loader2,
  ChevronLeft, ChevronRight, ZoomIn, BookOpen, Target,
} from 'lucide-react';

// --------------- Types ---------------

export interface WrongQuestionDetail {
  id: string;
  questionNumber: number;
  subject: { name: string };
  topic: { name: string } | null;
  errorReason: { label: string } | null;
  notes: string | null;
  photoUrl: string | null;
  difficulty: string | null;
  understandingStatus: string | null;
}

interface QuestionDetailModalProps {
  examId: string;
  question: WrongQuestionDetail;
  questions: WrongQuestionDetail[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onUpdate: (questionId: string, updates: Partial<WrongQuestionDetail>) => void;
}

// --------------- Constants ---------------

const UNDERSTANDING_OPTIONS = [
  { value: 'anladim', label: 'Anladım', icon: CheckCircle, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20', activeColor: 'bg-emerald-500 text-white border-emerald-600' },
  { value: 'tekrar', label: 'Tekrar Etmem Lazım', icon: RefreshCw, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20', activeColor: 'bg-amber-500 text-white border-amber-600' },
  { value: 'anlamadim', label: 'Hala Anlayamadım', icon: AlertTriangle, color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20', activeColor: 'bg-rose-500 text-white border-rose-600' },
];

const DIFFICULTY_MAP: Record<string, { label: string; color: string }> = {
  kolay: { label: 'Kolay', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  orta: { label: 'Orta', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  zor: { label: 'Zor', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
};

// --------------- Component ---------------

export default function QuestionDetailModal({
  examId,
  question,
  questions,
  currentIndex,
  onClose,
  onNavigate,
  onUpdate,
}: QuestionDetailModalProps) {
  const [saving, setSaving] = useState(false);
  const [showFullPhoto, setShowFullPhoto] = useState(false);

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < questions.length - 1;

  async function handleUpdateStatus(status: string) {
    if (question.understandingStatus === status) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/exams/${examId}/wrong-questions/${question.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ understandingStatus: status }),
      });
      if (!res.ok) throw new Error('Güncelleme başarısız');
      onUpdate(question.id, { understandingStatus: status });
      toast.success('Durum güncellendi');
    } catch {
      toast.error('Durum güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateDifficulty(difficulty: string) {
    if (question.difficulty === difficulty) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/exams/${examId}/wrong-questions/${question.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty }),
      });
      if (!res.ok) throw new Error('Güncelleme başarısız');
      onUpdate(question.id, { difficulty });
      toast.success('Zorluk güncellendi');
    } catch {
      toast.error('Zorluk güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-[#151528] rounded-2xl shadow-2xl shadow-pink-500/[0.05] max-w-lg w-full max-h-[90vh] overflow-y-auto border border-pink-500/[0.12]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#151528] border-b border-pink-500/15 px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-white">
                Soru {question.questionNumber}
              </span>
              <span className="text-sm text-white/40">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => canGoPrev && onNavigate(currentIndex - 1)}
                disabled={!canGoPrev}
                className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => canGoNext && onNavigate(currentIndex + 1)}
                disabled={!canGoNext}
                className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-2"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 py-5 space-y-5">
            {/* Photo */}
            {question.photoUrl && (
              <div
                className="relative group cursor-pointer rounded-xl overflow-hidden border border-pink-500/[0.12]"
                onClick={() => setShowFullPhoto(true)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={question.photoUrl}
                  alt={`Soru ${question.questionNumber}`}
                  className="w-full max-h-80 object-contain bg-white/[0.03]"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                </div>
              </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.04] rounded-lg p-3 border border-white/10">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Ders</p>
                <p className="text-sm font-semibold text-white/90">{question.subject.name}</p>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-3 border border-white/10">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Konu</p>
                <p className="text-sm font-semibold text-white/90">{question.topic?.name ?? 'Belirtilmemiş'}</p>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-3 border border-white/10">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Hata Nedeni</p>
                <p className="text-sm font-semibold text-white/90">{question.errorReason?.label ?? 'Belirtilmemiş'}</p>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-3 border border-white/10">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Not</p>
                <p className="text-sm text-white/60 italic">{question.notes || '-'}</p>
              </div>
            </div>

            {/* Difficulty Selection */}
            <div>
              <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Target size={14} />
                Zorluk Seviyesi
              </p>
              <div className="flex gap-2">
                {['kolay', 'orta', 'zor'].map((level) => {
                  const info = DIFFICULTY_MAP[level];
                  const isActive = question.difficulty === level;
                  return (
                    <button
                      key={level}
                      onClick={() => handleUpdateDifficulty(level)}
                      disabled={saving}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                        isActive ? info.color.replace('/10', '/30') + ' ring-2 ring-offset-1 ring-offset-[#151528] ring-pink-400' : info.color
                      } disabled:opacity-50`}
                    >
                      {info.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Understanding Status */}
            <div>
              <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen size={14} />
                Anlama Durumu
              </p>
              <div className="space-y-2">
                {UNDERSTANDING_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = question.understandingStatus === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleUpdateStatus(opt.value)}
                      disabled={saving}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                        isActive ? opt.activeColor : opt.color
                      } disabled:opacity-50`}
                    >
                      {saving && question.understandingStatus !== opt.value ? null : (
                        <Icon size={18} className={isActive ? 'text-white' : ''} />
                      )}
                      <span>{opt.label}</span>
                      {isActive && (
                        <CheckCircle size={16} className="ml-auto text-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Full Photo Overlay */}
      <AnimatePresence>
        {showFullPhoto && question.photoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowFullPhoto(false)}
          >
            <button
              onClick={() => setShowFullPhoto(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={24} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={question.photoUrl}
              alt={`Soru ${question.questionNumber}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
