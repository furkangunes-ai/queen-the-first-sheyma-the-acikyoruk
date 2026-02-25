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
  { value: 'anladim', label: 'Anladim', icon: CheckCircle, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100', activeColor: 'bg-emerald-500 text-white border-emerald-600' },
  { value: 'tekrar', label: 'Tekrar Etmem Lazim', icon: RefreshCw, color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100', activeColor: 'bg-amber-500 text-white border-amber-600' },
  { value: 'anlamadim', label: 'Hala Anlayamadim', icon: AlertTriangle, color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100', activeColor: 'bg-red-500 text-white border-red-600' },
];

const DIFFICULTY_MAP: Record<string, { label: string; color: string }> = {
  kolay: { label: 'Kolay', color: 'bg-green-100 text-green-700 border-green-200' },
  orta: { label: 'Orta', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  zor: { label: 'Zor', color: 'bg-red-100 text-red-700 border-red-200' },
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
      if (!res.ok) throw new Error('Guncelleme basarisiz');
      onUpdate(question.id, { understandingStatus: status });
      toast.success('Durum guncellendi');
    } catch {
      toast.error('Durum guncellenirken hata olustu');
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
      if (!res.ok) throw new Error('Guncelleme basarisiz');
      onUpdate(question.id, { difficulty });
      toast.success('Zorluk guncellendi');
    } catch {
      toast.error('Zorluk guncellenirken hata olustu');
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
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-slate-800">
                Soru {question.questionNumber}
              </span>
              <span className="text-sm text-slate-400">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => canGoPrev && onNavigate(currentIndex - 1)}
                disabled={!canGoPrev}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => canGoNext && onNavigate(currentIndex + 1)}
                disabled={!canGoNext}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-2"
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
                className="relative group cursor-pointer rounded-xl overflow-hidden border border-slate-200 shadow-sm"
                onClick={() => setShowFullPhoto(true)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={question.photoUrl}
                  alt={`Soru ${question.questionNumber}`}
                  className="w-full max-h-80 object-contain bg-slate-50"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                </div>
              </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ders</p>
                <p className="text-sm font-semibold text-slate-800">{question.subject.name}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Konu</p>
                <p className="text-sm font-semibold text-slate-800">{question.topic?.name ?? 'Belirtilmemis'}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hata Nedeni</p>
                <p className="text-sm font-semibold text-slate-800">{question.errorReason?.label ?? 'Belirtilmemis'}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Not</p>
                <p className="text-sm text-slate-600 italic">{question.notes || '-'}</p>
              </div>
            </div>

            {/* Difficulty Selection */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
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
                        isActive ? info.color.replace('100', '500').replace('text-', 'text-white ') + ' ring-2 ring-offset-1 ring-' + level : info.color
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
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
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
