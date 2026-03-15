"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Play, ChevronDown, Clock, Zap, BookOpen, RotateCcw, Compass, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';
import type { NextAction, TopicROI, ActionType } from '@/lib/roi-engine';
import MasteryBadge from './mastery-badge';
import StudySessionOverlay from './study-session-overlay';

const ACTION_ICONS: Record<ActionType, React.ReactNode> = {
  focused_practice: <Zap size={14} />,
  concept_study: <BookOpen size={14} />,
  spaced_review: <RotateCcw size={14} />,
  explore: <Compass size={14} />,
};

/**
 * Sıradaki Hamle Widget'ı — Dashboard'un en üst aksiyonu.
 *
 * Aksiyom 3: Minimum Direnç Yolu.
 * Newton'un Eylemsizlik Prensibi: Duran cisim durmaya devam eder.
 * Her ekstra tıklama = vazgeçme olasılığı.
 *
 * Tek buton → timer başlar → oturum bitince belief güncellenir.
 */
export default function NextActionWidget() {
  const router = useRouter();
  const [data, setData] = useState<NextAction | null>(null);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicROI | null>(null);

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

  useEffect(() => {
    fetchNextAction();
  }, [fetchNextAction]);

  const handleStartSession = useCallback((topic: TopicROI, duration: number) => {
    setSelectedTopic(topic);
    setSessionOpen(true);
  }, []);

  const handleSessionComplete = useCallback(() => {
    setSessionOpen(false);
    setSelectedTopic(null);
    // Yeni next action fetch (cache invalidate)
    fetchNextAction();
  }, [fetchNextAction]);

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
        <div className="p-5 text-center relative z-10">
          <p className="text-sm text-white/50 font-medium mb-3">
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

  const { primary, alternatives, sessionDuration, dailyBudgetRemaining, todayCompleted } = data;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03 }}
        className="glass-panel relative overflow-hidden"
      >
        {/* Gradient accent (reason'a göre renk) */}
        <div className={clsx(
          "absolute top-0 left-0 w-48 h-48 rounded-full blur-[50px] pointer-events-none",
          primary.reason === 'retention_critical' ? 'bg-red-500/8' :
          primary.reason === 'dag_bottleneck' ? 'bg-orange-500/8' :
          primary.reason === 'quick_win' ? 'bg-emerald-500/8' :
          'bg-pink-500/8'
        )} />

        <div className="p-5 relative z-10">
          {/* Header: Konu + Badge */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">
                  Sıradaki Hamlen
                </span>
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

          {/* CTA Button — Hemen Başla */}
          <button
            onClick={() => handleStartSession(primary, sessionDuration)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500/80 to-amber-500/80 text-white text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Play size={16} />
            Hemen Başla
            <span className="text-white/60 text-xs">({sessionDuration}dk)</span>
          </button>

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
                      <button
                        onClick={() => handleStartSession(alt, alt.estimatedDuration)}
                        className="ml-2 px-3 py-1.5 rounded-lg text-[10px] font-bold text-pink-300 bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 transition-all flex items-center gap-1"
                      >
                        Seç
                        <ArrowRight size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
          sessionDuration={sessionDuration}
          onSessionComplete={handleSessionComplete}
        />
      )}
    </>
  );
}
