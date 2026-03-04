"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  BookOpen, ChevronRight, ChevronDown, Trash2, Plus, Loader2,
  CheckCircle2, XCircle, FileJson, Copy,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TopicInfo {
  id: string;
  name: string;
  _count: { kazanimlar: number };
}

interface SubjectInfo {
  id: string;
  name: string;
  topics: TopicInfo[];
}

interface ExamTypeInfo {
  id: string;
  name: string;
  subjects: SubjectInfo[];
}

interface KazanimDetail {
  id: string;
  code: string;
  subTopicName: string | null;
  description: string;
  details: string | null;
  isKeyKazanim: boolean;
  sortOrder: number;
}

// ---------------------------------------------------------------------------
// Örnek JSON
// ---------------------------------------------------------------------------

const EXAMPLE_JSON = `[
  {
    "exam": "AYT",
    "subject": "Matematik",
    "topic": "Polinomlar",
    "kazanimlar": [
      {
        "code": "10.3.1.1",
        "description": "Bir değişkenli polinom kavramını açıklar.",
        "subTopicName": "Polinom Kavramı",
        "isKey": true
      },
      {
        "code": "10.3.1.2",
        "description": "Polinomlarla toplama, çıkarma ve çarpma işlemlerini yapar.",
        "details": "a) Polinomların toplamı ve farkı.\\nb) Polinomların çarpımı."
      }
    ]
  }
]`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MufredatManager() {
  // --- State ---
  const [tree, setTree] = useState<ExamTypeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedExams, setExpandedExams] = useState<Set<string>>(new Set());
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [selectedTopic, setSelectedTopic] = useState<{
    id: string;
    name: string;
    exam: string;
    subject: string;
  } | null>(null);
  const [topicKazanimlar, setTopicKazanimlar] = useState<KazanimDetail[]>([]);
  const [loadingKazanimlar, setLoadingKazanimlar] = useState(false);

  // JSON input
  const [jsonInput, setJsonInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    notFound?: string[];
  } | null>(null);

  // --- Fetch tree ---
  const fetchTree = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/kazanimlar");
      if (res.ok) {
        const data: ExamTypeInfo[] = await res.json();
        setTree(data);
        // Auto-expand all exams
        setExpandedExams(new Set(data.map((et) => et.id)));
      }
    } catch {
      toast.error("Topic ağacı yüklenemedi");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  // --- Fetch kazanımlar for selected topic ---
  const fetchTopicKazanimlar = useCallback(async (topicId: string) => {
    setLoadingKazanimlar(true);
    try {
      const res = await fetch(`/api/admin/kazanimlar?topicId=${topicId}`);
      if (res.ok) {
        setTopicKazanimlar(await res.json());
      }
    } catch {
      toast.error("Kazanımlar yüklenemedi");
    }
    setLoadingKazanimlar(false);
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      fetchTopicKazanimlar(selectedTopic.id);
    }
  }, [selectedTopic, fetchTopicKazanimlar]);

  // --- Delete single kazanım ---
  const deleteKazanim = async (kazanimId: string) => {
    try {
      const res = await fetch(`/api/admin/kazanimlar?kazanimId=${kazanimId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTopicKazanimlar((prev) => prev.filter((k) => k.id !== kazanimId));
        toast.success("Kazanım silindi");
        fetchTree(); // refresh counts
      }
    } catch {
      toast.error("Silme başarısız");
    }
  };

  // --- Delete all kazanımlar for topic ---
  const deleteAllForTopic = async () => {
    if (!selectedTopic) return;
    if (!confirm(`"${selectedTopic.name}" konusunun TÜM kazanımlarını silmek istediğinize emin misiniz?`))
      return;

    try {
      const res = await fetch(
        `/api/admin/kazanimlar?topicId=${selectedTopic.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        const data = await res.json();
        setTopicKazanimlar([]);
        toast.success(data.message);
        fetchTree();
      }
    } catch {
      toast.error("Silme başarısız");
    }
  };

  // --- Submit JSON ---
  const submitJson = async () => {
    setResult(null);
    let parsed: any;
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      setResult({ success: false, message: "Geçersiz JSON formatı. Kontrol edip tekrar deneyin." });
      return;
    }

    if (!Array.isArray(parsed)) {
      setResult({ success: false, message: "JSON bir array olmalı: [{ exam, subject, topic, kazanimlar }]" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/kazanimlar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonInput,
      });
      const data = await res.json();

      if (res.ok) {
        setResult({
          success: true,
          message: data.message,
          notFound: data.notFound,
        });
        toast.success(data.message);
        setJsonInput("");
        fetchTree();
        if (selectedTopic) fetchTopicKazanimlar(selectedTopic.id);
      } else {
        setResult({
          success: false,
          message: data.error || "Bir hata oluştu",
          notFound: data.details,
        });
      }
    } catch {
      setResult({ success: false, message: "Ağ hatası" });
    }
    setSubmitting(false);
  };

  // --- Toggle helpers ---
  const toggleExam = (id: string) => {
    setExpandedExams((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSubject = (id: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // --- Stats ---
  const totalTopics = tree.reduce(
    (sum, et) => sum + et.subjects.reduce((s2, sub) => s2 + sub.topics.length, 0),
    0
  );
  const filledTopics = tree.reduce(
    (sum, et) =>
      sum +
      et.subjects.reduce(
        (s2, sub) => s2 + sub.topics.filter((t) => t._count.kazanimlar > 0).length,
        0
      ),
    0
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BookOpen size={18} />
          </div>
          <div>
            <h2 className="text-base font-black tracking-wider text-white/90">
              MÜFREDAT YÖNETİMİ
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-0.5">
              {filledTopics}/{totalTopics} konu dolu
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/10">
        {/* =============== LEFT: Topic Tree =============== */}
        <div className="lg:w-[380px] max-h-[600px] overflow-y-auto p-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
            </div>
          ) : (
            <div className="space-y-1">
              {tree.map((et) => (
                <div key={et.id}>
                  {/* Exam Type */}
                  <button
                    onClick={() => toggleExam(et.id)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-left hover:bg-white/[0.03] rounded-lg transition-colors"
                  >
                    {expandedExams.has(et.id) ? (
                      <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                    )}
                    <span className="text-xs font-black tracking-widest text-emerald-400">
                      {et.name}
                    </span>
                  </button>

                  {/* Subjects */}
                  <AnimatePresence initial={false}>
                    {expandedExams.has(et.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden ml-3"
                      >
                        {et.subjects.map((sub) => (
                          <div key={sub.id}>
                            <button
                              onClick={() => toggleSubject(sub.id)}
                              className="flex items-center gap-2 w-full px-2 py-1 text-left hover:bg-white/[0.03] rounded-lg transition-colors"
                            >
                              {expandedSubjects.has(sub.id) ? (
                                <ChevronDown className="w-3 h-3 text-white/50" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-white/30" />
                              )}
                              <span className="text-[11px] font-bold tracking-wide text-white/70">
                                {sub.name}
                              </span>
                            </button>

                            {/* Topics */}
                            <AnimatePresence initial={false}>
                              {expandedSubjects.has(sub.id) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.12 }}
                                  className="overflow-hidden ml-4"
                                >
                                  {sub.topics.map((t) => {
                                    const count = t._count.kazanimlar;
                                    const isSelected = selectedTopic?.id === t.id;
                                    return (
                                      <button
                                        key={t.id}
                                        onClick={() =>
                                          setSelectedTopic({
                                            id: t.id,
                                            name: t.name,
                                            exam: et.name,
                                            subject: sub.name,
                                          })
                                        }
                                        className={`flex items-center justify-between w-full px-2 py-1 text-left rounded-lg transition-colors text-[11px] ${
                                          isSelected
                                            ? "bg-emerald-500/10 text-emerald-300"
                                            : "hover:bg-white/[0.03] text-white/60"
                                        }`}
                                      >
                                        <span className="truncate flex-1 mr-2">{t.name}</span>
                                        <span
                                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                            count > 0
                                              ? "bg-emerald-500/20 text-emerald-400"
                                              : "bg-red-500/15 text-red-400/70"
                                          }`}
                                        >
                                          {count}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =============== RIGHT: Detail + JSON =============== */}
        <div className="flex-1 p-4 space-y-4 max-h-[600px] overflow-y-auto">
          {/* Selected topic detail */}
          {selectedTopic ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    {selectedTopic.exam} &gt; {selectedTopic.subject}
                  </p>
                  <h3 className="text-sm font-black tracking-wide text-white/90">
                    {selectedTopic.name}
                  </h3>
                </div>
                {topicKazanimlar.length > 0 && (
                  <button
                    onClick={deleteAllForTopic}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={12} />
                    Tümünü Sil
                  </button>
                )}
              </div>

              {/* Kazanım list */}
              {loadingKazanimlar ? (
                <div className="flex items-center gap-2 py-4">
                  <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span className="text-xs text-white/40">Yükleniyor...</span>
                </div>
              ) : topicKazanimlar.length === 0 ? (
                <p className="text-xs text-white/30 py-3 italic">
                  Bu konu için kazanım yok. Aşağıdaki JSON editöründen ekleyebilirsiniz.
                </p>
              ) : (
                <div className="space-y-1.5 mb-4">
                  {topicKazanimlar.map((k) => (
                    <div
                      key={k.id}
                      className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-emerald-400/70">
                            {k.code}
                          </span>
                          {k.isKeyKazanim && (
                            <span className="text-[8px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                              ANAHTAR
                            </span>
                          )}
                          {k.subTopicName && (
                            <span className="text-[9px] text-white/30">
                              · {k.subTopicName}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-white/70 mt-0.5 leading-relaxed">
                          {k.description}
                        </p>
                        {k.details && (
                          <p className="text-[10px] text-white/40 mt-1 whitespace-pre-line">
                            {k.details}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteKazanim(k.id)}
                        className="p-1 rounded text-white/20 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                        title="Sil"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileJson className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-xs text-white/30">
                Soldan bir konu seçerek kazanımları görüntüleyin
              </p>
            </div>
          )}

          {/* =============== JSON Editor =============== */}
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Plus size={14} className="text-emerald-400" />
                <span className="text-xs font-black tracking-wider text-white/70">
                  JSON İLE KAZANIM EKLE
                </span>
              </div>
              <button
                onClick={() => {
                  setJsonInput(EXAMPLE_JSON);
                  toast.info("Örnek JSON yapıştırıldı");
                }}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
              >
                <Copy size={10} />
                Örnek
              </button>
            </div>

            <textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setResult(null);
              }}
              placeholder={`[{ "exam": "AYT", "subject": "Matematik", "topic": "Polinomlar", "kazanimlar": [{ "code": "...", "description": "..." }] }]`}
              className="w-full h-48 px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white/80 font-mono placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 resize-y"
              spellCheck={false}
            />

            {/* Result */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-2 p-3 rounded-lg text-xs ${
                    result.success
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-300 border border-red-500/20"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {result.success ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <XCircle size={14} />
                    )}
                    <span className="font-bold">{result.message}</span>
                  </div>
                  {result.notFound && result.notFound.length > 0 && (
                    <div className="mt-1.5 text-[10px] text-white/50">
                      <span className="font-bold">Bulunamayan:</span>
                      <ul className="list-disc list-inside mt-0.5">
                        {result.notFound.map((nf, i) => (
                          <li key={i}>{nf}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={submitJson}
              disabled={submitting || !jsonInput.trim()}
              className="mt-3 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black tracking-widest bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              {submitting ? "EKLENİYOR..." : "KAZANIMLARI EKLE"}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
