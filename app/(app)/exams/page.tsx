"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ExamEntryForm from '@/components/exams/exam-entry-form';
import WrongQuestionForm from '@/components/exams/wrong-question-form';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  Plus,
  Loader2,
  ChevronRight,
  FileArchive,
  Target,
  TrendingUp,
  BarChart3,
  Award,
  Hash,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getBranchGroupLabel } from '@/lib/constants';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface ExamListItem {
  id: string;
  title: string;
  date: string;
  examCategory?: string | null;
  examType: { id: string; name: string };
  subjectResults: Array<{
    subjectId: string;
    subject: { name: string };
    correctCount: number;
    wrongCount: number;
    emptyCount: number;
    netScore: number;
  }>;
}

type PageView = 'list' | 'new-exam' | 'wrong-questions';
type ExamModeFilter = 'all' | 'genel' | 'brans' | 'brans-fen' | 'brans-sosyal' | 'brans-matematik' | 'brans-tek';

const COLORS = ['#ff2a85', '#ff7eb3', '#00f0ff', '#bb66ff', '#ffb84d', '#ff3366', '#00e5ff', '#ff99cc', '#7c3aed', '#10b981'];

const tooltipStyle = {
  contentStyle: {
    borderRadius: '16px',
    border: '1px solid rgba(255,42,133,0.2)',
    backgroundColor: 'rgba(17,9,21,0.95)',
    boxShadow: '0 8px 32px rgba(255,42,133,0.15)',
    color: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(12px)',
    fontSize: '13px',
    fontWeight: 600,
  },
};

const MODE_FILTERS: { key: ExamModeFilter; label: string }[] = [
  { key: 'all', label: 'Hepsi' },
  { key: 'genel', label: 'Genel' },
  { key: 'brans', label: 'Tüm Branş' },
  { key: 'brans-fen', label: 'Fen' },
  { key: 'brans-sosyal', label: 'Sosyal' },
  { key: 'brans-matematik', label: 'Matematik' },
  { key: 'brans-tek', label: 'Tek Ders' },
];

function matchesMode(exam: ExamListItem, mode: ExamModeFilter): boolean {
  const cat = exam.examCategory;
  switch (mode) {
    case 'all':
      return true;
    case 'genel':
      return !cat;
    case 'brans':
      return !!cat && cat.startsWith('brans');
    case 'brans-fen':
      return cat === 'brans-fen';
    case 'brans-sosyal':
      return cat === 'brans-sosyal' || cat === 'brans-sosyal2';
    case 'brans-matematik':
      return cat === 'brans-matematik';
    case 'brans-tek':
      return cat === 'brans';
    default:
      return true;
  }
}

function getExamCategoryBadge(examCategory: string | null | undefined): { label: string; className: string } | null {
  if (!examCategory) return null;
  if (examCategory === 'brans') return { label: 'Tek Ders', className: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' };
  const label = getBranchGroupLabel(examCategory);
  if (label) return { label, className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
  return { label: 'Branş', className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
}

export default function ExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<ExamListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<PageView>('list');
  const [filterType, setFilterType] = useState<string>('all');
  const [examMode, setExamMode] = useState<ExamModeFilter>('all');
  const [examTypes, setExamTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [showCharts, setShowCharts] = useState(true);

  // For wrong question entry after exam creation
  const [newExamId, setNewExamId] = useState<string>('');
  const [newExamTypeId, setNewExamTypeId] = useState<string>('');
  const [newExamSubjectResults, setNewExamSubjectResults] = useState<Array<{
    subjectId: string;
    subjectName: string;
    wrongCount: number;
    emptyCount: number;
  }>>([]);

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      const params = filterType !== 'all' ? `?examTypeId=${filterType}` : '';
      const res = await fetch(`/api/exams${params}`);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      if (Array.isArray(data)) {
        setExams(data);
      }
    } catch (err) {
      console.error('Denemeler yüklenirken hata:', err);
      toast.error('Denemeler yüklenirken hata oluştu');
      setExams([]);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  const fetchExamTypes = useCallback(async () => {
    try {
      const res = await fetch('/api/exam-types');
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      if (Array.isArray(data)) {
        setExamTypes(data);
      }
    } catch (err) {
      console.error('Sınav türleri yüklenirken hata:', err);
      toast.error('Sınav türleri yüklenemedi');
      setExamTypes([]);
    }
  }, []);

  useEffect(() => {
    fetchExamTypes();
  }, [fetchExamTypes]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleExamCreated = async (examId: string) => {
    try {
      const res = await fetch(`/api/exams/${examId}`);
      if (!res.ok) throw new Error('Fetch failed');
      const exam = await res.json();

      setNewExamId(examId);
      setNewExamTypeId(exam.examTypeId);
      setNewExamSubjectResults(
        exam.subjectResults.map((sr: any) => ({
          subjectId: sr.subjectId,
          subjectName: sr.subject.name,
          wrongCount: sr.wrongCount,
          emptyCount: sr.emptyCount,
        }))
      );
      setView('wrong-questions');
    } catch {
      toast.error('Deneme detayları yüklenemedi');
      setView('list');
      fetchExams();
    }
  };

  const handleWrongQuestionsComplete = () => {
    setView('list');
    fetchExams();
    toast.success('Deneme ve yanlış/boş bilgileri kaydedildi!');
  };

  const getTotalNet = (exam: ExamListItem) => {
    return exam.subjectResults.reduce((sum, sr) => sum + sr.netScore, 0);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  // ---------- Filtered exams ----------
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => matchesMode(exam, examMode));
  }, [exams, examMode]);

  // ---------- Chart data ----------
  const stats = useMemo(() => {
    if (filteredExams.length === 0) return null;
    const nets = filteredExams.map((e) => getTotalNet(e));
    const maxNet = Math.max(...nets);
    const avgNet = nets.reduce((a, b) => a + b, 0) / nets.length;
    const lastNet = nets[0]; // exams sorted desc
    return {
      count: filteredExams.length,
      maxNet: maxNet.toFixed(1),
      avgNet: avgNet.toFixed(1),
      lastNet: lastNet.toFixed(1),
    };
  }, [filteredExams]);

  const trendData = useMemo(() => {
    return [...filteredExams]
      .reverse()
      .map((e) => ({
        date: formatDateShort(e.date),
        net: parseFloat(getTotalNet(e).toFixed(1)),
        title: e.title,
      }));
  }, [filteredExams]);

  const subjectAvgData = useMemo(() => {
    const subjectMap = new Map<string, { total: number; count: number }>();
    for (const exam of filteredExams) {
      for (const sr of exam.subjectResults) {
        const existing = subjectMap.get(sr.subject.name) || { total: 0, count: 0 };
        existing.total += sr.netScore;
        existing.count += 1;
        subjectMap.set(sr.subject.name, existing);
      }
    }
    return Array.from(subjectMap.entries())
      .map(([name, { total, count }]) => ({
        name,
        avg: parseFloat((total / count).toFixed(1)),
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [filteredExams]);

  return (
    <div className="h-full flex flex-col gap-8">
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Header */}
            <div className="flex justify-between items-end">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
                Deneme Takibi
              </h1>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView('new-exam')}
                className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(255,42,133,0.3)] hover:shadow-[0_0_25px_rgba(255,42,133,0.5)] border border-pink-400/20 transition-all font-bold text-sm flex items-center gap-2"
              >
                <Plus size={18} />
                Yeni Ekle
              </motion.button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide flex-wrap">
              <button
                onClick={() => setFilterType('all')}
                className={`px-5 py-2 rounded-xl text-sm font-bold tracking-wide transition-all border ${filterType === 'all'
                    ? 'bg-white/10 text-white border-white/20 shadow-[0_4px_20px_-4px_rgba(255,255,255,0.1)]'
                    : 'bg-white/[0.02] text-white/50 border-white/5 hover:bg-white/[0.04] hover:text-white/80'
                  }`}
              >
                Tümü
              </button>
              {examTypes.map((et) => (
                <button
                  key={et.id}
                  onClick={() => setFilterType(et.id)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold tracking-wide transition-all border ${filterType === et.id
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.3)]'
                      : 'bg-white/[0.02] text-white/50 border-white/5 hover:bg-white/[0.04] hover:text-white/80'
                    }`}
                >
                  {et.name}
                </button>
              ))}
              <div className="w-px h-8 bg-white/10 self-center mx-1" />
              {MODE_FILTERS.map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => setExamMode(mode.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all border whitespace-nowrap ${examMode === mode.key
                      ? 'bg-pink-500/20 text-pink-300 border-pink-500/30 shadow-[0_4px_20px_-4px_rgba(244,114,182,0.3)]'
                      : 'bg-white/[0.02] text-white/50 border-white/5 hover:bg-white/[0.04] hover:text-white/80'
                    }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Charts Section */}
            {!loading && filteredExams.length > 0 && stats && (
              <div className="space-y-4">
                {/* Toggle */}
                <button
                  onClick={() => setShowCharts((p) => !p)}
                  className="flex items-center gap-2 text-xs font-bold text-white/40 hover:text-white/60 transition-colors uppercase tracking-widest"
                >
                  <BarChart3 size={14} />
                  {showCharts ? 'Grafikleri Gizle' : 'Grafikleri Göster'}
                </button>

                <AnimatePresence>
                  {showCharts && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5 overflow-hidden"
                    >
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { icon: Hash, label: 'Toplam Deneme', value: stats.count, color: 'text-purple-400' },
                          { icon: Award, label: 'En Yüksek Net', value: stats.maxNet, color: 'text-cyan-400' },
                          { icon: TrendingUp, label: 'Ortalama Net', value: stats.avgNet, color: 'text-pink-400' },
                          { icon: Target, label: 'Son Deneme', value: stats.lastNet, color: 'text-amber-400' },
                        ].map((stat) => (
                          <div key={stat.label} className="glass-panel p-4 text-center space-y-1">
                            <stat.icon size={18} className={`mx-auto ${stat.color}`} />
                            <p className="text-xl font-black text-white/90 font-mono">{stat.value}</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">{stat.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Charts Row */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Net Trend */}
                        {trendData.length >= 2 && (
                          <div className="glass-panel p-5">
                            <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <TrendingUp size={14} className="text-pink-400" />
                              Net Gidişatı
                            </h4>
                            <ResponsiveContainer width="100%" height={200}>
                              <AreaChart data={trendData}>
                                <defs>
                                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ff2a85" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#ff2a85" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                                <Tooltip {...tooltipStyle} />
                                <Area type="monotone" dataKey="net" stroke="#ff2a85" strokeWidth={2.5} fill="url(#netGrad)" dot={{ r: 4, fill: '#ff2a85', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Subject Average Bar Chart */}
                        {subjectAvgData.length > 0 && (
                          <div className="glass-panel p-5">
                            <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <BarChart3 size={14} className="text-cyan-400" />
                              Ders Ortalama Net
                            </h4>
                            <ResponsiveContainer width="100%" height={200}>
                              <BarChart data={subjectAvgData} layout="vertical" margin={{ left: 80 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} axisLine={false} tickLine={false} width={75} />
                                <Tooltip {...tooltipStyle} />
                                <Bar dataKey="avg" radius={[0, 6, 6, 0]} fill="#00f0ff" barSize={16}>
                                  {subjectAvgData.map((_, idx) => (
                                    <rect key={idx} fill={COLORS[idx % COLORS.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Exam Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-pink-400" size={40} />
              </div>
            ) : filteredExams.length === 0 ? (
              <div className="glass-panel text-center py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-transparent pointer-events-none" />
                <FileArchive className="mx-auto text-pink-500/50 mb-6 drop-shadow-[0_0_15px_rgba(255,42,133,0.3)]" size={64} />
                <h3 className="text-2xl font-bold text-white mb-3">Henüz deneme eklenmemiş</h3>
                <p className="text-base text-white/50 mb-0">Yeni bir deneme ekleyerek başlayabilirsin</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                {filteredExams.map((exam, idx) => {
                  const categoryBadge = getExamCategoryBadge(exam.examCategory);
                  return (
                    <motion.div
                      key={exam.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group cursor-pointer h-full"
                      onClick={() => router.push(`/exams/${exam.id}`)}
                    >
                      {/* Card */}
                      <div className="glass-panel p-6 h-full flex flex-col transform group-hover:-translate-y-1.5 transition-all duration-300 group-hover:shadow-[0_8px_30px_-4px_rgba(255,42,133,0.15)] group-hover:border-pink-500/30 relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-[40px] group-hover:bg-pink-500/10 transition-colors" />

                        {/* Header */}
                        <div className="flex items-start justify-between mb-5 relative z-10">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-bold text-white leading-tight mb-1 group-hover:text-pink-300 transition-colors truncate">{exam.title}</h4>
                            <span className="text-[11px] font-semibold text-white/40 tracking-wider uppercase">{formatDate(exam.date)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {categoryBadge && (
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md tracking-wider ${categoryBadge.className}`}>
                                {categoryBadge.label}
                              </span>
                            )}
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-md tracking-widest ${exam.examType.name === 'TYT' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              }`}>
                              {exam.examType.name}
                            </span>
                          </div>
                        </div>

                        {/* Net Score */}
                        <div className="text-center py-4 mb-5 rounded-xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-white/[0.01] relative z-10 overflow-hidden group/score">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-[200%] group-hover/score:animate-shimmer" />
                          <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 drop-shadow-[0_2px_10px_rgba(255,42,133,0.2)] font-mono">
                            {getTotalNet(exam).toFixed(1)}
                          </span>
                          <div className="flex items-center justify-center gap-1.5 mt-1.5">
                            <Target size={12} className="text-white/30" />
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Toplam Net</span>
                          </div>
                        </div>

                        {/* Subject breakdown */}
                        <div className="space-y-2 mt-auto relative z-10">
                          {exam.subjectResults.slice(0, 4).map((sr) => (
                            <div key={sr.subjectId} className="flex items-center justify-between text-[13px] bg-white/[0.02] px-3 py-2 rounded-lg border border-white/5">
                              <span className="text-white/70 font-medium truncate flex-1">{sr.subject.name}</span>
                              <div className="flex gap-2.5 items-center ml-3 font-mono">
                                <span className="text-emerald-400 font-bold">{sr.correctCount}</span>
                                <span className="text-rose-400 font-bold">{sr.wrongCount}</span>
                                <span className="text-white/30 font-bold">{sr.emptyCount}</span>
                                <span className="font-black text-pink-300 w-10 text-right bg-pink-500/10 px-1 py-0.5 rounded">{sr.netScore.toFixed(1)}</span>
                              </div>
                            </div>
                          ))}
                          {exam.subjectResults.length > 4 && (
                            <div className="text-[11px] font-bold text-white/30 text-center pt-2 tracking-wide uppercase">
                              +{exam.subjectResults.length - 4} ders daha
                            </div>
                          )}
                        </div>

                        {/* Arrow indicator */}
                        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0 z-10">
                          <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30 shadow-[0_0_10px_rgba(255,42,133,0.3)] group-hover:shadow-[0_0_15px_rgba(255,42,133,0.5)]">
                            <ChevronRight className="text-pink-100" size={16} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {view === 'new-exam' && (
          <motion.div
            key="new-exam"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="pb-12"
          >
            <ExamEntryForm
              onClose={() => setView('list')}
              onExamCreated={handleExamCreated}
            />
          </motion.div>
        )}

        {view === 'wrong-questions' && (
          <motion.div
            key="wrong-questions"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="pb-12"
          >
            <WrongQuestionForm
              examId={newExamId}
              examTypeId={newExamTypeId}
              subjectResults={newExamSubjectResults}
              onComplete={handleWrongQuestionsComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
