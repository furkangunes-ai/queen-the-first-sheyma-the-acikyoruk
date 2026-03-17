"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  BookOpen, ChevronRight, ChevronDown, Trash2, Plus, Loader2,
  CheckCircle2, XCircle, FileJson, Copy, Pencil, Save, X,
  Download, Upload, Settings2, Star,
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

interface TopicDetail {
  id: string;
  name: string;
  difficulty: number;
  estimatedHours: number;
  gradeLevel: number | null;
  learningArea: string | null;
  sortOrder: number;
}

// ---------------------------------------------------------------------------
// Ornek JSON
// ---------------------------------------------------------------------------

const EXAMPLE_JSON = `[
  {
    "exam": "AYT",
    "subject": "Matematik",
    "topic": "Polinomlar",
    "kazanimlar": [
      {
        "code": "10.3.1.1",
        "description": "Bir degiskenli polinom kavramini aciklar.",
        "subTopicName": "Polinom Kavrami",
        "isKey": true
      },
      {
        "code": "10.3.1.2",
        "description": "Polinomlarla toplama, cikarma ve carpma islemlerini yapar.",
        "details": "a) Polinomlarin toplami ve farki.\\nb) Polinomlarin carpimi."
      }
    ]
  }
]`;

// ---------------------------------------------------------------------------
// Inline input component
// ---------------------------------------------------------------------------

function InlineInput({
  value,
  onSave,
  multiline = false,
  className = "",
}: {
  value: string;
  onSave: (v: string) => void;
  multiline?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const save = () => {
    if (draft.trim() !== value) onSave(draft.trim());
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (!editing) {
    return (
      <span
        onClick={() => { setDraft(value); setEditing(true); }}
        className={`cursor-pointer hover:bg-white/[0.06] rounded px-1 -mx-1 transition-colors ${className}`}
        title="Düzenlemek için tıkla"
      >
        {value || <span className="italic text-white/20">boş</span>}
      </span>
    );
  }

  if (multiline) {
    return (
      <div className="flex flex-col gap-1">
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") cancel(); }}
          className="w-full px-2 py-1 bg-white/[0.06] border border-emerald-500/30 rounded text-xs text-white/80 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/40 resize-y min-h-[60px]"
          rows={3}
        />
        <div className="flex gap-1">
          <button onClick={save} className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"><Save size={10} /></button>
          <button onClick={cancel} className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"><X size={10} /></button>
        </div>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") cancel();
        }}
        onBlur={save}
        className="px-1.5 py-0.5 bg-white/[0.06] border border-emerald-500/30 rounded text-xs text-white/80 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 min-w-[80px]"
      />
    </span>
  );
}

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
  const [topicDetail, setTopicDetail] = useState<TopicDetail | null>(null);
  const [topicKazanimlar, setTopicKazanimlar] = useState<KazanimDetail[]>([]);
  const [loadingKazanimlar, setLoadingKazanimlar] = useState(false);
  const [showTopicEdit, setShowTopicEdit] = useState(false);
  const [exporting, setExporting] = useState(false);

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
        setExpandedExams(new Set(data.map((et) => et.id)));
      }
    } catch {
      toast.error("Konu ağacı yüklenemedi");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  // --- Fetch kazanimlar for selected topic ---
  const fetchTopicKazanimlar = useCallback(async (topicId: string) => {
    setLoadingKazanimlar(true);
    try {
      const res = await fetch(`/api/admin/kazanimlar?topicId=${topicId}`);
      if (res.ok) {
        const data = await res.json();
        setTopicDetail(data.topic || null);
        setTopicKazanimlar(data.kazanimlar || []);
      }
    } catch {
      toast.error("Kazanımlar yüklenemedi");
    }
    setLoadingKazanimlar(false);
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      fetchTopicKazanimlar(selectedTopic.id);
      setShowTopicEdit(false);
    }
  }, [selectedTopic, fetchTopicKazanimlar]);

  // --- Update kazanim ---
  const updateKazanim = async (kazanimId: string, field: string, value: any) => {
    try {
      const res = await fetch("/api/admin/kazanimlar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "kazanim", id: kazanimId, data: { [field]: value } }),
      });
      if (res.ok) {
        setTopicKazanimlar((prev) =>
          prev.map((k) => (k.id === kazanimId ? { ...k, [field]: value } : k))
        );
        toast.success("Kazanım güncellendi");
      } else {
        toast.error("Güncelleme başarısız");
      }
    } catch {
      toast.error("Ağ hatası");
    }
  };

  // --- Update topic ---
  const updateTopic = async (field: string, value: any) => {
    if (!topicDetail) return;
    try {
      const res = await fetch("/api/admin/kazanimlar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "topic", id: topicDetail.id, data: { [field]: value } }),
      });
      if (res.ok) {
        setTopicDetail((prev) => prev ? { ...prev, [field]: value } : prev);
        if (field === "name" && selectedTopic) {
          setSelectedTopic({ ...selectedTopic, name: value });
        }
        toast.success("Konu güncellendi");
        if (field === "name") fetchTree();
      } else {
        toast.error("Güncelleme başarısız");
      }
    } catch {
      toast.error("Ağ hatası");
    }
  };

  // --- Delete single kazanim ---
  const deleteKazanim = async (kazanimId: string) => {
    try {
      const res = await fetch(`/api/admin/kazanimlar?kazanimId=${kazanimId}`, {
        method: "DELETE",
        headers: { "X-Confirm-Delete": "confirmed" },
      });
      if (res.ok) {
        setTopicKazanimlar((prev) => prev.filter((k) => k.id !== kazanimId));
        toast.success("Kazanım silindi");
        fetchTree();
      }
    } catch {
      toast.error("Silme başarısız");
    }
  };

  // --- Delete all kazanimlar for topic ---
  const deleteAllForTopic = async () => {
    if (!selectedTopic) return;
    if (!confirm(`"${selectedTopic.name}" konusunun TÜM kazanımlarını silmek istediğinize emin misiniz?`))
      return;

    try {
      const res = await fetch(
        `/api/admin/kazanimlar?topicId=${selectedTopic.id}`,
        { method: "DELETE", headers: { "X-Confirm-Delete": "confirmed" } }
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

  // --- Export JSON ---
  const exportJson = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/kazanimlar?mode=export");
      if (res.ok) {
        const data = await res.json();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mufredat-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`${data.length} konu için kazanımlar indirildi`);
      }
    } catch {
      toast.error("Dışa aktarım başarısız");
    }
    setExporting(false);
  };

  // --- Export selected topic as JSON (copy to clipboard) ---
  const exportTopicJson = () => {
    if (!selectedTopic || topicKazanimlar.length === 0) return;
    const exportData = [{
      exam: selectedTopic.exam,
      subject: selectedTopic.subject,
      topic: selectedTopic.name,
      kazanimlar: topicKazanimlar.map((k) => ({
        code: k.code,
        description: k.description,
        ...(k.subTopicName ? { subTopicName: k.subTopicName } : {}),
        ...(k.details ? { details: k.details } : {}),
        ...(k.isKeyKazanim ? { isKey: true } : {}),
      })),
    }];
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    toast.success("Kazanımlar JSON olarak kopyalandı");
  };

  // --- Submit JSON ---
  const submitJson = async () => {
    setResult(null);
    try {
      JSON.parse(jsonInput);
    } catch {
      setResult({ success: false, message: "Geçersiz JSON formatı. Kontrol edip tekrar deneyin." });
      return;
    }

    const parsed = JSON.parse(jsonInput);
    if (!Array.isArray(parsed)) {
      setResult({ success: false, message: "JSON bir dizi olmalı: [{ exam, subject, topic, kazanimlar }]" });
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
          message: data.error || "Bir hata olustu",
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
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mt-0.5">
              {filledTopics}/{totalTopics} konu dolu
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportJson}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
          >
            {exporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            TÜM MÜFREDATI İNDİR
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/10">
        {/* =============== LEFT: Topic Tree =============== */}
        <div className="lg:w-[420px] max-h-[700px] overflow-y-auto p-3">
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
                                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
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
        <div className="flex-1 p-4 space-y-4 max-h-[700px] overflow-y-auto">
          {/* Selected topic detail */}
          {selectedTopic ? (
            <div>
              {/* Topic header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                    {selectedTopic.exam} &gt; {selectedTopic.subject}
                  </p>
                  <h3 className="text-sm font-black tracking-wide text-white/90">
                    {selectedTopic.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowTopicEdit(!showTopicEdit)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wide border transition-colors ${
                      showTopicEdit
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-white/[0.04] text-white/50 border-white/10 hover:bg-white/[0.08]"
                    }`}
                  >
                    <Settings2 size={11} />
                    KONU
                  </button>
                  {topicKazanimlar.length > 0 && (
                    <>
                      <button
                        onClick={exportTopicJson}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                        title="Bu konunun kazanimlarini JSON olarak kopyala"
                      >
                        <Copy size={11} />
                        JSON
                      </button>
                      <button
                        onClick={deleteAllForTopic}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wide bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={11} />
                        SIL
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Topic properties edit panel */}
              <AnimatePresence>
                {showTopicEdit && topicDetail && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                      <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">
                        KONU ÖZELLİKLERİ
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-white/40 text-xs">Ad:</span>
                          <div className="text-white/80">
                            <InlineInput
                              value={topicDetail.name}
                              onSave={(v) => updateTopic("name", v)}
                            />
                          </div>
                        </div>
                        <div>
                          <span className="text-white/40 text-xs">Zorluk (1-5):</span>
                          <div className="text-white/80">
                            <InlineInput
                              value={String(topicDetail.difficulty)}
                              onSave={(v) => {
                                const n = parseInt(v);
                                if (n >= 1 && n <= 5) updateTopic("difficulty", n);
                                else toast.error("Zorluk 1-5 arası olmalı");
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <span className="text-white/40 text-xs">Tahmini Saat:</span>
                          <div className="text-white/80">
                            <InlineInput
                              value={String(topicDetail.estimatedHours)}
                              onSave={(v) => {
                                const n = parseFloat(v);
                                if (!isNaN(n) && n > 0) updateTopic("estimatedHours", n);
                                else toast.error("Geçersiz saat değeri");
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <span className="text-white/40 text-xs">Sınıf Seviyesi:</span>
                          <div className="text-white/80">
                            <InlineInput
                              value={topicDetail.gradeLevel ? String(topicDetail.gradeLevel) : ""}
                              onSave={(v) => {
                                const n = parseInt(v);
                                if (n >= 9 && n <= 12) updateTopic("gradeLevel", n);
                                else if (!v.trim()) updateTopic("gradeLevel", null);
                                else toast.error("Sınıf 9-12 arası olmalı");
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-white/40 text-xs">Öğrenme Alanı:</span>
                          <div className="text-white/80">
                            <InlineInput
                              value={topicDetail.learningArea || ""}
                              onSave={(v) => updateTopic("learningArea", v || null)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Kazanim list */}
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
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] group hover:border-white/[0.12] transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <InlineInput
                            value={k.code}
                            onSave={(v) => updateKazanim(k.id, "code", v)}
                            className="text-[10px] font-mono text-emerald-400/70"
                          />
                          <button
                            onClick={() => updateKazanim(k.id, "isKeyKazanim", !k.isKeyKazanim)}
                            className={`text-[10px] px-1 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                              k.isKeyKazanim
                                ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                                : "bg-white/[0.04] text-white/20 hover:bg-white/[0.08] hover:text-white/40"
                            }`}
                            title={k.isKeyKazanim ? "Anahtar kazanimi kaldir" : "Anahtar kazanim yap"}
                          >
                            <Star size={8} className="inline mr-0.5" />
                            {k.isKeyKazanim ? "ANAHTAR" : "ANAHTAR"}
                          </button>
                          {k.subTopicName !== null && (
                            <span className="text-[9px] text-white/30">
                              ·{" "}
                              <InlineInput
                                value={k.subTopicName || ""}
                                onSave={(v) => updateKazanim(k.id, "subTopicName", v || null)}
                                className="text-[9px] text-white/30"
                              />
                            </span>
                          )}
                          {k.subTopicName === null && (
                            <button
                              onClick={() => updateKazanim(k.id, "subTopicName", "Alt Konu")}
                              className="text-[10px] text-white/15 hover:text-white/30 transition-colors"
                              title="Alt konu ekle"
                            >
                              + alt konu
                            </button>
                          )}
                        </div>
                        <div className="mt-0.5">
                          <InlineInput
                            value={k.description}
                            onSave={(v) => updateKazanim(k.id, "description", v)}
                            multiline
                            className="text-[11px] text-white/70 leading-relaxed"
                          />
                        </div>
                        {k.details && (
                          <div className="mt-1">
                            <InlineInput
                              value={k.details}
                              onSave={(v) => updateKazanim(k.id, "details", v || null)}
                              multiline
                              className="text-[10px] text-white/40 whitespace-pre-line"
                            />
                          </div>
                        )}
                        {!k.details && (
                          <button
                            onClick={() => updateKazanim(k.id, "details", "Detay ekleyin...")}
                            className="text-[10px] text-white/15 hover:text-white/30 mt-1 transition-colors"
                          >
                            + detay ekle
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => deleteKazanim(k.id)}
                        className="p-1 rounded text-white/20 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
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
                <Upload size={14} className="text-emerald-400" />
                <span className="text-xs font-black tracking-wider text-white/70">
                  JSON İLE TOPLU KAZANIM EKLE / GÜNCELLE
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

            <p className="text-[10px] text-white/30 mb-2">
              Dosya yukle veya JSON yapistiriniz. Format: [{"{"} exam, subject, topic, kazanimlar: [{"{"} code, description, subTopicName?, details?, isKey? {"}"}] {"}"}]
            </p>

            {/* File upload */}
            <label className="flex items-center justify-center gap-2 px-4 py-2.5 mb-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-[11px] text-white/40 cursor-pointer hover:bg-white/[0.04] hover:border-white/20 transition-colors">
              <Upload size={14} />
              <span>JSON dosyası yükle</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const text = await file.text();
                    JSON.parse(text); // validate
                    setJsonInput(text);
                    toast.success(`${file.name} yüklendi`);
                  } catch {
                    toast.error("Geçersiz JSON dosyası");
                  }
                  e.target.value = "";
                }}
              />
            </label>

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
              {submitting ? "EKLENIYOR..." : "KAZANIMLARI EKLE"}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
