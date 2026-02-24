"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Handwriting, Tape } from '@/components/skeuomorphic';
import ExamEntryForm from '@/components/exams/exam-entry-form';
import WrongQuestionForm from '@/components/exams/wrong-question-form';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Plus, X, FileText, Filter, Loader2, ChevronRight } from 'lucide-react';
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
      setExams(data);
    } catch {
      toast.error('Denemeler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  const fetchExamTypes = useCallback(async () => {
    try {
      const res = await fetch('/api/exam-types');
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setExamTypes(data);
    } catch {
      // Silently fail
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
    <div className="h-full flex flex-col gap-6">
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
              <Handwriting className="text-3xl">Deneme Takibi</Handwriting>
              <button
                onClick={() => setView('new-exam')}
                className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2"
              >
                <Plus size={16} />
                Yeni Deneme Ekle
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Tümü
              </button>
              {examTypes.map((et) => (
                <button
                  key={et.id}
                  onClick={() => setFilterType(et.id)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    filterType === et.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {et.name}
                </button>
              ))}
            </div>

            {/* Exam Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            ) : exams.length === 0 ? (
              <Paper className="text-center py-16">
                <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                <Handwriting className="text-xl text-slate-400">Henüz deneme eklenmemiş</Handwriting>
                <p className="text-sm text-slate-400 mt-2">Yeni bir deneme ekleyerek başlayabilirsin</p>
              </Paper>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                {exams.map((exam, idx) => (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative group cursor-pointer"
                    onClick={() => router.push(`/exams/${exam.id}`)}
                  >
                    {/* Card */}
                    <div className="bg-white p-4 pb-5 shadow-md rounded-lg border border-slate-100 transform group-hover:-translate-y-1 group-hover:shadow-lg transition-all duration-300">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Handwriting className="text-lg leading-tight">{exam.title}</Handwriting>
                          <span className="text-xs text-slate-400">{formatDate(exam.date)}</span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          exam.examType.name === 'TYT' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {exam.examType.name}
                        </span>
                      </div>

                      {/* Net Score */}
                      <div className="text-center py-3 mb-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg">
                        <span className="text-3xl font-bold text-slate-800">
                          {getTotalNet(exam).toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-500 block mt-0.5">Toplam Net</span>
                      </div>

                      {/* Subject breakdown */}
                      <div className="space-y-1">
                        {exam.subjectResults.slice(0, 4).map((sr) => (
                          <div key={sr.subjectId} className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 truncate flex-1">{sr.subject.name}</span>
                            <div className="flex gap-2 items-center ml-2">
                              <span className="text-green-600 font-medium">{sr.correctCount}D</span>
                              <span className="text-red-500 font-medium">{sr.wrongCount}Y</span>
                              <span className="text-slate-400">{sr.emptyCount}B</span>
                              <span className="font-bold text-slate-700 w-10 text-right">{sr.netScore.toFixed(1)}</span>
                            </div>
                          </div>
                        ))}
                        {exam.subjectResults.length > 4 && (
                          <div className="text-xs text-slate-400 text-center pt-1">
                            +{exam.subjectResults.length - 4} ders daha
                          </div>
                        )}
                      </div>

                      {/* Arrow indicator */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="text-slate-300" size={20} />
                      </div>
                    </div>
                  </motion.div>
                ))}
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
