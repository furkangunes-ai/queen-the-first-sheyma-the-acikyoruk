"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { ChevronRight, Save, Loader2, FileText, CheckCircle2, Zap, Sun, Moon, Sunrise, Volume2, VolumeX, Battery, BatteryLow, BatteryFull } from 'lucide-react';
import { BRANCH_GROUPS } from "@/lib/constants";
import {
  TIME_OF_DAY_OPTIONS,
  ENVIRONMENT_OPTIONS,
  BIOLOGICAL_STATE_OPTIONS,
  PERCEIVED_DIFFICULTY_OPTIONS,
} from "@/lib/severity";
import SubjectBlock from "./subject-block";
import type { QuestionState } from "./optical-grid";

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

/**
 * Sıcak Faz - Sınav Giriş Formu
 * Kognitif yorgunluk sonrası minimum sürtünme ile veri girişi.
 * Step 1: Temel bilgi (başlık, tür, tarih, kategori)
 * Step 2: Sayısal veri (doğru/yanlış/boş - saf integer input)
 * Step 3: Bağlam etiketleri (tek tıkla seçim)
 */
export default function ExamEntryForm({ onClose, onExamCreated }: ExamEntryFormProps) {
  const [step, setStep] = useState(1);

  // Step 1: Basic info
  const [examCategory, setExamCategory] = useState<'genel' | 'brans'>('genel');
  const [branchSubjectId, setBranchSubjectId] = useState('');
  const [branchMode, setBranchMode] = useState<'group' | 'tek-ders' | ''>('');
  const [selectedGroupKey, setSelectedGroupKey] = useState('');
  const [title, setTitle] = useState('');
  const [examTypeId, setExamTypeId] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" });
  });
  const [notes, setNotes] = useState('');

  // Step 3: Context tags (Sıcak Faz bağlam)
  const [timeOfDay, setTimeOfDay] = useState<string>('');
  const [environment, setEnvironment] = useState<string>('');
  const [perceivedDifficulty, setPerceivedDifficulty] = useState<number>(0);
  const [biologicalState, setBiologicalState] = useState<string>('');

  // Data fetching
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingExamTypes, setLoadingExamTypes] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const examTypeName = examTypes.find(et => et.id === examTypeId)?.name ?? '';

  // Step 2: Subject results
  const [results, setResults] = useState<SubjectResult[]>([]);
  // Mikro giriş: subjectId → Map<questionNumber, QuestionState>
  const [microEntries, setMicroEntries] = useState<Map<string, Map<number, QuestionState>>>(new Map());
  // Aksiyom 2: Ders bazı süre (dakika) — opsiyonel, hız ağırlığı için
  const [subjectDurations, setSubjectDurations] = useState<Map<string, number>>(new Map());

  // Submission
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchExamTypes() {
      try {
        const res = await fetch('/api/exam-types');
        if (!res.ok) throw new Error('Sınav türleri yüklenemedi');
        const data = await res.json();
        if (Array.isArray(data)) setExamTypes(data);
        else throw new Error('Beklenmeyen veri formatı');
      } catch {
        toast.error('Sınav türleri yüklenirken hata oluştu');
        setExamTypes([]);
      } finally {
        setLoadingExamTypes(false);
      }
    }
    fetchExamTypes();
  }, []);

  useEffect(() => {
    setBranchSubjectId('');
    setBranchMode('');
    setSelectedGroupKey('');
  }, [examCategory, examTypeId]);

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

  const nets = useMemo(() => {
    return results.map((r) => r.correctCount - r.wrongCount / 4);
  }, [results]);

  const totalNet = useMemo(() => {
    return nets.reduce((sum, n) => sum + n, 0);
  }, [nets]);

  // Mikro giriş: tek soru state değiştir
  const handleQuestionStateChange = useCallback(
    (subjectId: string, questionNumber: number, state: QuestionState) => {
      setMicroEntries((prev) => {
        const next = new Map(prev);
        const subjectMap = new Map(next.get(subjectId) || new Map());
        if (state === null) {
          subjectMap.delete(questionNumber);
        } else {
          subjectMap.set(questionNumber, state);
        }
        next.set(subjectId, subjectMap);
        return next;
      });
    },
    []
  );

  // Mikro giriş: toplu state uygula (vector parser'dan)
  const handleBulkQuestionStates = useCallback(
    (subjectId: string, states: Map<number, QuestionState>) => {
      setMicroEntries((prev) => {
        const next = new Map(prev);
        next.set(subjectId, states);
        return next;
      });
    },
    []
  );

  // Makro field değişikliği
  const handleMacroChange = useCallback(
    (index: number, field: 'correctCount' | 'wrongCount' | 'emptyCount', value: number) => {
      setResults((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    },
    []
  );

  function canProceedToStep2() {
    const baseValid = title.trim() !== '' && examTypeId !== '' && date !== '';
    if (examCategory === 'brans') {
      if (branchMode === 'group') return baseValid && selectedGroupKey !== '';
      if (branchMode === 'tek-ders') return baseValid && branchSubjectId !== '';
      return false;
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
      // Create exam with context fields
      const examRes = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          examTypeId,
          date,
          notes: notes.trim() || undefined,
          examCategory: examCategory === 'brans'
            ? (branchMode === 'group' && selectedGroupKey ? `brans-${selectedGroupKey}` : 'brans')
            : undefined,
          // Sıcak faz bağlam alanları
          timeOfDay: timeOfDay || undefined,
          environment: environment || undefined,
          perceivedDifficulty: perceivedDifficulty || undefined,
          biologicalState: biologicalState || undefined,
        }),
      });

      if (!examRes.ok) {
        const err = await examRes.json();
        throw new Error(err.error || 'Sınav oluşturulamadı');
      }

      const exam = await examRes.json();

      // Save subject results
      const resultsRes = await fetch(`/api/exams/${exam.id}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          results: results.map((r) => ({
            subjectId: r.subjectId,
            correctCount: r.correctCount,
            wrongCount: r.wrongCount,
            emptyCount: r.emptyCount,
            durationMinutes: subjectDurations.get(r.subjectId) || undefined,
          })),
        }),
      });

      if (!resultsRes.ok) {
        const err = await resultsRes.json();
        throw new Error(err.error || 'Sonuçlar kaydedilemedi');
      }

      // Mikro girişlerden RAW CognitiveVoid'lar oluştur
      const voidPromises: Promise<Response>[] = [];
      for (const [subjectId, stateMap] of microEntries) {
        for (const [questionNumber, state] of stateMap) {
          if (state) {
            voidPromises.push(
              fetch(`/api/exams/${exam.id}/cognitive-voids`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  subjectId,
                  source: state, // 'WRONG' veya 'EMPTY'
                  questionNumber,
                  magnitude: 1,
                }),
              })
            );
          }
        }
      }

      // Makro girişlerden de soru numarasız RAW void'lar oluştur
      // (mikro girişlerde işaretlenmemiş yanlış/boş'lar için)
      for (const r of results) {
        const subjectMicro = microEntries.get(r.subjectId);
        const microWrong = subjectMicro
          ? [...subjectMicro.values()].filter(s => s === 'WRONG').length
          : 0;
        const microEmpty = subjectMicro
          ? [...subjectMicro.values()].filter(s => s === 'EMPTY').length
          : 0;

        // Makro > mikro ise fark kadarını null-questionNumber olarak kaydet
        const extraWrong = Math.max(0, r.wrongCount - microWrong);
        const extraEmpty = Math.max(0, r.emptyCount - microEmpty);

        for (let i = 0; i < extraWrong; i++) {
          voidPromises.push(
            fetch(`/api/exams/${exam.id}/cognitive-voids`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                subjectId: r.subjectId,
                source: 'WRONG',
                magnitude: 1,
              }),
            })
          );
        }
        for (let i = 0; i < extraEmpty; i++) {
          voidPromises.push(
            fetch(`/api/exams/${exam.id}/cognitive-voids`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                subjectId: r.subjectId,
                source: 'EMPTY',
                magnitude: 1,
              }),
            })
          );
        }
      }

      if (voidPromises.length > 0) {
        await Promise.allSettled(voidPromises);
      }

      toast.success('Sınav kaydedildi! Dinlendikten sonra zafiyet analizini yapabilirsin.');
      onExamCreated(exam.id);
    } catch (err: any) {
      toast.error(err.message || 'Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClassName = "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-[15px] font-medium text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-400/30 transition-all hover:border-white/20";
  const buttonClassName = "bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(255,42,133,0.3)] hover:shadow-[0_0_25px_rgba(255,42,133,0.5)] border border-pink-400/20 transition-all font-bold tracking-wide text-sm flex items-center justify-center gap-2";

  // Context tag button component
  function ContextTag({
    selected,
    onClick,
    children,
    color = 'pink',
  }: {
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
    color?: 'pink' | 'amber' | 'cyan' | 'emerald';
  }) {
    const colors = {
      pink: selected
        ? 'bg-pink-500/20 text-pink-400 border-pink-500/30 shadow-[0_0_10px_rgba(255,42,133,0.15)]'
        : 'bg-white/[0.03] text-white/50 border-white/10 hover:bg-white/[0.06] hover:text-white/70',
      amber: selected
        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
        : 'bg-white/[0.03] text-white/50 border-white/10 hover:bg-white/[0.06] hover:text-white/70',
      cyan: selected
        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.15)]'
        : 'bg-white/[0.03] text-white/50 border-white/10 hover:bg-white/[0.06] hover:text-white/70',
      emerald: selected
        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(52,211,153,0.15)]'
        : 'bg-white/[0.03] text-white/50 border-white/10 hover:bg-white/[0.06] hover:text-white/70',
    };

    return (
      <button
        type="button"
        onClick={onClick}
        className={`py-2.5 px-4 rounded-xl text-sm font-bold tracking-wide transition-all border ${colors[color]}`}
      >
        {children}
      </button>
    );
  }

  const timeIcons = { sabah: <Sunrise size={14} />, ogle: <Sun size={14} />, aksam: <Moon size={14} /> };
  const envIcons = { sessiz: <VolumeX size={14} />, gurultulu: <Volume2 size={14} /> };
  const bioIcons = { dinc: <BatteryFull size={14} />, normal: <Battery size={14} />, yorgun: <BatteryLow size={14} /> };

  return (
    <div className="glass-panel p-6 sm:p-8 max-w-3xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Progress indicator - 3 steps */}
      <div className="flex items-center gap-2 mb-8 relative z-10">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300 shadow-lg ${
                step >= s
                  ? 'bg-gradient-to-br from-pink-400 to-pink-600 text-white shadow-pink-500/30'
                  : 'bg-white/10 text-white/50 border border-white/5'
              }`}
            >
              {step > s ? <CheckCircle2 size={16} /> : s}
            </div>
            {s < 3 && (
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-pink-400 transition-all duration-500 ease-out"
                  style={{ width: step > s ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ========= STEP 1: TEMEL BİLGİ ========= */}
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
                        <option key={et.id} value={et.id}>{et.name}</option>
                      ))}
                    </select>
                  )}
                </div>

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

              {/* Branch Type Picker */}
              {examCategory === 'brans' && examTypeId && (
                <div>
                  <label className="block text-[11px] font-bold text-amber-400/70 uppercase tracking-widest px-1 mb-2">
                    Branş Türü
                  </label>
                  {loadingSubjects ? (
                    <div className="flex items-center gap-2 text-white/40 h-[46px] px-4">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span className="text-sm font-medium">Yükleniyor...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {(BRANCH_GROUPS[examTypeName] || []).map((group) => (
                        <button
                          key={group.key}
                          type="button"
                          onClick={() => {
                            setBranchMode('group');
                            setSelectedGroupKey(group.key);
                            setBranchSubjectId('');
                            const groupSubjects = subjects.filter(s => group.subjectNames.includes(s.name));
                            setResults(groupSubjects.map(s => ({
                              subjectId: s.id,
                              subjectName: s.name,
                              correctCount: 0,
                              wrongCount: 0,
                              emptyCount: 0,
                            })));
                          }}
                          className={`py-3 px-4 rounded-xl text-sm font-bold tracking-wide transition-all border ${
                            branchMode === 'group' && selectedGroupKey === group.key
                              ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 border-amber-500/30 shadow-[inset_0_0_20px_rgba(245,158,11,0.1)]'
                              : 'bg-white/[0.03] text-white/50 border-white/10 hover:bg-white/[0.06] hover:text-white/70'
                          }`}
                        >
                          {group.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setBranchMode('tek-ders');
                          setSelectedGroupKey('');
                          setResults([]);
                        }}
                        className={`py-3 px-4 rounded-xl text-sm font-bold tracking-wide transition-all border ${
                          branchMode === 'tek-ders'
                            ? 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-400 border-purple-500/30 shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]'
                            : 'bg-white/[0.03] text-white/50 border-white/10 hover:bg-white/[0.06] hover:text-white/70'
                        }`}
                      >
                        Tek Ders
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Branch Subject Picker - tek-ders mode */}
              {examCategory === 'brans' && examTypeId && branchMode === 'tek-ders' && (
                <div>
                  <label className="block text-[11px] font-bold text-amber-400/70 uppercase tracking-widest px-1 mb-2">
                    Branş Dersi
                  </label>
                  <select
                    value={branchSubjectId}
                    onChange={(e) => setBranchSubjectId(e.target.value)}
                    className={`${inputClassName} [color-scheme:dark] !border-amber-500/20 focus:!ring-amber-400/50 focus:!border-amber-400/30`}
                  >
                    <option value="">Branş dersi seçin</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.questionCount} soru)</option>
                    ))}
                  </select>
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
                  rows={2}
                  className={inputClassName + " resize-none"}
                />
              </div>
            </div>

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

        {/* ========= STEP 2: SAYISAL VERİ (NUMPAD) ========= */}
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
                    {branchMode === 'group'
                      ? `${BRANCH_GROUPS[examTypeName]?.find(g => g.key === selectedGroupKey)?.label ?? ''} branş denemesi`
                      : `${results[0].subjectName} branş denemesi`
                    }
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
                <div className="space-y-3">
                  {results.map((r, i) => {
                    const subject = subjects.find(s => s.id === r.subjectId);
                    const questionCount = subject?.questionCount || 40;
                    return (
                      <SubjectBlock
                        key={r.subjectId}
                        subjectId={r.subjectId}
                        subjectName={r.subjectName}
                        questionCount={questionCount}
                        correctCount={r.correctCount}
                        wrongCount={r.wrongCount}
                        emptyCount={r.emptyCount}
                        questionStates={microEntries.get(r.subjectId) || new Map()}
                        onMacroChange={(field, value) => handleMacroChange(i, field, value)}
                        onQuestionStateChange={(qNum, state) => handleQuestionStateChange(r.subjectId, qNum, state)}
                        onBulkQuestionStates={(states) => handleBulkQuestionStates(r.subjectId, states)}
                        net={nets[i]}
                        disabled={submitting}
                        durationMinutes={subjectDurations.get(r.subjectId)}
                        onDurationChange={(minutes) => {
                          setSubjectDurations(prev => {
                            const next = new Map(prev);
                            if (minutes > 0) next.set(r.subjectId, minutes);
                            else next.delete(r.subjectId);
                            return next;
                          });
                        }}
                      />
                    );
                  })}
                </div>

                {/* Toplam Net */}
                <div className="flex items-center justify-end gap-3 mt-4 px-2">
                  <span className="text-sm font-bold text-white/60 tracking-wide uppercase">
                    Toplam Net:
                  </span>
                  <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 drop-shadow-[0_2px_10px_rgba(255,42,133,0.3)]">
                    {totalNet.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="text-white/40 hover:text-white/80 transition-colors text-sm font-bold tracking-wider uppercase"
                  >
                    Geri Dön
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(3)}
                    className={`${buttonClassName} opacity-100`}
                  >
                    BAĞLAM ETİKETLERİ
                    <ChevronRight className="w-4 h-4 ml-1 relative top-[1px]" />
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ========= STEP 3: BAĞLAM ETİKETLERİ (Context Tags) ========= */}
        {step === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            className="relative z-10"
          >
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
              <Zap size={24} className="text-amber-400" />
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Sınav Bağlamı</h2>
                <p className="text-sm text-white/40 mt-1">Tek tıkla seç, AI motorunu besle</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Time of Day */}
              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-3">
                  Sınav Zamanı
                </label>
                <div className="flex gap-2">
                  {TIME_OF_DAY_OPTIONS.map((opt) => (
                    <ContextTag
                      key={opt.value}
                      selected={timeOfDay === opt.value}
                      onClick={() => setTimeOfDay(timeOfDay === opt.value ? '' : opt.value)}
                      color="amber"
                    >
                      <span className="flex items-center gap-1.5">
                        {timeIcons[opt.value as keyof typeof timeIcons]}
                        {opt.label}
                      </span>
                    </ContextTag>
                  ))}
                </div>
              </div>

              {/* Environment */}
              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-3">
                  Ortam
                </label>
                <div className="flex gap-2">
                  {ENVIRONMENT_OPTIONS.map((opt) => (
                    <ContextTag
                      key={opt.value}
                      selected={environment === opt.value}
                      onClick={() => setEnvironment(environment === opt.value ? '' : opt.value)}
                      color="cyan"
                    >
                      <span className="flex items-center gap-1.5">
                        {envIcons[opt.value as keyof typeof envIcons]}
                        {opt.label}
                      </span>
                    </ContextTag>
                  ))}
                </div>
              </div>

              {/* Biological State */}
              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-3">
                  Enerji Durumu
                </label>
                <div className="flex gap-2">
                  {BIOLOGICAL_STATE_OPTIONS.map((opt) => (
                    <ContextTag
                      key={opt.value}
                      selected={biologicalState === opt.value}
                      onClick={() => setBiologicalState(biologicalState === opt.value ? '' : opt.value)}
                      color="emerald"
                    >
                      <span className="flex items-center gap-1.5">
                        {bioIcons[opt.value as keyof typeof bioIcons]}
                        {opt.label}
                      </span>
                    </ContextTag>
                  ))}
                </div>
              </div>

              {/* Perceived Difficulty */}
              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-3">
                  Algılanan Zorluk
                </label>
                <div className="flex gap-2">
                  {PERCEIVED_DIFFICULTY_OPTIONS.map((val) => (
                    <ContextTag
                      key={val}
                      selected={perceivedDifficulty === val}
                      onClick={() => setPerceivedDifficulty(perceivedDifficulty === val ? 0 : val)}
                      color="pink"
                    >
                      {val}
                    </ContextTag>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-white/30 mt-1.5 px-1">
                  <span>Kolay</span>
                  <span>Zor</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-10">
              <button
                onClick={() => setStep(2)}
                className="text-white/40 hover:text-white/80 transition-colors text-sm font-bold tracking-wider uppercase"
              >
                Geri Dön
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
                    KAYDET
                  </>
                )}
              </motion.button>
            </div>

            <p className="text-center text-xs text-white/30 mt-4">
              Zafiyet analizi dinlendikten sonra yapılabilir
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
