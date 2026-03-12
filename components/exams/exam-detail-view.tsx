"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Paper, Handwriting } from '@/components/skeuomorphic';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, BarChart3, Trash2, Pencil, Check, X, Loader2, Target, Brain, ChevronDown, Sparkles, Bot, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import {
  ERROR_REASON_LABELS,
  VOID_STATUS_LABELS,
  VOID_STATUS_COLORS,
  type ErrorReasonType,
} from '@/lib/severity';

// ---------- Types ----------

interface SubjectResult {
  subjectId: string;
  subject: { name: string };
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
  netScore: number;
}

interface CognitiveVoid {
  id: string;
  subjectId: string;
  subject: { name: string };
  topicId: string | null;
  topic: { name: string } | null;
  source: 'WRONG' | 'EMPTY';
  errorReason: ErrorReasonType;
  magnitude: number;
  status: 'UNRESOLVED' | 'REVIEW' | 'RESOLVED';
  severity: number;
  notes: string | null;
}

interface ExamType {
  id: string;
  name: string;
}

interface ExamDetail {
  id: string;
  title: string;
  date: string;
  examTypeId: string;
  examType: { id: string; name: string };
  examCategory?: string | null;
  subjectResults: SubjectResult[];
  cognitiveVoids: CognitiveVoid[];
  coldPhaseCompleted: boolean;
  timeOfDay?: string | null;
  environment?: string | null;
  perceivedDifficulty?: number | null;
  biologicalState?: string | null;
}

interface ExamDetailViewProps {
  examId: string;
  onBack: () => void;
  onDeleted?: () => void;
}

// ---------- Constants ----------

const CHART_COLORS = ['#f472b6', '#fbbf24', '#34d399', '#fb7185', '#a78bfa', '#ec4899', '#2dd4bf', '#f97316'];

const TABS = [
  { key: 'summary', label: 'Özet', icon: BookOpen },
  { key: 'voids', label: 'Zafiyetler', icon: Brain },
  { key: 'analysis', label: 'Analiz', icon: BarChart3 },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const STATUS_CYCLE: Record<string, 'UNRESOLVED' | 'REVIEW' | 'RESOLVED'> = {
  UNRESOLVED: 'REVIEW',
  REVIEW: 'RESOLVED',
  RESOLVED: 'UNRESOLVED',
};

const STATUS_ICONS = {
  UNRESOLVED: AlertTriangle,
  REVIEW: RefreshCw,
  RESOLVED: CheckCircle,
};

// ---------- Helpers ----------

function formatDateTR(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ---------- Skeleton ----------

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-white/10 rounded" />
        <div className="h-8 w-64 bg-white/10 rounded" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-white/10 rounded-lg" />
        ))}
      </div>
      <div className="h-64 bg-white/10 rounded-lg" />
    </div>
  );
}

// ---------- Tab: Summary ----------

function SummaryTab({ exam }: { exam: ExamDetail }) {
  const totals = useMemo(() => {
    return exam.subjectResults.reduce(
      (acc, sr) => ({
        correct: acc.correct + sr.correctCount,
        wrong: acc.wrong + sr.wrongCount,
        empty: acc.empty + sr.emptyCount,
        net: acc.net + sr.netScore,
      }),
      { correct: 0, wrong: 0, empty: 0, net: 0 }
    );
  }, [exam.subjectResults]);

  const radarData = useMemo(() => {
    return exam.subjectResults.map((sr) => ({
      subject: sr.subject.name,
      net: sr.netScore,
    }));
  }, [exam.subjectResults]);

  const voidStats = useMemo(() => {
    const unresolved = exam.cognitiveVoids.filter(v => v.status === 'UNRESOLVED').length;
    const review = exam.cognitiveVoids.filter(v => v.status === 'REVIEW').length;
    const resolved = exam.cognitiveVoids.filter(v => v.status === 'RESOLVED').length;
    return { unresolved, review, resolved, total: exam.cognitiveVoids.length };
  }, [exam.cognitiveVoids]);

  // Context tags
  const contextTags = [
    exam.timeOfDay && `🕐 ${exam.timeOfDay === 'sabah' ? 'Sabah' : exam.timeOfDay === 'ogle' ? 'Öğle' : 'Akşam'}`,
    exam.environment && `🏠 ${exam.environment === 'sessiz' ? 'Sessiz' : 'Gürültülü'}`,
    exam.perceivedDifficulty && `⭐ Zorluk: ${exam.perceivedDifficulty}/5`,
    exam.biologicalState && `💪 ${exam.biologicalState === 'dinc' ? 'Dinç' : exam.biologicalState === 'normal' ? 'Normal' : 'Yorgun'}`,
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Handwriting as="h2" className="text-2xl sm:text-3xl flex-1">
          {exam.title}
        </Handwriting>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-white/50">{formatDateTR(exam.date)}</span>
          <span className="inline-flex items-center rounded-full bg-pink-500/10 text-pink-400 px-3 py-0.5 text-xs font-medium border border-pink-500/20">
            {exam.examType.name}
          </span>
          {!exam.coldPhaseCompleted && (
            <span className="inline-flex items-center rounded-full bg-amber-500/10 text-amber-400 px-3 py-0.5 text-xs font-medium border border-amber-500/20">
              Analiz Bekliyor
            </span>
          )}
        </div>
      </div>

      {/* Context Tags */}
      {contextTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {contextTags.map((tag, i) => (
            <span key={i} className="text-[12px] bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-lg text-white/60">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Total Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Doğru', value: totals.correct, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: 'Yanlış', value: totals.wrong, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
          { label: 'Boş', value: totals.empty, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
          { label: 'Net', value: totals.net.toFixed(2), color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bg} ${stat.border} border rounded-xl p-4 text-center`}
          >
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Void Status Summary */}
      {voidStats.total > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className={`${VOID_STATUS_COLORS.UNRESOLVED.bg} ${VOID_STATUS_COLORS.UNRESOLVED.border} border rounded-lg p-3 text-center`}>
            <AlertTriangle className={`w-5 h-5 ${VOID_STATUS_COLORS.UNRESOLVED.text} mx-auto mb-1`} />
            <p className={`text-lg font-bold ${VOID_STATUS_COLORS.UNRESOLVED.text}`}>{voidStats.unresolved}</p>
            <p className="text-[10px] text-white/40 uppercase font-medium">Çözülmemiş</p>
          </div>
          <div className={`${VOID_STATUS_COLORS.REVIEW.bg} ${VOID_STATUS_COLORS.REVIEW.border} border rounded-lg p-3 text-center`}>
            <RefreshCw className={`w-5 h-5 ${VOID_STATUS_COLORS.REVIEW.text} mx-auto mb-1`} />
            <p className={`text-lg font-bold ${VOID_STATUS_COLORS.REVIEW.text}`}>{voidStats.review}</p>
            <p className="text-[10px] text-white/40 uppercase font-medium">İncelemede</p>
          </div>
          <div className={`${VOID_STATUS_COLORS.RESOLVED.bg} ${VOID_STATUS_COLORS.RESOLVED.border} border rounded-lg p-3 text-center`}>
            <CheckCircle className={`w-5 h-5 ${VOID_STATUS_COLORS.RESOLVED.text} mx-auto mb-1`} />
            <p className={`text-lg font-bold ${VOID_STATUS_COLORS.RESOLVED.text}`}>{voidStats.resolved}</p>
            <p className="text-[10px] text-white/40 uppercase font-medium">Çözüldü</p>
          </div>
        </div>
      )}

      {/* Subject Results Table */}
      {exam.subjectResults.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-pink-500/15">
                <th className="text-left py-3 px-4 font-semibold text-white/70">Ders</th>
                <th className="text-center py-3 px-4 font-semibold text-emerald-400">Doğru</th>
                <th className="text-center py-3 px-4 font-semibold text-rose-400">Yanlış</th>
                <th className="text-center py-3 px-4 font-semibold text-amber-400">Boş</th>
                <th className="text-center py-3 px-4 font-semibold text-pink-400">Net</th>
              </tr>
            </thead>
            <tbody>
              {exam.subjectResults.map((sr, idx) => (
                <tr
                  key={sr.subjectId}
                  className={`border-b border-white/10 ${idx % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.04]'}`}
                >
                  <td className="py-3 px-4 font-medium text-white/90">{sr.subject.name}</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-semibold">{sr.correctCount}</td>
                  <td className="py-3 px-4 text-center text-rose-400 font-semibold">{sr.wrongCount}</td>
                  <td className="py-3 px-4 text-center text-amber-400 font-semibold">{sr.emptyCount}</td>
                  <td className="py-3 px-4 text-center text-pink-400 font-bold">{sr.netScore.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Radar Chart */}
      {radarData.length >= 3 && (
        <div className="bg-white/[0.04] border border-pink-500/[0.12] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white/60 mb-4 text-center">Ders Bazında Net Dağılımı</h3>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="rgba(244,114,182,0.15)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }} />
              <PolarRadiusAxis angle={30} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} />
              <Radar name="Net" dataKey="net" stroke="#f472b6" fill="#f472b6" fillOpacity={0.25} strokeWidth={2} />
              <Tooltip
                formatter={(value: number) => [value.toFixed(2), 'Net']}
                contentStyle={{ borderRadius: '8px', fontSize: '12px', background: '#151528', border: '1px solid rgba(244,114,182,0.2)', color: '#fff' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ---------- Tab: Cognitive Voids (Operations Desk) ----------

function VoidsTab({
  exam,
  onStatusChange,
}: {
  exam: ExamDetail;
  onStatusChange: (voidId: string, newStatus: 'UNRESOLVED' | 'REVIEW' | 'RESOLVED') => void;
}) {
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const allSubjects = useMemo(() => {
    const names = new Set<string>();
    exam.cognitiveVoids.forEach(v => names.add(v.subject.name));
    return Array.from(names).sort();
  }, [exam.cognitiveVoids]);

  const filteredVoids = useMemo(() => {
    return exam.cognitiveVoids.filter(v => {
      if (subjectFilter !== 'all' && v.subject.name !== subjectFilter) return false;
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      return true;
    });
  }, [exam.cognitiveVoids, subjectFilter, statusFilter]);

  // Group by subject
  const groupedVoids = useMemo(() => {
    const groups = new Map<string, CognitiveVoid[]>();
    filteredVoids.forEach(v => {
      const key = v.subject.name;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(v);
    });
    return Array.from(groups.entries());
  }, [filteredVoids]);

  if (exam.cognitiveVoids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/40">
        <Brain className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">Zafiyet analizi yapılmamış</p>
        <p className="text-sm mt-1">Soğuk faz analizini tamamlayarak zafiyetleri işaretleyebilirsin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="text-sm p-1.5 rounded bg-white/[0.06] border border-pink-500/[0.12] text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          <option value="all">Tüm Dersler</option>
          {allSubjects.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm p-1.5 rounded bg-white/[0.06] border border-pink-500/[0.12] text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="UNRESOLVED">Çözülmemiş</option>
          <option value="REVIEW">İncelemede</option>
          <option value="RESOLVED">Çözüldü</option>
        </select>
        <span className="text-[12px] text-white/30 self-center ml-auto">
          {filteredVoids.length} zafiyet
        </span>
      </div>

      {/* Void Cards grouped by subject */}
      {groupedVoids.map(([subjectName, voids]) => (
        <div key={subjectName}>
          <h3 className="text-sm font-bold text-white/70 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-pink-500" />
            {subjectName}
            <span className="text-white/30 text-[11px] font-normal">({voids.length})</span>
          </h3>
          <div className="space-y-2">
            {voids.map((v) => {
              const statusColors = VOID_STATUS_COLORS[v.status];
              const StatusIcon = STATUS_ICONS[v.status];
              const nextStatus = STATUS_CYCLE[v.status];
              const errorLabel = ERROR_REASON_LABELS[v.errorReason] || v.errorReason;

              return (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${statusColors.bg} ${statusColors.border} border rounded-xl p-4 transition-all hover:scale-[1.005]`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {v.topic && (
                          <span className="text-sm font-bold text-white/90">
                            {v.topic.name}
                          </span>
                        )}
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${
                          v.source === 'WRONG'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {v.source === 'WRONG' ? 'Yanlış' : 'Boş'}
                        </span>
                        {v.magnitude > 1 && (
                          <span className="text-[11px] text-white/50 font-bold">
                            x{v.magnitude}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="inline-flex items-center rounded-full bg-white/[0.06] text-white/60 px-2 py-0.5 text-[11px] font-medium border border-white/10">
                          {errorLabel}
                        </span>
                        <span className="text-[10px] text-white/30">
                          Severity: {v.severity.toFixed(1)}
                        </span>
                      </div>
                      {v.notes && (
                        <p className="text-xs text-white/50 mt-2 italic">{v.notes}</p>
                      )}
                    </div>

                    {/* Single-tap status button */}
                    <button
                      onClick={() => onStatusChange(v.id, nextStatus)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${statusColors.bg} ${statusColors.text} ${statusColors.border} border hover:brightness-125`}
                      title={`${VOID_STATUS_LABELS[v.status]} → ${VOID_STATUS_LABELS[nextStatus]}`}
                    >
                      <StatusIcon size={14} />
                      {VOID_STATUS_LABELS[v.status]}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- Tab: Analysis (Charts) ----------

function AnalysisTab({ exam }: { exam: ExamDetail }) {
  const errorReasonData = useMemo(() => {
    const counts: Record<string, number> = {};
    exam.cognitiveVoids.forEach((v) => {
      const label = ERROR_REASON_LABELS[v.errorReason] || v.errorReason;
      counts[label] = (counts[label] || 0) + v.magnitude;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [exam.cognitiveVoids]);

  const topicData = useMemo(() => {
    const topicMap: Record<string, { topic: string; subject: string; severity: number }> = {};
    exam.cognitiveVoids.forEach((v) => {
      const topicName = v.topic?.name ?? 'Belirtilmemiş';
      const key = `${v.subject.name}::${topicName}`;
      if (!topicMap[key]) {
        topicMap[key] = { topic: topicName, subject: v.subject.name, severity: 0 };
      }
      topicMap[key].severity += v.severity;
    });
    return Object.values(topicMap).sort((a, b) => b.severity - a.severity);
  }, [exam.cognitiveVoids]);

  const subjectColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    const subjects = [...new Set(topicData.map(d => d.subject))];
    subjects.forEach((name, idx) => {
      map[name] = CHART_COLORS[idx % CHART_COLORS.length];
    });
    return map;
  }, [topicData]);

  if (exam.cognitiveVoids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/40">
        <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">Analiz verisi yok</p>
        <p className="text-sm mt-1">Zafiyet analizi tamamlandıktan sonra grafikler burada görünecek.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error Reason Pie Chart */}
      {errorReasonData.length > 0 && (
        <div className="bg-white/[0.04] border border-pink-500/[0.12] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white/60 mb-4 text-center">Hata Kök Neden Dağılımı</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={errorReasonData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={{ stroke: 'rgba(255,255,255,0.3)' }}
              >
                {errorReasonData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '8px', fontSize: '12px', background: '#151528', border: '1px solid rgba(244,114,182,0.2)', color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Topic Severity Bar Chart */}
      {topicData.length > 0 && (
        <div className="bg-white/[0.04] border border-pink-500/[0.12] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white/60 mb-4 text-center">Konu Bazında Zafiyet Derinliği</h3>
          <ResponsiveContainer width="100%" height={Math.max(300, topicData.length * 40)}>
            <BarChart data={topicData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(244,114,182,0.1)" />
              <XAxis type="number" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.5)' }} />
              <YAxis type="category" dataKey="topic" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.7)' }} width={140} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', fontSize: '12px', background: '#151528', border: '1px solid rgba(244,114,182,0.2)', color: '#fff' }}
                formatter={(value: any, _name: any, props: any) => [
                  Number(value).toFixed(1),
                  props?.payload?.subject ?? '',
                ]}
              />
              <Bar dataKey="severity" name="Severity" radius={[0, 6, 6, 0]}>
                {topicData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={subjectColorMap[entry.subject] ?? CHART_COLORS[0]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center mt-4 pt-3 border-t border-white/10">
            {Object.entries(subjectColorMap).map(([name, color]) => (
              <div key={name} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                <span className="text-xs text-white/60">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Main Component ----------

export default function ExamDetailView({ examId, onBack, onDeleted }: ExamDetailViewProps) {
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('summary');

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [saving, setSaving] = useState(false);

  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysisCached, setAiAnalysisCached] = useState(false);

  // Exam type change state
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [showExamTypeDropdown, setShowExamTypeDropdown] = useState(false);
  const [changingExamType, setChangingExamType] = useState(false);
  const examTypeDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showExamTypeDropdown) return;
    function handleClickOutside(e: MouseEvent) {
      if (examTypeDropdownRef.current && !examTypeDropdownRef.current.contains(e.target as Node)) {
        setShowExamTypeDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExamTypeDropdown]);

  // Fetch exam types for dropdown
  useEffect(() => {
    async function fetchExamTypes() {
      try {
        const res = await fetch('/api/exam-types');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) setExamTypes(data);
      } catch {
        // silently fail
      }
    }
    fetchExamTypes();
  }, []);

  // Fetch exam data
  useEffect(() => {
    let cancelled = false;
    async function fetchExam() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/exams/${examId}`);
        if (!res.ok) throw new Error(`Sınav yüklenemedi (${res.status})`);
        const data: ExamDetail = await res.json();
        if (!cancelled) setExam(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchExam();
    return () => { cancelled = true; };
  }, [examId]);

  const handleAIAnalysis = async () => {
    setAiAnalysisLoading(true);
    try {
      const res = await fetch('/api/ai/exam-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId }),
      });
      if (!res.ok) {
        if (res.status === 403) {
          toast.error('AI erişiminiz aktif değil');
          return;
        }
        throw new Error('AI analizi oluşturulamadı');
      }
      const data = await res.json();
      setAiAnalysis(data.analysis);
      setAiAnalysisCached(data.cached);
    } catch {
      toast.error('AI analizi oluşturulurken hata oluştu');
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  const handleExamTypeChange = async (newExamTypeId: string) => {
    if (!exam || newExamTypeId === exam.examType.id) {
      setShowExamTypeDropdown(false);
      return;
    }
    setChangingExamType(true);
    try {
      const res = await fetch(`/api/exams/${examId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examTypeId: newExamTypeId }),
      });
      if (!res.ok) throw new Error('Sınav türü güncellenemedi');
      const updated = await res.json();
      setExam(prev => prev ? { ...prev, examTypeId: updated.examTypeId, examType: updated.examType } : prev);
      toast.success('Sınav türü güncellendi');
    } catch {
      toast.error('Sınav türü güncellenirken hata oluştu');
    } finally {
      setChangingExamType(false);
      setShowExamTypeDropdown(false);
    }
  };

  const handleCategoryToggle = async () => {
    if (!exam) return;
    const newCategory = exam.examCategory === 'brans' ? null : 'brans';
    setChangingExamType(true);
    try {
      const res = await fetch(`/api/exams/${examId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examCategory: newCategory }),
      });
      if (!res.ok) throw new Error('Kategori güncellenemedi');
      const updated = await res.json();
      setExam(prev => prev ? { ...prev, examCategory: updated.examCategory } : prev);
      toast.success(newCategory === 'brans' ? 'Branş denemesi olarak işaretlendi' : 'Genel deneme olarak işaretlendi');
    } catch {
      toast.error('Kategori güncellenirken hata oluştu');
    } finally {
      setChangingExamType(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/exams/${examId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Silme başarısız');
      toast.success('Deneme silindi');
      onDeleted ? onDeleted() : onBack();
    } catch {
      toast.error('Deneme silinirken hata oluştu');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const startEditing = () => {
    if (!exam) return;
    setEditTitle(exam.title);
    setEditDate(new Date(exam.date).toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" }));
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/exams/${examId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, date: editDate }),
      });
      if (!res.ok) throw new Error('Güncelleme başarısız');
      const updated = await res.json();
      setExam(prev => prev ? { ...prev, title: updated.title, date: updated.date } : prev);
      toast.success('Deneme güncellendi');
      setEditing(false);
    } catch {
      toast.error('Deneme güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  // Single-tap void status change
  const handleVoidStatusChange = async (voidId: string, newStatus: 'UNRESOLVED' | 'REVIEW' | 'RESOLVED') => {
    // Optimistic update
    setExam(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        cognitiveVoids: prev.cognitiveVoids.map(v =>
          v.id === voidId ? { ...v, status: newStatus } : v
        ),
      };
    });

    try {
      const res = await fetch(`/api/exams/${examId}/cognitive-voids/${voidId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Revert on error
      setExam(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          cognitiveVoids: prev.cognitiveVoids.map(v =>
            v.id === voidId ? { ...v, status: STATUS_CYCLE[newStatus] as any } : v
          ),
        };
      });
      toast.error('Durum güncellenemedi');
    }
  };

  // ---------- Render ----------

  return (
    <Paper className="rounded-2xl min-h-[60vh]">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white/90 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Geri Dön</span>
        </button>

        {exam && !loading && (
          <div className="flex items-center gap-2">
            {/* Exam Type Badge with Dropdown */}
            <div className="relative" ref={examTypeDropdownRef}>
              <button
                onClick={() => setShowExamTypeDropdown(!showExamTypeDropdown)}
                className="inline-flex items-center gap-1.5 rounded-full bg-pink-500/10 text-pink-400 px-3 py-1 text-xs font-medium border border-pink-500/20 hover:bg-pink-500/20 transition-colors"
                title="Sınav türünü değiştir"
              >
                {changingExamType ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    {exam.examType.name}
                    {exam.examCategory === 'brans' && exam.subjectResults.length === 1 && (
                      <span className="text-amber-400 ml-0.5">
                        {exam.subjectResults[0].subject.name}
                      </span>
                    )}
                    <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
              <AnimatePresence>
                {showExamTypeDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 z-50 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl overflow-hidden min-w-[120px]"
                  >
                    <button
                      onClick={handleCategoryToggle}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors border-b border-white/5 ${
                        exam.examCategory === 'brans'
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      {exam.examCategory === 'brans' ? '✓ Branş Denemesi' : 'Branş Denemesi Yap'}
                    </button>
                    {examTypes.map((et) => (
                      <button
                        key={et.id}
                        onClick={() => handleExamTypeChange(et.id)}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                          exam.examType.id === et.id
                            ? 'text-pink-400 bg-pink-500/10'
                            : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
                        }`}
                      >
                        {et.name}
                        {exam.examType.id === et.id && (
                          <Check className="w-3.5 h-3.5 inline ml-2" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={startEditing}
              className="p-2 text-white/40 hover:text-pink-400 hover:bg-pink-500/10 rounded-lg transition-colors"
              title="Düzenle"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4">
              <p className="text-sm text-rose-400 font-medium mb-3">
                Bu denemeyi silmek istediğine emin misin? Bu işlem geri alınamaz.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-400 disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Evet, Sil
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 py-2 bg-white/[0.06] text-white/70 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10"
                >
                  İptal
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Form */}
      <AnimatePresence>
        {editing && exam && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-pink-400">Denemeyi Düzenle</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/60 block mb-1">Başlık</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-pink-500/[0.12] bg-white/[0.06] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 block mb-1">Tarih</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 border border-pink-500/[0.12] bg-white/[0.06] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSaveEdit}
                  disabled={saving || !editTitle.trim()}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-400 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Kaydet
                </button>
                <button
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="px-4 py-2 bg-white/[0.06] text-white/70 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  İptal
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading && <DetailSkeleton />}

      {/* Error */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-rose-400">
          <p className="text-lg font-medium">Hata</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={onBack}
            className="mt-4 text-sm text-pink-400 hover:text-pink-300 underline"
          >
            Geri dön
          </button>
        </div>
      )}

      {/* Content */}
      {exam && !loading && (
        <>
          {/* Tab Navigation */}
          <div className="border-b border-pink-500/15 mb-6">
            <nav className="flex gap-1 -mb-px overflow-x-auto" aria-label="Sekmeler">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors
                      ${isActive ? 'text-pink-400' : 'text-white/50 hover:text-white/70'}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="exam-detail-tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-400 rounded-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'summary' && (
                <>
                  <SummaryTab exam={exam} />
                  {/* AI Analysis Section */}
                  <div className="mt-8">
                    {aiAnalysis ? (
                      <div className="bg-white/5 backdrop-blur-md border border-pink-500/15 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bot size={18} className="text-pink-400" />
                            <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">
                              AI Analizi
                            </h3>
                            {aiAnalysisCached && (
                              <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-lg">
                                Kayıtlı
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white/90 prose-p:text-white/70 prose-strong:text-white/90 prose-ul:text-white/70 prose-li:text-white/70 prose-a:text-pink-400">
                          <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleAIAnalysis}
                        disabled={aiAnalysisLoading}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-pink-500/20 hover:from-amber-500/30 hover:to-pink-500/30 border border-pink-500/20 text-white/70 hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {aiAnalysisLoading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            AI Analiz Oluşturuluyor...
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} className="text-amber-400" />
                            AI ile Analiz Et
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </>
              )}
              {activeTab === 'voids' && (
                <VoidsTab exam={exam} onStatusChange={handleVoidStatusChange} />
              )}
              {activeTab === 'analysis' && <AnalysisTab exam={exam} />}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </Paper>
  );
}
