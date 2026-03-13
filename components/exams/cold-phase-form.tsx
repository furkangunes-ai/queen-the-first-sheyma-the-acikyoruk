"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Brain, ChevronRight, CheckCircle2, Loader2, MessageSquare, Zap } from 'lucide-react';
import {
  ERROR_REASONS_ORDERED,
  ERROR_REASON_LABELS,
  VOID_STATUS_COLORS,
  getColdPhaseFrictionMessage,
  type ErrorReasonType,
} from '@/lib/severity';

interface ColdPhaseFormProps {
  examId: string;
  examDate: string; // ISO date
  subjectResults: Array<{
    subjectId: string;
    subjectName: string;
    wrongCount: number;
    emptyCount: number;
  }>;
  onComplete: () => void;
}

interface Topic {
  id: string;
  name: string;
  subjectId: string;
}

interface VoidCard {
  subjectId: string;
  subjectName: string;
  source: 'WRONG' | 'EMPTY';
  count: number; // kaç soru yanlış/boş
  // Soğuk faz girişleri
  topicId: string;
  errorReason: ErrorReasonType;
  notes: string;
  completed: boolean;
}

/**
 * Soğuk Faz - Kognitif Zafiyet Haritalama
 * Sıcak Faz'dan sonra (minimum 6 saat), öğrenci dinlendikten sonra
 * zafiyet noktalarını tek tıkla etiketler.
 *
 * Akış:
 * 1. Her ders için yanlış/boş sayısı kadar kart
 * 2. Kart 1: Konu seçimi (en çok hata yapılan konular üstte)
 * 3. Kart 2: Hata kök nedeni (statik butonlar)
 * 4. Kart 3: Opsiyonel "Eureka" notu
 */
export default function ColdPhaseForm({ examId, examDate, subjectResults, onComplete }: ColdPhaseFormProps) {
  const [topics, setTopics] = useState<Record<string, Topic[]>>({});
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Friction gate
  const [frictionMessage, setFrictionMessage] = useState<string | null>(null);
  const [frictionBypassed, setFrictionBypassed] = useState(false);

  // Current card index
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1); // 1=topic, 2=reason, 3=notes

  // Generate void cards from subject results
  const [cards, setCards] = useState<VoidCard[]>([]);

  useEffect(() => {
    // Check friction gate
    const hoursSinceExam = (Date.now() - new Date(examDate).getTime()) / (1000 * 60 * 60);
    const msg = getColdPhaseFrictionMessage(hoursSinceExam);
    setFrictionMessage(msg);
  }, [examDate]);

  useEffect(() => {
    // Generate cards: one per subject that has wrong or empty
    const newCards: VoidCard[] = [];
    for (const sr of subjectResults) {
      if (sr.wrongCount > 0) {
        newCards.push({
          subjectId: sr.subjectId,
          subjectName: sr.subjectName,
          source: 'WRONG',
          count: sr.wrongCount,
          topicId: '',
          errorReason: 'BILGI_EKSIKLIGI',
          notes: '',
          completed: false,
        });
      }
      if (sr.emptyCount > 0) {
        newCards.push({
          subjectId: sr.subjectId,
          subjectName: sr.subjectName,
          source: 'EMPTY',
          count: sr.emptyCount,
          topicId: '',
          errorReason: 'SURE_YETISMEDI',
          notes: '',
          completed: false,
        });
      }
    }
    setCards(newCards);
  }, [subjectResults]);

  // Fetch topics for all subjects
  useEffect(() => {
    const subjectIds = [...new Set(subjectResults.map(s => s.subjectId))];
    if (subjectIds.length === 0) return;

    async function fetchTopics() {
      setLoadingTopics(true);
      try {
        const topicMap: Record<string, Topic[]> = {};
        // Fetch all subjects' topics
        const res = await fetch(`/api/subjects/topics?subjectIds=${subjectIds.join(',')}`);
        if (res.ok) {
          const data = await res.json();
          for (const topic of data) {
            if (!topicMap[topic.subjectId]) topicMap[topic.subjectId] = [];
            topicMap[topic.subjectId].push(topic);
          }
        }
        setTopics(topicMap);
      } catch {
        toast.error('Konular yüklenirken hata oluştu');
      } finally {
        setLoadingTopics(false);
      }
    }
    fetchTopics();
  }, [subjectResults]);

  const currentCard = cards[currentCardIndex];
  const totalCards = cards.length;
  const completedCards = cards.filter(c => c.completed).length;

  function updateCurrentCard(updates: Partial<VoidCard>) {
    setCards(prev => {
      const updated = [...prev];
      updated[currentCardIndex] = { ...updated[currentCardIndex], ...updates };
      return updated;
    });
  }

  function nextStep() {
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as 1 | 2 | 3);
    } else {
      // Mark card as completed and move to next
      updateCurrentCard({ completed: true });
      if (currentCardIndex < totalCards - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setCurrentStep(1);
      }
    }
  }

  function skipCard() {
    updateCurrentCard({ completed: true });
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setCurrentStep(1);
    }
  }

  async function handleSubmitAll() {
    setSubmitting(true);
    try {
      const completedVoids = cards.filter(c => c.completed && c.topicId);

      for (const card of completedVoids) {
        await fetch(`/api/exams/${examId}/cognitive-voids`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subjectId: card.subjectId,
            topicId: card.topicId,
            errorReason: card.errorReason,
            source: card.source,
            magnitude: card.count,
            notes: card.notes || undefined,
          }),
        });
      }

      // coldPhaseCompleted kaldırıldı — ClarityScore artık void status'larından otomatik hesaplanır
      toast.success('Zafiyet haritası tamamlandı! Ebbinghaus motoru aktif.');
      onComplete();
    } catch {
      toast.error('Zafiyet kaydedilirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  }

  const allCompleted = completedCards === totalCards && totalCards > 0;
  const subjectTopics = currentCard ? (topics[currentCard.subjectId] || []) : [];

  // Friction gate screen
  if (frictionMessage && !frictionBypassed) {
    return (
      <div className="glass-panel p-8 max-w-lg mx-auto text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none" />
        <Brain size={48} className="mx-auto text-amber-400 mb-6 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]" />
        <h2 className="text-xl font-bold text-white mb-4">Kognitif Uyarı</h2>
        <p className="text-white/60 text-sm leading-relaxed mb-8">{frictionMessage}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onComplete}
            className="px-6 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white/60 font-bold text-sm hover:bg-white/[0.08] transition-all"
          >
            Sonra Yaparım
          </button>
          <button
            onClick={() => setFrictionBypassed(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 text-amber-400 font-bold text-sm hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all"
          >
            Yine de Analiz Et
          </button>
        </div>
      </div>
    );
  }

  if (loadingTopics) {
    return (
      <div className="glass-panel p-8 max-w-lg mx-auto text-center">
        <Loader2 size={40} className="mx-auto animate-spin text-pink-400 mb-4" />
        <p className="text-white/50 text-sm">Konular yükleniyor...</p>
      </div>
    );
  }

  if (totalCards === 0) {
    return (
      <div className="glass-panel p-8 max-w-lg mx-auto text-center">
        <CheckCircle2 size={48} className="mx-auto text-emerald-400 mb-4" />
        <p className="text-white/60">Bu denemede haritalanacak zafiyet yok!</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 sm:p-8 max-w-2xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
            Zafiyet Haritalama
          </span>
          <span className="text-[11px] font-bold text-pink-400">
            {completedCards}/{totalCards}
          </span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-pink-500 to-pink-400"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCards / totalCards) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* All completed → submit */}
      {allCompleted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <CheckCircle2 size={56} className="mx-auto text-emerald-400 mb-4 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]" />
          <h3 className="text-xl font-bold text-white mb-2">Tüm zafiyetler haritalandı!</h3>
          <p className="text-white/40 text-sm mb-8">Ebbinghaus motoru bu verileri işleyecek.</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmitAll}
            disabled={submitting}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-3.5 rounded-xl shadow-[0_0_15px_rgba(52,211,153,0.3)] border border-emerald-400/20 font-bold text-sm flex items-center gap-2 mx-auto"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            {submitting ? 'Kaydediliyor...' : 'Zafiyet Haritasını Kaydet'}
          </motion.button>
        </motion.div>
      ) : currentCard && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentCardIndex}-${currentStep}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Card header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${
                currentCard.source === 'WRONG'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {currentCard.count}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{currentCard.subjectName}</h3>
                <p className="text-xs text-white/40">
                  {currentCard.source === 'WRONG' ? 'Yanlış' : 'Boş'} — Adım {currentStep}/3
                </p>
              </div>
            </div>

            {/* Step 1: Topic Selection */}
            {currentStep === 1 && (
              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-3">
                  Zafiyet Konusu
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                  {subjectTopics.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => {
                        updateCurrentCard({ topicId: topic.id });
                        nextStep();
                      }}
                      className={`py-3 px-4 rounded-xl text-sm font-bold tracking-wide transition-all border text-left ${
                        currentCard.topicId === topic.id
                          ? 'bg-pink-500/20 text-pink-400 border-pink-500/30 shadow-[0_0_10px_rgba(255,42,133,0.15)]'
                          : 'bg-white/[0.03] text-white/60 border-white/10 hover:bg-white/[0.06] hover:text-white/80'
                      }`}
                    >
                      {topic.name}
                    </button>
                  ))}
                </div>
                {subjectTopics.length === 0 && (
                  <p className="text-white/30 text-sm text-center py-8">Bu ders için konu tanımlanmamış</p>
                )}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={skipCard}
                    className="text-white/30 hover:text-white/60 text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Atla
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Error Reason */}
            {currentStep === 2 && (
              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-3">
                  Hata Kök Nedeni
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {ERROR_REASONS_ORDERED.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => {
                        updateCurrentCard({ errorReason: reason });
                        nextStep();
                      }}
                      className={`py-3.5 px-5 rounded-xl text-sm font-bold tracking-wide transition-all border text-left ${
                        currentCard.errorReason === reason
                          ? 'bg-pink-500/20 text-pink-400 border-pink-500/30'
                          : 'bg-white/[0.03] text-white/60 border-white/10 hover:bg-white/[0.06] hover:text-white/80'
                      }`}
                    >
                      {ERROR_REASON_LABELS[reason]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Optional Notes (Eureka moment) */}
            {currentStep === 3 && (
              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-3">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare size={12} />
                    İçgörü Notu <span className="text-white/30 font-normal">(opsiyonel)</span>
                  </span>
                </label>
                <textarea
                  placeholder="Bu konuyu neden yapamadığına dair bir içgörün varsa yaz..."
                  value={currentCard.notes}
                  onChange={(e) => updateCurrentCard({ notes: e.target.value })}
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-400/30 transition-all resize-none"
                />
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-white/40 hover:text-white/80 text-sm font-bold uppercase tracking-wider transition-colors"
                  >
                    Geri
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={nextStep}
                    className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-2.5 rounded-xl shadow-[0_0_12px_rgba(255,42,133,0.3)] border border-pink-400/20 font-bold text-sm flex items-center gap-2"
                  >
                    {currentCardIndex < totalCards - 1 ? 'Sonraki' : 'Tamamla'}
                    <ChevronRight size={14} />
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
