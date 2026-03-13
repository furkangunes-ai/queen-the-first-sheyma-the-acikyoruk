"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Brain, CheckCircle2, Loader2, MessageSquare, ChevronDown, ChevronUp, Save } from 'lucide-react';
import {
  ERROR_REASONS_ORDERED,
  ERROR_REASON_LABELS,
  VOID_STATUS_COLORS,
  getColdPhaseFrictionMessage,
  type ErrorReasonType,
  type VoidStatusType,
} from '@/lib/severity';
import { calculateClarityScore, formatScorePercent } from '@/lib/exam-metrics';

interface ColdPhaseFormProps {
  examId: string;
  examDate: string;
  onComplete: () => void;
}

interface RawVoid {
  id: string;
  subjectId: string;
  subject: { id: string; name: string };
  topic?: { id: string; name: string } | null;
  topicId: string | null;
  errorReason: ErrorReasonType | null;
  source: 'WRONG' | 'EMPTY';
  status: VoidStatusType;
  questionNumber: number | null;
  magnitude: number;
  notes: string | null;
}

interface Topic {
  id: string;
  name: string;
  subjectId: string;
}

interface VoidEdit {
  topicId: string;
  errorReason: ErrorReasonType | null;
  notes: string;
  expanded: boolean;
  dirty: boolean;
}

/**
 * Soğuk Faz — Progresif Zafiyet Haritalama
 *
 * Mevcut RAW void'ları listeler, öğrenci dilediği kadarını
 * opsiyonel olarak zenginleştirir (konu, neden, not).
 * Geri kalanlar RAW kalır — cezasız, zorunluluksuz.
 */
export default function ColdPhaseForm({ examId, examDate, onComplete }: ColdPhaseFormProps) {
  const [voids, setVoids] = useState<RawVoid[]>([]);
  const [edits, setEdits] = useState<Map<string, VoidEdit>>(new Map());
  const [topics, setTopics] = useState<Record<string, Topic[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Friction gate
  const [frictionMessage, setFrictionMessage] = useState<string | null>(null);
  const [frictionBypassed, setFrictionBypassed] = useState(false);

  useEffect(() => {
    const hoursSinceExam = (Date.now() - new Date(examDate).getTime()) / (1000 * 60 * 60);
    const msg = getColdPhaseFrictionMessage(hoursSinceExam);
    setFrictionMessage(msg);
  }, [examDate]);

  // Fetch existing cognitive voids
  useEffect(() => {
    async function fetchVoids() {
      setLoading(true);
      try {
        const res = await fetch(`/api/exams/${examId}/cognitive-voids`);
        if (!res.ok) throw new Error('Zafiyetler yüklenemedi');
        const data: RawVoid[] = await res.json();
        setVoids(data);

        // Initialize edits map
        const editMap = new Map<string, VoidEdit>();
        for (const v of data) {
          editMap.set(v.id, {
            topicId: v.topicId || '',
            errorReason: v.errorReason || null,
            notes: v.notes || '',
            expanded: false,
            dirty: false,
          });
        }
        setEdits(editMap);

        // Fetch topics for all subjects
        const subjectIds = [...new Set(data.map(v => v.subjectId))];
        if (subjectIds.length > 0) {
          const topicRes = await fetch(`/api/subjects/topics?subjectIds=${subjectIds.join(',')}`);
          if (topicRes.ok) {
            const topicData: Topic[] = await topicRes.json();
            const topicMap: Record<string, Topic[]> = {};
            for (const t of topicData) {
              if (!topicMap[t.subjectId]) topicMap[t.subjectId] = [];
              topicMap[t.subjectId].push(t);
            }
            setTopics(topicMap);
          }
        }
      } catch {
        toast.error('Zafiyetler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    }
    fetchVoids();
  }, [examId]);

  // Group voids by subject
  const groupedVoids = useMemo(() => {
    const groups = new Map<string, { subjectName: string; voids: RawVoid[] }>();
    for (const v of voids) {
      const existing = groups.get(v.subjectId);
      if (existing) {
        existing.voids.push(v);
      } else {
        groups.set(v.subjectId, { subjectName: v.subject.name, voids: [v] });
      }
    }
    return groups;
  }, [voids]);

  // Clarity score
  const clarityScore = useMemo(() => {
    return calculateClarityScore(voids.map(v => {
      const edit = edits.get(v.id);
      // Eğer edit'te topic ve reason varsa sınıflandırılmış say
      if (edit?.dirty && edit.topicId && edit.errorReason) {
        return { status: 'UNRESOLVED' };
      }
      return { status: v.status };
    }));
  }, [voids, edits]);

  function updateEdit(voidId: string, updates: Partial<VoidEdit>) {
    setEdits(prev => {
      const next = new Map(prev);
      const current = next.get(voidId);
      if (current) {
        next.set(voidId, { ...current, ...updates, dirty: true });
      }
      return next;
    });
  }

  function toggleExpand(voidId: string) {
    setEdits(prev => {
      const next = new Map(prev);
      const current = next.get(voidId);
      if (current) {
        next.set(voidId, { ...current, expanded: !current.expanded });
      }
      return next;
    });
  }

  const dirtyCount = useMemo(() => {
    let count = 0;
    edits.forEach(e => { if (e.dirty) count++; });
    return count;
  }, [edits]);

  async function handleSave() {
    setSubmitting(true);
    try {
      const promises: Promise<Response>[] = [];

      for (const [voidId, edit] of edits) {
        if (!edit.dirty) continue;

        const v = voids.find(v => v.id === voidId);
        if (!v) continue;

        // PATCH existing void with enrichment data
        promises.push(
          fetch(`/api/exams/${examId}/cognitive-voids/${voidId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...(edit.topicId && { topicId: edit.topicId }),
              ...(edit.errorReason && { errorReason: edit.errorReason }),
              ...(edit.notes && { notes: edit.notes }),
            }),
          })
        );
      }

      if (promises.length > 0) {
        const results = await Promise.allSettled(promises);
        const failed = results.filter(r => r.status === 'rejected').length;
        if (failed > 0) {
          toast.error(`${failed} zafiyet kaydedilemedi`);
        } else {
          toast.success(`${promises.length} zafiyet güncellendi!`);
        }
      }

      onComplete();
    } catch {
      toast.error('Kaydetme sırasında hata oluştu');
    } finally {
      setSubmitting(false);
    }
  }

  // Friction gate screen
  if (frictionMessage && !frictionBypassed) {
    return (
      <div className="glass-panel p-8 max-w-lg mx-auto text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none" />
        <Brain size={48} className="mx-auto text-amber-400 mb-6 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]" />
        <h2 className="text-xl font-bold text-white mb-4">Kognitif Uyarı</h2>
        <p className="text-white/60 text-sm leading-relaxed mb-8">{frictionMessage}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onComplete}
            className="px-6 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white/60 font-bold text-sm hover:bg-white/[0.08] transition-all"
          >
            Sonra Yaparım
          </button>
          <button
            onClick={() => setFrictionBypassed(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 text-amber-400 font-bold text-sm hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all"
          >
            Yine de Analiz Et
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-panel p-8 max-w-lg mx-auto text-center">
        <Loader2 size={40} className="mx-auto animate-spin text-pink-400 mb-4" />
        <p className="text-white/50 text-sm">Zafiyetler yükleniyor...</p>
      </div>
    );
  }

  if (voids.length === 0) {
    return (
      <div className="glass-panel p-8 max-w-lg mx-auto text-center">
        <CheckCircle2 size={48} className="mx-auto text-emerald-400 mb-4" />
        <p className="text-white/60">Bu denemede haritalanacak zafiyet yok!</p>
      </div>
    );
  }

  const rawCount = voids.filter(v => v.status === 'RAW').length;

  return (
    <div className="glass-panel p-6 sm:p-8 max-w-2xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Header with clarity score */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h2 className="text-xl font-bold text-white">Zafiyet Haritalama</h2>
          <p className="text-xs text-white/40 mt-1">
            {rawCount} ham veri, {voids.length} toplam — dilediğin kadarını sınıflandır
          </p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
            {formatScorePercent(clarityScore)}
          </div>
          <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
            Netlik
          </div>
        </div>
      </div>

      {/* Void groups by subject */}
      <div className="space-y-4">
        {Array.from(groupedVoids.entries()).map(([subjectId, group]) => (
          <div key={subjectId}>
            <h3 className="text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-2">
              {group.subjectName}
              <span className="text-white/30 ml-2">({group.voids.length})</span>
            </h3>
            <div className="space-y-2">
              {group.voids.map((v) => {
                const edit = edits.get(v.id);
                if (!edit) return null;
                const subjectTopics = topics[v.subjectId] || [];
                const isClassified = (edit.topicId && edit.errorReason) || v.status !== 'RAW';
                const statusColor = VOID_STATUS_COLORS[v.status];

                return (
                  <div
                    key={v.id}
                    className={`rounded-xl border transition-all ${
                      isClassified
                        ? 'bg-white/[0.02] border-white/[0.06]'
                        : 'bg-white/[0.03] border-white/10'
                    }`}
                  >
                    {/* Void header — tıklanınca açılır */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(v.id)}
                      className="w-full flex items-center gap-3 p-3 text-left"
                    >
                      {/* Source badge */}
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                        v.source === 'WRONG'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-white/[0.06] text-white/40 border border-white/10'
                      }`}>
                        {v.questionNumber || '#'}
                      </span>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white/80">
                            {v.source === 'WRONG' ? 'Yanlış' : 'Boş'}
                            {v.questionNumber ? ` — Soru ${v.questionNumber}` : ''}
                          </span>
                          {isClassified && (
                            <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
                          )}
                        </div>
                        {v.topic && (
                          <span className="text-[10px] text-white/30">{v.topic.name}</span>
                        )}
                        {edit.dirty && !isClassified && (
                          <span className="text-[10px] text-amber-400">düzenlendi</span>
                        )}
                      </div>

                      {/* Status pill */}
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
                        {v.status === 'RAW' ? 'Ham' : v.status}
                      </span>

                      {edit.expanded ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
                    </button>

                    {/* Expanded: enrichment fields */}
                    {edit.expanded && (
                      <div className="px-3 pb-3 space-y-3 border-t border-white/5 pt-3">
                        {/* Topic dropdown */}
                        <div>
                          <label className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">
                            Konu
                          </label>
                          <select
                            value={edit.topicId}
                            onChange={(e) => updateEdit(v.id, { topicId: e.target.value })}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white [color-scheme:dark] focus:outline-none focus:ring-1 focus:ring-pink-400/50"
                          >
                            <option value="">Konu seç (opsiyonel)</option>
                            {subjectTopics.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Error reason buttons */}
                        <div>
                          <label className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">
                            Hata Nedeni
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {ERROR_REASONS_ORDERED.map(reason => (
                              <button
                                key={reason}
                                type="button"
                                onClick={() => updateEdit(v.id, {
                                  errorReason: edit.errorReason === reason ? null : reason,
                                })}
                                className={`py-1.5 px-3 rounded-lg text-[10px] font-bold transition-all border ${
                                  edit.errorReason === reason
                                    ? 'bg-pink-500/20 text-pink-400 border-pink-500/30'
                                    : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:text-white/60'
                                }`}
                              >
                                {ERROR_REASON_LABELS[reason]}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">
                            <span className="flex items-center gap-1">
                              <MessageSquare size={10} />
                              Not (opsiyonel)
                            </span>
                          </label>
                          <input
                            type="text"
                            placeholder="İçgörün varsa kısaca yaz..."
                            value={edit.notes}
                            onChange={(e) => updateEdit(v.id, { notes: e.target.value })}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-pink-400/50"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer: Save + Close */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 relative z-10">
        <button
          onClick={onComplete}
          className="text-white/40 hover:text-white/80 text-sm font-bold uppercase tracking-wider transition-colors"
        >
          Sonra Devam Et
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={submitting || dirtyCount === 0}
          className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-2.5 rounded-xl shadow-[0_0_12px_rgba(255,42,133,0.3)] border border-pink-400/20 font-bold text-sm flex items-center gap-2 disabled:opacity-40"
        >
          {submitting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {submitting ? 'Kaydediliyor...' : `Kaydet${dirtyCount > 0 ? ` (${dirtyCount})` : ''}`}
        </motion.button>
      </div>
    </div>
  );
}
