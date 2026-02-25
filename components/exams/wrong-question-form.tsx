"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Paper, Handwriting } from '@/components/skeuomorphic';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Plus, Trash2, Camera, Save, CheckCircle, Loader2, X, ImageIcon } from 'lucide-react';

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

  // --------------- Loading State ---------------

  if (loading) {
    return (
      <Paper className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-blue-500 mr-3" size={24} />
        <span className="text-slate-600 text-sm">Veriler yukleniyor...</span>
      </Paper>
    );
  }

  if (activeSubjects.length === 0) {
    return (
      <Paper className="text-center py-12">
        <Handwriting className="text-xl text-slate-500">
          Yanlis veya bos soru bulunmuyor.
        </Handwriting>
        <button
          onClick={onComplete}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition-colors font-bold text-sm inline-flex items-center gap-2"
        >
          <CheckCircle size={16} />
          Tamamla
        </button>
      </Paper>
    );
  }

  // --------------- Render ---------------

  const currentData = subjectData[activeTab];
  const currentTopics = getTopicsForSubject(activeTab);

  return (
    <Paper className="space-y-6">
      {/* Section Title */}
      <Handwriting className="text-2xl">Yanlis & Bos Soru Girisi</Handwriting>

      {/* Subject Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {activeSubjects.map((s) => {
          const isSaved = subjectData[s.subjectId]?.saved;
          const isActive = activeTab === s.subjectId;
          return (
            <button
              key={s.subjectId}
              onClick={() => setActiveTab(s.subjectId)}
              className={`
                relative px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors
                ${isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white/70 text-slate-600 hover:bg-blue-50 border border-b-0 border-slate-200'
                }
              `}
            >
              {s.subjectName}
              {isSaved && (
                <CheckCircle
                  size={14}
                  className={`inline-block ml-1.5 ${isActive ? 'text-green-200' : 'text-green-500'}`}
                />
              )}
              <span className={`ml-1 text-xs ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>
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
            className="space-y-8"
          >
            {/* ==================== YANLIS SORULAR ==================== */}
            {currentData.wrongRows.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Handwriting className="text-lg text-red-700">Yanlislar</Handwriting>
                  <button
                    type="button"
                    onClick={() => addWrongRow(activeTab)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Satir Ekle
                  </button>
                </div>

                <div className="space-y-3">
                  {currentData.wrongRows.map((row, idx) => (
                    <div
                      key={row.id}
                      className="bg-white/60 rounded-lg px-3 py-3 border border-slate-100 space-y-2"
                    >
                      {/* Row 1: Soru No + Konu + Hata Nedeni + Zorluk + Sil */}
                      <div className="grid grid-cols-[50px_1fr_1fr_80px_32px] gap-2 items-center">
                        <input
                          type="number"
                          min={1}
                          placeholder={`${idx + 1}`}
                          value={row.questionNumber}
                          onChange={(e) => updateWrongRow(activeTab, row.id, 'questionNumber', e.target.value)}
                          className="w-full p-1.5 text-sm rounded bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-center"
                        />

                        <select
                          value={row.topicId}
                          onChange={(e) => updateWrongRow(activeTab, row.id, 'topicId', e.target.value)}
                          className="w-full p-1.5 text-sm rounded bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                          <option value="">Konu secin...</option>
                          {currentTopics.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>

                        <select
                          value={row.errorReasonId}
                          onChange={(e) => updateWrongRow(activeTab, row.id, 'errorReasonId', e.target.value)}
                          className="w-full p-1.5 text-sm rounded bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                          <option value="">Neden secin...</option>
                          {errorReasons.map((er) => (
                            <option key={er.id} value={er.id}>{er.label}</option>
                          ))}
                        </select>

                        <select
                          value={row.difficulty}
                          onChange={(e) => updateWrongRow(activeTab, row.id, 'difficulty', e.target.value)}
                          className={`w-full p-1.5 text-sm rounded bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                            row.difficulty === 'kolay' ? 'text-green-600' :
                            row.difficulty === 'orta' ? 'text-amber-600' :
                            row.difficulty === 'zor' ? 'text-red-600' : ''
                          }`}
                        >
                          {DIFFICULTY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => removeWrongRow(activeTab, row.id)}
                          className="mx-auto w-7 h-7 flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Satiri sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Row 2: Not + Foto */}
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Not..."
                          value={row.notes}
                          onChange={(e) => updateWrongRow(activeTab, row.id, 'notes', e.target.value)}
                          className="flex-1 p-1.5 text-sm rounded bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                          <div className="relative w-10 h-10 rounded overflow-hidden border border-blue-300 flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={row.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removePhoto(activeTab, row.id)}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[row.id]?.click()}
                            title="Fotograf yukle"
                            className="w-10 h-10 flex items-center justify-center rounded bg-blue-50 hover:bg-blue-100 text-blue-400 hover:text-blue-600 transition-colors border border-blue-200 flex-shrink-0"
                          >
                            <Camera size={18} />
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
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Handwriting className="text-lg text-amber-700">Boslar</Handwriting>
                  <button
                    type="button"
                    onClick={() => addEmptyRow(activeTab)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Satir Ekle
                  </button>
                </div>

                {/* Header */}
                <div className="hidden sm:grid sm:grid-cols-[60px_1fr_1fr_32px] gap-2 mb-1 px-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Soru No</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Konu</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Not</span>
                  <span />
                </div>

                <div className="space-y-2">
                  {currentData.emptyRows.map((row, idx) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-1 sm:grid-cols-[60px_1fr_1fr_32px] gap-2 items-center bg-white/60 rounded px-2 py-2 border border-slate-100"
                    >
                      <input
                        type="number"
                        min={1}
                        placeholder={`${idx + 1}`}
                        value={row.questionNumber}
                        onChange={(e) => updateEmptyRow(activeTab, row.id, 'questionNumber', e.target.value)}
                        className="w-full p-1.5 text-sm rounded bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-center"
                      />

                      <select
                        value={row.topicId}
                        onChange={(e) => updateEmptyRow(activeTab, row.id, 'topicId', e.target.value)}
                        className="w-full p-1.5 text-sm rounded bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      >
                        <option value="">Konu secin...</option>
                        {currentTopics.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Not..."
                        value={row.notes}
                        onChange={(e) => updateEmptyRow(activeTab, row.id, 'notes', e.target.value)}
                        className="w-full p-1.5 text-sm rounded bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />

                      <button
                        type="button"
                        onClick={() => removeEmptyRow(activeTab, row.id)}
                        className="mx-auto w-7 h-7 flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Satiri sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No rows at all */}
            {currentData.wrongRows.length === 0 && currentData.emptyRows.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                <p>Bu ders icin soru girisi bulunmuyor.</p>
                <div className="flex items-center justify-center gap-4 mt-3">
                  <button
                    type="button"
                    onClick={() => addWrongRow(activeTab)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Yanlis Ekle
                  </button>
                  <button
                    type="button"
                    onClick={() => addEmptyRow(activeTab)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Bos Ekle
                  </button>
                </div>
              </div>
            )}

            {/* Save Button for this subject */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              {currentData.saved && (
                <span className="text-green-600 text-sm font-medium inline-flex items-center gap-1">
                  <CheckCircle size={14} />
                  Kaydedildi
                </span>
              )}
              <button
                type="button"
                onClick={() => handleSaveSubject(activeTab)}
                disabled={savingSubject === activeTab || currentData.saved}
                className={`
                  inline-flex items-center gap-2 px-5 py-2 rounded shadow font-bold text-sm transition-colors
                  ${currentData.saved
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                {savingSubject === activeTab ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Kaydet
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complete Button */}
      <div className="flex items-center justify-center pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={handleComplete}
          disabled={completing}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded shadow hover:bg-blue-700 transition-colors font-bold text-sm"
        >
          {completing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Tamamlaniyor...
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              Tamamla
            </>
          )}
        </button>
      </div>
    </Paper>
  );
}
