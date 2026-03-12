"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Brain, Loader2, ChevronDown, ChevronRight, Check, X,
  Sparkles, Link2, Edit3, Trash2, Plus, AlertCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SubjectOption {
  id: string;
  name: string;
  examTypeName: string;
  topicCount: number;
}

interface NodeSuggestion {
  name: string;
  slug: string;
  domain: string;
  examType: string;
  complexityScore: number;
}

interface TopicSuggestion {
  topicId: string;
  topicName: string;
  nodes: NodeSuggestion[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AINodeLinker() {
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  // AI suggestions
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<TopicSuggestion[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  // Editing state
  const [editingNode, setEditingNode] = useState<string | null>(null); // "topicIdx-nodeIdx"
  const [editForm, setEditForm] = useState<NodeSuggestion>({ name: "", slug: "", domain: "", examType: "both", complexityScore: 5 });

  // Removed nodes tracking
  const [removedNodes, setRemovedNodes] = useState<Set<string>>(new Set()); // "topicIdx-nodeIdx"

  // Apply state
  const [applying, setApplying] = useState(false);

  // --- Fetch subjects ---
  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/curriculum");
      if (res.ok) {
        const examTypes = await res.json();
        const subs: SubjectOption[] = [];
        for (const et of examTypes) {
          for (const sub of et.subjects) {
            subs.push({
              id: sub.id,
              name: `${sub.name} (${et.name})`,
              examTypeName: et.name,
              topicCount: sub.topics.length,
            });
          }
        }
        setSubjects(subs);
      }
    } catch {
      toast.error("Dersler yüklenemedi");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  // --- Generate suggestions ---
  const generateSuggestions = async () => {
    if (!selectedSubject) return;
    setGenerating(true);
    setSuggestions([]);
    setRemovedNodes(new Set());
    setEditingNode(null);
    try {
      const res = await fetch("/api/admin/ai-link-nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId: selectedSubject }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        // Expand all topics by default
        setExpandedTopics(new Set(data.suggestions?.map((_: any, i: number) => String(i)) || []));
        toast.success(`${data.suggestions?.length || 0} konu için öneriler oluşturuldu`);
      } else {
        const err = await res.json();
        toast.error(err.error || "AI önerileri oluşturulamadı");
      }
    } catch {
      toast.error("Bağlantı hatası");
    }
    setGenerating(false);
  };

  // --- Edit node ---
  const startEdit = (topicIdx: number, nodeIdx: number) => {
    const key = `${topicIdx}-${nodeIdx}`;
    setEditingNode(key);
    setEditForm({ ...suggestions[topicIdx].nodes[nodeIdx] });
  };

  const saveEdit = (topicIdx: number, nodeIdx: number) => {
    const updated = [...suggestions];
    updated[topicIdx] = {
      ...updated[topicIdx],
      nodes: [...updated[topicIdx].nodes],
    };
    updated[topicIdx].nodes[nodeIdx] = { ...editForm };
    setSuggestions(updated);
    setEditingNode(null);
  };

  // --- Remove/restore node ---
  const toggleRemove = (topicIdx: number, nodeIdx: number) => {
    const key = `${topicIdx}-${nodeIdx}`;
    setRemovedNodes((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // --- Add node to topic ---
  const addNode = (topicIdx: number) => {
    const updated = [...suggestions];
    const topic = updated[topicIdx];
    const domain = topic.nodes[0]?.domain || "";
    updated[topicIdx] = {
      ...topic,
      nodes: [
        ...topic.nodes,
        {
          name: "",
          slug: "",
          domain,
          examType: "both",
          complexityScore: 5,
        },
      ],
    };
    setSuggestions(updated);
    // Start editing the new node
    startEdit(topicIdx, updated[topicIdx].nodes.length - 1);
  };

  // --- Slug generator ---
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
      .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // --- Apply approved suggestions ---
  const applySuggestions = async () => {
    // Filter out removed nodes
    const filtered = suggestions.map((topic, ti) => ({
      topicId: topic.topicId,
      nodes: topic.nodes.filter((_, ni) => !removedNodes.has(`${ti}-${ni}`) && _.name.trim()),
    })).filter((t) => t.nodes.length > 0);

    if (filtered.length === 0) {
      toast.error("Uygulanacak öneri yok");
      return;
    }

    const totalNodes = filtered.reduce((s, t) => s + t.nodes.length, 0);
    if (!confirm(`${totalNodes} kavram düğümü oluşturulacak ve konulara bağlanacak. Onaylıyor musunuz?`)) return;

    setApplying(true);
    try {
      const res = await fetch("/api/admin/ai-link-nodes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestions: filtered }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
        setSuggestions([]);
        setRemovedNodes(new Set());
      } else {
        const err = await res.json();
        toast.error(err.error || "Uygulama başarısız");
      }
    } catch {
      toast.error("Bağlantı hatası");
    }
    setApplying(false);
  };

  // --- Stats ---
  const activeNodes = suggestions.reduce(
    (s, topic, ti) => s + topic.nodes.filter((_, ni) => !removedNodes.has(`${ti}-${ni}`) && _.name.trim()).length,
    0
  );
  const removedCount = removedNodes.size;

  // --- Toggle topic expand ---
  const toggleTopic = (idx: number) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      const key = String(idx);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-400 border border-violet-500/20">
            <Brain size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wider text-white/90">
              AI KAVRAM DÜĞÜMÜ OLUŞTURUCU
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mt-0.5">
              Müfredattaki konulara otomatik kavram düğümü ata
            </p>
          </div>
        </div>
      </div>

      {/* Subject selector + generate button */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs font-black text-white/50 uppercase tracking-widest mb-2 block">
              DERS SEÇ
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => { setSelectedSubject(e.target.value); setSuggestions([]); }}
              disabled={generating}
              className="w-full px-4 py-3 bg-white/[0.04] rounded-xl border border-white/10 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-violet-500/40 [color-scheme:dark]"
            >
              <option value="">Bir ders seçin...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.topicCount} konu
                </option>
              ))}
            </select>
          </div>
          <div className="pt-7">
            <motion.button
              whileHover={!generating && selectedSubject ? { scale: 1.03 } : {}}
              whileTap={!generating && selectedSubject ? { scale: 0.97 } : {}}
              onClick={generateSuggestions}
              disabled={generating || !selectedSubject}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black tracking-wider bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              {generating ? "ÖNERİLER OLUŞTURULUYOR..." : "AI İLE OLUŞTUR"}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {generating && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
            <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl animate-pulse" />
          </div>
          <p className="text-sm font-bold text-white/50 tracking-wide">
            AI her konu için kavram düğümleri oluşturuyor...
          </p>
        </div>
      )}

      {/* Suggestions list */}
      {suggestions.length > 0 && (
        <div className="p-4">
          {/* Summary bar */}
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-bold text-white/70">
                {suggestions.length} konu
              </span>
              <span className="font-bold text-violet-400">
                {activeNodes} kavram düğümü
              </span>
              {removedCount > 0 && (
                <span className="font-bold text-red-400/60">
                  {removedCount} çıkarıldı
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpandedTopics(new Set(suggestions.map((_, i) => String(i))))}
                className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide bg-white/[0.04] text-white/50 border border-white/10 hover:bg-white/[0.08] transition-colors"
              >
                Tümünü Aç
              </button>
              <button
                onClick={() => setExpandedTopics(new Set())}
                className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide bg-white/[0.04] text-white/50 border border-white/10 hover:bg-white/[0.08] transition-colors"
              >
                Tümünü Kapat
              </button>
            </div>
          </div>

          {/* Topic suggestions */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
            {suggestions.map((topic, topicIdx) => {
              const isExpanded = expandedTopics.has(String(topicIdx));
              const activeCount = topic.nodes.filter((_, ni) => !removedNodes.has(`${topicIdx}-${ni}`)).length;
              return (
                <div key={topicIdx} className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
                  {/* Topic header */}
                  <button
                    onClick={() => toggleTopic(topicIdx)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-violet-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-white/40 flex-shrink-0" />
                    )}
                    <span className="text-base font-bold text-white/90 flex-1">{topic.topicName}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      activeCount > 0 ? "bg-violet-500/20 text-violet-400" : "bg-white/[0.05] text-white/30"
                    }`}>
                      {activeCount} düğüm
                    </span>
                  </button>

                  {/* Nodes */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-3 space-y-2">
                          {topic.nodes.map((node, nodeIdx) => {
                            const key = `${topicIdx}-${nodeIdx}`;
                            const isRemoved = removedNodes.has(key);
                            const isEditing = editingNode === key;

                            if (isEditing) {
                              return (
                                <div key={nodeIdx} className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/30 space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">AD</label>
                                      <input
                                        autoFocus
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value, slug: generateSlug(e.target.value) })}
                                        className="w-full px-3 py-2 bg-white/[0.06] rounded-lg border border-violet-500/30 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/40"
                                        placeholder="Kavram adı..."
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">SLUG</label>
                                      <input
                                        value={editForm.slug}
                                        onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                                        className="w-full px-3 py-2 bg-white/[0.06] rounded-lg border border-violet-500/30 text-sm text-white/60 font-mono focus:outline-none focus:ring-1 focus:ring-violet-500/40"
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div>
                                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">TİP</label>
                                      <select
                                        value={editForm.examType}
                                        onChange={(e) => setEditForm({ ...editForm, examType: e.target.value })}
                                        className="w-full px-3 py-2 bg-white/[0.06] rounded-lg border border-violet-500/30 text-sm text-white focus:outline-none [color-scheme:dark]"
                                      >
                                        <option value="tyt">TYT</option>
                                        <option value="ayt">AYT</option>
                                        <option value="both">Her İkisi</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">
                                        ZORLUK ({editForm.complexityScore})
                                      </label>
                                      <input
                                        type="range" min={1} max={10}
                                        value={editForm.complexityScore}
                                        onChange={(e) => setEditForm({ ...editForm, complexityScore: parseInt(e.target.value) })}
                                        className="w-full accent-violet-500 mt-1"
                                      />
                                    </div>
                                    <div className="flex items-end gap-2">
                                      <button
                                        onClick={() => saveEdit(topicIdx, nodeIdx)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-bold hover:bg-emerald-500/30 transition-colors"
                                      >
                                        <Check size={14} /> Kaydet
                                      </button>
                                      <button
                                        onClick={() => setEditingNode(null)}
                                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={nodeIdx}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                                  isRemoved
                                    ? "bg-red-500/5 border-red-500/10 opacity-40"
                                    : "bg-white/[0.02] border-white/5 hover:border-violet-500/20"
                                }`}
                              >
                                <Link2 size={14} className={isRemoved ? "text-red-400/40" : "text-violet-400/60"} />
                                <div className="flex-1 min-w-0">
                                  <span className={`text-sm font-semibold ${isRemoved ? "line-through text-white/30" : "text-white/80"}`}>
                                    {node.name}
                                  </span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-mono text-white/25">{node.slug}</span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/[0.05] text-white/40">
                                      {node.examType.toUpperCase()}
                                    </span>
                                    <span className="text-[10px] text-white/25">
                                      zorluk: {node.complexityScore}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {!isRemoved && (
                                    <button
                                      onClick={() => startEdit(topicIdx, nodeIdx)}
                                      className="p-2 rounded-lg text-white/30 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                                      title="Düzenle"
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => toggleRemove(topicIdx, nodeIdx)}
                                    className={`p-2 rounded-lg transition-colors ${
                                      isRemoved
                                        ? "text-emerald-400 hover:bg-emerald-500/10"
                                        : "text-white/30 hover:text-red-400 hover:bg-red-500/10"
                                    }`}
                                    title={isRemoved ? "Geri al" : "Çıkar"}
                                  >
                                    {isRemoved ? <Plus size={14} /> : <Trash2 size={14} />}
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          {/* Add node button */}
                          <button
                            onClick={() => addNode(topicIdx)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/10 text-xs font-bold text-white/30 hover:text-violet-400 hover:border-violet-500/30 transition-colors"
                          >
                            <Plus size={14} />
                            Düğüm Ekle
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Apply button */}
          <div className="mt-6 flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <AlertCircle size={14} />
              Onayladığınızda kavram düğümleri oluşturulacak ve konulara bağlanacak
            </div>
            <motion.button
              whileHover={!applying ? { scale: 1.03 } : {}}
              whileTap={!applying ? { scale: 0.97 } : {}}
              onClick={applySuggestions}
              disabled={applying || activeNodes === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black tracking-wider bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {applying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check size={18} />
              )}
              {applying ? "UYGULANYOR..." : `${activeNodes} DÜĞÜMÜ ONAYLA VE OLUŞTUR`}
            </motion.button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!generating && suggestions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 opacity-50">
          <Brain size={40} className="text-white/30" />
          <p className="text-sm font-bold text-white/50 text-center max-w-md">
            Bir ders seçip &quot;AI İLE OLUŞTUR&quot; butonuna basın. AI her konu için gerekli kavram düğümlerini önerecek.
            Önerileri düzenleyebilir, çıkarabilir veya yeni düğüm ekleyebilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}
