"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { ChevronRight, Save, Loader2, FileText, CheckCircle2 } from 'lucide-react';

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
  const [examCategory, setExamCategory] = useState<'genel' | 'brans'>('genel');
  const [branchSubjectId, setBranchSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [examTypeId, setExamTypeId] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" });
  });
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
        const data = await res.json();
        if (Array.isArray(data)) {
          setExamTypes(data);
        } else {
          throw new Error('Beklenmeyen veri formatı');
        }
      } catch {
        toast.error('Sınav türleri yüklenirken hata oluştu');
        setExamTypes([]);
      } finally {
        setLoadingExamTypes(false);
      }
    }
    fetchExamTypes();
  }, []);

  // Reset branchSubjectId when switching category or examType
  useEffect(() => {
    setBranchSubjectId('');
  }, [examCategory, examTypeId]);

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
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Beklenmeyen veri formatı');
        setSubjects(data);
        // Only set all results for genel mode; for brans, results are set when branch subject is selected
        if (examCategory === 'genel') {
          setResults(
            data.map((s: Subject) => ({
              subjectId: s.id,
              subjectName: s.name,
              correctCount: 0,
              wrongCount: 0,
              emptyCount: 0,
            }))
          );
        }
      } catch {
        toast.error('Dersler yüklenirken hata oluştu');
        setSubjects([]);
        setResults([]);
      } finally {
        setLoadingSubjects(false);
      }
    }
    fetchSubjects();
  }, [examTypeId, examCategory]);

  // When branch subject is selected, set results to only that subject
  useEffect(() => {
    if (examCategory === 'brans' && branchSubjectId) {
      const subject = subjects.find(s => s.id === branchSubjectId);
      if (subject) {
        setResults([{
          subjectId: subject.id,
          subjectName: subject.name,
          correctCount: 0,
          wrongCount: 0,
          emptyCount: 0,
        }]);
      }
    }
  }, [branchSubjectId, examCategory, subjects]);

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
    const baseValid = title.trim() !== '' && examTypeId !== '' && date !== '';
    if (examCategory === 'brans') {
      return baseValid && branchSubjectId !== '';
    }
    return baseValid;
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
          examCategory: examCategory === 'brans' ? 'brans' : undefined,
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

  const inputClassName = "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-[15px] font-medium text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-400/30 transition-all hover:border-white/20";
  const buttonClassName = "bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(255,42,133,0.3)] hover:shadow-[0_0_25px_rgba(255,42,133,0.5)] border border-pink-400/20 transition-all font-bold tracking-wide text-sm flex items-center justify-center gap-2";

  return (
    <div className="glass-panel p-6 sm:p-8 max-w-3xl mx-auto relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Progress indicator */}
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300 shadow-lg ${step >= 1 ? 'bg-gradient-to-br from-pink-400 to-pink-600 text-white shadow-pink-500/30' : 'bg-white/10 text-white/50 border border-white/5'
            }`}
        >
          {step > 1 ? <CheckCircle2 size={16} /> : '1'}
        </div>
        <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-pink-400 transition-all duration-500 ease-out"
            style={{ width: step >= 2 ? '100%' : '0%' }}
          />
        </div>
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300 shadow-lg ${step >= 2 ? 'bg-gradient-to-br from-pink-400 to-pink-600 text-white shadow-pink-500/30' : 'bg-white/10 text-white/50 border border-white/5'
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
            className="relative z-10"
          >
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
              <FileText size={24} className="text-pink-400" />
              <h2 className="text-2xl font-bold tracking-tight text-white">Yeni Deneme Sınavı</h2>
            </div>

            <div className="space-y-6">
              {/* Exam Category Toggle */}
              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-2">
                  Deneme Kategorisi
                </label>
                <div className="flex rounded-xl overflow-hidden border border-white/10 bg-white/[0.02]">
                  <button
                    type="button"
                    onClick={() => setExamCategory('genel')}
                    className={`flex-1 py-3 px-4 text-sm font-bold tracking-wide transition-all ${
                      examCategory === 'genel'
                        ? 'bg-gradient-to-r from-pink-500/20 to-pink-600/20 text-pink-400 border-r border-pink-500/20 shadow-[inset_0_0_20px_rgba(255,42,133,0.1)]'
                        : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03] border-r border-white/10'
                    }`}
                  >
                    Genel Deneme
                  </button>
                  <button
                    type="button"
                    onClick={() => setExamCategory('brans')}
                    className={`flex-1 py-3 px-4 text-sm font-bold tracking-wide transition-all ${
                      examCategory === 'brans'
                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 shadow-[inset_0_0_20px_rgba(245,158,11,0.1)]'
                        : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03]'
                    }`}
                  >
                    Branş Denemesi
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-2">
                  Sınav Başlığı
                </label>
                <input
                  type="text"
                  placeholder={examCategory === 'brans' ? 'Örn: Matematik Branş Denemesi 1' : 'Örn: Özdebir TYT Deneme 3'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClassName}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Exam Type */}
                <div>
                  <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-2">
                    Sınav Türü
                  </label>
                  {loadingExamTypes ? (
                    <div className="flex items-center gap-2 text-white/40 h-[46px] px-4">
                      <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                      <span className="text-sm font-medium">Yükleniyor...</span>
                    </div>
                  ) : (
                    <select
                      value={examTypeId}
                      onChange={(e) => setExamTypeId(e.target.value)}
                      className={`${inputClassName} [color-scheme:dark]`}
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
                  <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-2">
                    Sınav Tarihi
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`${inputClassName} [color-scheme:dark]`}
                  />
                </div>
              </div>

              {/* Branch Subject Picker - only shown in brans mode */}
              {examCategory === 'brans' && examTypeId && (
                <div>
                  <label className="block text-[11px] font-bold text-amber-400/70 uppercase tracking-widest px-1 mb-2">
                    Branş Dersi
                  </label>
                  {loadingSubjects ? (
                    <div className="flex items-center gap-2 text-white/40 h-[46px] px-4">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span className="text-sm font-medium">Dersler yükleniyor...</span>
                    </div>
                  ) : (
                    <select
                      value={branchSubjectId}
                      onChange={(e) => setBranchSubjectId(e.target.value)}
                      className={`${inputClassName} [color-scheme:dark] !border-amber-500/20 focus:!ring-amber-400/50 focus:!border-amber-400/30`}
                    >
                      <option value="">Branş dersi seçin</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.questionCount} soru)
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-2">
                  Notlar <span className="text-white/30 font-semibold">(isteğe bağlı)</span>
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
            <div className="flex justify-between items-center mt-10">
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white/80 transition-colors text-sm font-bold tracking-wider uppercase"
              >
                Vazgeç
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={goToStep2}
                disabled={!canProceedToStep2()}
                className={`${buttonClassName} opacity-100 disabled:opacity-50`}
              >
                DEVAM ET
                <ChevronRight className="w-4 h-4 ml-1 relative top-[1px]" />
              </motion.button>
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
            className="relative z-10 flex flex-col h-full"
          >
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
              <FileText size={24} className={examCategory === 'brans' ? 'text-amber-400' : 'text-cyan-400'} />
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {examCategory === 'brans' ? 'Branş Sonuçları' : 'Ders Sonuçları'}
                </h2>
                {examCategory === 'brans' && results.length > 0 && (
                  <p className="text-sm text-amber-400/70 mt-1">
                    {results[0].subjectName} branş denemesi
                  </p>
                )}
              </div>
            </div>

            {loadingSubjects ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-white/40">
                <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
                <span className="font-medium tracking-wide">Dersler yükleniyor...</span>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-white/[0.03] border-b border-white/10">
                        <th className="text-left py-4 px-5 text-[11px] uppercase tracking-widest font-bold text-white/50">
                          Ders
                        </th>
                        <th className="text-center py-4 px-3 text-[11px] uppercase tracking-widest font-bold text-emerald-400 w-24">
                          Doğru
                        </th>
                        <th className="text-center py-4 px-3 text-[11px] uppercase tracking-widest font-bold text-rose-400 w-24">
                          Yanlış
                        </th>
                        <th className="text-center py-4 px-3 text-[11px] uppercase tracking-widest font-bold text-white/50 w-24">
                          Boş
                        </th>
                        <th className="text-center py-4 px-5 text-[11px] uppercase tracking-widest font-bold text-pink-400 w-24">
                          Net
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => (
                        <tr
                          key={r.subjectId}
                          className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-3 px-5 text-sm font-bold text-white/90">
                            {r.subjectName}
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              min={0}
                              value={r.correctCount}
                              onChange={(e) =>
                                updateResult(i, 'correctCount', parseInt(e.target.value) || 0)
                              }
                              className="w-full py-2 px-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center text-[15px] font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors hover:border-emerald-500/40"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              min={0}
                              value={r.wrongCount}
                              onChange={(e) =>
                                updateResult(i, 'wrongCount', parseInt(e.target.value) || 0)
                              }
                              className="w-full py-2 px-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center text-[15px] font-bold text-white focus:outline-none focus:ring-1 focus:ring-rose-400 transition-colors hover:border-rose-500/40"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              min={0}
                              value={r.emptyCount}
                              onChange={(e) =>
                                updateResult(i, 'emptyCount', parseInt(e.target.value) || 0)
                              }
                              className="w-full py-2 px-1 rounded-lg bg-white/[0.04] border border-white/10 text-center text-[15px] font-bold text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-colors hover:border-white/20"
                            />
                          </td>
                          <td className="py-3 px-5 text-center text-[15px] font-black text-pink-400 bg-pink-500/[0.03]">
                            {nets[i].toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gradient-to-r from-pink-500/[0.02] to-pink-500/[0.05] border-t border-white/10">
                        <td
                          colSpan={4}
                          className="py-4 px-5 text-right text-sm font-bold text-white/60 tracking-wide uppercase"
                        >
                          Toplam Net:
                        </td>
                        <td className="py-4 px-5 text-center text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 drop-shadow-[0_2px_10px_rgba(255,42,133,0.3)]">
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
                    className="text-white/40 hover:text-white/80 transition-colors text-sm font-bold tracking-wider uppercase"
                  >
                    Geri DÖN
                  </button>
                  <motion.button
                    whileHover="hover"
                    whileTap="tap"
                    variants={{
                      hover: { scale: 1.02 },
                      tap: { scale: 0.98 }
                    }}
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={`${buttonClassName} opacity-100 disabled:opacity-50`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        KAYDEDİLİYOR...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 ml-[-4px]" />
                        KAYDET VE GÖNDER
                      </>
                    )}
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
