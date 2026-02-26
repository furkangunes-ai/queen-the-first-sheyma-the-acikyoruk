"use client";

import React, { useState, useEffect, useCallback } from 'react';
import ExamEntryForm from '@/components/exams/exam-entry-form';
import WrongQuestionForm from '@/components/exams/wrong-question-form';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Plus, X, FileText, Filter, Loader2, ChevronRight, FileArchive, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ExamListItem {
  id: string;
  title: string;
  date: string;
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

export default function ExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<ExamListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<PageView>('list');
  const [filterType, setFilterType] = useState<string>('all');
  const [examMode, setExamMode] = useState<'all' | 'genel' | 'brans'>('all');
  const [examTypes, setExamTypes] = useState<Array<{ id: string; name: string }>>([]);

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
    // Fetch the newly created exam to get its subject results
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

  return (
    <div className="h-full flex flex-col gap-8">
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-8"
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
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
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
              {([
                { key: 'all' as const, label: 'Hepsi' },
                { key: 'genel' as const, label: 'Genel Deneme' },
                { key: 'brans' as const, label: 'Branş' },
              ]).map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => setExamMode(mode.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all border ${examMode === mode.key
                      ? 'bg-pink-500/20 text-pink-300 border-pink-500/30 shadow-[0_4px_20px_-4px_rgba(244,114,182,0.3)]'
                      : 'bg-white/[0.02] text-white/50 border-white/5 hover:bg-white/[0.04] hover:text-white/80'
                    }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Exam Grid */}
            {(() => {
              const filteredExams = exams.filter((exam) => {
                if (examMode === 'genel') return exam.subjectResults.length > 1;
                if (examMode === 'brans') return exam.subjectResults.length === 1;
                return true;
              });
              return loading ? (
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
                {filteredExams.map((exam, idx) => (
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
                        <div>
                          <h4 className="text-lg font-bold text-white leading-tight mb-1 group-hover:text-pink-300 transition-colors">{exam.title}</h4>
                          <span className="text-[11px] font-semibold text-white/40 tracking-wider uppercase">{formatDate(exam.date)}</span>
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-md tracking-widest ${exam.examType.name === 'TYT' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}>
                          {exam.examType.name}
                        </span>
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
                ))}
              </div>
            );
            })()}
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
