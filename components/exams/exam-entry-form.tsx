"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Paper, Handwriting } from '@/components/skeuomorphic';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { ChevronRight, Save, Loader2 } from 'lucide-react';

interface ExamType {
  id: string;
  name: string;
  slug: string;
  subjects: Subject[];
}

interface Subject {
  id: string;
  name: string;
  questionCount: number;
  examTypeId: string;
  sortOrder: number;
}

interface SubjectResult {
  subjectId: string;
  subjectName: string;
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
}

interface ExamEntryFormProps {
  onClose: () => void;
  onExamCreated: (examId: string) => void;
}

export default function ExamEntryForm({ onClose, onExamCreated }: ExamEntryFormProps) {
  const [step, setStep] = useState(1);

  // Step 1: Basic info
  const [title, setTitle] = useState('');
  const [examTypeId, setExamTypeId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Data fetching
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingExamTypes, setLoadingExamTypes] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Step 2: Subject results
  const [results, setResults] = useState<SubjectResult[]>([]);

  // Submission
  const [submitting, setSubmitting] = useState(false);

  // Fetch exam types on mount
  useEffect(() => {
    async function fetchExamTypes() {
      try {
        const res = await fetch('/api/exam-types');
        if (!res.ok) throw new Error('Sınav türleri yüklenemedi');
        const data: ExamType[] = await res.json();
        setExamTypes(data);
      } catch (err) {
        toast.error('Sınav türleri yüklenirken hata oluştu');
      } finally {
        setLoadingExamTypes(false);
      }
    }
    fetchExamTypes();
  }, []);

  // Fetch subjects when exam type changes
  useEffect(() => {
    if (!examTypeId) {
      setSubjects([]);
      setResults([]);
      return;
    }

    async function fetchSubjects() {
      setLoadingSubjects(true);
      try {
        const res = await fetch(`/api/subjects/${examTypeId}`);
        if (!res.ok) throw new Error('Dersler yüklenemedi');
        const data: Subject[] = await res.json();
        setSubjects(data);
        setResults(
          data.map((s) => ({
            subjectId: s.id,
            subjectName: s.name,
            correctCount: 0,
            wrongCount: 0,
            emptyCount: 0,
          }))
        );
      } catch (err) {
        toast.error('Dersler yüklenirken hata oluştu');
      } finally {
        setLoadingSubjects(false);
      }
    }
    fetchSubjects();
  }, [examTypeId]);

  // Calculate nets
  const nets = useMemo(() => {
    return results.map((r) => r.correctCount - r.wrongCount / 4);
  }, [results]);

  const totalNet = useMemo(() => {
    return nets.reduce((sum, n) => sum + n, 0);
  }, [nets]);

  function updateResult(index: number, field: 'correctCount' | 'wrongCount' | 'emptyCount', value: number) {
    setResults((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: Math.max(0, value) };
      return updated;
    });
  }

  function canProceedToStep2() {
    return title.trim() !== '' && examTypeId !== '' && date !== '';
  }

  function goToStep2() {
    if (!canProceedToStep2()) {
      toast.error('Lütfen başlık, sınav türü ve tarih alanlarını doldurun');
      return;
    }
    setStep(2);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      // Step 1: Create exam
      const examRes = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          examTypeId,
          date,
          notes: notes.trim() || undefined,
        }),
      });

      if (!examRes.ok) {
        const err = await examRes.json();
        throw new Error(err.error || 'Sınav oluşturulamadı');
      }

      const exam = await examRes.json();

      // Step 2: Save subject results
      const resultsRes = await fetch(`/api/exams/${exam.id}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          results: results.map((r) => ({
            subjectId: r.subjectId,
            correctCount: r.correctCount,
            wrongCount: r.wrongCount,
            emptyCount: r.emptyCount,
          })),
        }),
      });

      if (!resultsRes.ok) {
        const err = await resultsRes.json();
        throw new Error(err.error || 'Sonuçlar kaydedilemedi');
      }

      toast.success('Sınav başarıyla kaydedildi!');
      onExamCreated(exam.id);
    } catch (err: any) {
      toast.error(err.message || 'Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClassName = "w-full p-2 rounded bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300";
  const buttonClassName = "bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition-colors font-bold";

  return (
    <Paper className="max-w-3xl mx-auto rounded-lg">
      {/* Progress indicator */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
          }`}
        >
          1
        </div>
        <div className={`flex-1 h-1 rounded ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'} transition-colors`} />
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
          }`}
        >
          2
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <Handwriting as="h2" className="text-2xl mb-6">
              Yeni Deneme Sınavı
            </Handwriting>

            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sınav Başlığı
                </label>
                <input
                  type="text"
                  placeholder="Örn: Özdebir TYT Deneme 3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClassName}
                />
              </div>

              {/* Exam Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sınav Türü
                </label>
                {loadingExamTypes ? (
                  <div className="flex items-center gap-2 text-slate-400 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Yükleniyor...</span>
                  </div>
                ) : (
                  <select
                    value={examTypeId}
                    onChange={(e) => setExamTypeId(e.target.value)}
                    className={inputClassName}
                  >
                    <option value="">Sınav türü seçin</option>
                    {examTypes.map((et) => (
                      <option key={et.id} value={et.id}>
                        {et.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sınav Tarihi
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputClassName}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notlar <span className="text-slate-400 font-normal">(isteğe bağlı)</span>
                </label>
                <textarea
                  placeholder="Sınavla ilgili notlarınız..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className={inputClassName + " resize-none"}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium"
              >
                Vazgeç
              </button>
              <button
                onClick={goToStep2}
                disabled={!canProceedToStep2()}
                className={`${buttonClassName} flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Devam Et
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            <Handwriting as="h2" className="text-2xl mb-6">
              Ders Sonuçları
            </Handwriting>

            {loadingSubjects ? (
              <div className="flex items-center justify-center gap-3 py-12 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Dersler yükleniyor...</span>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-300">
                        <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">
                          Ders
                        </th>
                        <th className="text-center py-2 px-3 text-sm font-semibold text-green-700 w-20">
                          Doğru
                        </th>
                        <th className="text-center py-2 px-3 text-sm font-semibold text-red-700 w-20">
                          Yanlış
                        </th>
                        <th className="text-center py-2 px-3 text-sm font-semibold text-slate-500 w-20">
                          Boş
                        </th>
                        <th className="text-center py-2 px-3 text-sm font-semibold text-blue-700 w-24">
                          Net
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => (
                        <tr
                          key={r.subjectId}
                          className="border-b border-slate-200 hover:bg-white/60 transition-colors"
                        >
                          <td className="py-2 px-3 text-sm font-medium text-slate-800">
                            {r.subjectName}
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min={0}
                              value={r.correctCount}
                              onChange={(e) =>
                                updateResult(i, 'correctCount', parseInt(e.target.value) || 0)
                              }
                              className="w-full p-1.5 rounded bg-white border border-slate-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min={0}
                              value={r.wrongCount}
                              onChange={(e) =>
                                updateResult(i, 'wrongCount', parseInt(e.target.value) || 0)
                              }
                              className="w-full p-1.5 rounded bg-white border border-slate-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min={0}
                              value={r.emptyCount}
                              onChange={(e) =>
                                updateResult(i, 'emptyCount', parseInt(e.target.value) || 0)
                              }
                              className="w-full p-1.5 rounded bg-white border border-slate-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                            />
                          </td>
                          <td className="py-2 px-3 text-center text-sm font-bold text-blue-700">
                            {nets[i].toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-300">
                        <td
                          colSpan={4}
                          className="py-3 px-3 text-right text-sm font-bold text-slate-700"
                        >
                          Toplam Net:
                        </td>
                        <td className="py-3 px-3 text-center text-lg font-bold text-blue-700">
                          {totalNet.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium"
                  >
                    Geri Dön
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={`${buttonClassName} flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Kaydet ve Devam Et
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Paper>
  );
}
