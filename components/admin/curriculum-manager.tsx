"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  BookOpen, Plus, Trash2, Loader2, ChevronRight, ChevronDown,
  Link2, Unlink, AlertCircle, Network, Search, Layers,
  CheckSquare, Square,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TopicItem {
  id: string;
  name: string;
  difficulty: number;
  estimatedHours: number;
  gradeLevel: number | null;
  sortOrder: number;
  _count: { kazanimlar: number; conceptNodes: number };
  conceptNodes?: ConceptNodeItem[];
}

interface SubjectItem {
  id: string;
  name: string;
  topics: TopicItem[];
}

interface ExamTypeItem {
  id: string;
  name: string;
  subjects: SubjectItem[];
}

interface ConceptNodeItem {
  id: string;
  name: string;
  slug: string;
  domain: string;
  complexityScore: number;
  examType?: string;
  _count?: { parentEdges: number; childEdges: number; cognitiveStates: number };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CurriculumManager() {
  const [tree, setTree] = useState<ExamTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedExams, setExpandedExams] = useState<Set<string>>(new Set());
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [unlinkedNodes, setUnlinkedNodes] = useState<ConceptNodeItem[]>([]);
  const [viewMode, setViewMode] = useState<"tree" | "links">("tree");

  // Multi-select
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Forms
  const [showAddSubject, setShowAddSubject] = useState<string | null>(null); // examTypeId
  const [showAddTopic, setShowAddTopic] = useState<string | null>(null); // subjectId
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Link mode
  const [linkingTopicId, setLinkingTopicId] = useState<string | null>(null);
  const [nodeSearch, setNodeSearch] = useState("");

  // --- Fetch ---
  const fetchTree = useCallback(async () => {
    setLoading(true);
    try {
      const mode = viewMode === "links" ? "?mode=links" : "";
      const res = await fetch(`/api/admin/curriculum${mode}`);
      if (res.ok) {
        const data = await res.json();
        if (viewMode === "links") {
          setTree(data.examTypes || []);
          setUnlinkedNodes(data.unlinkedNodes || []);
        } else {
          setTree(data);
        }
        setExpandedExams(new Set((data.examTypes || data).map((et: any) => et.id)));
      }
    } catch {
      toast.error("Mufredat yuklenemedi");
    }
    setLoading(false);
  }, [viewMode]);

  useEffect(() => { fetchTree(); }, [fetchTree]);

  // --- Create subject ---
  const createSubject = async (examTypeId: string) => {
    if (!newName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_subject", examTypeId, name: newName.trim() }),
      });
      if (res.ok) {
        toast.success(`"${newName}" dersi eklendi`);
        setNewName("");
        setShowAddSubject(null);
        fetchTree();
      } else {
        const d = await res.json();
        toast.error(d.error);
      }
    } catch { toast.error("Hata olustu"); }
    setSubmitting(false);
  };

  // --- Create topic ---
  const createTopic = async (subjectId: string) => {
    if (!newName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_topic", subjectId, name: newName.trim() }),
      });
      if (res.ok) {
        toast.success(`"${newName}" konusu eklendi`);
        setNewName("");
        setShowAddTopic(null);
        fetchTree();
      } else {
        const d = await res.json();
        toast.error(d.error);
      }
    } catch { toast.error("Hata olustu"); }
    setSubmitting(false);
  };

  // --- Delete topic ---
  const deleteTopic = async (topicId: string, topicName: string) => {
    if (!confirm(`"${topicName}" konusunu silmek istediginize emin misiniz? Tum kazanimlari ve baglantilari da silinecek.`))
      return;
    try {
      const res = await fetch(`/api/admin/curriculum?action=delete_topic&id=${topicId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`"${topicName}" silindi`);
        fetchTree();
      } else {
        const d = await res.json();
        toast.error(d.error);
      }
    } catch { toast.error("Silme basarisiz"); }
  };

  // --- Bulk delete topics ---
  const bulkDeleteTopics = async () => {
    if (selectedTopics.size === 0) return;
    if (!confirm(`${selectedTopics.size} konuyu silmek istediginize emin misiniz? Tum kazanimlari ve baglantilari da silinecek.`))
      return;
    setBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;
    for (const topicId of selectedTopics) {
      try {
        const res = await fetch(`/api/admin/curriculum?action=delete_topic&id=${topicId}`, { method: "DELETE" });
        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }
    if (successCount > 0) toast.success(`${successCount} konu silindi`);
    if (failCount > 0) toast.error(`${failCount} konu silinemedi`);
    setSelectedTopics(new Set());
    setBulkDeleting(false);
    fetchTree();
  };

  // --- Delete subject ---
  const deleteSubject = async (subjectId: string, subjectName: string) => {
    if (!confirm(`"${subjectName}" dersini silmek istediginize emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/admin/curriculum?action=delete_subject&id=${subjectId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`"${subjectName}" silindi`);
        fetchTree();
      } else {
        const d = await res.json();
        toast.error(d.error);
      }
    } catch { toast.error("Silme basarisiz"); }
  };

  // --- Link/unlink concept node ---
  const linkNode = async (topicId: string, conceptNodeId: string) => {
    try {
      const res = await fetch("/api/admin/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "link_node", topicId, conceptNodeId }),
      });
      if (res.ok) {
        toast.success("Kavram dugumu baglandi");
        setLinkingTopicId(null);
        fetchTree();
      }
    } catch { toast.error("Baglama basarisiz"); }
  };

  const unlinkNode = async (conceptNodeId: string) => {
    try {
      const res = await fetch("/api/admin/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unlink_node", conceptNodeId }),
      });
      if (res.ok) {
        toast.success("Baglanti kaldirildi");
        fetchTree();
      }
    } catch { toast.error("Islem basarisiz"); }
  };

  // --- Toggle helpers ---
  const toggle = (set: Set<string>, setFn: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) => {
    setFn((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // --- Multi-select helpers ---
  const toggleTopicSelection = (topicId: string) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      next.has(topicId) ? next.delete(topicId) : next.add(topicId);
      return next;
    });
  };

  const selectAllTopicsInSubject = (sub: SubjectItem) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      sub.topics.forEach((t) => next.add(t.id));
      return next;
    });
  };

  // --- Stats ---
  const totalTopics = tree.reduce((s, et) => s + et.subjects.reduce((s2, sub) => s2 + sub.topics.length, 0), 0);
  const linkedTopics = tree.reduce((s, et) =>
    s + et.subjects.reduce((s2, sub) =>
      s2 + sub.topics.filter((t) => (t._count?.conceptNodes || 0) > 0).length, 0), 0);

  // Filtered unlinked nodes
  const filteredNodes = unlinkedNodes.filter((n) =>
    !nodeSearch || n.name.toLowerCase().includes(nodeSearch.toLowerCase()) || n.domain.toLowerCase().includes(nodeSearch.toLowerCase())
  );

  // Find which subject is currently expanded (for "select all" in floating bar)
  const findExpandedSubjectWithSelectedTopics = (): SubjectItem | null => {
    for (const et of tree) {
      for (const sub of et.subjects) {
        if (expandedSubjects.has(sub.id) && sub.topics.length > 0) {
          return sub;
        }
      }
    }
    return null;
  };

  return (
    <div className="glass-panel overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Layers size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wider text-white/90">
              DERS & KONU YONETIMI
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mt-1">
              {totalTopics} konu · {linkedTopics} bagli kavram dugumu
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === "tree" ? "links" : "tree")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold tracking-wide border transition-colors ${
              viewMode === "links"
                ? "bg-violet-500/20 text-violet-400 border-violet-500/30"
                : "bg-white/[0.04] text-white/50 border-white/10 hover:bg-white/[0.08]"
            }`}
          >
            <Network size={16} />
            {viewMode === "links" ? "BAGLANTILAR" : "AGAC"}
          </button>
        </div>
      </div>

      <div className="p-5 max-h-[700px] overflow-y-auto pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {tree.map((et) => (
              <div key={et.id}>
                {/* Exam Type */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggle(expandedExams, setExpandedExams, et.id)}
                    className="flex items-center gap-3 flex-1 px-3 py-2.5 text-left hover:bg-white/[0.03] rounded-lg transition-colors"
                  >
                    {expandedExams.has(et.id) ? (
                      <ChevronDown className="w-5 h-5 text-blue-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-white/40" />
                    )}
                    <span className="text-lg font-black tracking-widest text-blue-400">{et.name}</span>
                    <span className="text-xs text-white/20">({et.subjects.length} ders)</span>
                  </button>
                  <button
                    onClick={() => { setShowAddSubject(showAddSubject === et.id ? null : et.id); setNewName(""); }}
                    className="p-2 rounded-lg text-white/20 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                    title="Ders ekle"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {/* Add subject form */}
                <AnimatePresence>
                  {showAddSubject === et.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden ml-8"
                    >
                      <div className="flex items-center gap-3 py-2.5">
                        <input
                          autoFocus
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") createSubject(et.id); if (e.key === "Escape") setShowAddSubject(null); }}
                          placeholder="Ders adi..."
                          className="px-3 py-2 bg-white/[0.06] border border-blue-500/30 rounded-lg text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-blue-500/40 flex-1"
                        />
                        <button onClick={() => createSubject(et.id)} disabled={submitting || !newName.trim()}
                          className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-bold disabled:opacity-50">
                          {submitting ? <Loader2 size={14} className="animate-spin" /> : "EKLE"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Subjects */}
                <AnimatePresence initial={false}>
                  {expandedExams.has(et.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden ml-4"
                    >
                      {et.subjects.map((sub) => (
                        <div key={sub.id} className="mt-1">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggle(expandedSubjects, setExpandedSubjects, sub.id)}
                              className="flex items-center gap-3 flex-1 px-3 py-2 text-left hover:bg-white/[0.03] rounded-lg transition-colors"
                            >
                              {expandedSubjects.has(sub.id) ? (
                                <ChevronDown className="w-4 h-4 text-white/50" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-white/30" />
                              )}
                              <span className="text-base font-bold tracking-wide text-white/70">{sub.name}</span>
                              <span className="text-xs text-white/20">({sub.topics.length})</span>
                            </button>
                            <button
                              onClick={() => { setShowAddTopic(showAddTopic === sub.id ? null : sub.id); setNewName(""); }}
                              className="p-2 rounded-lg text-white/15 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                              title="Konu ekle"
                            >
                              <Plus size={16} />
                            </button>
                            <button
                              onClick={() => deleteSubject(sub.id, sub.name)}
                              className="p-2 rounded-lg text-red-400/30 bg-red-500/5 hover:text-red-400 hover:bg-red-500/15 transition-all"
                              title="Dersi sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {/* Add topic form */}
                          <AnimatePresence>
                            {showAddTopic === sub.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden ml-10"
                              >
                                <div className="flex items-center gap-3 py-2">
                                  <input
                                    autoFocus
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") createTopic(sub.id); if (e.key === "Escape") setShowAddTopic(null); }}
                                    placeholder="Konu adi..."
                                    className="px-3 py-2 bg-white/[0.06] border border-emerald-500/30 rounded-lg text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 flex-1"
                                  />
                                  <button onClick={() => createTopic(sub.id)} disabled={submitting || !newName.trim()}
                                    className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-bold disabled:opacity-50">
                                    {submitting ? <Loader2 size={14} className="animate-spin" /> : "EKLE"}
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Topics */}
                          <AnimatePresence initial={false}>
                            {expandedSubjects.has(sub.id) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.12 }}
                                className="overflow-hidden ml-6 space-y-1"
                              >
                                {sub.topics.map((t) => {
                                  const hasNodes = (t._count?.conceptNodes || 0) > 0;
                                  const isExpanded = expandedTopics.has(t.id);
                                  const isSelected = selectedTopics.has(t.id);
                                  return (
                                    <div key={t.id}>
                                      <div className="flex items-center gap-3 group py-1">
                                        {/* Checkbox */}
                                        <button
                                          onClick={() => toggleTopicSelection(t.id)}
                                          className="p-0.5 flex-shrink-0 text-white/30 hover:text-blue-400 transition-colors"
                                        >
                                          {isSelected ? (
                                            <CheckSquare size={18} className="text-blue-400" />
                                          ) : (
                                            <Square size={18} />
                                          )}
                                        </button>
                                        {viewMode === "links" && (
                                          <button
                                            onClick={() => toggle(expandedTopics, setExpandedTopics, t.id)}
                                            className="p-1"
                                          >
                                            {isExpanded ? (
                                              <ChevronDown className="w-4 h-4 text-white/30" />
                                            ) : (
                                              <ChevronRight className="w-4 h-4 text-white/20" />
                                            )}
                                          </button>
                                        )}
                                        <div className="flex items-center gap-2 flex-1 px-3 py-1.5 text-sm">
                                          <span className={`font-semibold truncate ${hasNodes ? "text-white/70" : "text-white/40"}`}>
                                            {t.name}
                                          </span>
                                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                                            t._count.kazanimlar > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.04] text-white/20"
                                          }`}>
                                            K:{t._count.kazanimlar}
                                          </span>
                                          {viewMode === "links" && (
                                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                                              hasNodes ? "bg-violet-500/20 text-violet-400" : "bg-red-500/10 text-red-400/50"
                                            }`}>
                                              {hasNodes ? `N:${t._count.conceptNodes}` : "BAGLANTI YOK"}
                                            </span>
                                          )}
                                        </div>
                                        {viewMode === "links" && (
                                          <button
                                            onClick={() => setLinkingTopicId(linkingTopicId === t.id ? null : t.id)}
                                            className={`p-2 rounded-lg transition-colors ${
                                              linkingTopicId === t.id
                                                ? "text-violet-400 bg-violet-500/20"
                                                : "text-white/15 hover:text-violet-400 hover:bg-violet-500/10"
                                            }`}
                                            title="Kavram dugumu bagla"
                                          >
                                            <Link2 size={16} />
                                          </button>
                                        )}
                                        <button
                                          onClick={() => deleteTopic(t.id, t.name)}
                                          className="p-2 rounded-lg text-red-400/30 bg-red-500/5 hover:text-red-400 hover:bg-red-500/15 transition-all"
                                          title="Konuyu sil"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>

                                      {/* Linked concept nodes */}
                                      {viewMode === "links" && isExpanded && t.conceptNodes && t.conceptNodes.length > 0 && (
                                        <div className="ml-12 space-y-1 mb-2">
                                          {t.conceptNodes.map((cn) => (
                                            <div key={cn.id} className="flex items-center gap-3 px-3 py-1.5 text-xs rounded-lg bg-violet-500/5 border border-violet-500/10">
                                              <Network size={14} className="text-violet-400/50" />
                                              <span className="text-violet-300/70 flex-1 truncate">{cn.name}</span>
                                              <span className="text-[10px] text-white/20 font-mono">{cn.domain}</span>
                                              {cn._count && (
                                                <span className="text-[10px] text-white/15">
                                                  {cn._count.cognitiveStates}u
                                                </span>
                                              )}
                                              <button
                                                onClick={() => unlinkNode(cn.id)}
                                                className="p-1 rounded text-white/15 hover:text-red-400 transition-colors"
                                                title="Baglanti kaldir"
                                              >
                                                <Unlink size={12} />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {/* Link node picker */}
                                      {linkingTopicId === t.id && (
                                        <div className="ml-12 p-3 rounded-lg bg-violet-500/5 border border-violet-500/20 mb-2">
                                          <div className="flex items-center gap-3 mb-2">
                                            <Search size={14} className="text-violet-400/50" />
                                            <input
                                              autoFocus
                                              value={nodeSearch}
                                              onChange={(e) => setNodeSearch(e.target.value)}
                                              placeholder="Kavram dugumu ara..."
                                              className="flex-1 px-2 py-1 bg-transparent border-none text-sm text-white/60 placeholder:text-white/20 focus:outline-none"
                                            />
                                          </div>
                                          <div className="max-h-[180px] overflow-y-auto space-y-1">
                                            {filteredNodes.length === 0 ? (
                                              <p className="text-xs text-white/20 py-2">Baglantisiz kavram dugumu yok</p>
                                            ) : (
                                              filteredNodes.slice(0, 20).map((n) => (
                                                <button
                                                  key={n.id}
                                                  onClick={() => linkNode(t.id, n.id)}
                                                  className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-left text-sm text-white/50 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                                                >
                                                  <Link2 size={14} />
                                                  <span className="flex-1 truncate">{n.name}</span>
                                                  <span className="text-[10px] text-white/20">{n.domain}</span>
                                                </button>
                                              ))
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
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

        {/* Unlinked nodes warning */}
        {viewMode === "links" && unlinkedNodes.length > 0 && (
          <div className="mt-5 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <div className="flex items-center gap-3 text-sm text-amber-400 font-bold mb-3">
              <AlertCircle size={18} />
              {unlinkedNodes.length} BAGLANTISIZ KAVRAM DUGUMU
            </div>
            <div className="flex flex-wrap gap-1.5">
              {unlinkedNodes.slice(0, 30).map((n) => (
                <span key={n.id} className="text-xs px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400/60">
                  {n.name} <span className="text-white/20">({n.domain})</span>
                </span>
              ))}
              {unlinkedNodes.length > 30 && (
                <span className="text-xs text-white/20">+{unlinkedNodes.length - 30} daha</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating multi-select action bar */}
      <AnimatePresence>
        {selectedTopics.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-xl border-t border-white/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-white/70">
                  <span className="text-blue-400 font-black">{selectedTopics.size}</span> konu secildi
                </span>
                {(() => {
                  const expandedSub = findExpandedSubjectWithSelectedTopics();
                  if (!expandedSub) return null;
                  return (
                    <button
                      onClick={() => selectAllTopicsInSubject(expandedSub)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white/50 bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] transition-colors"
                    >
                      Tumunu Sec
                    </button>
                  );
                })()}
                <button
                  onClick={() => setSelectedTopics(new Set())}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white/40 hover:text-white/60 transition-colors"
                >
                  Temizle
                </button>
              </div>
              <button
                onClick={bulkDeleteTopics}
                disabled={bulkDeleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-black tracking-wide hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                {bulkDeleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                SECILENLERI SIL
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
