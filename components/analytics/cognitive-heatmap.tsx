"use client";

import React, { useState, useEffect } from "react";
import { Flame, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface TopicCell {
  topicId: string;
  topicName: string;
  unresolved: number;
  review: number;
  resolved: number;
  totalSeverity: number;
  totalMagnitude: number;
}

interface SubjectRow {
  subjectId: string;
  subjectName: string;
  topics: TopicCell[];
}

function getHeatColor(unresolved: number, maxUnresolved: number): string {
  if (unresolved === 0) return "rgba(0, 240, 255, 0.08)";
  const ratio = Math.min(1, unresolved / Math.max(1, maxUnresolved));
  // Green → Yellow → Orange → Red
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

export default function CognitiveHeatmap({ examTypeFilter }: { examTypeFilter?: string }) {
  const [data, setData] = useState<SubjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredTopic, setHoveredTopic] = useState<TopicCell | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = examTypeFilter && examTypeFilter !== "all" ? `?examTypeId=${examTypeFilter}` : "";
        const res = await fetch(`/api/analytics/heatmap${params}`);
        if (!res.ok) throw new Error();
        setData(await res.json());
      } catch {
        toast.error("Isı haritası verileri yüklenemedi");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examTypeFilter]);

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
      {/* Legend */}
      <div className="glass-panel p-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Flame className="text-orange-400" size={20} />
          <span className="text-white font-bold text-sm">Kognitif Isı Haritası</span>
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
        </div>
      </div>

      {/* Tooltip */}
      {hoveredTopic && (
        <div className="fixed top-4 right-4 z-50 glass-panel p-4 border border-pink-500/20 shadow-[0_8px_32px_rgba(255,42,133,0.2)] max-w-[240px] pointer-events-none">
          <p className="text-white font-bold text-sm mb-2">{hoveredTopic.topicName}</p>
          <div className="space-y-1 text-[12px]">
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
            <span className="text-white/30 text-[11px] font-normal ml-auto">
              {subject.topics.reduce((s, t) => s + t.unresolved, 0)} çözülmemiş
            </span>
          </h3>

          <div className="flex flex-wrap gap-2">
            {subject.topics.map((topic) => (
              <div
                key={topic.topicId}
                className="relative px-3 py-2 rounded-lg cursor-default transition-all duration-200 hover:scale-105 hover:shadow-[0_4px_16px_rgba(255,42,133,0.2)]"
                style={{
                  backgroundColor: getHeatColor(topic.unresolved, maxUnresolved),
                  border: `1px solid ${getBorderColor(topic.unresolved, maxUnresolved)}`,
                  minWidth: "80px",
                }}
                onMouseEnter={() => setHoveredTopic(topic)}
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
        </motion.div>
      ))}
    </div>
  );
}
