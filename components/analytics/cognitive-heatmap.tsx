"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Flame, Loader2, Lock, Eye, AlertTriangle, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { formatScorePercent } from "@/lib/exam-metrics";

interface TopicCell {
  topicId: string;
  topicName: string;
  raw: number;
  unresolved: number;
  review: number;
  resolved: number;
  totalSeverity: number;
  totalMagnitude: number;
}

interface SubjectRow {
  subjectId: string;
  subjectName: string;
  rawCount: number;
  rawSeverity: number;
  rawMagnitude: number;
  topics: TopicCell[];
}

interface HeatmapMeta {
  totalVoids: number;
  rawVoids: number;
  clarityScore: number;
}

interface HeatmapResponse {
  subjects: SubjectRow[];
  meta: HeatmapMeta;
}

// ── DAG Coverage Types ──
interface DagTopicCoverage {
  topicId: string;
  topicName: string;
  totalNodes: number;
  testedNodes: number;
  untestedNodes: number;
  untestedNodeNames: string[];
}

interface DagSubjectCoverage {
  subjectId: string;
  subjectName: string;
  totalNodes: number;
  testedNodes: number;
  untestedNodes: number;
  topics: DagTopicCoverage[];
}

interface DagCoverageResponse {
  subjects: DagSubjectCoverage[];
  meta: {
    totalNodes: number;
    testedNodes: number;
    untestedNodes: number;
    coverageScore: number;
  };
}

function getHeatColor(unresolved: number, maxUnresolved: number): string {
  if (unresolved === 0) return "rgba(0, 240, 255, 0.08)";
  const ratio = Math.min(1, unresolved / Math.max(1, maxUnresolved));
  if (ratio < 0.25) return `rgba(0, 200, 100, ${0.15 + ratio * 1.4})`;
  if (ratio < 0.5) return `rgba(255, 180, 0, ${0.2 + ratio * 0.8})`;
  if (ratio < 0.75) return `rgba(255, 100, 0, ${0.3 + ratio * 0.6})`;
  return `rgba(255, 42, 85, ${0.4 + ratio * 0.5})`;
}

function getBorderColor(unresolved: number, maxUnresolved: number): string {
  if (unresolved === 0) return "rgba(0, 240, 255, 0.1)";
  const ratio = Math.min(1, unresolved / Math.max(1, maxUnresolved));
  if (ratio < 0.25) return "rgba(0, 200, 100, 0.3)";
  if (ratio < 0.5) return "rgba(255, 180, 0, 0.3)";
  if (ratio < 0.75) return "rgba(255, 100, 0, 0.4)";
  return "rgba(255, 42, 85, 0.5)";
}

/** Fog blur amount based on clarity: 0% clarity = 6px blur, 100% = 0px */
function getFogBlur(clarityScore: number): number {
  return Math.max(0, (1 - clarityScore) * 6);
}

export default function CognitiveHeatmap({ examTypeFilter, examCategoryFilter }: { examTypeFilter?: string; examCategoryFilter?: string }) {
  const [data, setData] = useState<SubjectRow[]>([]);
  const [meta, setMeta] = useState<HeatmapMeta>({ totalVoids: 0, rawVoids: 0, clarityScore: 1 });
  const [dagCoverage, setDagCoverage] = useState<DagCoverageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredTopic, setHoveredTopic] = useState<TopicCell | null>(null);
  const [hoveredRaw, setHoveredRaw] = useState<SubjectRow | null>(null);
  const [hoveredUntested, setHoveredUntested] = useState<{ subjectName: string; topicName: string; untestedNodes: number; untestedNodeNames: string[]; totalNodes: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const parts: string[] = [];
        if (examTypeFilter && examTypeFilter !== "all") parts.push(`examTypeId=${examTypeFilter}`);
        if (examCategoryFilter && examCategoryFilter !== "all") parts.push(`examCategory=${examCategoryFilter}`);
        const params = parts.length > 0 ? `?${parts.join('&')}` : "";

        const [heatmapRes, dagRes] = await Promise.all([
          fetch(`/api/analytics/heatmap${params}`),
          fetch(`/api/analytics/dag-coverage${examTypeFilter && examTypeFilter !== "all" ? `?examTypeId=${examTypeFilter}` : ""}`),
        ]);

        if (heatmapRes.ok) {
          const response: HeatmapResponse = await heatmapRes.json();
          if (Array.isArray(response)) {
            setData(response as unknown as SubjectRow[]);
            setMeta({ totalVoids: 0, rawVoids: 0, clarityScore: 1 });
          } else {
            setData(response.subjects);
            setMeta(response.meta);
          }
        }

        if (dagRes.ok) {
          setDagCoverage(await dagRes.json());
        }
      } catch {
        toast.error("Isi haritasi verileri yuklenemedi");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examTypeFilter, examCategoryFilter]);

  const fogBlur = useMemo(() => getFogBlur(meta.clarityScore), [meta.clarityScore]);
  const hasRawVoids = meta.rawVoids > 0;

  // Build DAG coverage lookup: topicId -> coverage data
  const dagByTopic = useMemo(() => {
    const map = new Map<string, DagTopicCoverage>();
    if (!dagCoverage) return map;
    for (const subject of dagCoverage.subjects) {
      for (const topic of subject.topics) {
        map.set(topic.topicId, topic);
      }
    }
    return map;
  }, [dagCoverage]);

  const dagBySubject = useMemo(() => {
    const map = new Map<string, DagSubjectCoverage>();
    if (!dagCoverage) return map;
    for (const subject of dagCoverage.subjects) {
      map.set(subject.subjectId, subject);
    }
    return map;
  }, [dagCoverage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-pink-500" size={40} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="glass-panel text-center py-20 flex flex-col items-center justify-center">
        <Flame className="text-orange-400/30 mb-4" size={56} />
        <h2 className="text-xl font-bold text-white/60">Henuz zafiyet verisi yok</h2>
        <p className="text-sm text-white/40 mt-2">
          Soguk faz analizini tamamladiktan sonra isi haritasi burada gorunecek.
        </p>
      </div>
    );
  }

  // Find max unresolved for color scaling
  const maxUnresolved = Math.max(
    1,
    ...data.flatMap((s) => s.topics.map((t) => t.unresolved))
  );

  const hasUntestedNodes = dagCoverage && dagCoverage.meta.untestedNodes > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Legend + Clarity Badge + DAG Coverage */}
      <div className="glass-panel p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Flame className="text-orange-400" size={20} />
            <span className="text-white font-bold text-sm">Kognitif Isi Haritasi</span>
            {hasRawVoids && (
              <span className="text-[10px] bg-slate-500/20 text-slate-400 border border-slate-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Eye size={10} />
                Netlik {formatScorePercent(meta.clarityScore)} — {meta.rawVoids} ham zafiyet sisi olusturuyor
              </span>
            )}
            {hasUntestedNodes && (
              <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <AlertTriangle size={10} />
                {dagCoverage!.meta.untestedNodes} kavram dugumu hic test edilmedi
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(0, 240, 255, 0.08)", border: "1px solid rgba(0, 240, 255, 0.1)" }} />
              <span className="text-[11px] text-white/50">Temiz</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(0, 200, 100, 0.3)" }} />
              <span className="text-[11px] text-white/50">Dusuk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(255, 180, 0, 0.5)" }} />
              <span className="text-[11px] text-white/50">Orta</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(255, 100, 0, 0.6)" }} />
              <span className="text-[11px] text-white/50">Yuksek</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(255, 42, 85, 0.7)" }} />
              <span className="text-[11px] text-white/50">Kritik</span>
            </div>
            {hasRawVoids && (
              <>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded border border-dashed border-slate-500/50 bg-slate-500/10 flex items-center justify-center">
                    <Lock size={8} className="text-slate-500" />
                  </div>
                  <span className="text-[11px] text-slate-400">Bilinmeyen</span>
                </div>
              </>
            )}
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded border border-dashed border-purple-500/50 bg-purple-500/10 flex items-center justify-center">
                <MapPin size={8} className="text-purple-500" />
              </div>
              <span className="text-[11px] text-purple-400">Kor Nokta</span>
            </div>
          </div>
        </div>

        {/* DAG Coverage Bar */}
        {dagCoverage && dagCoverage.meta.totalNodes > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest whitespace-nowrap">
              DAG Kapsam
            </span>
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${dagCoverage.meta.coverageScore * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <span className="text-[11px] text-white/50 font-bold tabular-nums whitespace-nowrap">
              {dagCoverage.meta.testedNodes}/{dagCoverage.meta.totalNodes} ({formatScorePercent(dagCoverage.meta.coverageScore)})
            </span>
          </div>
        )}
      </div>

      {/* Topic tooltip */}
      {hoveredTopic && (
        <div className="fixed top-4 right-4 z-50 glass-panel p-4 border border-pink-500/20 shadow-[0_8px_32px_rgba(255,42,133,0.2)] max-w-[240px] pointer-events-none">
          <p className="text-white font-bold text-sm mb-2">{hoveredTopic.topicName}</p>
          <div className="space-y-1 text-[12px]">
            {hoveredTopic.raw > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Ham (RAW):</span>
                <span className="text-white font-bold">{hoveredTopic.raw}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-red-400">Cozulmemis:</span>
              <span className="text-white font-bold">{hoveredTopic.unresolved}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-400">Incelemede:</span>
              <span className="text-white font-bold">{hoveredTopic.review}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-400">Cozuldu:</span>
              <span className="text-white font-bold">{hoveredTopic.resolved}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-white/10">
              <span className="text-white/50">Severity:</span>
              <span className="text-pink-400 font-bold">{hoveredTopic.totalSeverity}</span>
            </div>
            {/* DAG coverage for this topic */}
            {dagByTopic.has(hoveredTopic.topicId) && (() => {
              const cov = dagByTopic.get(hoveredTopic.topicId)!;
              return cov.untestedNodes > 0 ? (
                <div className="flex justify-between pt-1 border-t border-purple-500/20">
                  <span className="text-purple-400">Kor Nokta:</span>
                  <span className="text-purple-300 font-bold">{cov.untestedNodes}/{cov.totalNodes}</span>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}

      {/* Raw tooltip */}
      {hoveredRaw && (
        <div className="fixed top-4 right-4 z-50 glass-panel p-4 border border-slate-500/30 shadow-[0_8px_32px_rgba(100,116,139,0.2)] max-w-[240px] pointer-events-none">
          <p className="text-slate-300 font-bold text-sm mb-2">Bilinmeyen Bolge</p>
          <p className="text-[11px] text-white/40 mb-2">{hoveredRaw.subjectName}</p>
          <div className="space-y-1 text-[12px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Ham zafiyet:</span>
              <span className="text-white font-bold">{hoveredRaw.rawCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Severity:</span>
              <span className="text-slate-300 font-bold">{hoveredRaw.rawSeverity}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 border-t border-white/5 pt-2">
            Sisi kaldirmak icin soguk faz analizinde konularini belirle.
          </p>
        </div>
      )}

      {/* Untested DAG tooltip */}
      {hoveredUntested && (
        <div className="fixed top-4 right-4 z-50 glass-panel p-4 border border-purple-500/30 shadow-[0_8px_32px_rgba(168,85,247,0.2)] max-w-[280px] pointer-events-none">
          <p className="text-purple-300 font-bold text-sm mb-1">Kor Nokta — Savas Sisi</p>
          <p className="text-[11px] text-white/40 mb-2">{hoveredUntested.subjectName} · {hoveredUntested.topicName}</p>
          <div className="space-y-1 text-[12px] mb-2">
            <div className="flex justify-between">
              <span className="text-purple-400">Test edilmemis:</span>
              <span className="text-white font-bold">{hoveredUntested.untestedNodes}/{hoveredUntested.totalNodes} dugum</span>
            </div>
          </div>
          {hoveredUntested.untestedNodeNames.length > 0 && (
            <div className="space-y-0.5 mb-2">
              {hoveredUntested.untestedNodeNames.slice(0, 5).map((name, i) => (
                <p key={i} className="text-[10px] text-purple-300/60">· {name}</p>
              ))}
              {hoveredUntested.untestedNodeNames.length > 5 && (
                <p className="text-[10px] text-purple-300/40">+{hoveredUntested.untestedNodeNames.length - 5} daha</p>
              )}
            </div>
          )}
          <p className="text-[10px] text-purple-400/80 border-t border-purple-500/20 pt-2">
            Bu konu hic test edilmedi. DAG uzerindeki kritik bagimliliklar risk altinda. Aydinlatmak icin bir mini-test coz.
          </p>
        </div>
      )}

      {/* Heatmap Grid */}
      {data.map((subject, sIdx) => {
        const subjectDag = dagBySubject.get(subject.subjectId);
        const subjectUntested = subjectDag?.untestedNodes ?? 0;

        return (
          <motion.div
            key={subject.subjectId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sIdx * 0.05 }}
            className="glass-panel p-5"
          >
            <h3 className="text-white font-bold text-[15px] mb-4 flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor:
                    subject.topics.some((t) => t.unresolved > maxUnresolved * 0.5)
                      ? "#ff2a55"
                      : "#00f0ff",
                }}
              />
              {subject.subjectName}
              <span className="text-white/30 text-[11px] font-normal ml-auto flex items-center gap-2">
                {subject.topics.reduce((s, t) => s + t.unresolved, 0)} cozulmemis
                {subject.rawCount > 0 && (
                  <span className="text-slate-500">· {subject.rawCount} bilinmeyen</span>
                )}
                {subjectUntested > 0 && (
                  <span className="text-purple-400">· {subjectUntested} kor nokta</span>
                )}
              </span>
            </h3>

            <div className="flex flex-wrap gap-2 relative">
              {/* Regular topic cells — with fog blur based on clarity */}
              <div
                className="flex flex-wrap gap-2 flex-1 transition-all duration-700"
                style={{
                  filter: fogBlur > 0 ? `blur(${fogBlur}px)` : 'none',
                }}
              >
                {subject.topics.map((topic) => {
                  const topicDag = dagByTopic.get(topic.topicId);
                  const hasUntested = topicDag && topicDag.untestedNodes > 0;

                  return (
                    <div
                      key={topic.topicId}
                      className="relative px-3 py-2 rounded-lg cursor-default transition-all duration-200 hover:scale-105 hover:shadow-[0_4px_16px_rgba(255,42,133,0.2)]"
                      style={{
                        backgroundColor: getHeatColor(topic.unresolved, maxUnresolved),
                        border: `1px solid ${getBorderColor(topic.unresolved, maxUnresolved)}`,
                        minWidth: "80px",
                      }}
                      onMouseEnter={() => { setHoveredTopic(topic); setHoveredRaw(null); setHoveredUntested(null); }}
                      onMouseLeave={() => setHoveredTopic(null)}
                    >
                      <span className="text-[12px] text-white/90 font-medium block truncate max-w-[140px]">
                        {topic.topicName}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {topic.unresolved > 0 && (
                          <span className="text-[10px] text-white/60 font-bold">
                            {topic.unresolved}
                          </span>
                        )}
                        {/* Fog of War indicator for untested DAG nodes */}
                        {hasUntested && (
                          <span className="text-[9px] text-purple-400 font-bold flex items-center gap-0.5" title={`${topicDag!.untestedNodes} test edilmemis kavram`}>
                            <MapPin size={8} />
                            {topicDag!.untestedNodes}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dark Matter Column — "Bilinmeyen Bolge" (RAW voids) */}
              {subject.rawCount > 0 && (
                <div
                  className="relative px-3 py-2 rounded-lg cursor-default transition-all duration-200 hover:scale-105 border border-dashed border-slate-500/30 bg-slate-500/[0.06] min-w-[100px] flex flex-col items-center justify-center gap-1"
                  onMouseEnter={() => { setHoveredRaw(subject); setHoveredTopic(null); setHoveredUntested(null); }}
                  onMouseLeave={() => setHoveredRaw(null)}
                >
                  <Lock size={12} className="text-slate-500" />
                  <span className="text-[11px] text-slate-400 font-medium">Bilinmeyen</span>
                  <span className="text-[13px] text-slate-300 font-bold">{subject.rawCount}</span>
                  <span className="text-[9px] text-slate-500">Sisi kaldir</span>
                </div>
              )}

              {/* Fog of War Column — Untested DAG nodes */}
              {subjectDag && subjectDag.untestedNodes > 0 && (
                <div
                  className="relative px-3 py-2 rounded-lg cursor-default transition-all duration-200 hover:scale-105 border border-dashed border-purple-500/30 bg-purple-500/[0.06] min-w-[100px] flex flex-col items-center justify-center gap-1"
                  onMouseEnter={() => {
                    setHoveredUntested({
                      subjectName: subject.subjectName,
                      topicName: `${subjectDag.topics.filter(t => t.untestedNodes > 0).length} konuda`,
                      untestedNodes: subjectDag.untestedNodes,
                      totalNodes: subjectDag.totalNodes,
                      untestedNodeNames: subjectDag.topics.flatMap(t => t.untestedNodeNames).slice(0, 8),
                    });
                    setHoveredTopic(null);
                    setHoveredRaw(null);
                  }}
                  onMouseLeave={() => setHoveredUntested(null)}
                >
                  <MapPin size={12} className="text-purple-400" />
                  <span className="text-[11px] text-purple-400 font-medium">Kor Nokta</span>
                  <span className="text-[13px] text-purple-300 font-bold">{subjectDag.untestedNodes}</span>
                  <span className="text-[9px] text-purple-500">Aydinlat</span>
                </div>
              )}
            </div>

            {/* Fog overlay nudge — shows when clarity is low */}
            {fogBlur > 2 && subject.topics.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                <Lock size={11} />
                <span>
                  {meta.rawVoids} hatanin nedeni belirsiz — soguk faz analizini tamamlayarak sisi kaldir
                </span>
              </div>
            )}

            {/* DAG blind spot nudge per topic */}
            {subjectDag && subjectDag.topics.filter(t => t.untestedNodes > 0).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {subjectDag.topics.filter(t => t.untestedNodes > 0).slice(0, 4).map(t => (
                  <div
                    key={t.topicId}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/[0.06] border border-purple-500/15 cursor-default transition-all hover:bg-purple-500/10"
                    onMouseEnter={() => {
                      setHoveredUntested({
                        subjectName: subject.subjectName,
                        topicName: t.topicName,
                        untestedNodes: t.untestedNodes,
                        totalNodes: t.totalNodes,
                        untestedNodeNames: t.untestedNodeNames,
                      });
                      setHoveredTopic(null);
                      setHoveredRaw(null);
                    }}
                    onMouseLeave={() => setHoveredUntested(null)}
                  >
                    <MapPin size={9} className="text-purple-400/60" />
                    <span className="text-[10px] text-purple-300/70 font-medium truncate max-w-[120px]">{t.topicName}</span>
                    <span className="text-[9px] text-purple-400 font-bold">{t.untestedNodes}</span>
                  </div>
                ))}
                {subjectDag.topics.filter(t => t.untestedNodes > 0).length > 4 && (
                  <span className="text-[10px] text-purple-400/40 self-center">
                    +{subjectDag.topics.filter(t => t.untestedNodes > 0).length - 4} konu daha
                  </span>
                )}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
