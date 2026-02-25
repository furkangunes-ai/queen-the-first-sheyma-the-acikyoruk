"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Paper, Handwriting, Tape } from '@/components/skeuomorphic';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Camera, BookOpen, PieChart as PieChartIcon, BarChart3, Image, Trash2, Pencil, Check, X, Loader2, ListOrdered, Target, CheckCircle, AlertTriangle, RefreshCw, Filter } from 'lucide-react';
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

interface ExamDetail {
  id: string;
  title: string;
  date: string;
  examType: { name: string };
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

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const TABS = [
  { key: 'summary', label: 'Ozet', icon: BookOpen },
  { key: 'questions', label: 'Sorular', icon: ListOrdered },
  { key: 'wrong', label: 'Yanlis Analizi', icon: PieChartIcon },
  { key: 'topics', label: 'Konu Dagilimi', icon: BarChart3 },
  { key: 'photos', label: 'Fotograflar', icon: Image },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const DIFFICULTY_MAP: Record<string, { label: string; color: string; bg: string }> = {
  kolay: { label: 'Kolay', color: 'text-green-700', bg: 'bg-green-100 border-green-200' },
  orta: { label: 'Orta', color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200' },
  zor: { label: 'Zor', color: 'text-red-700', bg: 'bg-red-100 border-red-200' },
};

const STATUS_MAP: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  anladim: { label: 'Anladim', icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200' },
  tekrar: { label: 'Tekrar Lazim', icon: RefreshCw, color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200' },
  anlamadim: { label: 'Anlamadim', icon: AlertTriangle, color: 'text-red-700', bg: 'bg-red-100 border-red-200' },
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
        <div className="w-8 h-8 bg-slate-200 rounded" />
        <div className="h-8 w-64 bg-slate-200 rounded" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-lg" />
        ))}
      </div>
      <div className="h-64 bg-slate-200 rounded-lg" />
      <div className="h-48 bg-slate-200 rounded-lg" />
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
          <span className="text-sm text-slate-500">{formatDateTR(exam.date)}</span>
          <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 px-3 py-0.5 text-xs font-medium border border-indigo-200">
            {exam.examType.name}
          </span>
        </div>
      </div>

      {/* Total Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Dogru', value: totals.correct, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Yanlis', value: totals.wrong, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
          { label: 'Bos', value: totals.empty, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
          { label: 'Net', value: totals.net.toFixed(2), color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bg} ${stat.border} border rounded-xl p-4 text-center shadow-sm`}
          >
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Subject Results Table */}
      {exam.subjectResults.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-300">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Ders</th>
                <th className="text-center py-3 px-4 font-semibold text-emerald-700">Dogru</th>
                <th className="text-center py-3 px-4 font-semibold text-red-700">Yanlis</th>
                <th className="text-center py-3 px-4 font-semibold text-amber-700">Bos</th>
                <th className="text-center py-3 px-4 font-semibold text-indigo-700">Net</th>
              </tr>
            </thead>
            <tbody>
              {exam.subjectResults.map((sr, idx) => (
                <tr
                  key={sr.subjectId}
                  className={`border-b border-slate-200 ${idx % 2 === 0 ? 'bg-white/60' : 'bg-slate-50/60'}`}
                >
                  <td className="py-3 px-4 font-medium text-slate-800">{sr.subject.name}</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-semibold">{sr.correctCount}</td>
                  <td className="py-3 px-4 text-center text-red-600 font-semibold">{sr.wrongCount}</td>
                  <td className="py-3 px-4 text-center text-amber-600 font-semibold">{sr.emptyCount}</td>
                  <td className="py-3 px-4 text-center text-indigo-600 font-bold">{sr.netScore.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Radar Chart */}
      {radarData.length >= 3 && (
        <div className="bg-white/60 border border-slate-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-600 mb-4 text-center">Ders Bazinda Net Dagilimi</h3>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 12, fill: '#475569' }}
              />
              <PolarRadiusAxis
                angle={30}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
              />
              <Radar
                name="Net"
                dataKey="net"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Tooltip
                formatter={(value: number) => [value.toFixed(2), 'Net']}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
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
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
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
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
            <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-emerald-700">{statusCounts.anladim}</p>
            <p className="text-[10px] text-emerald-600 uppercase font-medium">Anladim</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
            <RefreshCw className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-amber-700">{statusCounts.tekrar}</p>
            <p className="text-[10px] text-amber-600 uppercase font-medium">Tekrar Lazim</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-700">{statusCounts.anlamadim}</p>
            <p className="text-[10px] text-red-600 uppercase font-medium">Anlamadim</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
            <Target className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-slate-600">{statusCounts.none}</p>
            <p className="text-[10px] text-slate-500 uppercase font-medium">Belirtilmemis</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="text-sm p-1.5 rounded bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
          className="text-sm p-1.5 rounded bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="all">Tum Durumlar</option>
          <option value="anladim">Anladim</option>
          <option value="tekrar">Tekrar Lazim</option>
          <option value="anlamadim">Anlamadim</option>
          <option value="none">Belirtilmemis</option>
        </select>
      </div>

      {/* Wrong Questions */}
      {filteredWrong.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
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
                  className="w-full text-left bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-sm">
                          S.{wq.questionNumber}
                        </span>
                        <span className="text-xs text-slate-400">{wq.subject.name}</span>
                        {wq.topic && (
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {wq.topic.name}
                          </span>
                        )}
                        {wq.errorReason && (
                          <span className="inline-flex items-center rounded-full bg-red-50 text-red-600 px-2 py-0.5 text-[11px] font-medium border border-red-200">
                            {wq.errorReason.label}
                          </span>
                        )}
                      </div>
                      {wq.notes && (
                        <p className="text-xs text-slate-500 mt-1 italic truncate">{wq.notes}</p>
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
                        <Camera className="w-4 h-4 text-blue-400" />
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
          <h3 className="text-sm font-semibold text-amber-600 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full" />
            Bos Sorular ({filteredEmpty.length})
          </h3>
          <div className="space-y-2">
            {filteredEmpty.map((eq) => (
              <div
                key={eq.id}
                className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-800 text-sm">S.{eq.questionNumber}</span>
                  <span className="text-xs text-slate-400">{eq.subject.name}</span>
                  {eq.topic && (
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {eq.topic.name}
                    </span>
                  )}
                </div>
                {eq.notes && (
                  <p className="text-xs text-slate-500 mt-1 italic">{eq.notes}</p>
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
      const label = wq.errorReason?.label ?? 'Belirtilmemis';
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [exam.wrongQuestions]);

  if (exam.wrongQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
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
        <div className="bg-white/60 border border-slate-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-600 mb-4 text-center">Hata Nedeni Dagilimi</h3>
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
                labelLine={{ stroke: '#94a3b8' }}
              >
                {errorReasonData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Wrong Questions List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-600">
          Yanlis Sorular ({exam.wrongQuestions.length})
        </h3>
        {exam.wrongQuestions.map((wq) => (
          <motion.div
            key={wq.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800 text-sm">
                    S.{wq.questionNumber}
                  </span>
                  {wq.topic && (
                    <>
                      <span className="text-slate-300">&mdash;</span>
                      <span className="text-sm text-slate-600">{wq.topic.name}</span>
                    </>
                  )}
                  {wq.errorReason && (
                    <>
                      <span className="text-slate-300">&mdash;</span>
                      <span className="inline-flex items-center rounded-full bg-red-50 text-red-700 px-2 py-0.5 text-xs font-medium border border-red-200">
                        {wq.errorReason.label}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{wq.subject.name}</p>
                {wq.notes && (
                  <p className="text-xs text-slate-500 mt-2 italic leading-relaxed">{wq.notes}</p>
                )}
              </div>
              {wq.photoUrl && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-indigo-500" />
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
      const topicName = wq.topic?.name ?? 'Belirtilmemis';
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
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">Konu verisi bulunamadi</p>
        <p className="text-sm mt-1">Bu denemede konu bazli analiz icin yeterli veri yok.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white/60 border border-slate-200 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-600 mb-4 text-center">Konulara Gore Yanlis Sayisi</h3>
        <ResponsiveContainer width="100%" height={Math.max(300, topicData.length * 40)}>
          <BarChart
            data={topicData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="topic"
              tick={{ fontSize: 11, fill: '#475569' }}
              width={140}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
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
        <div className="flex flex-wrap gap-4 justify-center mt-4 pt-3 border-t border-slate-100">
          {subjectNames.map((name) => (
            <div key={name} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: subjectColorMap[name] }}
              />
              <span className="text-xs text-slate-600">{name}</span>
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
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
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
            className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedPhoto(wq.photoUrl)}
          >
            {/* Photo area */}
            <div className="relative bg-slate-100 aspect-[4/3] flex items-center justify-center overflow-hidden">
              {wq.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={wq.photoUrl}
                  alt={`Soru ${wq.questionNumber}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image className="w-10 h-10 text-slate-300" />
              )}
              <Tape className="top-[-4px] left-1/2 -translate-x-1/2" />
            </div>

            {/* Info */}
            <div className="p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 text-sm">
                  Soru {wq.questionNumber}
                </span>
                <span className="text-xs text-slate-400">{wq.subject.name}</span>
              </div>
              {wq.topic && (
                <p className="text-xs text-slate-500">{wq.topic.name}</p>
              )}
              {wq.errorReason && (
                <span className="inline-flex items-center rounded-full bg-red-50 text-red-700 px-2 py-0.5 text-xs font-medium border border-red-200">
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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/exams/${examId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Silme basarisiz');
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
    setEditDate(new Date(exam.date).toISOString().split('T')[0]);
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
      if (!res.ok) throw new Error('Guncelleme basarisiz');
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
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Geri Don</span>
          </button>

          {exam && !loading && (
            <div className="flex items-center gap-2">
              <button
                onClick={startEditing}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Duzenle"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium mb-3">
                  Bu denemeyi silmek istedigine emin misin? Bu islem geri alinamaz.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Evet, Sil
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
                  >
                    Iptal
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-blue-800">Denemeyi Duzenle</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Baslik</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Tarih</label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={e => setEditDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving || !editTitle.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Kaydet
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    disabled={saving}
                    className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Iptal
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
          <div className="flex flex-col items-center justify-center py-20 text-red-500">
            <p className="text-lg font-medium">Hata</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={onBack}
              className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 underline"
            >
              Geri don
            </button>
          </div>
        )}

        {/* Content */}
        {exam && !loading && (
          <>
            {/* Tab Navigation */}
            <div className="border-b border-slate-200 mb-6">
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
                          ? 'text-indigo-600'
                          : 'text-slate-500 hover:text-slate-700'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="exam-detail-tab-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
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
                {activeTab === 'summary' && <SummaryTab exam={exam} />}
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
