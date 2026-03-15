"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Target,
  Brain,
  Clock,
  ChevronDown,
  Loader2,
  BarChart3,
  GitBranch,
  Timer,
  User,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';

// ==================== Types ====================

interface TrendData {
  topicId: string;
  topicName: string;
  subjectName: string;
  direction: 'improving' | 'worsening' | 'stable';
  slope: number;
  examCount: number;
  lastErrorCount: number;
  firstErrorCount: number;
  message: string;
}

interface RootCause {
  rootNodeId: string;
  rootNodeName: string;
  rootTopicId: string | null;
  rootTopicName: string | null;
  rootMastery: number;
  affectedChildCount: number;
  affectedChildren: string[];
  estimatedImpact: number;
  message: string;
}

interface StaleBelief {
  topicId: string;
  topicName: string;
  originalMean: number;
  decayedMean: number;
  daysSinceUpdate: number;
  decayFactor: number;
}

interface ErrorProfile {
  profile: string;
  profileLabel: string;
  profileDescription: string;
  distribution: Record<string, { count: number; percentage: number }>;
  totalErrors: number;
  dominantErrorType: string | null;
  dominantPercentage: number;
  recommendation: string;
}

interface SubjectPrediction {
  subjectId: string;
  subjectName: string;
  questionCount: number;
  predictedCorrect: number;
  predictedWrong: number;
  predictedNet: number;
  avgEvidence: number;
}

interface NetPrediction {
  examTypeName: string;
  predictedNet: number;
  lowerBound: number;
  upperBound: number;
  subjectBreakdown: SubjectPrediction[];
  message: string;
}

interface AnalyticsData {
  trends: TrendData[];
  rootCauses: RootCause[];
  staleBeliefs: StaleBelief[];
  errorProfile: ErrorProfile;
  netPredictions: NetPrediction[];
}

// ==================== Error Type Labels ====================

const ERROR_TYPE_LABELS: Record<string, string> = {
  KAVRAM_YANILGISI: 'Kavram Yanılgısı',
  BILGI_EKSIKLIGI: 'Bilgi Eksikliği',
  DIKKATSIZLIK: 'Dikkatsizlik',
  ISLEM_HATASI: 'İşlem Hatası',
  SURE_YETISMEDI: 'Süre Yetişmedi',
  SORU_KOKUNU_YANLIS_OKUMA: 'Soru Kökü Yanlış',
  SINIFLANDIRILMAMIS: 'Sınıflandırılmamış',
};

const ERROR_TYPE_COLORS: Record<string, string> = {
  KAVRAM_YANILGISI: 'bg-red-500',
  BILGI_EKSIKLIGI: 'bg-orange-500',
  DIKKATSIZLIK: 'bg-amber-500',
  ISLEM_HATASI: 'bg-yellow-500',
  SURE_YETISMEDI: 'bg-blue-500',
  SORU_KOKUNU_YANLIS_OKUMA: 'bg-purple-500',
  SINIFLANDIRILMAMIS: 'bg-slate-500',
};

// ==================== Main Component ====================

export default function StudentAnalyticsPanel() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['predictions', 'profile'])
  );

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch('/api/student/analytics');
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-panel p-6 flex items-center justify-center"
      >
        <Loader2 className="animate-spin text-pink-500" size={24} />
        <span className="ml-2 text-sm text-white/40">Analiz yükleniyor...</span>
      </motion.div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-panel p-5 text-center">
        <p className="text-sm text-white/40">Analitik veriler yüklenemedi.</p>
        <button
          onClick={fetchAnalytics}
          className="mt-2 text-xs text-pink-400 hover:text-pink-300"
        >
          Tekrar dene
        </button>
      </div>
    );
  }

  const hasData = data.netPredictions.length > 0 || data.errorProfile.totalErrors >= 5 ||
    data.trends.length > 0 || data.rootCauses.length > 0 || data.staleBeliefs.length > 0;

  if (!hasData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-5 text-center"
      >
        <BarChart3 size={32} className="text-white/10 mx-auto mb-2" />
        <p className="text-sm text-white/40">
          Henüz yeterli veri yok. Deneme girdikçe analizler burada görünecek.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="space-y-3"
    >
      {/* Net Tahmin */}
      {data.netPredictions.length > 0 && (
        <SectionCard
          id="predictions"
          icon={<Target size={18} className="text-emerald-400" />}
          title="Tahmini Sınav Netin"
          accentColor="emerald"
          expanded={expandedSections.has('predictions')}
          onToggle={() => toggleSection('predictions')}
        >
          <NetPredictionCard predictions={data.netPredictions} />
        </SectionCard>
      )}

      {/* Öğrenci Profili */}
      {data.errorProfile.totalErrors >= 5 && (
        <SectionCard
          id="profile"
          icon={<User size={18} className="text-violet-400" />}
          title={`Hata Profilin: ${data.errorProfile.profileLabel}`}
          accentColor="violet"
          expanded={expandedSections.has('profile')}
          onToggle={() => toggleSection('profile')}
        >
          <ErrorProfileCard profile={data.errorProfile} />
        </SectionCard>
      )}

      {/* Trendler */}
      {data.trends.length > 0 && (
        <SectionCard
          id="trends"
          icon={<TrendingUp size={18} className="text-cyan-400" />}
          title="Konu Trendleri"
          accentColor="cyan"
          expanded={expandedSections.has('trends')}
          onToggle={() => toggleSection('trends')}
        >
          <TrendsList trends={data.trends} />
        </SectionCard>
      )}

      {/* Kök Nedenler */}
      {data.rootCauses.length > 0 && (
        <SectionCard
          id="rootCauses"
          icon={<GitBranch size={18} className="text-orange-400" />}
          title="Kök Neden Analizi"
          accentColor="orange"
          expanded={expandedSections.has('rootCauses')}
          onToggle={() => toggleSection('rootCauses')}
        >
          <RootCausesList causes={data.rootCauses} />
        </SectionCard>
      )}

      {/* Bayat Konular */}
      {data.staleBeliefs.length > 0 && (
        <SectionCard
          id="stale"
          icon={<Timer size={18} className="text-amber-400" />}
          title="Uzun Süredir Çalışılmayan Konular"
          accentColor="amber"
          expanded={expandedSections.has('stale')}
          onToggle={() => toggleSection('stale')}
        >
          <StaleBeliefsList beliefs={data.staleBeliefs} />
        </SectionCard>
      )}
    </motion.div>
  );
}

// ==================== Section Card ====================

function SectionCard({
  id,
  icon,
  title,
  accentColor,
  expanded,
  onToggle,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  accentColor: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      layout
      className="glass-panel relative overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-32 h-32 bg-${accentColor}-500/5 rounded-full blur-[40px] pointer-events-none`} />

      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between relative z-10"
      >
        <div className="flex items-center gap-2.5">
          {icon}
          <h3 className="text-sm font-bold text-white">{title}</h3>
        </div>
        <ChevronDown
          size={14}
          className={clsx(
            "text-white/30 transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 relative z-10">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ==================== Net Prediction Card ====================

function NetPredictionCard({ predictions }: { predictions: NetPrediction[] }) {
  const [expandedExam, setExpandedExam] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {predictions.map((pred) => (
        <div key={pred.examTypeName}>
          {/* Ana tahmin */}
          <button
            onClick={() => setExpandedExam(expandedExam === pred.examTypeName ? null : pred.examTypeName)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={clsx(
                "text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-widest font-bold",
                pred.examTypeName === 'TYT'
                  ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                  : "bg-purple-500/10 text-purple-300 border-purple-500/20"
              )}>
                {pred.examTypeName}
              </div>
              <div className="text-left">
                <span className="text-lg font-black text-white">
                  {pred.predictedNet}
                </span>
                <span className="text-xs text-white/30 ml-1.5">
                  net
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/25">
                {pred.lowerBound} — {pred.upperBound}
              </span>
              <ChevronDown
                size={12}
                className={clsx(
                  "text-white/20 transition-transform",
                  expandedExam === pred.examTypeName && "rotate-180"
                )}
              />
            </div>
          </button>

          {/* Ders kırılım */}
          <AnimatePresence>
            {expandedExam === pred.examTypeName && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-1.5 pl-2">
                  {pred.subjectBreakdown.map((sub) => (
                    <div
                      key={sub.subjectId}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]"
                    >
                      <span className="text-[11px] text-white/60">{sub.subjectName}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-emerald-400/60">
                          {sub.predictedCorrect}D
                        </span>
                        <span className="text-[10px] text-red-400/60">
                          {sub.predictedWrong}Y
                        </span>
                        <span className="text-[11px] font-bold text-white/80">
                          {sub.predictedNet} net
                        </span>
                        {sub.avgEvidence < 3 && (
                          <span className="text-[8px] text-amber-400/50" title="Düşük veri">
                            ?
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-white/25 mt-2 italic">{pred.message}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ==================== Error Profile Card ====================

function ErrorProfileCard({ profile }: { profile: ErrorProfile }) {
  return (
    <div className="space-y-3">
      {/* Açıklama */}
      <p className="text-[11px] text-white/50 leading-relaxed">
        {profile.profileDescription}
      </p>

      {/* Dağılım grafiği */}
      {Object.keys(profile.distribution).length > 0 && (
        <div className="space-y-1.5">
          {Object.entries(profile.distribution)
            .sort(([, a], [, b]) => b.percentage - a.percentage)
            .map(([type, data]) => (
              <div key={type} className="flex items-center gap-2">
                <span className="text-[10px] text-white/40 w-28 truncate text-right">
                  {ERROR_TYPE_LABELS[type] ?? type}
                </span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      "h-full rounded-full transition-all",
                      ERROR_TYPE_COLORS[type] ?? 'bg-slate-500'
                    )}
                    style={{ width: `${data.percentage}%`, opacity: 0.7 }}
                  />
                </div>
                <span className="text-[10px] text-white/30 w-10 text-right">
                  %{data.percentage}
                </span>
              </div>
            ))}
        </div>
      )}

      {/* Öneri */}
      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-violet-500/5 border border-violet-500/10">
        <Zap size={12} className="text-violet-400 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-violet-300/70 leading-relaxed">
          {profile.recommendation}
        </p>
      </div>
    </div>
  );
}

// ==================== Trends List ====================

function TrendsList({ trends }: { trends: TrendData[] }) {
  const improving = trends.filter(t => t.direction === 'improving');
  const worsening = trends.filter(t => t.direction === 'worsening');

  return (
    <div className="space-y-2">
      {worsening.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[9px] text-red-400/60 uppercase tracking-widest font-bold">
            Kötüleşen
          </span>
          {worsening.slice(0, 5).map((t) => (
            <TrendItem key={t.topicId} trend={t} />
          ))}
        </div>
      )}
      {improving.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[9px] text-emerald-400/60 uppercase tracking-widest font-bold">
            İyileşen
          </span>
          {improving.slice(0, 5).map((t) => (
            <TrendItem key={t.topicId} trend={t} />
          ))}
        </div>
      )}
      {worsening.length === 0 && improving.length === 0 && (
        <p className="text-[11px] text-white/30 text-center py-2">
          Tüm konular stabil görünüyor.
        </p>
      )}
    </div>
  );
}

function TrendItem({ trend }: { trend: TrendData }) {
  const Icon = trend.direction === 'improving' ? TrendingDown
    : trend.direction === 'worsening' ? TrendingUp
    : Minus;

  const color = trend.direction === 'improving' ? 'text-emerald-400'
    : trend.direction === 'worsening' ? 'text-red-400'
    : 'text-white/30';

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
      <Icon size={14} className={color} />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-white/70 truncate">
          {trend.topicName}
          <span className="text-white/30 ml-1">· {trend.subjectName}</span>
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-white/25">
          {trend.firstErrorCount}→{trend.lastErrorCount}
        </span>
        <span className="text-[9px] text-white/20">
          {trend.examCount} deneme
        </span>
      </div>
    </div>
  );
}

// ==================== Root Causes List ====================

function RootCausesList({ causes }: { causes: RootCause[] }) {
  return (
    <div className="space-y-2">
      {causes.slice(0, 5).map((cause) => (
        <div
          key={cause.rootNodeId}
          className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={12} className="text-orange-400" />
              <span className="text-[11px] font-bold text-white/80">
                {cause.rootNodeName}
              </span>
            </div>
            <span className="text-[9px] text-orange-400/60">
              {Math.round(cause.rootMastery * 100)}% hakimiyet
            </span>
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed">
            {cause.affectedChildCount} bağlı konuyu etkiliyor:
            {' '}
            <span className="text-white/50">
              {cause.affectedChildren.slice(0, 3).join(', ')}
              {cause.affectedChildren.length > 3 && ` +${cause.affectedChildren.length - 3}`}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}

// ==================== Stale Beliefs List ====================

function StaleBeliefsList({ beliefs }: { beliefs: StaleBelief[] }) {
  return (
    <div className="space-y-1.5">
      {beliefs.slice(0, 5).map((b) => (
        <div
          key={b.topicId}
          className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]"
        >
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-amber-400/50" />
            <span className="text-[11px] text-white/60">{b.topicName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/25">
              {b.daysSinceUpdate} gün önce
            </span>
            <span className="text-[10px] text-amber-400/50">
              {Math.round(b.originalMean * 100)}% → {Math.round(b.decayedMean * 100)}%
            </span>
          </div>
        </div>
      ))}
      <p className="text-[9px] text-white/20 mt-1 italic">
        Uzun süredir çalışılmayan konularda bilgi güveni zamanla düşer.
      </p>
    </div>
  );
}
