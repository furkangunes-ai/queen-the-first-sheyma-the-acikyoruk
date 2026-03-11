"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Network, Plus, Trash2, Loader2, Search, Edit3, Check, X,
  ChevronDown, Filter,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ConceptNode {
  id: string;
  name: string;
  slug: string;
  domain: string;
  examType: string;
  complexityScore: number;
  parentTopicId: string | null;
  sortOrder: number;
  parentTopic: { id: string; name: string } | null;
  _count: {
    parentEdges: number;
    childEdges: number;
    cognitiveStates: number;
  };
}

interface TopicOption {
  id: string;
  name: string;
}

const DOMAINS = [
  "Matematik", "Geometri", "Fizik", "Kimya", "Biyoloji",
  "Türkçe", "Edebiyat", "Tarih", "Coğrafya", "Felsefe", "Din Kültürü",
];

const EXAM_TYPES = [
  { value: "tyt", label: "TYT" },
  { value: "ayt", label: "AYT" },
  { value: "both", label: "Her İkisi" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ConceptNodeManager() {
  const [nodes, setNodes] = useState<ConceptNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<TopicOption[]>([]);

  // Filters
  const [filterDomain, setFilterDomain] = useState("");
  const [filterExamType, setFilterExamType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    slug: "",
    domain: DOMAINS[0],
    examType: "both",
    complexityScore: 5,
    parentTopicId: "",
    sortOrder: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ConceptNode>>({});

  // --- Fetch ---
  const fetchNodes = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterDomain) params.set("domain", filterDomain);
    if (filterExamType) params.set("examType", filterExamType);
    if (searchQuery) params.set("search", searchQuery);

    try {
      const res = await fetch(`/api/cognitive/nodes?${params}`);
      if (res.ok) setNodes(await res.json());
    } catch {
      toast.error("Kavramlar yüklenemedi");
    }
    setLoading(false);
  }, [filterDomain, filterExamType, searchQuery]);

  const fetchTopics = useCallback(async () => {
    try {
      const res = await fetch("/api/topics");
      if (res.ok) {
        const data = await res.json();
        setTopics(data.map((t: any) => ({ id: t.id, name: t.name })));
      }
    } catch { /* topics are optional */ }
  }, []);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // --- Slug generator ---
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
      .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // --- Add Node ---
  const handleAdd = async () => {
    if (!addForm.name.trim() || !addForm.slug.trim()) {
      toast.error("Ad ve slug zorunludur");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/cognitive/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addForm,
          parentTopicId: addForm.parentTopicId || null,
        }),
      });
      if (res.ok) {
        toast.success("Kavram oluşturuldu");
        setShowAddForm(false);
        setAddForm({
          name: "", slug: "", domain: DOMAINS[0], examType: "both",
          complexityScore: 5, parentTopicId: "", sortOrder: 0,
        });
        fetchNodes();
      } else {
        const err = await res.json();
        toast.error(err.error || "Oluşturulamadı");
      }
    } catch {
      toast.error("Ağ hatası");
    }
    setSubmitting(false);
  };

  // --- Delete Node ---
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" kavramını silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/cognitive/nodes/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Kavram silindi");
        fetchNodes();
      } else {
        const err = await res.json();
        toast.error(err.error || "Silinemedi");
      }
    } catch {
      toast.error("Ağ hatası");
    }
  };

  // --- Edit Node ---
  const startEdit = (node: ConceptNode) => {
    setEditingId(node.id);
    setEditForm({
      name: node.name,
      slug: node.slug,
      domain: node.domain,
      examType: node.examType,
      complexityScore: node.complexityScore,
      parentTopicId: node.parentTopicId,
      sortOrder: node.sortOrder,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const res = await fetch(`/api/cognitive/nodes/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        toast.success("Güncellendi");
        setEditingId(null);
        fetchNodes();
      } else {
        const err = await res.json();
        toast.error(err.error || "Güncellenemedi");
      }
    } catch {
      toast.error("Ağ hatası");
    }
  };

  // --- Stats ---
  const domainCounts = nodes.reduce((acc, n) => {
    acc[n.domain] = (acc[n.domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Network size={18} />
          </div>
          <div>
            <h2 className="text-base font-black tracking-wider text-white/90">
              KAVRAM DÜĞÜMLERİ
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-0.5">
              {nodes.length} kavram
              {Object.entries(domainCounts).length > 0 && (
                <> · {Object.entries(domainCounts).map(([d, c]) => `${d}: ${c}`).join(", ")}</>
              )}
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold tracking-wide bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-colors"
        >
          <Plus size={14} />
          Yeni Kavram
        </motion.button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/10"
          >
            <div className="p-4 bg-violet-500/[0.03] grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1 block">AD</label>
                <input
                  value={addForm.name}
                  onChange={(e) => {
                    setAddForm({
                      ...addForm,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  placeholder="Ör: Zincir Kuralı"
                  className="w-full px-3 py-2 bg-white/[0.03] rounded-lg border border-white/10 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/40"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1 block">SLUG</label>
                <input
                  value={addForm.slug}
                  onChange={(e) => setAddForm({ ...addForm, slug: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.03] rounded-lg border border-white/10 text-xs text-white/70 font-mono focus:outline-none focus:ring-1 focus:ring-violet-500/40"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1 block">ALAN</label>
                <select
                  value={addForm.domain}
                  onChange={(e) => setAddForm({ ...addForm, domain: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.03] rounded-lg border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/40 [color-scheme:dark]"
                >
                  {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1 block">SINAV TİPİ</label>
                <select
                  value={addForm.examType}
                  onChange={(e) => setAddForm({ ...addForm, examType: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.03] rounded-lg border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/40 [color-scheme:dark]"
                >
                  {EXAM_TYPES.map((et) => <option key={et.value} value={et.value}>{et.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1 block">
                  KARMAŞIKLIK ({addForm.complexityScore})
                </label>
                <input
                  type="range" min={1} max={10}
                  value={addForm.complexityScore}
                  onChange={(e) => setAddForm({ ...addForm, complexityScore: parseInt(e.target.value) })}
                  className="w-full accent-violet-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1 block">ÜST KONU</label>
                <select
                  value={addForm.parentTopicId}
                  onChange={(e) => setAddForm({ ...addForm, parentTopicId: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.03] rounded-lg border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/40 [color-scheme:dark]"
                >
                  <option value="">Yok</option>
                  {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAdd}
                  disabled={submitting || !addForm.name.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-black tracking-widest bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus size={14} />}
                  EKLE
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex items-center gap-3 p-4 border-b border-white/5">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kavram ara..."
            className="w-full pl-9 pr-3 py-2 bg-white/[0.03] rounded-lg border border-white/10 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/40"
          />
        </div>
        <select
          value={filterDomain}
          onChange={(e) => setFilterDomain(e.target.value)}
          className="px-3 py-2 bg-white/[0.03] rounded-lg border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/40 [color-scheme:dark]"
        >
          <option value="">Tüm Alanlar</option>
          {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          value={filterExamType}
          onChange={(e) => setFilterExamType(e.target.value)}
          className="px-3 py-2 bg-white/[0.03] rounded-lg border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/40 [color-scheme:dark]"
        >
          <option value="">Tüm Tipler</option>
          {EXAM_TYPES.map((et) => <option key={et.value} value={et.value}>{et.label}</option>)}
        </select>
      </div>

      {/* Node List */}
      <div className="max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
          </div>
        ) : nodes.length === 0 ? (
          <div className="text-center py-12 opacity-50">
            <Network className="w-8 h-8 text-white/30 mx-auto mb-2" />
            <p className="text-xs text-white/40">Kavram bulunamadı</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {nodes.map((node) => (
              <div
                key={node.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors group"
              >
                {editingId === node.id ? (
                  /* Edit Mode */
                  <div className="flex-1 grid grid-cols-2 lg:grid-cols-5 gap-2 items-center">
                    <input
                      value={editForm.name || ""}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="px-2 py-1.5 bg-white/[0.05] rounded border border-violet-500/30 text-xs text-white focus:outline-none col-span-2"
                    />
                    <select
                      value={editForm.domain || ""}
                      onChange={(e) => setEditForm({ ...editForm, domain: e.target.value })}
                      className="px-2 py-1.5 bg-white/[0.05] rounded border border-violet-500/30 text-xs text-white focus:outline-none [color-scheme:dark]"
                    >
                      {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input
                      type="number" min={1} max={10}
                      value={editForm.complexityScore || 5}
                      onChange={(e) => setEditForm({ ...editForm, complexityScore: parseInt(e.target.value) })}
                      className="px-2 py-1.5 bg-white/[0.05] rounded border border-violet-500/30 text-xs text-white focus:outline-none w-20"
                    />
                    <div className="flex items-center gap-1.5">
                      <button onClick={saveEdit} className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">
                        <Check size={12} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30">
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white/90 truncate">{node.name}</span>
                        <span className="text-[9px] font-mono text-white/30">{node.slug}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400">
                          {node.domain}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/[0.06] text-white/50">
                          {node.examType.toUpperCase()}
                        </span>
                        <span className="text-[9px] text-white/30">
                          K:{node.complexityScore}
                        </span>
                        {node.parentTopic && (
                          <span className="text-[9px] text-white/30 truncate">
                            ← {node.parentTopic.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Edge counts */}
                    <div className="flex items-center gap-3 text-[9px] text-white/30">
                      <span title="Parent kenarları">↑{node._count.parentEdges}</span>
                      <span title="Child kenarları">↓{node._count.childEdges}</span>
                      <span title="Kullanıcı state'leri">U:{node._count.cognitiveStates}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(node)}
                        className="p-1.5 rounded text-white/30 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(node.id, node.name)}
                        className="p-1.5 rounded text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
