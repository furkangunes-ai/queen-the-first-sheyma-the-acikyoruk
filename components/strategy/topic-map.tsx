"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Clock,
  BookOpen,
  Tag,
} from "lucide-react";
import { useSession } from "next-auth/react";
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
                                        const isSaving =
                                          savingTopicId === topic.id;

                                        return (
                                          <motion.div
                                            key={topic.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{
                                              duration: 0.15,
                                              delay: tIdx * 0.02,
                                            }}
                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors border-b border-white/[0.03] last:border-b-0"
                                          >
                                            {/* Topic name + concepts */}
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
                                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 text-white/40 border border-white/[0.06] hover:bg-white/10 hover:text-white/60 transition-colors cursor-default"
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
                                              <span
                                                className={`text-xs ${badge.colorClass}`}
                                              >
                                                {badge.text}
                                              </span>
                                            </div>

                                            {/* Level buttons */}
                                            <div className="flex items-center gap-1 shrink-0">
                                              {[0, 1, 2, 3, 4, 5].map(
                                                (lvl) => {
                                                  const isSelected =
                                                    level === lvl;

                                                  return (
                                                    <button
                                                      key={lvl}
                                                      disabled={isSaving}
                                                      onClick={() =>
                                                        updateKnowledgeLevel(
                                                          topic.id,
                                                          lvl
                                                        )
                                                      }
                                                      title={LEVEL_LABELS[lvl]}
                                                      className={`w-7 h-7 rounded-lg text-[11px] font-semibold transition-all duration-150 ${
                                                        isSelected
                                                          ? `${LEVEL_COLORS[lvl]} text-slate-950 shadow-md`
                                                          : `border ${LEVEL_BORDER_COLORS[lvl]} bg-transparent hover:bg-white/5`
                                                      } ${
                                                        isSaving
                                                          ? "opacity-50 cursor-not-allowed"
                                                          : "cursor-pointer"
                                                      }`}
                                                    >
                                                      {lvl}
                                                    </button>
                                                  );
                                                }
                                              )}
                                            </div>
                                          </motion.div>
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
