"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Clock,
  BookOpen,
  Tag,
  Check,
  StickyNote,
  Star,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { filterExamTypesByTrack, type ExamTrack } from "@/lib/exam-track-filter";
import { LEVEL_COLORS, LEVEL_BORDER_COLORS, LEVEL_LABELS } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Topic {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  questionCount: number;
  topics: Topic[];
}

interface ExamType {
  id: string;
  name: string;
  subjects: Subject[];
}

interface KnowledgeEntry {
  id: string;
  topicId: string;
  level: number;
  topic: {
    id: string;
    name: string;
    subject: {
      id: string;
      name: string;
      examType: { id: string; name: string };
    };
  };
}

interface LastStudiedEntry {
  topicId: string;
  lastStudiedDate: string;
  daysSince: number;
}

interface Recommendation {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  examTypeName: string;
  knowledgeLevel: number;
  daysSinceLastStudy: number | null;
  wrongCount: number;
  priorityScore: number;
}

interface TopicConcept {
  id: string;
  topicId: string;
  name: string;
  description: string | null;
  formula: string | null;
  sortOrder: number;
}

interface KazanimProgress {
  checked: boolean;
  notes: string | null;
}

interface Kazanim {
  id: string;
  topicId: string;
  code: string;
  subTopicName: string | null;
  description: string;
  details: string | null;
  isKeyKazanim: boolean;
  sortOrder: number;
  progress: KazanimProgress | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysSinceBadge(daysSince: number | null): {
  text: string;
  colorClass: string;
} {
  if (daysSince === null || daysSince === undefined) {
    return { text: "Hiç", colorClass: "text-white/30" };
  }
  if (daysSince < 3) {
    return { text: `${daysSince} gün önce`, colorClass: "text-emerald-400" };
  }
  if (daysSince < 7) {
    return { text: `${daysSince} gün önce`, colorClass: "text-amber-400" };
  }
  if (daysSince < 14) {
    return { text: `${daysSince} gün önce`, colorClass: "text-orange-500" };
  }
  return { text: `${daysSince} gün önce`, colorClass: "text-rose-400" };
}

function knowledgeDot(level: number) {
  const color = LEVEL_COLORS[level] ?? "bg-white/20";
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${color}`}
      title={LEVEL_LABELS[level] ?? ""}
    />
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TopicMap() {
  const { data: session } = useSession();
  const examTrack = (session?.user as any)?.examTrack as ExamTrack;

  // Data state
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [knowledgeMap, setKnowledgeMap] = useState<Map<string, number>>(
    new Map()
  );
  const [lastStudiedMap, setLastStudiedMap] = useState<
    Map<string, { date: string; daysSince: number }>
  >(new Map());
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [conceptsMap, setConceptsMap] = useState<Map<string, TopicConcept[]>>(new Map());

  // UI state
  const [loading, setLoading] = useState(true);
  const [savingTopicId, setSavingTopicId] = useState<string | null>(null);
  const [filterExamType, setFilterExamType] = useState<string>("all");
  const [expandedExamTypes, setExpandedExamTypes] = useState<Set<string>>(
    new Set()
  );
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    new Set()
  );

  // Inline kazanım state
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [topicKazanimlar, setTopicKazanimlar] = useState<Map<string, Kazanim[]>>(new Map());
  const [loadingKazanimTopicId, setLoadingKazanimTopicId] = useState<string | null>(null);
  const [savingKazanimIds, setSavingKazanimIds] = useState<Set<string>>(new Set());
  const [localNotes, setLocalNotes] = useState<Map<string, string>>(new Map());
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const noteTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [knowledgeRes, lastStudiedRes, recommendationsRes, examTypesRes] =
        await Promise.all([
          fetch("/api/topic-knowledge"),
          fetch("/api/strategy/last-studied"),
          fetch("/api/strategy/recommendations?limit=3"),
          fetch("/api/exam-types"),
        ]);

      // Parse all responses
      const [knowledgeData, lastStudiedData, recommendationsData, examTypesData]: [
        KnowledgeEntry[],
        LastStudiedEntry[],
        Recommendation[],
        ExamType[]
      ] = await Promise.all([
        knowledgeRes.json(),
        lastStudiedRes.json(),
        recommendationsRes.json(),
        examTypesRes.json(),
      ]);

      // Build knowledge map
      const kMap = new Map<string, number>();
      if (Array.isArray(knowledgeData)) {
        for (const entry of knowledgeData) {
          kMap.set(entry.topicId, entry.level);
        }
      }
      setKnowledgeMap(kMap);

      // Build last-studied map
      const lsMap = new Map<string, { date: string; daysSince: number }>();
      if (Array.isArray(lastStudiedData)) {
        for (const entry of lastStudiedData) {
          lsMap.set(entry.topicId, {
            date: entry.lastStudiedDate,
            daysSince: entry.daysSince,
          });
        }
      }
      setLastStudiedMap(lsMap);

      // Recommendations (max 3)
      setRecommendations(Array.isArray(recommendationsData) ? recommendationsData.slice(0, 3) : []);

      // Exam types — filter by student's exam track (e.g. sayısal hides AYT Edebiyat)
      const rawExamTypes = Array.isArray(examTypesData) ? examTypesData : [];
      const filteredET = filterExamTypesByTrack(
        rawExamTypes.map((et: ExamType) => ({ ...et, slug: et.name.toLowerCase() === "ayt" ? "ayt" : "tyt" })),
        examTrack
      );
      setExamTypes(filteredET);

      // Auto-expand all exam types on first load
      if (Array.isArray(examTypesData)) {
        setExpandedExamTypes(new Set(examTypesData.map((et: ExamType) => et.id)));
      }

      // Fetch concepts for all topics
      try {
        const allTopicIds = (Array.isArray(examTypesData) ? examTypesData : [])
          .flatMap((et: ExamType) => et.subjects?.flatMap((s) => s.topics?.map((t) => t.id) ?? []) ?? []);
        if (allTopicIds.length > 0) {
          const conceptRes = await fetch(`/api/topic-concepts?topicIds=${allTopicIds.join(",")}`);
          if (conceptRes.ok) {
            const conceptData: TopicConcept[] = await conceptRes.json();
            const cMap = new Map<string, TopicConcept[]>();
            for (const c of conceptData) {
              const existing = cMap.get(c.topicId) || [];
              existing.push(c);
              cMap.set(c.topicId, existing);
            }
            setConceptsMap(cMap);
          }
        }
      } catch {
        // concepts are optional, fail silently
      }
    } catch (error) {
      console.error("TopicMap: failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }, [examTrack]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const updateKnowledgeLevel = useCallback(
    async (topicId: string, level: number) => {
      setSavingTopicId(topicId);

      // Optimistic update
      setKnowledgeMap((prev) => {
        const next = new Map(prev);
        next.set(topicId, level);
        return next;
      });

      try {
        await fetch("/api/topic-knowledge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topicId, level }),
        });
      } catch (error) {
        console.error("Failed to update knowledge level", error);
        // Revert on failure
        setKnowledgeMap((prev) => {
          const next = new Map(prev);
          next.delete(topicId);
          return next;
        });
      } finally {
        setSavingTopicId(null);
      }
    },
    []
  );

  // ---- Inline kazanım handlers ----

  const toggleTopicExpand = useCallback(async (topicId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
        return next;
      }
      next.add(topicId);
      return next;
    });

    // Fetch kazanımlar if not loaded yet
    if (!topicKazanimlar.has(topicId)) {
      setLoadingKazanimTopicId(topicId);
      try {
        const res = await fetch(`/api/topic-kazanims?topicId=${topicId}`);
        if (res.ok) {
          const data: Kazanim[] = await res.json();
          setTopicKazanimlar((prev) => {
            const next = new Map(prev);
            next.set(topicId, data);
            return next;
          });
          // Init local notes
          for (const k of data) {
            if (k.progress?.notes) {
              setLocalNotes((prev) => {
                const next = new Map(prev);
                next.set(k.id, k.progress!.notes!);
                return next;
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch kazanımlar", err);
      } finally {
        setLoadingKazanimTopicId(null);
      }
    }
  }, [topicKazanimlar]);

  const toggleKazanimCheck = useCallback(async (kazanimId: string, topicId: string) => {
    const kazList = topicKazanimlar.get(topicId);
    if (!kazList) return;

    const kazanim = kazList.find((k) => k.id === kazanimId);
    if (!kazanim) return;

    const newChecked = !(kazanim.progress?.checked ?? false);

    // Optimistic update
    setTopicKazanimlar((prev) => {
      const next = new Map(prev);
      const list = [...(next.get(topicId) || [])];
      const idx = list.findIndex((k) => k.id === kazanimId);
      if (idx >= 0) {
        list[idx] = {
          ...list[idx],
          progress: { checked: newChecked, notes: list[idx].progress?.notes ?? null },
        };
        next.set(topicId, list);
      }
      return next;
    });

    setSavingKazanimIds((prev) => new Set(prev).add(kazanimId));

    try {
      const res = await fetch("/api/kazanim-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kazanimId, checked: newChecked }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.autoLevel !== undefined) {
          setKnowledgeMap((prev) => {
            const next = new Map(prev);
            next.set(topicId, data.autoLevel);
            return next;
          });
        }
      }
    } catch (err) {
      // Revert on failure
      setTopicKazanimlar((prev) => {
        const next = new Map(prev);
        const list = [...(next.get(topicId) || [])];
        const idx = list.findIndex((k) => k.id === kazanimId);
        if (idx >= 0) {
          list[idx] = {
            ...list[idx],
            progress: { checked: !newChecked, notes: list[idx].progress?.notes ?? null },
          };
          next.set(topicId, list);
        }
        return next;
      });
      toast.error("Kazanım kaydedilemedi");
    } finally {
      setSavingKazanimIds((prev) => {
        const next = new Set(prev);
        next.delete(kazanimId);
        return next;
      });
    }
  }, [topicKazanimlar]);

  const saveKazanimNote = useCallback(async (kazanimId: string, notes: string) => {
    try {
      await fetch("/api/kazanim-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kazanimId, notes }),
      });
    } catch {
      // silent fail for notes
    }
  }, []);

  const handleNoteChange = useCallback((kazanimId: string, value: string) => {
    setLocalNotes((prev) => {
      const next = new Map(prev);
      next.set(kazanimId, value);
      return next;
    });
    // Debounce save
    const existing = noteTimers.current.get(kazanimId);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      saveKazanimNote(kazanimId, value);
      noteTimers.current.delete(kazanimId);
    }, 800);
    noteTimers.current.set(kazanimId, timer);
  }, [saveKazanimNote]);

  const toggleExamType = useCallback((id: string) => {
    setExpandedExamTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSubject = useCallback((id: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Filtered data
  // ---------------------------------------------------------------------------

  const filteredExamTypes =
    filterExamType === "all"
      ? examTypes
      : examTypes.filter((et) => et.id === filterExamType);

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
        <span className="ml-3 text-white/50 text-sm">Konu haritası yükleniyor...</span>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <BookOpen className="w-4 h-4 text-pink-400" />
        <select
          value={filterExamType}
          onChange={(e) => setFilterExamType(e.target.value)}
          className="bg-white/5 border border-pink-500/15 rounded-xl px-4 py-2 text-sm text-white/90 backdrop-blur-sm focus:outline-none focus:border-pink-400/40 transition-colors"
        >
          <option value="all" className="bg-slate-950 text-white">
            Tüm Sınav Türleri
          </option>
          {examTypes.map((et) => (
            <option key={et.id} value={et.id} className="bg-slate-950 text-white">
              {et.name}
            </option>
          ))}
        </select>
      </div>

      {/* Recommended Topics Card */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/5 backdrop-blur-md border border-pink-500/15 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white/90">
              Önerilen Konular
            </h2>
            <span className="ml-auto text-xs text-white/30">
              Öncelik sırasına göre
            </span>
          </div>

          <div className="grid gap-2">
            {recommendations.map((rec, idx) => {
              const level = knowledgeMap.get(rec.topicId) ?? rec.knowledgeLevel;
              const ls = lastStudiedMap.get(rec.topicId);
              const badge = daysSinceBadge(
                ls ? ls.daysSince : rec.daysSinceLastStudy
              );

              return (
                <motion.div
                  key={rec.topicId}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors"
                >
                  {/* Rank */}
                  <span className="text-xs font-bold text-pink-400/70 w-5 text-right">
                    {idx + 1}
                  </span>

                  {/* Subject & Topic */}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-white/40 block truncate">
                      {rec.examTypeName} &middot; {rec.subjectName}
                    </span>
                    <span className="text-sm text-white/90 block truncate">
                      {rec.topicName}
                    </span>
                  </div>

                  {/* Knowledge dot */}
                  <div className="flex items-center gap-1.5">
                    {knowledgeDot(level)}
                    <span className="text-xs text-white/40">
                      {LEVEL_LABELS[level]}
                    </span>
                  </div>

                  {/* Last studied */}
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-white/30" />
                    <span className={`text-xs ${badge.colorClass}`}>
                      {badge.text}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Main Accordion: ExamType > Subject > Topic */}
      <div className="space-y-3">
        {filteredExamTypes.map((examType) => {
          const isExamExpanded = expandedExamTypes.has(examType.id);

          return (
            <motion.div
              key={examType.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white/5 backdrop-blur-md border border-pink-500/15 rounded-2xl overflow-hidden"
            >
              {/* ExamType Header */}
              <button
                onClick={() => toggleExamType(examType.id)}
                className="flex items-center gap-3 w-full px-5 py-4 text-left hover:bg-white/[0.03] transition-colors"
              >
                <motion.div
                  animate={{ rotate: isExamExpanded ? 90 : 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <ChevronRight className="w-5 h-5 text-pink-400" />
                </motion.div>
                <h3 className="text-base font-semibold text-white/90">
                  {examType.name}
                </h3>
                <span className="ml-auto text-xs text-white/30">
                  {examType.subjects?.length ?? 0} ders
                </span>
              </button>

              {/* ExamType Body */}
              <AnimatePresence initial={false}>
                {isExamExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-2">
                      {examType.subjects?.map((subject) => {
                        const isSubjectExpanded = expandedSubjects.has(
                          subject.id
                        );
                        const topicCount = subject.topics?.length ?? 0;

                        // Count topics by knowledge level
                        const levelCounts = [0, 0, 0, 0, 0, 0]; // levels 0-5
                        for (const topic of subject.topics ?? []) {
                          const lvl = knowledgeMap.get(topic.id) ?? 0;
                          levelCounts[lvl]++;
                        }

                        return (
                          <div
                            key={subject.id}
                            className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden"
                          >
                            {/* Subject Header */}
                            <button
                              onClick={() => toggleSubject(subject.id)}
                              className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-white/[0.03] transition-colors"
                            >
                              <motion.div
                                animate={{
                                  rotate: isSubjectExpanded ? 90 : 0,
                                }}
                                transition={{ duration: 0.15 }}
                              >
                                <ChevronRight className="w-4 h-4 text-amber-400" />
                              </motion.div>
                              <span className="text-sm font-medium text-white/90 flex-1">
                                {subject.name}{" "}
                                <span className="text-white/40 font-normal">
                                  ({subject.questionCount} soru)
                                </span>
                              </span>

                              {/* Mini level bar */}
                              <div className="flex items-center gap-0.5">
                                {levelCounts.map((count, lvl) =>
                                  count > 0 ? (
                                    <div
                                      key={lvl}
                                      className="flex items-center gap-0.5"
                                    >
                                      <span
                                        className={`inline-block w-1.5 h-1.5 rounded-full ${LEVEL_COLORS[lvl]}`}
                                      />
                                      <span className="text-[10px] text-white/30">
                                        {count}
                                      </span>
                                    </div>
                                  ) : null
                                )}
                              </div>

                              <span className="text-xs text-white/30 ml-2">
                                {topicCount} konu
                              </span>
                            </button>

                            {/* Subject Body — Topic Rows */}
                            <AnimatePresence initial={false}>
                              {isSubjectExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{
                                    duration: 0.2,
                                    ease: "easeInOut",
                                  }}
                                  className="overflow-hidden"
                                >
                                  <div className="border-t border-white/5">
                                    {(subject.topics ?? []).map(
                                      (topic, tIdx) => {
                                        const level =
                                          knowledgeMap.get(topic.id) ?? 0;
                                        const ls = lastStudiedMap.get(
                                          topic.id
                                        );
                                        const badge = daysSinceBadge(
                                          ls ? ls.daysSince : null
                                        );
                                        const isTopicExpanded = expandedTopics.has(topic.id);
                                        const kazList = topicKazanimlar.get(topic.id) || [];
                                        const isLoadingKaz = loadingKazanimTopicId === topic.id;
                                        const checkedCount = kazList.filter((k) => k.progress?.checked).length;
                                        const totalKaz = kazList.length;

                                        return (
                                          <div
                                            key={topic.id}
                                            className="border-b border-white/[0.03] last:border-b-0"
                                          >
                                            {/* Topic Header Row — clickable to expand */}
                                            <motion.button
                                              initial={{ opacity: 0 }}
                                              animate={{ opacity: 1 }}
                                              transition={{
                                                duration: 0.15,
                                                delay: tIdx * 0.02,
                                              }}
                                              onClick={() => toggleTopicExpand(topic.id)}
                                              className="flex items-center gap-3 px-4 py-2.5 w-full text-left hover:bg-white/[0.02] transition-colors"
                                            >
                                              {/* Expand chevron */}
                                              <motion.div
                                                animate={{ rotate: isTopicExpanded ? 90 : 0 }}
                                                transition={{ duration: 0.15 }}
                                                className="shrink-0"
                                              >
                                                <ChevronRight className="w-3.5 h-3.5 text-pink-400/60" />
                                              </motion.div>

                                              {/* Topic name */}
                                              <div className="flex-1 min-w-0">
                                                <span className="text-sm text-white/80 truncate block">
                                                  {topic.name}
                                                </span>
                                                {/* Concept tags */}
                                                {conceptsMap.get(topic.id)?.length ? (
                                                  <div className="flex flex-wrap gap-1 mt-1">
                                                    {conceptsMap.get(topic.id)!.sort((a, b) => a.sortOrder - b.sortOrder).map((concept) => (
                                                      <span
                                                        key={concept.id}
                                                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 text-white/40 border border-white/[0.06]"
                                                        title={
                                                          (concept.description ? concept.description : "") +
                                                          (concept.formula ? `\nFormül: ${concept.formula}` : "")
                                                        }
                                                      >
                                                        {concept.name}
                                                      </span>
                                                    ))}
                                                  </div>
                                                ) : null}
                                              </div>

                                              {/* Last studied badge */}
                                              <div className="flex items-center gap-1 shrink-0">
                                                <Clock className="w-3 h-3 text-white/20" />
                                                <span className={`text-xs ${badge.colorClass}`}>
                                                  {badge.text}
                                                </span>
                                              </div>

                                              {/* Kazanım progress mini badge */}
                                              {isTopicExpanded && totalKaz > 0 && (
                                                <span className="text-[10px] text-white/40 shrink-0">
                                                  {checkedCount}/{totalKaz}
                                                </span>
                                              )}

                                              {/* Auto-calculated level badge */}
                                              <span
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold shrink-0 ${
                                                  level > 0
                                                    ? `${LEVEL_COLORS[level]} text-slate-950`
                                                    : "bg-white/10 text-white/40"
                                                }`}
                                                title={LEVEL_LABELS[level]}
                                              >
                                                {level}/5
                                              </span>
                                            </motion.button>

                                            {/* Inline Kazanım Section */}
                                            <AnimatePresence initial={false}>
                                              {isTopicExpanded && (
                                                <motion.div
                                                  initial={{ height: 0, opacity: 0 }}
                                                  animate={{ height: "auto", opacity: 1 }}
                                                  exit={{ height: 0, opacity: 0 }}
                                                  transition={{ duration: 0.2, ease: "easeInOut" }}
                                                  className="overflow-hidden"
                                                >
                                                  <div className="px-4 pb-3 pt-1 ml-6 border-l-2 border-pink-500/20">
                                                    {/* Loading */}
                                                    {isLoadingKaz && (
                                                      <div className="flex items-center gap-2 py-3">
                                                        <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
                                                        <span className="text-xs text-white/40">Kazanımlar yükleniyor...</span>
                                                      </div>
                                                    )}

                                                    {/* Empty state */}
                                                    {!isLoadingKaz && kazList.length === 0 && (
                                                      <p className="text-xs text-white/30 py-2">
                                                        Bu konu için kazanım bulunamadı.
                                                      </p>
                                                    )}

                                                    {/* Kazanım list */}
                                                    {!isLoadingKaz && kazList.length > 0 && (
                                                      <div className="space-y-1.5">
                                                        {kazList.map((kaz) => {
                                                          const isChecked = kaz.progress?.checked ?? false;
                                                          const isSavingK = savingKazanimIds.has(kaz.id);
                                                          const noteValue = localNotes.get(kaz.id) ?? kaz.progress?.notes ?? "";
                                                          const isNoteOpen = expandedNotes.has(kaz.id);

                                                          return (
                                                            <div key={kaz.id} className="rounded-lg bg-white/[0.02] border border-white/[0.05] overflow-hidden">
                                                              <div className="flex items-start gap-2.5 px-3 py-2">
                                                                {/* Checkbox */}
                                                                <button
                                                                  onClick={() => toggleKazanimCheck(kaz.id, topic.id)}
                                                                  disabled={isSavingK}
                                                                  className={`mt-0.5 w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${
                                                                    isChecked
                                                                      ? "bg-pink-500 border-pink-500 text-white"
                                                                      : "border-white/20 bg-transparent hover:border-pink-400/50"
                                                                  } ${isSavingK ? "opacity-50" : "cursor-pointer"}`}
                                                                >
                                                                  {isChecked && <Check className="w-2.5 h-2.5" />}
                                                                </button>

                                                                {/* Content */}
                                                                <div className="flex-1 min-w-0">
                                                                  <div className="flex items-center gap-1.5 flex-wrap">
                                                                    <span className="text-[10px] font-mono font-bold text-pink-400/70">{kaz.code}</span>
                                                                    {kaz.isKeyKazanim && (
                                                                      <Star className="w-3 h-3 text-amber-400 fill-amber-400/40" />
                                                                    )}
                                                                  </div>
                                                                  <p className={`text-xs leading-relaxed ${isChecked ? "text-white/40 line-through" : "text-white/70"}`}>
                                                                    {kaz.description}
                                                                  </p>
                                                                </div>

                                                                {/* Note toggle */}
                                                                <button
                                                                  onClick={() => {
                                                                    setExpandedNotes((prev) => {
                                                                      const next = new Set(prev);
                                                                      if (next.has(kaz.id)) next.delete(kaz.id);
                                                                      else next.add(kaz.id);
                                                                      return next;
                                                                    });
                                                                  }}
                                                                  className={`shrink-0 p-1 rounded transition-colors ${
                                                                    noteValue ? "text-amber-400/60" : "text-white/20 hover:text-white/40"
                                                                  }`}
                                                                  title="Not ekle"
                                                                >
                                                                  <StickyNote className="w-3 h-3" />
                                                                </button>
                                                              </div>

                                                              {/* Notes area */}
                                                              <AnimatePresence>
                                                                {isNoteOpen && (
                                                                  <motion.div
                                                                    initial={{ height: 0 }}
                                                                    animate={{ height: "auto" }}
                                                                    exit={{ height: 0 }}
                                                                    className="overflow-hidden"
                                                                  >
                                                                    <div className="px-3 pb-2">
                                                                      <textarea
                                                                        value={noteValue}
                                                                        onChange={(e) => handleNoteChange(kaz.id, e.target.value)}
                                                                        placeholder="Not ekle..."
                                                                        rows={2}
                                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/70 placeholder-white/20 resize-none focus:outline-none focus:border-pink-400/30"
                                                                      />
                                                                    </div>
                                                                  </motion.div>
                                                                )}
                                                              </AnimatePresence>
                                                            </div>
                                                          );
                                                        })}

                                                        {/* Progress footer */}
                                                        <div className="flex items-center gap-2 pt-1">
                                                          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                                            <div
                                                              className="h-full bg-pink-500 rounded-full transition-all duration-300"
                                                              style={{ width: `${totalKaz > 0 ? (checkedCount / totalKaz) * 100 : 0}%` }}
                                                            />
                                                          </div>
                                                          <span className="text-[10px] text-white/40">
                                                            {checkedCount}/{totalKaz}
                                                          </span>
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>
                                                </motion.div>
                                              )}
                                            </AnimatePresence>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredExamTypes.length === 0 && !loading && (
        <div className="text-center py-16 text-white/30">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Henüz sınav türü bulunamadı.</p>
        </div>
      )}

    </div>
  );
}
