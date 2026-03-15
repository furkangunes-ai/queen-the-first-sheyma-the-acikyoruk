"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Loader2, Clock, Zap, Play, ChevronRight, TrendingUp, AlertTriangle, HelpCircle, Lightbulb, RefreshCw, CalendarPlus, Home, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import MasteryBadge from './mastery-badge';
import StudySessionOverlay from './study-session-overlay';

// ==================== Types ====================

interface SubjectOption {
  id: string;
  name: string;
  examTypeName: string;
  examTypeId: string;
}

interface GuidedRecommendation {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  examTypeName: string;
  actionType: string;
  actionLabel: string;
  suggestedDuration: number;
  belief: {
    mean: number;
    ci95Lower: number;
    ci95Upper: number;
    category: string;
    categoryLabel: string;
    evidenceCount: number;
  };
  insight: string;
  insightType: string;
  roi: number;
}

interface GuidedResult {
  recommendations: GuidedRecommendation[];
  summary: {
    totalDuration: number;
    estimatedNetGain: string;
    subjectBreakdown: { subjectName: string; minutes: number; topicCount: number }[];
  };
}

type StudyGoal = 'new' | 'improve' | 'review' | 'auto';
type WizardStep = 'mode' | 'exam-type' | 'study-goal' | 'subject-count' | 'subjects' | 'duration' | 'recent-study' | 'loading' | 'result';

interface WizardState {
  mode: 'quick' | 'detailed' | null;
  examType: 'tyt' | 'ayt' | 'both' | null;
  studyGoal: StudyGoal | null;
  subjectCount: number | null;
  selectedSubjects: string[];
  totalDuration: number | null;
  recentStudySubjects: string[];
}

const DURATION_OPTIONS = [
  { value: 30, label: '30dk' },
  { value: 60, label: '1 saat' },
  { value: 90, label: '1.5 saat' },
  { value: 120, label: '2 saat' },
  { value: 180, label: '3 saat' },
  { value: 240, label: '4+ saat' },
];

// ==================== Component ====================

interface GuidedActionWizardProps {
  onBack: () => void;
  onReturnHome?: () => void;
}

export default function GuidedActionWizard({ onBack, onReturnHome }: GuidedActionWizardProps) {
  const [step, setStep] = useState<WizardStep>('mode');
  const [state, setState] = useState<WizardState>({
    mode: null,
    studyGoal: null,
    examType: null,
    subjectCount: null,
    selectedSubjects: [],
    totalDuration: null,
    recentStudySubjects: [],
  });
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [result, setResult] = useState<GuidedResult | null>(null);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [selectedForSession, setSelectedForSession] = useState<GuidedRecommendation | null>(null);
  const [addingToPlan, setAddingToPlan] = useState<string | null>(null);
  const [addedToPlan, setAddedToPlan] = useState<Set<string>>(new Set());

  // Fetch subjects when exam type is selected
  useEffect(() => {
    if (!state.examType) return;
    fetch(`/api/student/subjects?examType=${state.examType}`)
      .then(r => r.json())
      .then(data => setSubjects(data.subjects || []))
      .catch(() => setSubjects([]));
  }, [state.examType]);

  // Step flow
  const getSteps = useCallback((): WizardStep[] => {
    if (state.mode === 'quick') {
      return ['mode', 'exam-type', 'study-goal', 'subjects', 'duration', 'loading', 'result'];
    }
    return ['mode', 'exam-type', 'study-goal', 'subject-count', 'subjects', 'duration', 'recent-study', 'loading', 'result'];
  }, [state.mode]);

  const getCurrentStepIndex = useCallback(() => {
    const steps = getSteps();
    return steps.indexOf(step);
  }, [step, getSteps]);

  const getTotalVisibleSteps = useCallback(() => {
    return getSteps().filter(s => s !== 'loading' && s !== 'result').length;
  }, [getSteps]);

  const goNext = useCallback((nextStep: WizardStep) => {
    setStep(nextStep);
  }, []);

  const goBack = useCallback(() => {
    const steps = getSteps();
    const idx = steps.indexOf(step);
    if (idx <= 0) {
      onBack();
    } else {
      setStep(steps[idx - 1]);
    }
  }, [step, getSteps, onBack]);

  // Fetch recommendations
  const fetchRecommendations = useCallback(async () => {
    setStep('loading');
    try {
      const params = new URLSearchParams();
      if (state.examType) params.set('examType', state.examType);
      params.set('subjects', state.selectedSubjects.join(','));
      if (state.totalDuration) params.set('duration', state.totalDuration.toString());
      if (state.studyGoal) params.set('studyGoal', state.studyGoal);
      if (state.recentStudySubjects.length > 0) {
        params.set('recentSubjects', state.recentStudySubjects.join(','));
      }

      const res = await fetch(`/api/student/guided-recommendation?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data);
      setStep('result');
    } catch {
      setResult(null);
      setStep('result');
    }
  }, [state]);

  const handleStartSession = useCallback((rec: GuidedRecommendation) => {
    setSelectedForSession(rec);
    setSessionOpen(true);
  }, []);

  const handleSessionComplete = useCallback(() => {
    setSessionOpen(false);
    setSelectedForSession(null);
    if (onReturnHome) onReturnHome();
  }, [onReturnHome]);

  const handleAddToPlan = useCallback(async (rec: GuidedRecommendation) => {
    setAddingToPlan(rec.topicId);
    try {
      const res = await fetch('/api/weekly-plans/add-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: rec.subjectId,
          topicId: rec.topicId,
          duration: rec.suggestedDuration,
        }),
      });
      if (!res.ok) throw new Error();
      setAddedToPlan(prev => new Set(prev).add(rec.topicId));
      toast.success(`${rec.topicName} bugünün planına eklendi`);
    } catch {
      toast.error('Plana eklenirken hata oluştu');
    } finally {
      setAddingToPlan(null);
    }
  }, []);

  const handleAddAllToPlan = useCallback(async () => {
    if (!result) return;
    const toAdd = result.recommendations.filter(r => !addedToPlan.has(r.topicId));
    for (const rec of toAdd) {
      await handleAddToPlan(rec);
    }
  }, [result, addedToPlan, handleAddToPlan]);

  // Current visible step number (for progress)
  const visibleStepIndex = getCurrentStepIndex();
  const totalVisible = getTotalVisibleSteps();
  const showProgress = step !== 'loading' && step !== 'result';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-48 h-48 bg-pink-500/8 rounded-full blur-[50px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/5 relative z-10">
          <button
            onClick={step === 'mode' ? onBack : goBack}
            className="text-white/30 hover:text-white/60 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">
              Çalışma Planı
            </span>
          </div>
          {showProgress && state.mode && (
            <div className="flex items-center gap-1">
              {Array.from({ length: totalVisible }).map((_, i) => (
                <div
                  key={i}
                  className={clsx(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    i < visibleStepIndex ? "bg-pink-400" :
                    i === visibleStepIndex ? "bg-pink-400 scale-125" :
                    "bg-white/10"
                  )}
                />
              ))}
              <span className="text-[9px] text-white/20 ml-1.5">
                {Math.min(visibleStepIndex + 1, totalVisible)}/{totalVisible}
              </span>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="p-5 relative z-10">
          <AnimatePresence mode="wait">
            {/* Step: Mode Selection */}
            {step === 'mode' && (
              <StepContainer key="mode">
                <StepQuestion>Nasıl belirleyelim?</StepQuestion>
                <div className="space-y-2.5">
                  <OptionCard
                    selected={false}
                    onClick={() => {
                      setState(s => ({ ...s, mode: 'quick' }));
                      goNext('exam-type');
                    }}
                    icon={<Zap size={16} className="text-amber-400" />}
                    label="Hızlı Belirle"
                    description="4 soru — 30 saniyede hazır"
                  />
                  <OptionCard
                    selected={false}
                    onClick={() => {
                      setState(s => ({ ...s, mode: 'detailed' }));
                      goNext('exam-type');
                    }}
                    icon={<TrendingUp size={16} className="text-cyan-400" />}
                    label="Detaylı Belirle"
                    description="6 soru — kişiselleştirilmiş plan"
                  />
                </div>
              </StepContainer>
            )}

            {/* Step: Exam Type */}
            {step === 'exam-type' && (
              <StepContainer key="exam-type">
                <StepQuestion>Hangi sınav türü?</StepQuestion>
                <div className="grid grid-cols-3 gap-2">
                  {(['tyt', 'ayt', 'both'] as const).map(type => (
                    <ChipButton
                      key={type}
                      selected={state.examType === type}
                      onClick={() => {
                        setState(s => ({ ...s, examType: type, selectedSubjects: [] }));
                        goNext('study-goal');
                      }}
                      label={type === 'tyt' ? 'TYT' : type === 'ayt' ? 'AYT' : 'İkisi de'}
                    />
                  ))}
                </div>
              </StepContainer>
            )}

            {/* Step: Study Goal */}
            {step === 'study-goal' && (
              <StepContainer key="study-goal">
                <StepQuestion>Bugün ne tür çalışma yapmak istiyorsun?</StepQuestion>
                <div className="space-y-2.5">
                  <OptionCard
                    selected={false}
                    onClick={() => {
                      setState(s => ({ ...s, studyGoal: 'new' as StudyGoal }));
                      goNext(state.mode === 'detailed' ? 'subject-count' : 'subjects');
                    }}
                    icon={<Lightbulb size={16} className="text-amber-400" />}
                    label="Yeni Konu Öğren"
                    description="Bilmediğin konulara odaklan"
                  />
                  <OptionCard
                    selected={false}
                    onClick={() => {
                      setState(s => ({ ...s, studyGoal: 'improve' as StudyGoal }));
                      goNext(state.mode === 'detailed' ? 'subject-count' : 'subjects');
                    }}
                    icon={<TrendingUp size={16} className="text-emerald-400" />}
                    label="Bildiğini Geliştir"
                    description="Orta seviye konuları güçlendir"
                  />
                  <OptionCard
                    selected={false}
                    onClick={() => {
                      setState(s => ({ ...s, studyGoal: 'review' as StudyGoal }));
                      goNext(state.mode === 'detailed' ? 'subject-count' : 'subjects');
                    }}
                    icon={<RefreshCw size={16} className="text-cyan-400" />}
                    label="Konu Tekrarı"
                    description="Unuttuklarını hatırla"
                  />
                  <OptionCard
                    selected={false}
                    onClick={() => {
                      setState(s => ({ ...s, studyGoal: 'auto' as StudyGoal }));
                      goNext(state.mode === 'detailed' ? 'subject-count' : 'subjects');
                    }}
                    icon={<Zap size={16} className="text-pink-400" />}
                    label="Sistem Karar Versin"
                    description="En verimli ne ise onu öner"
                  />
                </div>
              </StepContainer>
            )}

            {/* Step: Subject Count (detailed only) */}
            {step === 'subject-count' && (
              <StepContainer key="subject-count">
                <StepQuestion>Bugün kaç derse çalışmak istiyorsun?</StepQuestion>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(n => (
                    <ChipButton
                      key={n}
                      selected={state.subjectCount === n}
                      onClick={() => {
                        setState(s => ({ ...s, subjectCount: n }));
                        goNext('subjects');
                      }}
                      label={n === 4 ? '4+' : `${n}`}
                    />
                  ))}
                </div>
              </StepContainer>
            )}

            {/* Step: Subject Selection */}
            {step === 'subjects' && (
              <StepContainer key="subjects">
                <StepQuestion>
                  Hangi ders{state.subjectCount && state.subjectCount > 1 ? 'lere' : 'e'} çalışmak istiyorsun?
                </StepQuestion>
                {state.subjectCount && (
                  <p className="text-[10px] text-white/25 -mt-2 mb-3">
                    {state.selectedSubjects.length}/{state.subjectCount === 4 ? '4+' : state.subjectCount} seçildi
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  {subjects.map(sub => {
                    const isSelected = state.selectedSubjects.includes(sub.id);
                    const maxReached = state.subjectCount
                      ? state.selectedSubjects.length >= (state.subjectCount === 4 ? 99 : state.subjectCount)
                      : false;
                    return (
                      <ChipButton
                        key={sub.id}
                        selected={isSelected}
                        disabled={!isSelected && maxReached}
                        onClick={() => {
                          setState(s => {
                            const subs = isSelected
                              ? s.selectedSubjects.filter(id => id !== sub.id)
                              : [...s.selectedSubjects, sub.id];
                            return { ...s, selectedSubjects: subs };
                          });
                        }}
                        label={sub.name}
                        sublabel={sub.examTypeName}
                      />
                    );
                  })}
                  {subjects.length === 0 && (
                    <div className="w-full text-center py-4">
                      <Loader2 className="animate-spin text-white/20 mx-auto" size={20} />
                    </div>
                  )}
                </div>
                {state.selectedSubjects.length > 0 && (
                  <button
                    onClick={() => goNext('duration')}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500/60 to-amber-500/60 text-white text-sm font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    Devam
                    <ChevronRight size={16} />
                  </button>
                )}
              </StepContainer>
            )}

            {/* Step: Duration */}
            {step === 'duration' && (
              <StepContainer key="duration">
                <StepQuestion>Toplam ne kadar çalışacaksın?</StepQuestion>
                <div className="grid grid-cols-3 gap-2">
                  {DURATION_OPTIONS.map(opt => (
                    <ChipButton
                      key={opt.value}
                      selected={state.totalDuration === opt.value}
                      onClick={() => {
                        setState(s => ({ ...s, totalDuration: opt.value }));
                        if (state.mode === 'detailed') {
                          goNext('recent-study');
                        }
                      }}
                      label={opt.label}
                    />
                  ))}
                </div>
                {state.totalDuration && state.mode === 'quick' && (
                  <button
                    onClick={fetchRecommendations}
                    className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500/60 to-amber-500/60 text-white text-sm font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    Önerileri Göster
                    <ChevronRight size={16} />
                  </button>
                )}
              </StepContainer>
            )}

            {/* Step: Recent Study (detailed only) */}
            {step === 'recent-study' && (
              <StepContainer key="recent-study">
                <StepQuestion>Son birkaç günde hangi derslere çalıştın?</StepQuestion>
                <p className="text-[10px] text-white/25 -mt-2 mb-3">
                  Opsiyonel — tekrardan kaçınmak için
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {subjects.map(sub => {
                    const isSelected = state.recentStudySubjects.includes(sub.id);
                    return (
                      <ChipButton
                        key={sub.id}
                        selected={isSelected}
                        onClick={() => {
                          setState(s => {
                            const subs = isSelected
                              ? s.recentStudySubjects.filter(id => id !== sub.id)
                              : [...s.recentStudySubjects, sub.id];
                            return { ...s, recentStudySubjects: subs };
                          });
                        }}
                        label={sub.name}
                        sublabel={sub.examTypeName}
                      />
                    );
                  })}
                </div>
                <button
                  onClick={fetchRecommendations}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500/60 to-amber-500/60 text-white text-sm font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  Önerileri Göster
                  <ChevronRight size={16} />
                </button>
              </StepContainer>
            )}

            {/* Loading */}
            {step === 'loading' && (
              <StepContainer key="loading">
                <div className="text-center py-8">
                  <Loader2 className="animate-spin text-pink-400 mx-auto mb-3" size={28} />
                  <p className="text-sm text-white/50 font-medium">Deneme verilerin analiz ediliyor...</p>
                </div>
              </StepContainer>
            )}

            {/* Result */}
            {step === 'result' && (
              <StepContainer key="result">
                {!result || result.recommendations.length === 0 ? (
                  <div className="text-center py-6">
                    <HelpCircle size={28} className="text-white/20 mx-auto mb-2" />
                    <p className="text-sm text-white/40 font-medium">
                      Seçtiğin dersler için yeterli veri bulunamadı.
                    </p>
                    <p className="text-[10px] text-white/25 mt-1">
                      Deneme girişi yap veya bilgi seviyeni belirle.
                    </p>
                    <button
                      onClick={onBack}
                      className="mt-3 text-xs text-pink-300/60 hover:text-pink-300 transition-colors"
                    >
                      Geri dön
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Summary */}
                    {result.summary && (
                      <div className="mb-4 p-3 glass rounded-xl border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                            Çalışma Planın
                          </span>
                          <span className="text-[10px] text-white/40 flex items-center gap-1">
                            <Clock size={10} />
                            {result.summary.totalDuration}dk toplam
                          </span>
                        </div>
                        {result.summary.subjectBreakdown.map(sb => (
                          <div key={sb.subjectName} className="flex items-center justify-between py-1">
                            <span className="text-[11px] text-white/60 font-medium">{sb.subjectName}</span>
                            <span className="text-[10px] text-white/30">
                              {sb.topicCount} konu · {sb.minutes}dk
                            </span>
                          </div>
                        ))}
                        {result.summary.estimatedNetGain && (
                          <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1.5">
                            <TrendingUp size={12} className="text-emerald-400" />
                            <span className="text-[11px] text-emerald-400/80 font-bold">
                              {result.summary.estimatedNetGain}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hepsini Plana Ekle */}
                    {result.recommendations.some(r => !addedToPlan.has(r.topicId)) && (
                      <button
                        onClick={handleAddAllToPlan}
                        disabled={addingToPlan !== null}
                        className="w-full mb-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-bold hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <CalendarPlus size={16} />
                        Hepsini Bugünün Planına Ekle
                      </button>
                    )}

                    {/* Recommendations */}
                    <div className="space-y-2.5">
                      {result.recommendations.map((rec, idx) => {
                        const isAdded = addedToPlan.has(rec.topicId);
                        return (
                          <motion.div
                            key={rec.topicId}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className="p-3.5 glass rounded-xl border border-white/5 hover:border-pink-500/20 transition-all"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-white truncate">
                                  {rec.topicName}
                                </p>
                                <p className="text-[10px] text-white/40 mt-0.5">
                                  {rec.subjectName} · {rec.examTypeName} · {rec.actionLabel}
                                </p>
                              </div>
                              <MasteryBadge
                                category={rec.belief.category as any}
                                categoryLabel={rec.belief.categoryLabel}
                                mean={rec.belief.mean}
                                ci95Lower={rec.belief.ci95Lower}
                                ci95Upper={rec.belief.ci95Upper}
                                evidenceCount={rec.belief.evidenceCount}
                              />
                            </div>

                            {/* Insight */}
                            <div className="flex items-start gap-2 mb-3 p-2 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                              <InsightIcon type={rec.insightType} />
                              <p className="text-[11px] text-white/50 leading-relaxed flex-1">
                                {rec.insight}
                              </p>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAddToPlan(rec)}
                                disabled={addingToPlan === rec.topicId || isAdded}
                                className={clsx(
                                  "flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50",
                                  isAdded
                                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                                    : "bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20"
                                )}
                              >
                                {isAdded ? (
                                  <>
                                    <Check size={12} />
                                    Eklendi
                                  </>
                                ) : (
                                  <>
                                    <CalendarPlus size={12} />
                                    Plana Ekle
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleStartSession(rec)}
                                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-pink-500/60 to-amber-500/60 text-white text-xs font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                              >
                                <Play size={12} />
                                Hemen Başla
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Ana Sayfaya Dön */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex justify-center">
                      <button
                        onClick={onReturnHome || onBack}
                        className="text-[11px] text-white/30 hover:text-white/50 transition-colors flex items-center gap-1.5"
                      >
                        <Home size={12} />
                        Ana Sayfaya Dön
                      </button>
                    </div>
                  </>
                )}
              </StepContainer>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Study Session Overlay */}
      {selectedForSession && (
        <StudySessionOverlay
          isOpen={sessionOpen}
          onClose={() => {
            setSessionOpen(false);
            setSelectedForSession(null);
          }}
          topicId={selectedForSession.topicId}
          topicName={selectedForSession.topicName}
          subjectName={selectedForSession.subjectName}
          actionType={selectedForSession.actionType as any}
          actionLabel={selectedForSession.actionLabel}
          onSessionComplete={handleSessionComplete}
        />
      )}
    </>
  );
}

// ==================== Sub-Components ====================

function StepContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function StepQuestion({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[15px] font-bold text-white mb-4">
      {children}
    </h3>
  );
}

function OptionCard({
  selected,
  onClick,
  icon,
  label,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
        selected
          ? "bg-pink-500/10 border-pink-500/30"
          : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
      )}
    >
      <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="text-[10px] text-white/35 mt-0.5">{description}</p>
      </div>
    </button>
  );
}

function ChipButton({
  selected,
  disabled,
  onClick,
  label,
  sublabel,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  sublabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "px-3.5 py-2 rounded-xl text-xs font-bold border transition-all",
        selected
          ? "bg-pink-500/15 text-pink-300 border-pink-500/30"
          : disabled
          ? "bg-white/[0.01] text-white/15 border-white/5 cursor-not-allowed"
          : "bg-white/[0.03] text-white/60 border-white/5 hover:bg-white/[0.06] hover:text-white/80 hover:border-white/10"
      )}
    >
      {label}
      {sublabel && (
        <span className={clsx(
          "ml-1 text-[9px]",
          selected ? "text-pink-400/50" : "text-white/20"
        )}>
          {sublabel}
        </span>
      )}
    </button>
  );
}

function InsightIcon({ type }: { type: string }) {
  switch (type) {
    case 'most_errors':
      return <AlertTriangle size={12} className="text-red-400/60 flex-shrink-0 mt-0.5" />;
    case 'most_blanks':
      return <HelpCircle size={12} className="text-amber-400/60 flex-shrink-0 mt-0.5" />;
    case 'best_net_gain':
      return <TrendingUp size={12} className="text-emerald-400/60 flex-shrink-0 mt-0.5" />;
    case 'retention_drop':
      return <Clock size={12} className="text-orange-400/60 flex-shrink-0 mt-0.5" />;
    default:
      return <Zap size={12} className="text-cyan-400/60 flex-shrink-0 mt-0.5" />;
  }
}
