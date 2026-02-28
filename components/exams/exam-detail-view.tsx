"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Paper, Handwriting, Tape } from '@/components/skeuomorphic';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Camera, BookOpen, PieChart as PieChartIcon, BarChart3, Image, Trash2, Pencil, Check, X, Loader2, ListOrdered, Target, CheckCircle, AlertTriangle, RefreshCw, Filter, Sparkles, Bot, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import QuestionDetailModal, { type WrongQuestionDetail } from './question-detail-modal';

// ---------- Types ----------

interface SubjectResult {
  subjectId: string;
  subject: { name: string };
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
  netScore: number;
}

interface WrongQuestion {
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

interface EmptyQuestion {
  id: string;
  questionNumber: number;
  subject: { name: string };
  topic: { name: string } | null;
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
  wrongQuestions: WrongQuestion[];
  emptyQuestions: EmptyQuestion[];
}

interface ExamDetailViewProps {
  examId: string;
  onBack: () => void;
  onDeleted?: () => void;
}

// ---------- Constants ----------

const CHART_COLORS = ['#f472b6', '#fbbf24', '#34d399', '#fb7185', '#a78bfa', '#ec4899', '#2dd4bf', '#f97316'];

const TABS = [
  { key: 'summary', label: 'Ozet', icon: BookOpen },
  { key: 'questions', label: 'Sorular', icon: ListOrdered },
  { key: 'wrong', label: 'Yanlis Analizi', icon: PieChartIcon },
  { key: 'topics', label: 'Konu Dagilimi', icon: BarChart3 },
  { key: 'photos', label: 'Fotograflar', icon: Image },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const DIFFICULTY_MAP: Record<string, { label: string; color: string; bg: string }> = {
  kolay: { label: 'Kolay', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  orta: { label: 'Orta', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  zor: { label: 'Zor', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
};

const STATUS_MAP: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  anladim: { label: 'Anladım', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  tekrar: { label: 'Tekrar Lazim', icon: RefreshCw, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  anlamadim: { label: 'Anlamadım', icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
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
      <div className="h-48 bg-white/10 rounded-lg" />
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
        </div>
      </div>

      {/* Total Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Dogru', value: totals.correct, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: 'Yanlis', value: totals.wrong, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
          { label: 'Bos', value: totals.empty, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
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

      {/* Subject Results Table */}
      {exam.subjectResults.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-pink-500/15">
                <th className="text-left py-3 px-4 font-semibold text-white/70">Ders</th>
                <th className="text-center py-3 px-4 font-semibold text-emerald-400">Dogru</th>
                <th className="text-center py-3 px-4 font-semibold text-rose-400">Yanlis</th>
                <th className="text-center py-3 px-4 font-semibold text-amber-400">Bos</th>
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
          <h3 className="text-sm font-semibold text-white/60 mb-4 text-center">Ders Bazinda Net Dagilimi</h3>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="rgba(244,114,182,0.15)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
              />
              <PolarRadiusAxis
                angle={30}
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
              />
              <Radar
                name="Net"
                dataKey="net"
                stroke="#f472b6"
                fill="#f472b6"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Tooltip
                formatter={(value: number) => [value.toFixed(2), 'Net']}
                contentStyle={{ borderRadius: '8px', fontSize: '12px', background: '#151528', border: '1px solid rgba(244,114,182,0.2)', color: '#fff' }}
                itemStyle={{ color: '#f472b6' }}
                labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ---------- Tab: Questions (Tum Sorular) ----------

function QuestionsTab({
  exam,
  onQuestionClick,
}: {
  exam: ExamDetail;
  onQuestionClick: (questionIndex: number) => void;
}) {
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const allSubjects = useMemo(() => {
    const names = new Set<string>();
    exam.wrongQuestions.forEach(q => names.add(q.subject.name));
    exam.emptyQuestions.forEach(q => names.add(q.subject.name));
    return Array.from(names).sort();
  }, [exam.wrongQuestions, exam.emptyQuestions]);

  const filteredWrong = useMemo(() => {
    return exam.wrongQuestions.filter(q => {
      if (subjectFilter !== 'all' && q.subject.name !== subjectFilter) return false;
      if (statusFilter !== 'all' && (q.understandingStatus ?? 'none') !== statusFilter) return false;
      return true;
    });
  }, [exam.wrongQuestions, subjectFilter, statusFilter]);

  const filteredEmpty = useMemo(() => {
    return exam.emptyQuestions.filter(q => {
      if (subjectFilter !== 'all' && q.subject.name !== subjectFilter) return false;
      return true;
    });
  }, [exam.emptyQuestions, subjectFilter]);

  // Stats summary
  const statusCounts = useMemo(() => {
    const counts = { anladim: 0, tekrar: 0, anlamadim: 0, none: 0 };
    exam.wrongQuestions.forEach(q => {
      const s = q.understandingStatus ?? 'none';
      if (s in counts) counts[s as keyof typeof counts]++;
      else counts.none++;
    });
    return counts;
  }, [exam.wrongQuestions]);

  if (exam.wrongQuestions.length === 0 && exam.emptyQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/40">
        <ListOrdered className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">Soru bulunamadi</p>
        <p className="text-sm mt-1">Bu denemede kayitli soru yok.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Summary Bar */}
      {exam.wrongQuestions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
            <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-emerald-400">{statusCounts.anladim}</p>
            <p className="text-[10px] text-emerald-400/70 uppercase font-medium">Anladım</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
            <RefreshCw className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-amber-400">{statusCounts.tekrar}</p>
            <p className="text-[10px] text-amber-400/70 uppercase font-medium">Tekrar Lazim</p>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-center">
            <AlertTriangle className="w-5 h-5 text-rose-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-rose-400">{statusCounts.anlamadim}</p>
            <p className="text-[10px] text-rose-400/70 uppercase font-medium">Anlamadım</p>
          </div>
          <div className="bg-white/[0.04] border border-white/10 rounded-lg p-3 text-center">
            <Target className="w-5 h-5 text-white/40 mx-auto mb-1" />
            <p className="text-lg font-bold text-white/60">{statusCounts.none}</p>
            <p className="text-[10px] text-white/40 uppercase font-medium">Belirtilmemiş</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-white/40" />
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="text-sm p-1.5 rounded bg-white/[0.06] border border-pink-500/[0.12] text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            <option value="all">Tum Dersler</option>
            {allSubjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm p-1.5 rounded bg-white/[0.06] border border-pink-500/[0.12] text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          <option value="all">Tum Durumlar</option>
          <option value="anladim">Anladım</option>
          <option value="tekrar">Tekrar Lazim</option>
          <option value="anlamadim">Anlamadım</option>
          <option value="none">Belirtilmemiş</option>
        </select>
      </div>

      {/* Wrong Questions */}
      {filteredWrong.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-rose-400 rounded-full" />
            Yanlis Sorular ({filteredWrong.length})
          </h3>
          <div className="space-y-2">
            {filteredWrong.map((wq) => {
              const globalIdx = exam.wrongQuestions.findIndex(q => q.id === wq.id);
              const statusInfo = wq.understandingStatus ? STATUS_MAP[wq.understandingStatus] : null;
              const StatusIcon = statusInfo?.icon;
              const difficultyInfo = wq.difficulty ? DIFFICULTY_MAP[wq.difficulty] : null;

              return (
                <motion.button
                  key={wq.id}
                  onClick={() => onQuestionClick(globalIdx)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full text-left bg-white/[0.04] border border-pink-500/[0.12] rounded-lg p-4 hover:bg-white/[0.08] hover:border-pink-500/25 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white/90 text-sm">
                          S.{wq.questionNumber}
                        </span>
                        <span className="text-xs text-white/40">{wq.subject.name}</span>
                        {wq.topic && (
                          <span className="text-xs text-white/50 bg-white/[0.06] px-2 py-0.5 rounded-full">
                            {wq.topic.name}
                          </span>
                        )}
                        {wq.errorReason && (
                          <span className="inline-flex items-center rounded-full bg-rose-500/10 text-rose-400 px-2 py-0.5 text-[11px] font-medium border border-rose-500/20">
                            {wq.errorReason.label}
                          </span>
                        )}
                      </div>
                      {wq.notes && (
                        <p className="text-xs text-white/50 mt-1 italic truncate">{wq.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {difficultyInfo && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${difficultyInfo.bg} ${difficultyInfo.color}`}>
                          {difficultyInfo.label}
                        </span>
                      )}
                      {StatusIcon && statusInfo && (
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.color}`}>
                          <StatusIcon size={10} />
                          {statusInfo.label}
                        </span>
                      )}
                      {wq.photoUrl && (
                        <Camera className="w-4 h-4 text-pink-400" />
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty Questions */}
      {filteredEmpty.length > 0 && statusFilter === 'all' && (
        <div>
          <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full" />
            Bos Sorular ({filteredEmpty.length})
          </h3>
          <div className="space-y-2">
            {filteredEmpty.map((eq) => (
              <div
                key={eq.id}
                className="bg-white/[0.04] border border-pink-500/[0.12] rounded-lg p-3"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white/90 text-sm">S.{eq.questionNumber}</span>
                  <span className="text-xs text-white/40">{eq.subject.name}</span>
                  {eq.topic && (
                    <span className="text-xs text-white/50 bg-white/[0.06] px-2 py-0.5 rounded-full">
                      {eq.topic.name}
                    </span>
                  )}
                </div>
                {eq.notes && (
                  <p className="text-xs text-white/50 mt-1 italic">{eq.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Tab: Wrong Analysis ----------

function WrongAnalysisTab({ exam }: { exam: ExamDetail }) {
  const errorReasonData = useMemo(() => {
    const counts: Record<string, number> = {};
    exam.wrongQuestions.forEach((wq) => {
      const label = wq.errorReason?.label ?? 'Belirtilmemiş';
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [exam.wrongQuestions]);

  if (exam.wrongQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/40">
        <BookOpen className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">Yanlis soru bulunamadi</p>
        <p className="text-sm mt-1">Bu denemede yanlis yapilan soru yok.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error Reason Pie Chart */}
      {errorReasonData.length > 0 && (
        <div className="bg-white/[0.04] border border-pink-500/[0.12] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white/60 mb-4 text-center">Hata Nedeni Dagilimi</h3>
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
                itemStyle={{ color: '#f472b6' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Wrong Questions List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white/60">
          Yanlis Sorular ({exam.wrongQuestions.length})
        </h3>
        {exam.wrongQuestions.map((wq) => (
          <motion.div
            key={wq.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.04] border border-pink-500/[0.12] rounded-lg p-4 hover:bg-white/[0.08] transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white/90 text-sm">
                    S.{wq.questionNumber}
                  </span>
                  {wq.topic && (
                    <>
                      <span className="text-white/20">&mdash;</span>
                      <span className="text-sm text-white/60">{wq.topic.name}</span>
                    </>
                  )}
                  {wq.errorReason && (
                    <>
                      <span className="text-white/20">&mdash;</span>
                      <span className="inline-flex items-center rounded-full bg-rose-500/10 text-rose-400 px-2 py-0.5 text-xs font-medium border border-rose-500/20">
                        {wq.errorReason.label}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-white/40 mt-0.5">{wq.subject.name}</p>
                {wq.notes && (
                  <p className="text-xs text-white/50 mt-2 italic leading-relaxed">{wq.notes}</p>
                )}
              </div>
              {wq.photoUrl && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-pink-400" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ---------- Tab: Topic Distribution ----------

function TopicDistributionTab({ exam }: { exam: ExamDetail }) {
  const topicData = useMemo(() => {
    const topicMap: Record<string, { topic: string; subject: string; count: number }> = {};
    exam.wrongQuestions.forEach((wq) => {
      const topicName = wq.topic?.name ?? 'Belirtilmemiş';
      const key = `${wq.subject.name}::${topicName}`;
      if (!topicMap[key]) {
        topicMap[key] = { topic: topicName, subject: wq.subject.name, count: 0 };
      }
      topicMap[key].count += 1;
    });
    return Object.values(topicMap).sort((a, b) => b.count - a.count);
  }, [exam.wrongQuestions]);

  const subjectNames = useMemo(() => {
    return [...new Set(topicData.map((d) => d.subject))];
  }, [topicData]);

  const subjectColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    subjectNames.forEach((name, idx) => {
      map[name] = CHART_COLORS[idx % CHART_COLORS.length];
    });
    return map;
  }, [subjectNames]);

  if (topicData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/40">
        <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">Konu verisi bulunamadi</p>
        <p className="text-sm mt-1">Bu denemede konu bazli analiz icin yeterli veri yok.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white/[0.04] border border-pink-500/[0.12] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white/60 mb-4 text-center">Konulara Gore Yanlis Sayisi</h3>
        <ResponsiveContainer width="100%" height={Math.max(300, topicData.length * 40)}>
          <BarChart
            data={topicData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(244,114,182,0.1)" />
            <XAxis type="number" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.5)' }} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="topic"
              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.7)' }}
              width={140}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', fontSize: '12px', background: '#151528', border: '1px solid rgba(244,114,182,0.2)', color: '#fff' }}
              formatter={(value: any, _name: any, props: any) => [
                value,
                props?.payload?.subject ?? '',
              ]}
            />
            <Bar dataKey="count" name="Yanlis" radius={[0, 6, 6, 0]}>
              {topicData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={subjectColorMap[entry.subject] ?? CHART_COLORS[0]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center mt-4 pt-3 border-t border-white/10">
          {subjectNames.map((name) => (
            <div key={name} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: subjectColorMap[name] }}
              />
              <span className="text-xs text-white/60">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Tab: Photos ----------

function PhotosTab({ exam }: { exam: ExamDetail }) {
  const photosQuestions = useMemo(() => {
    return exam.wrongQuestions.filter((wq) => wq.photoUrl);
  }, [exam.wrongQuestions]);

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (photosQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/40">
        <Image className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">Fotograf bulunamadi</p>
        <p className="text-sm mt-1">Bu denemede fotografa sahip soru yok.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {photosQuestions.map((wq) => (
          <motion.div
            key={wq.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/[0.04] border border-pink-500/[0.12] rounded-lg overflow-hidden hover:bg-white/[0.08] transition-colors cursor-pointer"
            onClick={() => setSelectedPhoto(wq.photoUrl)}
          >
            {/* Photo area */}
            <div className="relative bg-white/[0.03] aspect-[4/3] flex items-center justify-center overflow-hidden">
              {wq.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={wq.photoUrl}
                  alt={`Soru ${wq.questionNumber}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image className="w-10 h-10 text-white/20" />
              )}
              <Tape className="top-[-4px] left-1/2 -translate-x-1/2" />
            </div>

            {/* Info */}
            <div className="p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white/90 text-sm">
                  Soru {wq.questionNumber}
                </span>
                <span className="text-xs text-white/40">{wq.subject.name}</span>
              </div>
              {wq.topic && (
                <p className="text-xs text-white/50">{wq.topic.name}</p>
              )}
              {wq.errorReason && (
                <span className="inline-flex items-center rounded-full bg-rose-500/10 text-rose-400 px-2 py-0.5 text-xs font-medium border border-rose-500/20">
                  {wq.errorReason.label}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Full Photo Overlay */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={24} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPhoto}
              alt="Buyuk fotograf"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
  const [saving, setSaving] = useState(false);

  // Question detail modal
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);

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
      toast.error('Deneme silinirken hata olustu');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const startEditing = () => {
    if (!exam) return;
    setEditTitle(exam.title);
    setEditDate(new Date(exam.date).toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" }));
    setEditNotes('');
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/exams/${examId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          date: editDate,
          ...(editNotes && { notes: editNotes }),
        }),
      });
      if (!res.ok) throw new Error('Güncelleme başarısız');
      const updated = await res.json();
      setExam(prev => prev ? { ...prev, title: updated.title, date: updated.date } : prev);
      toast.success('Deneme guncellendi');
      setEditing(false);
    } catch {
      toast.error('Deneme guncellenirken hata olustu');
    } finally {
      setSaving(false);
    }
  };

  const handleQuestionUpdate = (questionId: string, updates: Partial<WrongQuestionDetail>) => {
    setExam(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        wrongQuestions: prev.wrongQuestions.map(q =>
          q.id === questionId ? { ...q, ...updates } : q
        ),
      };
    });
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchExam() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/exams/${examId}`);
        if (!res.ok) {
          throw new Error(`Sinav yuklenemedi (${res.status})`);
        }
        const data: ExamDetail = await res.json();
        if (!cancelled) {
          setExam(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata olustu');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchExam();
    return () => {
      cancelled = true;
    };
  }, [examId]);

  // ---------- Render ----------

  return (
    <>
      <Paper className="rounded-2xl min-h-[60vh]">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white/90 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Geri Don</span>
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
                      {/* Branş / Genel Toggle */}
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

                      {/* Exam Type Options */}
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
                title="Duzenle"
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
                  Bu denemeyi silmek istedigine emin misin? Bu islem geri alinamaz.
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
                <h3 className="text-sm font-semibold text-pink-400">Denemeyi Duzenle</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Baslik</label>
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
              Geri don
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
                        ${isActive
                          ? 'text-pink-400'
                          : 'text-white/50 hover:text-white/70'
                        }
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
                {activeTab === 'questions' && (
                  <QuestionsTab
                    exam={exam}
                    onQuestionClick={(idx) => setSelectedQuestionIndex(idx)}
                  />
                )}
                {activeTab === 'wrong' && <WrongAnalysisTab exam={exam} />}
                {activeTab === 'topics' && <TopicDistributionTab exam={exam} />}
                {activeTab === 'photos' && <PhotosTab exam={exam} />}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </Paper>

      {/* Question Detail Modal */}
      <AnimatePresence>
        {selectedQuestionIndex !== null && exam && exam.wrongQuestions[selectedQuestionIndex] && (
          <QuestionDetailModal
            examId={examId}
            question={exam.wrongQuestions[selectedQuestionIndex]}
            questions={exam.wrongQuestions}
            currentIndex={selectedQuestionIndex}
            onClose={() => setSelectedQuestionIndex(null)}
            onNavigate={(idx) => setSelectedQuestionIndex(idx)}
            onUpdate={handleQuestionUpdate}
          />
        )}
      </AnimatePresence>
    </>
  );
}
