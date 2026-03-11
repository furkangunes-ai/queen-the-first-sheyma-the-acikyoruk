"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  GitBranch, Plus, Trash2, Loader2, Search, Edit3, Check, X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EdgeItem {
  id: string;
  parentNodeId: string;
  childNodeId: string;
  dependencyWeight: number;
  isAdaptive: boolean;
  parentNode: { id: string; name: string; domain: string };
  childNode: { id: string; name: string; domain: string };
}

interface NodeOption {
  id: string;
  name: string;
  domain: string;
}

const DOMAINS = [
  "Matematik", "Geometri", "Fizik", "Kimya", "Biyoloji",
  "Türkçe", "Edebiyat", "Tarih", "Coğrafya", "Felsefe", "Din Kültürü",
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DependencyEdgeManager() {
  const [edges, setEdges] = useState<EdgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [allNodes, setAllNodes] = useState<NodeOption[]>([]);

  // Filters
  const [filterDomain, setFilterDomain] = useState("");

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [parentSearch, setParentSearch] = useState("");
  const [childSearch, setChildSearch] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");
  const [selectedChildId, setSelectedChildId] = useState("");
  const [addWeight, setAddWeight] = useState(0.7);
  const [submitting, setSubmitting] = useState(false);

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState(0.7);

  // --- Fetch ---
  const fetchEdges = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterDomain) params.set("domain", filterDomain);

    try {
      const res = await fetch(`/api/cognitive/edges?${params}`);
      if (res.ok) setEdges(await res.json());
    } catch {
      toast.error("Kenarlar yüklenemedi");
    }
    setLoading(false);
  }, [filterDomain]);

  const fetchNodes = useCallback(async () => {
    try {
      const res = await fetch("/api/cognitive/nodes");
      if (res.ok) {
        const data = await res.json();
        setAllNodes(data.map((n: any) => ({ id: n.id, name: n.name, domain: n.domain })));
      }
    } catch { /* optional */ }
  }, []);

  useEffect(() => { fetchEdges(); }, [fetchEdges]);
  useEffect(() => { fetchNodes(); }, [fetchNodes]);

  // --- Filtered node options ---
  const filteredParents = allNodes.filter((n) =>
    n.name.toLowerCase().includes(parentSearch.toLowerCase())
  ).slice(0, 10);

  const filteredChildren = allNodes.filter((n) =>
    n.name.toLowerCase().includes(childSearch.toLowerCase())
  ).slice(0, 10);

  // --- Add Edge ---
  const handleAdd = async () => {
    if (!selectedParentId || !selectedChildId) {
      toast.error("Parent ve child düğümlerini seçin");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/cognitive/edges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentNodeId: selectedParentId,
          childNodeId: selectedChildId,
          dependencyWeight: addWeight,
        }),
      });
      if (res.ok) {
        toast.success("Bağlantı oluşturuldu");
        setShowAddForm(false);
        setSelectedParentId("");
        setSelectedChildId("");
        setParentSearch("");
        setChildSearch("");
        setAddWeight(0.7);
        fetchEdges();
      } else {
        const err = await res.json();
        toast.error(err.error || "Oluşturulamadı");
      }
    } catch {
      toast.error("Ağ hatası");
    }
    setSubmitting(false);
  };

  // --- Delete Edge ---
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/cognitive/edges/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Bağlantı silindi");
        fetchEdges();
      }
    } catch {
      toast.error("Silinemedi");
    }
  };

  // --- Edit Edge ---
  const startEdit = (edge: EdgeItem) => {
    setEditingId(edge.id);
    setEditWeight(edge.dependencyWeight);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const res = await fetch(`/api/cognitive/edges/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dependencyWeight: editWeight }),
      });
      if (res.ok) {
        toast.success("Ağırlık güncellendi");
        setEditingId(null);
        fetchEdges();
      }
    } catch {
      toast.error("Güncellenemedi");
    }
  };

  // --- Weight color ---
  const weightColor = (w: number) => {
    if (w >= 0.8) return "text-red-400 bg-red-500/15";
    if (w >= 0.5) return "text-amber-400 bg-amber-500/15";
    return "text-emerald-400 bg-emerald-500/15";
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <GitBranch size={18} />
          </div>
          <div>
            <h2 className="text-base font-black tracking-wider text-white/90">
              BAĞIMLILIK KENARLARI
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-0.5">
              {edges.length} bağlantı
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold tracking-wide bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
        >
          <Plus size={14} />
          Yeni Bağlantı
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
            <div className="p-4 bg-cyan-500/[0.03] space-y-3">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Parent Node */}
                <div>
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1 block">
                    PARENT (ÖN KOŞUL)
                  </label>
                  <input
                    value={parentSearch}
                    onChange={(e) => { setParentSearch(e.target.value); setSelectedParentId(""); }}
                    placeholder="Kavram ara..."
                    className="w-full px-3 py-2 bg-white/[0.03] rounded-lg border border-white/10 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                  />
                  {parentSearch && !selectedParentId && (
                    <div className="mt-1 bg-black/40 rounded-lg border border-white/10 max-h-32 overflow-y-auto">
                      {filteredParents.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => { setSelectedParentId(n.id); setParentSearch(n.name); }}
                          className="w-full text-left px-3 py-1.5 text-[11px] text-white/70 hover:bg-white/[0.05] transition-colors"
                        >
                          {n.name} <span className="text-white/30">({n.domain})</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedParentId && (
                    <span className="text-[9px] text-cyan-400 mt-1 block">Seçildi</span>
                  )}
                </div>

                {/* Child Node */}
                <div>
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1 block">
                    CHILD (BAĞIMLI)
                  </label>
                  <input
                    value={childSearch}
                    onChange={(e) => { setChildSearch(e.target.value); setSelectedChildId(""); }}
                    placeholder="Kavram ara..."
                    className="w-full px-3 py-2 bg-white/[0.03] rounded-lg border border-white/10 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                  />
                  {childSearch && !selectedChildId && (
                    <div className="mt-1 bg-black/40 rounded-lg border border-white/10 max-h-32 overflow-y-auto">
                      {filteredChildren.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => { setSelectedChildId(n.id); setChildSearch(n.name); }}
                          className="w-full text-left px-3 py-1.5 text-[11px] text-white/70 hover:bg-white/[0.05] transition-colors"
                        >
                          {n.name} <span className="text-white/30">({n.domain})</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedChildId && (
                    <span className="text-[9px] text-cyan-400 mt-1 block">Seçildi</span>
                  )}
                </div>

                {/* Weight + Submit */}
                <div>
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1 block">
                    AĞIRLIK (W): {addWeight.toFixed(1)}
                  </label>
                  <input
                    type="range" min={0} max={1} step={0.1}
                    value={addWeight}
                    onChange={(e) => setAddWeight(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 mb-2"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAdd}
                    disabled={submitting || !selectedParentId || !selectedChildId}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-black tracking-widest bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus size={14} />}
                    BAĞLA
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter */}
      <div className="flex items-center gap-3 p-4 border-b border-white/5">
        <select
          value={filterDomain}
          onChange={(e) => setFilterDomain(e.target.value)}
          className="px-3 py-2 bg-white/[0.03] rounded-lg border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/40 [color-scheme:dark]"
        >
          <option value="">Tüm Alanlar</option>
          {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Edge List */}
      <div className="max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          </div>
        ) : edges.length === 0 ? (
          <div className="text-center py-12 opacity-50">
            <GitBranch className="w-8 h-8 text-white/30 mx-auto mb-2" />
            <p className="text-xs text-white/40">Bağlantı bulunamadı</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {edges.map((edge) => (
              <div
                key={edge.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors group"
              >
                {/* Parent → Child */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-white/80 truncate">{edge.parentNode.name}</span>
                    <span className="text-white/30">→</span>
                    <span className="font-bold text-white/80 truncate">{edge.childNode.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/[0.06] text-white/40">
                      {edge.parentNode.domain}
                    </span>
                    {edge.isAdaptive && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">
                        Adaptif
                      </span>
                    )}
                  </div>
                </div>

                {/* Weight */}
                {editingId === edge.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="range" min={0} max={1} step={0.1}
                      value={editWeight}
                      onChange={(e) => setEditWeight(parseFloat(e.target.value))}
                      className="w-24 accent-cyan-500"
                    />
                    <span className="text-xs font-mono text-white/60 w-8">{editWeight.toFixed(1)}</span>
                    <button onClick={saveEdit} className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">
                      <Check size={12} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className={`text-xs font-black px-2 py-1 rounded-lg ${weightColor(edge.dependencyWeight)}`}>
                      W:{edge.dependencyWeight.toFixed(1)}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(edge)}
                        className="p-1.5 rounded text-white/30 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(edge.id)}
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
