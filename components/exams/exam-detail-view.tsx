"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Paper, Handwriting } from '@/components/skeuomorphic';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, BarChart3, Trash2, Pencil, Check, X, Loader2, Target, Brain, ChevronDown, Sparkles, Bot, AlertTriangle, CheckCircle, RefreshCw, Save, Sun, Moon, Sunrise, Volume2, VolumeX, Battery, BatteryLow, BatteryFull, MessageSquare, Plus } from 'lucide-react';
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
  ERROR_REASONS_ORDERED,
  VOID_STATUS_LABELS,
  VOID_STATUS_COLORS,
  TIME_OF_DAY_OPTIONS,
  ENVIRONMENT_OPTIONS,
  BIOLOGICAL_STATE_OPTIONS,
  PERCEIVED_DIFFICULTY_OPTIONS,
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
  errorReason: ErrorReasonType | null;
  magnitude: number;
  status: 'RAW' | 'UNRESOLVED' | 'REVIEW' | 'RESOLVED';
  severity: number;
  notes: string | null;
  questionNumber?: number | null;
  relapseCount?: number;
}

interface ExamType {
  id: string;
  name: string;
}

interface ExamDetail {
  id: string;
  title: string;
  date: string;
  notes?: string | null;
  examTypeId: string;
  examType: { id: string; name: string };
  examCategory?: string | null;
  subjectResults: SubjectResult[];
  cognitiveVoids: CognitiveVoid[];
  coldPhaseCompleted?: boolean;
  timeOfDay?: string | null;
  environment?: string | null;
  perceivedDifficulty?: number | null;
  biologicalState?: string | null;
}

interface TopicOption {
  id: string;
  name: string;
}

interface SubjectTopics {
  subjectName: string;
  topics: TopicOption[];
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
    const raw = exam.cognitiveVoids.filter(v => v.status === 'RAW').length;
    const unresolved = exam.cognitiveVoids.filter(v => v.status === 'UNRESOLVED').length;
    const review = exam.cognitiveVoids.filter(v => v.status === 'REVIEW').length;
    const resolved = exam.cognitiveVoids.filter(v => v.status === 'RESOLVED').length;
    const pending = raw + unresolved + review;
    return { raw, unresolved, review, resolved, pending, total: exam.cognitiveVoids.length };
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
        <span className="text-sm text-white/50">{formatDateTR(exam.date)}</span>
      </div>

      {/* Badge Line */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 font-mono">
          {totals.net.toFixed(2)} Net
        </span>
        <span className="text-white/30">•</span>
        <span className="text-sm text-white/60">
          <span className="text-emerald-400 font-bold">{totals.correct}</span>D,{' '}
          <span className="text-rose-400 font-bold">{totals.wrong}</span>Y,{' '}
          <span className="text-amber-400 font-bold">{totals.empty}</span>B
        </span>
        {voidStats.total > 0 && (
          <>
            <span className="text-white/30">•</span>
            <span className="text-sm">
              {voidStats.pending > 0 && (
                <span className="text-rose-400 font-bold">{voidStats.pending} Bekleyen</span>
              )}
              {voidStats.pending > 0 && voidStats.resolved > 0 && ', '}
              {voidStats.resolved > 0 && (
                <span className="text-emerald-400 font-bold">{voidStats.resolved} Çözülen</span>
              )}
            </span>
          </>
        )}
        <span className="inline-flex items-center rounded-full bg-pink-500/10 text-pink-400 px-3 py-0.5 text-xs font-medium border border-pink-500/20">
          {exam.examType.name}
        </span>
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

      {/* Notes */}
      {exam.notes && (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={14} className="text-white/40" />
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Notlar</span>
          </div>
          <p className="text-sm text-white/70 whitespace-pre-wrap">{exam.notes}</p>
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
  topicsBySubject,
  onStatusChange,
  onVoidUpdate,
}: {
  exam: ExamDetail;
  topicsBySubject: Record<string, SubjectTopics>;
  onStatusChange: (voidId: string, newStatus: 'RAW' | 'UNRESOLVED' | 'REVIEW' | 'RESOLVED') => void;
  onVoidUpdate: (voidId: string, data: { topicId?: string; errorReason?: string; notes?: string }) => Promise<void>;
}) {
  const [triageMode, setTriageMode] = useState(false);
  const [triageIndex, setTriageIndex] = useState(0);
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingVoidId, setEditingVoidId] = useState<string | null>(null);
  const [editVoidTopic, setEditVoidTopic] = useState('');
  const [editVoidReason, setEditVoidReason] = useState('');
  const [editVoidNotes, setEditVoidNotes] = useState('');
  const [savingVoid, setSavingVoid] = useState(false);

  const startVoidEdit = (v: CognitiveVoid) => {
    setEditingVoidId(v.id);
    setEditVoidTopic(v.topicId || '');
    setEditVoidReason(v.errorReason || '');
    setEditVoidNotes(v.notes || '');
  };

  const handleSaveVoid = async (v: CognitiveVoid) => {
    setSavingVoid(true);
    try {
      await onVoidUpdate(v.id, {
        topicId: editVoidTopic || undefined,
        errorReason: editVoidReason || undefined,
        notes: editVoidNotes || undefined,
      });
      setEditingVoidId(null);
    } finally {
      setSavingVoid(false);
    }
  };

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
          <option value="RAW">Ham Veri</option>
          <option value="UNRESOLVED">Çözülmemiş</option>
          <option value="REVIEW">İncelemede</option>
          <option value="RESOLVED">Çözüldü</option>
        </select>
        <span className="text-[12px] text-white/30 self-center ml-auto">
          {filteredVoids.length} zafiyet
        </span>
        {/* Triage Mode Button */}
        {filteredVoids.filter(v => v.status !== 'RESOLVED').length > 0 && (
          <button
            onClick={() => { setTriageIndex(0); setTriageMode(true); }}
            className="px-3 py-1.5 rounded-lg bg-pink-500/20 border border-pink-500/30 text-pink-400 text-xs font-bold hover:bg-pink-500/30 transition-all"
          >
            <Target size={12} className="inline mr-1" />
            Odak Modu
          </button>
        )}
      </div>

      {/* Triage Flashcard Mode */}
      <AnimatePresence>
        {triageMode && (() => {
          const triageVoids = filteredVoids
            .filter(v => v.status !== 'RESOLVED')
            .sort((a, b) => b.severity - a.severity);
          const current = triageVoids[triageIndex];
          if (!current) {
            return (
              <motion.div
                key="triage-done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              >
                <div className="bg-[#1a1a2e] border border-emerald-500/30 rounded-2xl p-8 text-center max-w-md">
                  <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Tamamlandı!</h3>
                  <p className="text-white/50 text-sm mb-4">Tüm zafiyetler işlendi.</p>
                  <button onClick={() => setTriageMode(false)} className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-bold">
                    Kapat
                  </button>
                </div>
              </motion.div>
            );
          }
          const errorLabel = current.errorReason ? (ERROR_REASON_LABELS[current.errorReason] || current.errorReason) : 'Sınıflandırılmamış';
          return (
            <motion.div
              key="triage-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 max-w-lg w-full space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/30 font-bold uppercase tracking-wider">
                    {triageIndex + 1} / {triageVoids.length}
                  </span>
                  <button onClick={() => setTriageMode(false)} className="text-white/30 hover:text-white/60">
                    <X size={18} />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{current.topic?.name || 'Konu Belirtilmemiş'}</h3>
                  <p className="text-sm text-white/50">{current.subject.name} • {errorLabel}</p>
                  <p className="text-xs text-white/30 mt-1">Severity: {current.severity.toFixed(1)}</p>
                </div>
                {current.notes && <p className="text-sm text-white/50 italic">{current.notes}</p>}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      onStatusChange(current.id, 'RESOLVED');
                      if (triageIndex < triageVoids.length - 1) setTriageIndex(i => i + 1);
                      else setTriageMode(false);
                    }}
                    className="flex-1 px-4 py-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-bold hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Çözüldü
                  </button>
                  <button
                    onClick={() => {
                      if (triageIndex < triageVoids.length - 1) setTriageIndex(i => i + 1);
                      else setTriageMode(false);
                    }}
                    className="flex-1 px-4 py-3 bg-white/[0.06] border border-white/10 text-white/50 rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
                  >
                    Atla
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

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
              const severityColor = v.severity >= 2 ? 'border-l-rose-500' : v.severity >= 1 ? 'border-l-amber-500' : 'border-l-white/20';
              const errorLabel = v.errorReason ? (ERROR_REASON_LABELS[v.errorReason] || v.errorReason) : null;
              const statusLabel = VOID_STATUS_LABELS[v.status] || v.status;
              const statusColors = VOID_STATUS_COLORS[v.status] || VOID_STATUS_COLORS.UNRESOLVED;
              const isEditing = editingVoidId === v.id;
              const subjectTopics = topicsBySubject[v.subjectId]?.topics || [];

              return (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white/[0.03] border border-white/[0.08] border-l-[3px] ${severityColor} rounded-xl p-4 transition-all hover:bg-white/[0.05]`}
                >
                  {isEditing ? (
                    /* Inline Edit Mode */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Zafiyet Düzenle</span>
                        <div className="flex items-center gap-1">
                          {v.questionNumber && (
                            <span className="text-[10px] text-white/40 font-mono bg-white/[0.06] px-1.5 py-0.5 rounded mr-1">
                              S.{v.questionNumber}
                            </span>
                          )}
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${
                            v.source === 'WRONG'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {v.source === 'WRONG' ? 'Yanlış' : 'Boş'}
                          </span>
                        </div>
                      </div>

                      {/* Topic Select */}
                      <div>
                        <label className="text-[10px] text-white/40 block mb-1">Konu</label>
                        <select
                          value={editVoidTopic}
                          onChange={e => setEditVoidTopic(e.target.value)}
                          className="w-full px-2.5 py-2 bg-white/[0.06] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-400 [color-scheme:dark]"
                        >
                          <option value="">Konu seçin</option>
                          {subjectTopics.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Error Reason Select */}
                      <div>
                        <label className="text-[10px] text-white/40 block mb-1">Hata Gerekçesi</label>
                        <div className="flex gap-1.5 flex-wrap">
                          {ERROR_REASONS_ORDERED.map(reason => (
                            <button
                              key={reason}
                              type="button"
                              onClick={() => setEditVoidReason(editVoidReason === reason ? '' : reason)}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                                editVoidReason === reason
                                  ? 'bg-pink-500/20 text-pink-400 border-pink-500/30'
                                  : 'bg-white/[0.03] text-white/40 border-white/10 hover:text-white/60'
                              }`}
                            >
                              {ERROR_REASON_LABELS[reason]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="text-[10px] text-white/40 block mb-1">Not</label>
                        <input
                          type="text"
                          value={editVoidNotes}
                          onChange={e => setEditVoidNotes(e.target.value)}
                          placeholder="İsteğe bağlı not..."
                          className="w-full px-2.5 py-2 bg-white/[0.06] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-400 placeholder:text-white/20"
                        />
                      </div>

                      {/* Save / Cancel */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleSaveVoid(v)}
                          disabled={savingVoid}
                          className="px-3 py-1.5 bg-pink-500 text-white rounded-lg text-xs font-bold hover:bg-pink-400 disabled:opacity-50 flex items-center gap-1.5 transition-all"
                        >
                          {savingVoid ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                          Kaydet
                        </button>
                        <button
                          onClick={() => setEditingVoidId(null)}
                          disabled={savingVoid}
                          className="px-3 py-1.5 bg-white/[0.06] text-white/60 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10 flex items-center gap-1.5"
                        >
                          <X size={12} />
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {v.topic ? (
                            <span className="text-sm font-bold text-white/90">{v.topic.name}</span>
                          ) : (
                            <span className="text-sm font-medium text-white/40 italic">Konu belirtilmemiş</span>
                          )}
                          {v.questionNumber && (
                            <span className="text-[10px] text-white/40 font-mono bg-white/[0.06] px-1.5 py-0.5 rounded">
                              S.{v.questionNumber}
                            </span>
                          )}
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${
                            v.source === 'WRONG'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {v.source === 'WRONG' ? 'Yanlış' : 'Boş'}
                          </span>
                          {(v.relapseCount ?? 0) > 0 && (
                            <span className="text-[10px] text-orange-400 font-bold bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                              Nüksetme x{v.relapseCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {errorLabel && (
                            <span className="inline-flex items-center rounded-full bg-white/[0.06] text-white/60 px-2 py-0.5 text-[11px] font-medium border border-white/10">
                              {errorLabel}
                            </span>
                          )}
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${statusColors.bg} ${statusColors.text} ${statusColors.border} border`}>
                            {statusLabel}
                          </span>
                          <span className="text-[10px] text-white/20">
                            {v.severity.toFixed(1)}
                          </span>
                        </div>
                        {v.notes && (
                          <p className="text-xs text-white/50 mt-2 italic">{v.notes}</p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => startVoidEdit(v)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 bg-white/[0.06] text-white/50 border border-white/10 hover:bg-white/10 hover:text-pink-400"
                        >
                          <Pencil size={12} />
                          Düzenle
                        </button>
                        {v.status !== 'RESOLVED' && (
                          <button
                            onClick={() => onStatusChange(v.id, 'RESOLVED')}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25"
                          >
                            <CheckCircle size={13} />
                            Çözüldü
                          </button>
                        )}
                        {v.status === 'RESOLVED' && (
                          <button
                            onClick={() => onStatusChange(v.id, 'UNRESOLVED')}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 bg-white/[0.06] text-white/40 border border-white/10 hover:bg-white/10"
                          >
                            <RefreshCw size={13} />
                            Geri Al
                          </button>
                        )}
                      </div>
                    </div>
                  )}
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
  // ─── Ders bazlı D/Y/B özet ───
  const subjectSummary = useMemo(() => {
    return exam.subjectResults.map(sr => {
      const voids = exam.cognitiveVoids.filter(v => v.subjectId === sr.subjectId);
      const classifiedVoids = voids.filter(v => v.topicId && v.errorReason);
      return {
        name: sr.subject.name,
        correctCount: sr.correctCount,
        wrongCount: sr.wrongCount,
        emptyCount: sr.emptyCount,
        netScore: sr.netScore,
        totalVoids: voids.length,
        classifiedVoids: classifiedVoids.length,
        rawVoids: voids.filter(v => v.status === 'RAW').length,
        unresolvedVoids: voids.filter(v => v.status === 'UNRESOLVED').length,
        reviewVoids: voids.filter(v => v.status === 'REVIEW').length,
        resolvedVoids: voids.filter(v => v.status === 'RESOLVED').length,
      };
    });
  }, [exam.subjectResults, exam.cognitiveVoids]);

  // ─── Void istatistikleri ───
  const voidStats = useMemo(() => {
    const voids = exam.cognitiveVoids;
    return {
      total: voids.length,
      raw: voids.filter(v => v.status === 'RAW').length,
      unresolved: voids.filter(v => v.status === 'UNRESOLVED').length,
      review: voids.filter(v => v.status === 'REVIEW').length,
      resolved: voids.filter(v => v.status === 'RESOLVED').length,
      classified: voids.filter(v => v.topicId && v.errorReason).length,
      totalSeverity: voids.reduce((s, v) => s + v.severity, 0),
      wrongSource: voids.filter(v => v.source === 'WRONG').length,
      emptySource: voids.filter(v => v.source === 'EMPTY').length,
    };
  }, [exam.cognitiveVoids]);

  // ─── Konu bazlı detay (grouped by topic with full info) ───
  const topicDetails = useMemo(() => {
    const map: Record<string, {
      topic: string; subject: string; severity: number;
      wrongCount: number; emptyCount: number;
      reasons: Record<string, number>;
      statuses: Record<string, number>;
    }> = {};
    exam.cognitiveVoids.forEach((v) => {
      const topicName = v.topic?.name ?? 'Sınıflandırılmamış';
      const key = `${v.subject.name}::${topicName}`;
      if (!map[key]) {
        map[key] = { topic: topicName, subject: v.subject.name, severity: 0, wrongCount: 0, emptyCount: 0, reasons: {}, statuses: {} };
      }
      map[key].severity += v.severity;
      if (v.source === 'WRONG') map[key].wrongCount += v.magnitude;
      if (v.source === 'EMPTY') map[key].emptyCount += v.magnitude;
      if (v.errorReason) {
        const label = ERROR_REASON_LABELS[v.errorReason] || v.errorReason;
        map[key].reasons[label] = (map[key].reasons[label] || 0) + v.magnitude;
      }
      map[key].statuses[v.status] = (map[key].statuses[v.status] || 0) + 1;
    });
    return Object.values(map).sort((a, b) => b.severity - a.severity);
  }, [exam.cognitiveVoids]);

  const errorReasonData = useMemo(() => {
    const counts: Record<string, number> = {};
    exam.cognitiveVoids.forEach((v) => {
      if (!v.errorReason) return;
      const label = ERROR_REASON_LABELS[v.errorReason] || v.errorReason;
      counts[label] = (counts[label] || 0) + v.magnitude;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [exam.cognitiveVoids]);

  const subjectColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    const subjects = [...new Set(topicDetails.map(d => d.subject))];
    subjects.forEach((name, idx) => {
      map[name] = CHART_COLORS[idx % CHART_COLORS.length];
    });
    return map;
  }, [topicDetails]);

  // Toplam net
  const totalNet = exam.subjectResults.reduce((s, r) => s + r.netScore, 0);
  const totalCorrect = exam.subjectResults.reduce((s, r) => s + r.correctCount, 0);
  const totalWrong = exam.subjectResults.reduce((s, r) => s + r.wrongCount, 0);
  const totalEmpty = exam.subjectResults.reduce((s, r) => s + r.emptyCount, 0);

  return (
    <div className="space-y-6">
      {/* ─── Genel Özet Kartları ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white/[0.04] border border-emerald-500/15 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">{totalCorrect}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-widest">Doğru</div>
        </div>
        <div className="bg-white/[0.04] border border-rose-500/15 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-rose-400">{totalWrong}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-widest">Yanlış</div>
        </div>
        <div className="bg-white/[0.04] border border-amber-500/15 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">{totalEmpty}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-widest">Boş</div>
        </div>
        <div className="bg-white/[0.04] border border-pink-500/15 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-pink-400">{totalNet.toFixed(2)}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-widest">Toplam Net</div>
        </div>
      </div>

      {/* ─── Ders Bazlı Tablo ─── */}
      <div className="bg-white/[0.04] border border-pink-500/[0.12] rounded-xl p-4 overflow-x-auto">
        <h3 className="text-sm font-semibold text-white/60 mb-3">Ders Bazlı Performans</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] text-white/40 uppercase tracking-widest border-b border-white/5">
              <th className="text-left py-2 pr-2">Ders</th>
              <th className="text-center px-2">D</th>
              <th className="text-center px-2">Y</th>
              <th className="text-center px-2">B</th>
              <th className="text-center px-2">Net</th>
              <th className="text-center px-2">Zafiyet</th>
              <th className="text-center px-2">Netlik</th>
            </tr>
          </thead>
          <tbody>
            {subjectSummary.map(s => {
              const clarityPct = s.totalVoids > 0 ? Math.round((s.classifiedVoids / s.totalVoids) * 100) : 100;
              return (
                <tr key={s.name} className="border-b border-white/5 last:border-0">
                  <td className="py-2 pr-2 text-white/80 font-medium">{s.name}</td>
                  <td className="text-center text-emerald-400 font-bold">{s.correctCount}</td>
                  <td className="text-center text-rose-400 font-bold">{s.wrongCount}</td>
                  <td className="text-center text-amber-400 font-bold">{s.emptyCount}</td>
                  <td className="text-center text-white font-bold">{s.netScore.toFixed(2)}</td>
                  <td className="text-center">
                    {s.totalVoids > 0 ? (
                      <span className="text-pink-400">{s.totalVoids}</span>
                    ) : (
                      <span className="text-white/20">—</span>
                    )}
                  </td>
                  <td className="text-center">
                    <span className={`text-xs font-bold ${clarityPct >= 80 ? 'text-emerald-400' : clarityPct >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                      %{clarityPct}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─── Zafiyet Durum İstatistikleri ─── */}
      {voidStats.total > 0 && (
        <div className="bg-white/[0.04] border border-pink-500/[0.12] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white/60 mb-3">Zafiyet Durumu</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-slate-400">{voidStats.raw}</div>
              <div className="text-[10px] text-white/30">RAW</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-rose-400">{voidStats.unresolved}</div>
              <div className="text-[10px] text-white/30">Çözülmemiş</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-400">{voidStats.review}</div>
              <div className="text-[10px] text-white/30">İncelemede</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-400">{voidStats.resolved}</div>
              <div className="text-[10px] text-white/30">Çözüldü</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-pink-400">{voidStats.totalSeverity.toFixed(1)}</div>
              <div className="text-[10px] text-white/30">Toplam Severity</div>
            </div>
          </div>
          {/* Clarity progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-white/40 mb-1">
              <span>Sınıflandırma Oranı</span>
              <span>%{voidStats.total > 0 ? Math.round((voidStats.classified / voidStats.total) * 100) : 100}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-pink-500 to-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${voidStats.total > 0 ? Math.min(100, (voidStats.classified / voidStats.total) * 100) : 100}%` }}
              />
            </div>
          </div>
          {/* Source breakdown */}
          <div className="flex gap-4 mt-3 text-xs text-white/40">
            <span>Yanlış kaynaklı: <span className="text-rose-400 font-bold">{voidStats.wrongSource}</span></span>
            <span>Boş kaynaklı: <span className="text-amber-400 font-bold">{voidStats.emptySource}</span></span>
          </div>
        </div>
      )}

      {/* ─── Hata Kök Neden Dağılımı Pie Chart ─── */}
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

      {/* ─── Konu Bazlı Detay Kartları ─── */}
      {topicDetails.length > 0 && (
        <div className="bg-white/[0.04] border border-pink-500/[0.12] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white/60 mb-4">Konu Bazlı Zafiyet Detayı</h3>
          <div className="space-y-3">
            {topicDetails.map((td, idx) => (
              <div
                key={idx}
                className="bg-white/[0.03] border border-white/5 rounded-lg p-3 hover:border-pink-500/15 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-white font-bold text-sm">{td.topic}</span>
                    <span
                      className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: (subjectColorMap[td.subject] ?? CHART_COLORS[0]) + '20', color: subjectColorMap[td.subject] ?? CHART_COLORS[0] }}
                    >
                      {td.subject}
                    </span>
                  </div>
                  <span className="text-pink-400 font-bold text-sm">{td.severity.toFixed(1)}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-[11px] text-white/50">
                  {td.wrongCount > 0 && <span>Yanlış: <span className="text-rose-400 font-bold">{td.wrongCount}</span></span>}
                  {td.emptyCount > 0 && <span>Boş: <span className="text-amber-400 font-bold">{td.emptyCount}</span></span>}
                  {Object.entries(td.reasons).map(([reason, count]) => (
                    <span key={reason}>{reason}: <span className="text-white/70 font-bold">{count}</span></span>
                  ))}
                </div>
                {/* Status mini bar */}
                <div className="flex gap-2 mt-2">
                  {td.statuses['RAW'] && <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-500/20 text-slate-400">RAW {td.statuses['RAW']}</span>}
                  {td.statuses['UNRESOLVED'] && <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400">Çözülmemiş {td.statuses['UNRESOLVED']}</span>}
                  {td.statuses['REVIEW'] && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">İnceleme {td.statuses['REVIEW']}</span>}
                  {td.statuses['RESOLVED'] && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Çözüldü {td.statuses['RESOLVED']}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {exam.cognitiveVoids.length === 0 && exam.subjectResults.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/40">
          <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Analiz verisi yok</p>
          <p className="text-sm mt-1">Zafiyet analizi tamamlandıktan sonra grafikler burada görünecek.</p>
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
  const [editNotes, setEditNotes] = useState('');
  const [editTimeOfDay, setEditTimeOfDay] = useState('');
  const [editEnvironment, setEditEnvironment] = useState('');
  const [editPerceivedDifficulty, setEditPerceivedDifficulty] = useState(0);
  const [editBiologicalState, setEditBiologicalState] = useState('');
  const [editResults, setEditResults] = useState<Array<{ subjectId: string; subjectName: string; correctCount: number; wrongCount: number; emptyCount: number }>>([]);
  const [saving, setSaving] = useState(false);

  // Topic data for void editing
  const [topicsBySubject, setTopicsBySubject] = useState<Record<string, SubjectTopics>>({});

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

  // Fetch topics when exam loads (for void editing)
  useEffect(() => {
    if (!exam) return;
    const subjectIds = [...new Set(exam.subjectResults.map(sr => sr.subjectId))];
    if (subjectIds.length === 0) return;

    async function fetchTopics() {
      try {
        const res = await fetch(`/api/subjects/topics?subjectIds=${subjectIds.join(',')}`);
        if (!res.ok) return;
        const data = await res.json();
        setTopicsBySubject(data);
      } catch {
        // silently fail
      }
    }
    fetchTopics();
  }, [exam?.id, exam?.subjectResults]);

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
      const res = await fetch(`/api/exams/${examId}`, {
        method: 'DELETE',
        headers: { 'X-Confirm-Delete': 'confirmed' },
      });
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
    setEditNotes(exam.notes || '');
    setEditTimeOfDay(exam.timeOfDay || '');
    setEditEnvironment(exam.environment || '');
    setEditPerceivedDifficulty(exam.perceivedDifficulty || 0);
    setEditBiologicalState(exam.biologicalState || '');
    setEditResults(exam.subjectResults.map(sr => ({
      subjectId: sr.subjectId,
      subjectName: sr.subject.name,
      correctCount: sr.correctCount,
      wrongCount: sr.wrongCount,
      emptyCount: sr.emptyCount,
    })));
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      // 1. Update exam metadata
      const patchBody: Record<string, any> = {
        title: editTitle,
        date: editDate,
        notes: editNotes.trim() || null,
        timeOfDay: editTimeOfDay || null,
        environment: editEnvironment || null,
        perceivedDifficulty: editPerceivedDifficulty || null,
        biologicalState: editBiologicalState || null,
      };

      const res = await fetch(`/api/exams/${examId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchBody),
      });
      if (!res.ok) throw new Error('Güncelleme başarısız');
      const updated = await res.json();

      // 2. Update subject results if changed
      const resultsRes = await fetch(`/api/exams/${examId}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          results: editResults.map(r => ({
            subjectId: r.subjectId,
            correctCount: r.correctCount,
            wrongCount: r.wrongCount,
            emptyCount: r.emptyCount,
          })),
        }),
      });

      if (!resultsRes.ok) throw new Error('Sonuçlar güncellenemedi');
      const resultsData = await resultsRes.json();

      // Update local state with fresh data (including synced voids)
      setExam(prev => prev ? {
        ...prev,
        title: updated.title,
        date: updated.date,
        notes: patchBody.notes,
        timeOfDay: patchBody.timeOfDay,
        environment: patchBody.environment,
        perceivedDifficulty: patchBody.perceivedDifficulty,
        biologicalState: patchBody.biologicalState,
        subjectResults: resultsData.results,
        ...(resultsData.cognitiveVoids ? { cognitiveVoids: resultsData.cognitiveVoids } : {}),
      } : prev);

      // Show void sync feedback
      if (resultsData.voidSyncSummary?.length > 0) {
        const totalCreated = resultsData.voidSyncSummary.reduce((s: number, v: any) => s + v.created, 0);
        const totalRemoved = resultsData.voidSyncSummary.reduce((s: number, v: any) => s + v.removed, 0);
        if (totalCreated > 0) {
          toast.info(`${totalCreated} yeni zafiyet kaydı oluşturuldu (sınıflandırma bekliyor)`);
        }
        if (totalRemoved > 0) {
          toast.info(`${totalRemoved} sınıflandırılmamış zafiyet kaydı silindi`);
        }
      }

      toast.success('Deneme güncellendi');
      setEditing(false);
    } catch {
      toast.error('Deneme güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  // Void field update (topic, errorReason, notes)
  const handleVoidUpdate = async (voidId: string, data: { topicId?: string; errorReason?: string; notes?: string }) => {
    try {
      const res = await fetch(`/api/exams/${examId}/cognitive-voids/${voidId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      // Update local state with server response
      setExam(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          cognitiveVoids: prev.cognitiveVoids.map(v =>
            v.id === voidId ? {
              ...v,
              topicId: updated.topicId,
              topic: updated.topic,
              errorReason: updated.errorReason,
              notes: updated.notes,
              status: updated.status,
              severity: updated.severity,
            } : v
          ),
        };
      });
      toast.success('Zafiyet güncellendi');
    } catch {
      toast.error('Zafiyet güncellenemedi');
    }
  };

  // Single-tap void status change
  const handleVoidStatusChange = async (voidId: string, newStatus: 'RAW' | 'UNRESOLVED' | 'REVIEW' | 'RESOLVED') => {
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
            <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-5 space-y-5">
              <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider flex items-center gap-2">
                <Pencil size={14} />
                Denemeyi Düzenle
              </h3>

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest block mb-1.5">Başlık</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2.5 border border-pink-500/[0.12] bg-white/[0.06] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest block mb-1.5">Tarih</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-pink-500/[0.12] bg-white/[0.06] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400 [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest block mb-1.5">Notlar</label>
                <textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  rows={2}
                  placeholder="Sınavla ilgili notlarınız..."
                  className="w-full px-3 py-2.5 border border-pink-500/[0.12] bg-white/[0.06] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none placeholder:text-white/20"
                />
              </div>

              {/* Context Tags */}
              <div className="space-y-4">
                <div className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Sınav Bağlamı</div>

                {/* Time of Day */}
                <div>
                  <label className="text-[10px] text-white/40 block mb-1.5">Sınav Zamanı</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {TIME_OF_DAY_OPTIONS.map(opt => {
                      const icons: Record<string, React.ReactNode> = { sabah: <Sunrise size={12} />, ogle: <Sun size={12} />, aksam: <Moon size={12} /> };
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setEditTimeOfDay(editTimeOfDay === opt.value ? '' : opt.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                            editTimeOfDay === opt.value
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : 'bg-white/[0.03] text-white/40 border-white/10 hover:text-white/60'
                          }`}
                        >
                          {icons[opt.value]}
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Environment */}
                <div>
                  <label className="text-[10px] text-white/40 block mb-1.5">Ortam</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {ENVIRONMENT_OPTIONS.map(opt => {
                      const icons: Record<string, React.ReactNode> = { sessiz: <VolumeX size={12} />, gurultulu: <Volume2 size={12} /> };
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setEditEnvironment(editEnvironment === opt.value ? '' : opt.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                            editEnvironment === opt.value
                              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                              : 'bg-white/[0.03] text-white/40 border-white/10 hover:text-white/60'
                          }`}
                        >
                          {icons[opt.value]}
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Biological State */}
                <div>
                  <label className="text-[10px] text-white/40 block mb-1.5">Enerji Durumu</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {BIOLOGICAL_STATE_OPTIONS.map(opt => {
                      const icons: Record<string, React.ReactNode> = { dinc: <BatteryFull size={12} />, normal: <Battery size={12} />, yorgun: <BatteryLow size={12} /> };
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setEditBiologicalState(editBiologicalState === opt.value ? '' : opt.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                            editBiologicalState === opt.value
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-white/[0.03] text-white/40 border-white/10 hover:text-white/60'
                          }`}
                        >
                          {icons[opt.value]}
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Perceived Difficulty */}
                <div>
                  <label className="text-[10px] text-white/40 block mb-1.5">Algılanan Zorluk</label>
                  <div className="flex gap-1.5">
                    {PERCEIVED_DIFFICULTY_OPTIONS.map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setEditPerceivedDifficulty(editPerceivedDifficulty === val ? 0 : val)}
                        className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all ${
                          editPerceivedDifficulty === val
                            ? 'bg-pink-500/20 text-pink-400 border-pink-500/30'
                            : 'bg-white/[0.03] text-white/40 border-white/10 hover:text-white/60'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-white/20 mt-1 px-0.5 w-[195px]">
                    <span>Kolay</span>
                    <span>Zor</span>
                  </div>
                </div>
              </div>

              {/* Subject Results */}
              {editResults.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-2">Ders Sonuçları</div>
                  <div className="space-y-2">
                    {editResults.map((r, i) => (
                      <div key={r.subjectId} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
                        <span className="text-xs text-white/70 font-medium truncate">{r.subjectName}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-emerald-400 w-4">D</span>
                          <input
                            type="number"
                            min={0}
                            value={r.correctCount}
                            onChange={e => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              setEditResults(prev => prev.map((er, idx) => idx === i ? { ...er, correctCount: val } : er));
                            }}
                            className="w-14 px-2 py-1.5 border border-emerald-500/20 bg-white/[0.04] rounded text-xs text-white text-center focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-rose-400 w-4">Y</span>
                          <input
                            type="number"
                            min={0}
                            value={r.wrongCount}
                            onChange={e => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              setEditResults(prev => prev.map((er, idx) => idx === i ? { ...er, wrongCount: val } : er));
                            }}
                            className="w-14 px-2 py-1.5 border border-rose-500/20 bg-white/[0.04] rounded text-xs text-white text-center focus:outline-none focus:ring-1 focus:ring-rose-400"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-amber-400 w-4">B</span>
                          <input
                            type="number"
                            min={0}
                            value={r.emptyCount}
                            onChange={e => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              setEditResults(prev => prev.map((er, idx) => idx === i ? { ...er, emptyCount: val } : er));
                            }}
                            className="w-14 px-2 py-1.5 border border-amber-500/20 bg-white/[0.04] rounded text-xs text-white text-center focus:outline-none focus:ring-1 focus:ring-amber-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save / Cancel */}
              <div className="flex gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={handleSaveEdit}
                  disabled={saving || !editTitle.trim()}
                  className="px-5 py-2.5 bg-pink-500 text-white rounded-lg text-sm font-bold hover:bg-pink-400 disabled:opacity-50 flex items-center gap-2 transition-all"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Kaydet
                </button>
                <button
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="px-5 py-2.5 bg-white/[0.06] text-white/70 border border-white/10 rounded-lg text-sm font-bold hover:bg-white/10 flex items-center gap-2 transition-all"
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
                <VoidsTab exam={exam} topicsBySubject={topicsBySubject} onStatusChange={handleVoidStatusChange} onVoidUpdate={handleVoidUpdate} />
              )}
              {activeTab === 'analysis' && <AnalysisTab exam={exam} />}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </Paper>
  );
}
