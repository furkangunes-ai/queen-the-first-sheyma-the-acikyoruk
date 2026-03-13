"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Flame, Loader2, Lock, Eye } from "lucide-react";
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

export default function CognitiveHeatmap({ examTypeFilter }: { examTypeFilter?: string }) {
  const [data, setData] = useState<SubjectRow[]>([]);
  const [meta, setMeta] = useState<HeatmapMeta>({ totalVoids: 0, rawVoids: 0, clarityScore: 1 });
  const [loading, setLoading] = useState(true);
  const [hoveredTopic, setHoveredTopic] = useState<TopicCell | null>(null);
  const [hoveredRaw, setHoveredRaw] = useState<SubjectRow | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = examTypeFilter && examTypeFilter !== "all" ? `?examTypeId=${examTypeFilter}` : "";
        const res = await fetch(`/api/analytics/heatmap${params}`);
        if (!res.ok) throw new Error();
        const response: HeatmapResponse = await res.json();
        // Handle both old array format and new {subjects, meta} format
        if (Array.isArray(response)) {
          setData(response as unknown as SubjectRow[]);
          setMeta({ totalVoids: 0, rawVoids: 0, clarityScore: 1 });
        } else {
          setData(response.subjects);
          setMeta(response.meta);
        }
      } catch {
        toast.error("Isı haritası verileri yüklenemedi");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examTypeFilter]);

  const fogBlur = useMemo(() => getFogBlur(meta.clarityScore), [meta.clarityScore]);
  const hasRawVoids = meta.rawVoids > 0;

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
        <h2 className="text-xl font-bold text-white/60">Henüz zafiyet verisi yok</h2>
        <p className="text-sm text-white/40 mt-2">
          Soğuk faz analizini tamamladıktan sonra ısı haritası burada görünecek.
        </p>
      </div>
    );
  }

  // Find max unresolved for color scaling
  const maxUnresolved = Math.max(
    1,
    ...data.flatMap((s) => s.topics.map((t) => t.unresolved))
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Legend + Clarity Badge */}
      <div className="glass-panel p-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Flame className="text-orange-400" size={20} />
          <span className="text-white font-bold text-sm">Kognitif Isı Haritası</span>
          {hasRawVoids && (
            <span className="ml-2 text-[10px] bg-slate-500/20 text-slate-400 border border-slate-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Eye size={10} />
              Netlik {formatScorePercent(meta.clarityScore)} — {meta.rawVoids} ham zafiyet sisi oluşturuyor
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(0, 240, 255, 0.08)", border: "1px solid rgba(0, 240, 255, 0.1)" }} />
            <span className="text-[11px] text-white/50">Temiz</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(0, 200, 100, 0.3)" }} />
            <span className="text-[11px] text-white/50">Düşük</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(255, 180, 0, 0.5)" }} />
            <span className="text-[11px] text-white/50">Orta</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(255, 100, 0, 0.6)" }} />
            <span className="text-[11px] text-white/50">Yüksek</span>
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
        </div>
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
              <span className="text-red-400">Çözülmemiş:</span>
              <span className="text-white font-bold">{hoveredTopic.unresolved}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-400">İncelemede:</span>
              <span className="text-white font-bold">{hoveredTopic.review}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-400">Çözüldü:</span>
              <span className="text-white font-bold">{hoveredTopic.resolved}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-white/10">
              <span className="text-white/50">Severity:</span>
              <span className="text-pink-400 font-bold">{hoveredTopic.totalSeverity}</span>
            </div>
          </div>
        </div>
      )}

      {/* Raw tooltip */}
      {hoveredRaw && (
        <div className="fixed top-4 right-4 z-50 glass-panel p-4 border border-slate-500/30 shadow-[0_8px_32px_rgba(100,116,139,0.2)] max-w-[240px] pointer-events-none">
          <p className="text-slate-300 font-bold text-sm mb-2">Bilinmeyen Bölge</p>
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
            Sisi kaldırmak için soğuk faz analizinde konularını belirle.
          </p>
        </div>
      )}

      {/* Heatmap Grid */}
      {data.map((subject, sIdx) => (
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
              {subject.topics.reduce((s, t) => s + t.unresolved, 0)} çözülmemiş
              {subject.rawCount > 0 && (
                <span className="text-slate-500">• {subject.rawCount} bilinmeyen</span>
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
              {subject.topics.map((topic) => (
                <div
                  key={topic.topicId}
                  className="relative px-3 py-2 rounded-lg cursor-default transition-all duration-200 hover:scale-105 hover:shadow-[0_4px_16px_rgba(255,42,133,0.2)]"
                  style={{
                    backgroundColor: getHeatColor(topic.unresolved, maxUnresolved),
                    border: `1px solid ${getBorderColor(topic.unresolved, maxUnresolved)}`,
                    minWidth: "80px",
                  }}
                  onMouseEnter={() => { setHoveredTopic(topic); setHoveredRaw(null); }}
                  onMouseLeave={() => setHoveredTopic(null)}
                >
                  <span className="text-[12px] text-white/90 font-medium block truncate max-w-[140px]">
                    {topic.topicName}
                  </span>
                  {topic.unresolved > 0 && (
                    <span className="text-[10px] text-white/60 font-bold">
                      {topic.unresolved}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Dark Matter Column — "Bilinmeyen Bölge" */}
            {subject.rawCount > 0 && (
              <div
                className="relative px-3 py-2 rounded-lg cursor-default transition-all duration-200 hover:scale-105 border border-dashed border-slate-500/30 bg-slate-500/[0.06] min-w-[100px] flex flex-col items-center justify-center gap-1"
                onMouseEnter={() => { setHoveredRaw(subject); setHoveredTopic(null); }}
                onMouseLeave={() => setHoveredRaw(null)}
              >
                <Lock size={12} className="text-slate-500" />
                <span className="text-[11px] text-slate-400 font-medium">Bilinmeyen</span>
                <span className="text-[13px] text-slate-300 font-bold">{subject.rawCount}</span>
                <span className="text-[9px] text-slate-500">Sisi kaldır</span>
              </div>
            )}
          </div>

          {/* Fog overlay nudge — shows when clarity is low */}
          {fogBlur > 2 && subject.topics.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
              <Lock size={11} />
              <span>
                {meta.rawVoids} hatanın nedeni belirsiz — soğuk faz analizini tamamlayarak sisi kaldır
              </span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
