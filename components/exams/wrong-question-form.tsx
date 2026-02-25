"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Plus, Trash2, Camera, Save, CheckCircle, Loader2, X, FileWarning, CheckCircle2 } from 'lucide-react';

// --------------- Types ---------------

interface WrongQuestionFormProps {
  examId: string;
  examTypeId: string;
  subjectResults: Array<{
    subjectId: string;
    subjectName: string;
    wrongCount: number;
    emptyCount: number;
  }>;
  onComplete: () => void;
}

interface Topic {
  id: string;
  name: string;
  subjectId: string;
}

interface SubjectWithTopics {
  id: string;
  name: string;
  topics: Topic[];
}

interface ErrorReason {
  id: string;
  label: string;
}

interface WrongQuestionRow {
  id: string;
  questionNumber: string;
  topicId: string;
  errorReasonId: string;
  notes: string;
  difficulty: string;
  photoFile: File | null;
  photoPreview: string | null;
  uploading: boolean;
}

interface EmptyQuestionRow {
  id: string;
  questionNumber: string;
  topicId: string;
  notes: string;
}

interface SubjectData {
  wrongRows: WrongQuestionRow[];
  emptyRows: EmptyQuestionRow[];
  saved: boolean;
}

// --------------- Helpers ---------------

let rowIdCounter = 0;
function generateRowId() {
  return `row-${++rowIdCounter}-${Date.now()}`;
}

const DIFFICULTY_OPTIONS = [
  { value: '', label: 'Zorluk...' },
  { value: 'kolay', label: 'Kolay' },
  { value: 'orta', label: 'Orta' },
  { value: 'zor', label: 'Zor' },
];

function createWrongRow(): WrongQuestionRow {
  return {
    id: generateRowId(),
    questionNumber: '',
    topicId: '',
    errorReasonId: '',
    notes: '',
    difficulty: '',
    photoFile: null,
    photoPreview: null,
    uploading: false,
  };
}

function createEmptyRow(): EmptyQuestionRow {
  return {
    id: generateRowId(),
    questionNumber: '',
    topicId: '',
    notes: '',
  };
}

// --------------- Photo Upload Helper ---------------

async function uploadPhoto(file: File): Promise<{ photoUrl: string; photoR2Key: string }> {
  // Step 1: Get signed upload URL
  const presignRes = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
    }),
  });

  if (!presignRes.ok) {
    throw new Error('Yukle URL alinamadi');
  }

  const { uploadUrl, publicUrl, r2Key } = await presignRes.json();

  // Step 2: Upload file to R2 via signed URL
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error('Dosya yuklenemedi');
  }

  return { photoUrl: publicUrl, photoR2Key: r2Key };
}

// --------------- Component ---------------

export default function WrongQuestionForm({
  examId,
  examTypeId,
  subjectResults,
  onComplete,
}: WrongQuestionFormProps) {
  // Filter subjects that have wrong or empty questions
  const activeSubjects = subjectResults.filter(
    (s) => s.wrongCount > 0 || s.emptyCount > 0
  );

  const [activeTab, setActiveTab] = useState(activeSubjects[0]?.subjectId ?? '');
  const [subjects, setSubjects] = useState<SubjectWithTopics[]>([]);
  const [errorReasons, setErrorReasons] = useState<ErrorReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSubject, setSavingSubject] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  // Per-subject form data keyed by subjectId
  const [subjectData, setSubjectData] = useState<Record<string, SubjectData>>({});

  // File input refs
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // --------------- Data Fetching ---------------

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [subjectsRes, errorsRes] = await Promise.all([
          fetch(`/api/subjects/${examTypeId}`),
          fetch('/api/error-reasons'),
        ]);

        if (!subjectsRes.ok) throw new Error('Dersler yuklenemedi');
        if (!errorsRes.ok) throw new Error('Hata nedenleri yuklenemedi');

        const subjectsJson: SubjectWithTopics[] = await subjectsRes.json();
        const errorsJson: ErrorReason[] = await errorsRes.json();

        setSubjects(subjectsJson);
        setErrorReasons(errorsJson);

        // Initialize rows for each active subject
        const initial: Record<string, SubjectData> = {};
        for (const sr of activeSubjects) {
          initial[sr.subjectId] = {
            wrongRows: Array.from({ length: sr.wrongCount }, () => createWrongRow()),
            emptyRows: Array.from({ length: sr.emptyCount }, () => createEmptyRow()),
            saved: false,
          };
        }
        setSubjectData(initial);
      } catch (err: any) {
        toast.error(err.message || 'Veriler yuklenirken hata olustu');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examTypeId]);

  // --------------- Row Manipulation ---------------

  function updateWrongRow(subjectId: string, rowId: string, field: string, value: any) {
    setSubjectData((prev) => {
      const data = prev[subjectId];
      if (!data) return prev;
      return {
        ...prev,
        [subjectId]: {
          ...data,
          wrongRows: data.wrongRows.map((r) =>
            r.id === rowId ? { ...r, [field]: value } : r
          ),
        },
      };
    });
  }

  function updateEmptyRow(subjectId: string, rowId: string, field: keyof EmptyQuestionRow, value: string) {
    setSubjectData((prev) => {
      const data = prev[subjectId];
      if (!data) return prev;
      return {
        ...prev,
        [subjectId]: {
          ...data,
          emptyRows: data.emptyRows.map((r) =>
            r.id === rowId ? { ...r, [field]: value } : r
          ),
        },
      };
    });
  }

  function addWrongRow(subjectId: string) {
    setSubjectData((prev) => {
      const data = prev[subjectId];
      if (!data) return prev;
      return {
        ...prev,
        [subjectId]: {
          ...data,
          wrongRows: [...data.wrongRows, createWrongRow()],
        },
      };
    });
  }

  function addEmptyRow(subjectId: string) {
    setSubjectData((prev) => {
      const data = prev[subjectId];
      if (!data) return prev;
      return {
        ...prev,
        [subjectId]: {
          ...data,
          emptyRows: [...data.emptyRows, createEmptyRow()],
        },
      };
    });
  }

  function removeWrongRow(subjectId: string, rowId: string) {
    setSubjectData((prev) => {
      const data = prev[subjectId];
      if (!data) return prev;
      // Revoke object URL if exists
      const row = data.wrongRows.find(r => r.id === rowId);
      if (row?.photoPreview) URL.revokeObjectURL(row.photoPreview);
      return {
        ...prev,
        [subjectId]: {
          ...data,
          wrongRows: data.wrongRows.filter((r) => r.id !== rowId),
        },
      };
    });
  }

  function removeEmptyRow(subjectId: string, rowId: string) {
    setSubjectData((prev) => {
      const data = prev[subjectId];
      if (!data) return prev;
      return {
        ...prev,
        [subjectId]: {
          ...data,
          emptyRows: data.emptyRows.filter((r) => r.id !== rowId),
        },
      };
    });
  }

  // --------------- Photo Handling ---------------

  function handlePhotoSelect(subjectId: string, rowId: string, file: File) {
    const preview = URL.createObjectURL(file);
    updateWrongRow(subjectId, rowId, 'photoFile', file);
    updateWrongRow(subjectId, rowId, 'photoPreview', preview);
  }

  function removePhoto(subjectId: string, rowId: string) {
    setSubjectData((prev) => {
      const data = prev[subjectId];
      if (!data) return prev;
      const row = data.wrongRows.find(r => r.id === rowId);
      if (row?.photoPreview) URL.revokeObjectURL(row.photoPreview);
      return {
        ...prev,
        [subjectId]: {
          ...data,
          wrongRows: data.wrongRows.map((r) =>
            r.id === rowId ? { ...r, photoFile: null, photoPreview: null } : r
          ),
        },
      };
    });
  }

  // --------------- Get topics for a subject ---------------

  function getTopicsForSubject(subjectId: string): Topic[] {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.topics ?? [];
  }

  // --------------- Save ---------------

  async function handleSaveSubject(subjectId: string) {
    const data = subjectData[subjectId];
    if (!data) return;

    setSavingSubject(subjectId);

    try {
      // Save wrong questions (with photo upload)
      for (const row of data.wrongRows) {
        let photoUrl: string | null = null;
        let photoR2Key: string | null = null;

        // Upload photo if exists
        if (row.photoFile) {
          try {
            const result = await uploadPhoto(row.photoFile);
            photoUrl = result.photoUrl;
            photoR2Key = result.photoR2Key;
          } catch (err) {
            console.error('Photo upload failed:', err);
            // Continue without photo
          }
        }

        const res = await fetch(`/api/exams/${examId}/wrong-questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionNumber: row.questionNumber ? parseInt(row.questionNumber, 10) : 0,
            subjectId,
            topicId: row.topicId || null,
            errorReasonId: row.errorReasonId || null,
            notes: row.notes || null,
            difficulty: row.difficulty || null,
            photoUrl,
            photoR2Key,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Yanlis soru kaydedilemedi');
        }
      }

      // Save empty questions
      for (const row of data.emptyRows) {
        const res = await fetch(`/api/exams/${examId}/empty-questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionNumber: row.questionNumber ? parseInt(row.questionNumber, 10) : 0,
            subjectId,
            topicId: row.topicId || null,
            notes: row.notes || null,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Bos soru kaydedilemedi');
        }
      }

      setSubjectData((prev) => ({
        ...prev,
        [subjectId]: { ...prev[subjectId], saved: true },
      }));

      const subjectName = activeSubjects.find((s) => s.subjectId === subjectId)?.subjectName ?? '';
      toast.success(`${subjectName} sorulari kaydedildi`);
    } catch (err: any) {
      toast.error(err.message || 'Kaydetme sirasinda hata olustu');
    } finally {
      setSavingSubject(null);
    }
  }

  async function handleComplete() {
    // Check if there are unsaved subjects
    const unsaved = activeSubjects.filter((s) => !subjectData[s.subjectId]?.saved);
    if (unsaved.length > 0) {
      const names = unsaved.map((s) => s.subjectName).join(', ');
      toast.error(`Kaydedilmemis dersler var: ${names}`);
      return;
    }
    setCompleting(true);
    try {
      onComplete();
    } finally {
      setCompleting(false);
    }
  }

  // --------------- Render ---------------

  const inputClassName = "w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-400/30 transition-all hover:border-white/20";
  const selectClassName = "w-full bg-white/[0.03] border border-white/10 rounded-xl px-2 py-2 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-400/30 transition-all hover:border-white/20 [color-scheme:dark]";
  const buttonClassName = "bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-2.5 rounded-xl shadow-[0_0_15px_rgba(255,42,133,0.3)] hover:shadow-[0_0_25px_rgba(255,42,133,0.5)] border border-pink-400/20 transition-all font-bold tracking-wide text-sm flex items-center gap-2 block bg-contain";

  if (loading) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center py-16">
        <Loader2 className="animate-spin text-pink-400 mb-4" size={32} />
        <span className="text-white/60 font-medium tracking-wide">Veriler yükleniyor...</span>
      </div>
    );
  }

  if (activeSubjects.length === 0) {
    return (
      <div className="glass-panel text-center py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-transparent pointer-events-none" />
        <CheckCircle2 className="mx-auto text-pink-400 mb-4 opacity-50" size={48} />
        <h3 className="text-xl font-bold text-white mb-2">Harika!</h3>
        <p className="text-white/50 mb-8">
          Yanlış veya boş soru bulunmuyor.
        </p>
        <button
          onClick={onComplete}
          className={`${buttonClassName} opacity-100 disabled:opacity-50 mx-auto justify-center`}
        >
          <CheckCircle size={18} />
          Tamamla
        </button>
      </div>
    );
  }

  const currentData = subjectData[activeTab];
  const currentTopics = getTopicsForSubject(activeTab);

  return (
    <div className="glass-panel p-6 sm:p-8 space-y-6 relative overflow-hidden text-white/90">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Section Title */}
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <FileWarning size={28} className="text-pink-400" />
        <h2 className="text-2xl font-bold tracking-tight text-white">Yanlış & Boş Soru Analizi</h2>
      </div>

      {/* Subject Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 relative z-10 scrollbar-hide">
        {activeSubjects.map((s) => {
          const isSaved = subjectData[s.subjectId]?.saved;
          const isActive = activeTab === s.subjectId;
          return (
            <button
              key={s.subjectId}
              onClick={() => setActiveTab(s.subjectId)}
              className={`
                relative px-5 py-2.5 text-sm font-bold rounded-xl whitespace-nowrap transition-all duration-300 border
                ${isActive
                  ? 'bg-gradient-to-r from-pink-500/20 to-pink-500/10 text-white border-pink-500/30 shadow-[0_4px_20px_-4px_rgba(255,42,133,0.3)]'
                  : 'bg-white/[0.02] text-white/50 hover:bg-white/[0.04] border-white/5 hover:text-white/80'
                }
              `}
            >
              {s.subjectName}
              {isSaved && (
                <CheckCircle
                  size={14}
                  className={`inline-block ml-2 ${isActive ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]' : 'text-emerald-500/50'}`}
                />
              )}
              <span className={`ml-1.5 text-xs ${isActive ? 'text-pink-300' : 'text-white/30'}`}>
                ({s.wrongCount}Y {s.emptyCount}B)
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {currentData && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-8 relative z-10"
          >
            {/* ==================== YANLIS SORULAR ==================== */}
            {currentData.wrongRows.length > 0 && (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-300">Yanlışlar</h3>
                  <button
                    type="button"
                    onClick={() => addWrongRow(activeTab)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold uppercase tracking-wider inline-flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg transition-colors border border-rose-500/20"
                  >
                    <Plus size={14} />
                    Soru Ekle
                  </button>
                </div>

                <div className="space-y-4">
                  {currentData.wrongRows.map((row, idx) => (
                    <div
                      key={row.id}
                      className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-3 relative group"
                    >
                      {/* Row 1: Soru No + Konu + Hata Nedeni + Zorluk + Sil */}
                      <div className="grid grid-cols-[60px_1fr_1fr_90px_32px] gap-3 items-center">
                        <input
                          type="number"
                          min={1}
                          placeholder={`${idx + 1}`}
                          value={row.questionNumber}
                          onChange={(e) => updateWrongRow(activeTab, row.id, 'questionNumber', e.target.value)}
                          className={`${inputClassName} text-center`}
                        />

                        <select
                          value={row.topicId}
                          onChange={(e) => updateWrongRow(activeTab, row.id, 'topicId', e.target.value)}
                          className={selectClassName}
                        >
                          <option value="">Konu seçin...</option>
                          {currentTopics.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>

                        <select
                          value={row.errorReasonId}
                          onChange={(e) => updateWrongRow(activeTab, row.id, 'errorReasonId', e.target.value)}
                          className={selectClassName}
                        >
                          <option value="">Neden seçin...</option>
                          {errorReasons.map((er) => (
                            <option key={er.id} value={er.id}>{er.label}</option>
                          ))}
                        </select>

                        <select
                          value={row.difficulty}
                          onChange={(e) => updateWrongRow(activeTab, row.id, 'difficulty', e.target.value)}
                          className={`${selectClassName} ${row.difficulty === 'kolay' ? '!text-emerald-400' :
                              row.difficulty === 'orta' ? '!text-amber-400' :
                                row.difficulty === 'zor' ? '!text-rose-400' : ''
                            }`}
                        >
                          {DIFFICULTY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => removeWrongRow(activeTab, row.id)}
                          className="mx-auto w-8 h-8 flex items-center justify-center rounded-lg text-rose-400/50 hover:text-rose-400 hover:bg-rose-500/20 transition-colors opacity-50 group-hover:opacity-100 border border-transparent hover:border-rose-500/30"
                          title="Satırı sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Row 2: Not + Foto */}
                      <div className="flex gap-3 items-center">
                        <input
                          type="text"
                          placeholder="Soru notu veya açıklaması..."
                          value={row.notes}
                          onChange={(e) => updateWrongRow(activeTab, row.id, 'notes', e.target.value)}
                          className={inputClassName}
                        />

                        {/* Photo upload */}
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          ref={(el) => { fileInputRefs.current[row.id] = el; }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoSelect(activeTab, row.id, file);
                          }}
                        />

                        {row.photoPreview ? (
                          <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-pink-500/50 flex-shrink-0 group/photo">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={row.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity" />
                            <button
                              type="button"
                              onClick={() => removePhoto(activeTab, row.id)}
                              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity transform hover:scale-110"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[row.id]?.click()}
                            title="Fotoğraf yükle"
                            className="w-11 h-11 flex items-center justify-center rounded-lg bg-white/[0.03] hover:bg-pink-500/10 text-white/40 hover:text-pink-400 transition-colors border border-white/10 hover:border-pink-500/30 flex-shrink-0"
                          >
                            <Camera size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==================== BOS SORULAR ==================== */}
            {currentData.emptyRows.length > 0 && (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300">Boşlar</h3>
                  <button
                    type="button"
                    onClick={() => addEmptyRow(activeTab)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider inline-flex items-center gap-1 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg transition-colors border border-cyan-500/20"
                  >
                    <Plus size={14} />
                    Soru Ekle
                  </button>
                </div>

                {/* Header */}
                <div className="hidden sm:grid sm:grid-cols-[60px_1fr_1fr_32px] gap-3 mb-2 px-2">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest text-center">No</span>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Konu</span>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Not</span>
                  <span />
                </div>

                <div className="space-y-3">
                  {currentData.emptyRows.map((row, idx) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-1 sm:grid-cols-[60px_1fr_1fr_32px] gap-3 items-center bg-black/20 rounded-xl p-3 border border-white/5 group"
                    >
                      <input
                        type="number"
                        min={1}
                        placeholder={`${idx + 1}`}
                        value={row.questionNumber}
                        onChange={(e) => updateEmptyRow(activeTab, row.id, 'questionNumber', e.target.value)}
                        className={`${inputClassName} text-center`}
                      />

                      <select
                        value={row.topicId}
                        onChange={(e) => updateEmptyRow(activeTab, row.id, 'topicId', e.target.value)}
                        className={selectClassName}
                      >
                        <option value="">Konu seçin...</option>
                        {currentTopics.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Not..."
                        value={row.notes}
                        onChange={(e) => updateEmptyRow(activeTab, row.id, 'notes', e.target.value)}
                        className={inputClassName}
                      />

                      <button
                        type="button"
                        onClick={() => removeEmptyRow(activeTab, row.id)}
                        className="mx-auto w-8 h-8 flex items-center justify-center rounded-lg text-rose-400/50 hover:text-rose-400 hover:bg-rose-500/20 transition-colors opacity-50 group-hover:opacity-100 border border-transparent hover:border-rose-500/30"
                        title="Satırı sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No rows at all */}
            {currentData.wrongRows.length === 0 && currentData.emptyRows.length === 0 && (
              <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-white/40 font-medium tracking-wide mb-4">Bu ders için soru girişi bulunmuyor.</p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => addWrongRow(activeTab)}
                    className="text-xs text-rose-400 hover:text-white font-bold inline-flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500 px-4 py-2 rounded-xl transition-all border border-rose-500/20"
                  >
                    <Plus size={14} />
                    YANLIŞ EKLE
                  </button>
                  <button
                    type="button"
                    onClick={() => addEmptyRow(activeTab)}
                    className="text-xs text-cyan-400 hover:text-white font-bold inline-flex items-center gap-1.5 bg-cyan-500/10 hover:bg-cyan-500 px-4 py-2 rounded-xl transition-all border border-cyan-500/20"
                  >
                    <Plus size={14} />
                    BOŞ EKLE
                  </button>
                </div>
              </div>
            )}

            {/* Save Button for this subject */}
            <div className="flex items-center justify-end gap-4 pt-4 mt-8 border-t border-white/5">
              {currentData.saved && (
                <span className="text-emerald-400 text-sm font-bold inline-flex items-center gap-1.5 tracking-wide">
                  <CheckCircle size={16} className="drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
                  KAYDEDİLDİ
                </span>
              )}
              <motion.button
                whileHover={!currentData.saved ? { scale: 1.02 } : {}}
                whileTap={!currentData.saved ? { scale: 0.98 } : {}}
                type="button"
                onClick={() => handleSaveSubject(activeTab)}
                disabled={savingSubject === activeTab || currentData.saved}
                className={`
                  inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold tracking-wider text-xs transition-all border
                  ${currentData.saved
                    ? 'bg-white/[0.03] text-white/30 border-white/5 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-[0_0_15px_rgba(255,42,133,0.3)] hover:shadow-[0_0_25px_rgba(255,42,133,0.5)] border-pink-400/20'
                  }
                `}
              >
                {savingSubject === activeTab ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    KAYDEDİLİYOR...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    DERSİ KAYDET
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complete Button */}
      <div className="flex items-center justify-center pt-8 mt-4 border-t border-pink-500/20 relative z-10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleComplete}
          disabled={completing}
          className={`${buttonClassName} px-10 py-3 text-base opacity-100 disabled:opacity-50 mx-auto justify-center w-full max-w-sm`}
        >
          {completing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              TÜMÜNÜ TAMAMLA...
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              TÜMÜNÜ TAMAMLA VE GÖNDER
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
