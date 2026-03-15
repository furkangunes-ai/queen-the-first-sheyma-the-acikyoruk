"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Play, ChevronDown, Clock, Zap, BookOpen, RotateCcw, Compass, ArrowRight, Sparkles, SlidersHorizontal, CalendarPlus, Home } from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { NextAction, TopicROI, ActionType } from '@/lib/roi-engine';
import MasteryBadge from './mastery-badge';
import StudySessionOverlay from './study-session-overlay';
import GuidedActionWizard from './guided-action-wizard';

const ACTION_ICONS: Record<ActionType, React.ReactNode> = {
  focused_practice: <Zap size={14} />,
  concept_study: <BookOpen size={14} />,
  spaced_review: <RotateCcw size={14} />,
  explore: <Compass size={14} />,
};

type WidgetMode = 'entry' | 'system' | 'guided';

interface NextActionWidgetProps {
  onReturnHome?: () => void;
}

/**
 * Sıradaki Hamle Widget'ı — /plan sayfasında tam sayfa olarak gösterilir.
 */
export default function NextActionWidget({ onReturnHome }: NextActionWidgetProps) {
  const router = useRouter();
  const [mode, setMode] = useState<WidgetMode>('entry');
  const [data, setData] = useState<NextAction | null>(null);
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicROI | null>(null);
  const [addingToPlan, setAddingToPlan] = useState<string | null>(null);

  const goHome = useCallback(() => {
    if (onReturnHome) {
      onReturnHome();
    } else {
      router.push('/');
    }
  }, [onReturnHome, router]);

  const fetchNextAction = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/next-action');
      if (!res.ok) throw new Error();
      const json = await res.json();
      if (json.empty) {
        setEmpty(true);
        setData(null);
      } else {
        setEmpty(false);
        setData(json);
      }
    } catch {
      setEmpty(true);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSystemMode = useCallback(() => {
    setMode('system');
    fetchNextAction();
  }, [fetchNextAction]);

  const handleStartSession = useCallback((topic: TopicROI) => {
    setSelectedTopic(topic);
    setSessionOpen(true);
  }, []);

  const handleSessionComplete = useCallback(() => {
    setSessionOpen(false);
    setSelectedTopic(null);
    goHome();
  }, [goHome]);

  const handleAddToPlan = useCallback(async (topic: TopicROI) => {
    setAddingToPlan(topic.topicId);
    try {
      const res = await fetch('/api/weekly-plans/add-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: topic.subjectId,
          topicId: topic.topicId,
          duration: topic.estimatedDuration,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${topic.topicName} bugünün planına eklendi`);
    } catch {
      toast.error('Plana eklenirken hata oluştu');
    } finally {
      setAddingToPlan(null);
    }
  }, []);

  // ==================== Guided Mode ====================
  if (mode === 'guided') {
    return (
      <GuidedActionWizard
        onBack={() => setMode('entry')}
        onReturnHome={goHome}
      />
    );
  }

  // ==================== Entry Mode ====================
  if (mode === 'entry') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03 }}
        className="glass-panel relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-48 h-48 bg-pink-500/8 rounded-full blur-[50px] pointer-events-none" />
        <div className="p-5 relative z-10">
          <div className="mb-4">
            <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">
              Sıradaki Hamlen
            </span>
            <h3 className="text-base font-bold text-white mt-1">
              Ne yapmak istiyorsun?
            </h3>
          </div>

          <div className="space-y-2.5">
            {/* Kendim Planlayayım */}
            <button
              onClick={() => setMode('guided')}
              className="w-full flex items-center gap-3 p-4 rounded-xl border bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-pink-500/20 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/15 to-amber-500/15 border border-pink-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <SlidersHorizontal size={18} className="text-pink-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Kendim Planlayayım</p>
                <p className="text-[10px] text-white/35 mt-0.5">Birkaç soru ile kişisel çalışma planı</p>
              </div>
              <ArrowRight size={14} className="text-white/15 group-hover:text-white/40 transition-colors" />
            </button>

            {/* Sistem Önersin */}
            <button
              onClick={handleSystemMode}
              className="w-full flex items-center gap-3 p-4 rounded-xl border bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-cyan-500/20 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/15 to-emerald-500/15 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles size={18} className="text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Sistem Önersin</p>
                <p className="text-[10px] text-white/35 mt-0.5">Verilerine göre en verimli konuyu otomatik seç</p>
              </div>
              <ArrowRight size={14} className="text-white/15 group-hover:text-white/40 transition-colors" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ==================== System Mode ====================

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03 }}
        className="glass-panel p-5 flex items-center justify-center"
      >
        <Loader2 className="animate-spin text-pink-500" size={24} />
      </motion.div>
    );
  }

  // Boş durum — yetersiz veri
  if (empty || !data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03 }}
        className="glass-panel relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-[40px] pointer-events-none" />
        <div className="p-5 relative z-10">
          <button
            onClick={() => setMode('entry')}
            className="text-[10px] text-white/25 hover:text-white/40 transition-colors mb-3 flex items-center gap-1"
          >
            <ArrowRight size={10} className="rotate-180" />
            Geri
          </button>
          <p className="text-sm text-white/50 font-medium mb-3 text-center">
            Seni tanımak için veriye ihtiyacım var.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => router.push('/exams')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-pink-300 bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 transition-all"
            >
              Deneme Gir
            </button>
            <button
              onClick={() => router.push('/strategy?tab=map')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all"
            >
              Bilgi Seviyeni Belirle
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  const { primary, alternatives, sessionDuration, todayCompleted } = data;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03 }}
        className="glass-panel relative overflow-hidden"
      >
        {/* Gradient accent */}
        <div className={clsx(
          "absolute top-0 left-0 w-48 h-48 rounded-full blur-[50px] pointer-events-none",
          primary.reason === 'retention_critical' ? 'bg-red-500/8' :
          primary.reason === 'dag_bottleneck' ? 'bg-orange-500/8' :
          primary.reason === 'quick_win' ? 'bg-emerald-500/8' :
          'bg-pink-500/8'
        )} />

        <div className="p-5 relative z-10">
          {/* Back + Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => setMode('entry')}
                  className="text-[9px] text-white/30 uppercase tracking-widest font-bold hover:text-white/50 transition-colors flex items-center gap-1"
                >
                  <ArrowRight size={8} className="rotate-180" />
                  Sıradaki Hamlen
                </button>
              </div>
              <h3 className="text-base font-bold text-white truncate">
                {primary.topicName}
              </h3>
              <p className="text-[11px] text-white/40 mt-0.5">
                {primary.subjectName} · {primary.examTypeName}
              </p>
            </div>
            <MasteryBadge
              category={primary.belief.category}
              categoryLabel={primary.belief.categoryLabel}
              mean={primary.belief.mean}
              ci95Lower={primary.belief.ci95Lower}
              ci95Upper={primary.belief.ci95Upper}
              evidenceCount={primary.belief.evidenceCount}
            />
          </div>

          {/* Aksiyon bilgisi */}
          <div className="flex items-center gap-2 mb-4">
            <span className={clsx(
              "flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border",
              "bg-white/[0.04] text-white/50 border-white/10"
            )}>
              {ACTION_ICONS[primary.actionType]}
              {primary.actionLabel}
            </span>
            <span className="text-[10px] text-white/30 flex items-center gap-0.5">
              <Clock size={10} />
              {sessionDuration}dk
            </span>
            {primary.reasonLabel && (
              <span className="text-[10px] text-white/25 italic">
                · {primary.reasonLabel}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleAddToPlan(primary)}
              disabled={addingToPlan === primary.topicId}
              className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 text-sm font-bold hover:bg-white/[0.08] hover:border-amber-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CalendarPlus size={16} />
              Plana Ekle
            </button>
            <button
              onClick={() => handleStartSession(primary)}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500/80 to-amber-500/80 text-white text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Play size={16} />
              Hemen Başla
            </button>
          </div>

          {/* Alternatifler + Günlük bütçe */}
          <div className="mt-3 flex items-center justify-between">
            {alternatives.length > 0 && (
              <button
                onClick={() => setShowAlternatives(!showAlternatives)}
                className="text-[10px] text-white/25 hover:text-white/40 transition-colors flex items-center gap-1"
              >
                <ChevronDown size={12} className={clsx(
                  "transition-transform",
                  showAlternatives && "rotate-180"
                )} />
                {alternatives.length} alternatif daha
              </button>
            )}
            {todayCompleted.sessions > 0 && (
              <span className="text-[10px] text-emerald-400/50">
                Bugün: {todayCompleted.sessions} oturum · {todayCompleted.totalMinutes}dk
              </span>
            )}
          </div>

          {/* Alternatifler (accordion) */}
          <AnimatePresence>
            {showAlternatives && alternatives.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-2">
                  {alternatives.map((alt) => (
                    <div
                      key={alt.topicId}
                      className="flex items-center justify-between p-3 glass rounded-xl border border-white/5 hover:border-white/10 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-white/70 truncate">
                          {alt.topicName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] text-white/30">
                            {alt.subjectName}
                          </span>
                          <MasteryBadge
                            category={alt.belief.category}
                            categoryLabel={alt.belief.categoryLabel}
                            mean={alt.belief.mean}
                            ci95Lower={alt.belief.ci95Lower}
                            ci95Upper={alt.belief.ci95Upper}
                            evidenceCount={alt.belief.evidenceCount}
                          />
                          <span className="text-[9px] text-white/20 flex items-center gap-0.5">
                            <Clock size={8} />
                            {alt.estimatedDuration}dk
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          onClick={() => handleAddToPlan(alt)}
                          disabled={addingToPlan === alt.topicId}
                          className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all flex items-center gap-1 disabled:opacity-50"
                        >
                          <CalendarPlus size={10} />
                        </button>
                        <button
                          onClick={() => handleStartSession(alt)}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-pink-300 bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 transition-all flex items-center gap-1"
                        >
                          Seç
                          <ArrowRight size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ana Sayfaya Dön */}
          <div className="mt-4 pt-3 border-t border-white/5 flex justify-center">
            <button
              onClick={goHome}
              className="text-[11px] text-white/30 hover:text-white/50 transition-colors flex items-center gap-1.5"
            >
              <Home size={12} />
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </motion.div>

      {/* Study Session Overlay */}
      {selectedTopic && (
        <StudySessionOverlay
          isOpen={sessionOpen}
          onClose={() => {
            setSessionOpen(false);
            setSelectedTopic(null);
          }}
          topicId={selectedTopic.topicId}
          topicName={selectedTopic.topicName}
          subjectName={selectedTopic.subjectName}
          actionType={selectedTopic.actionType}
          actionLabel={selectedTopic.actionLabel}
          onSessionComplete={handleSessionComplete}
        />
      )}
    </>
  );
}
