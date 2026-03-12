"use client";

import React, { useState, useEffect } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Crosshair, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface ErrorReasonData {
  errorReason: string;
  errorReasonLabel: string;
  totalMagnitude: number;
  voidCount: number;
  subjectBreakdown: Array<{
    subjectId: string;
    subjectName: string;
    totalMagnitude: number;
  }>;
}

interface RadarData {
  totalVoids: number;
  errorReasons: ErrorReasonData[];
}

const RADAR_COLORS = {
  fill: "rgba(255, 42, 133, 0.25)",
  stroke: "#ff2a85",
  grid: "rgba(255, 255, 255, 0.08)",
  axis: "rgba(255, 255, 255, 0.5)",
};

const tooltipStyle = {
  borderRadius: "16px",
  border: "1px solid rgba(255,42,133,0.2)",
  backgroundColor: "rgba(17,9,21,0.95)",
  boxShadow: "0 8px 32px rgba(255,42,133,0.15)",
  color: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(12px)",
};

export default function RootCauseRadar({ examTypeFilter, subjectFilter }: { examTypeFilter?: string; subjectFilter?: string }) {
  const [data, setData] = useState<RadarData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const typeParam = examTypeFilter && examTypeFilter !== "all" ? `examTypeId=${examTypeFilter}` : "";
        const subjectParam = subjectFilter && subjectFilter !== "all" ? `&subjectId=${subjectFilter}` : "";
        const res = await fetch(`/api/analytics/errors?${typeParam}${subjectParam}`);
        if (!res.ok) throw new Error();
        setData(await res.json());
      } catch {
        toast.error("Radar verileri yüklenemedi");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examTypeFilter, subjectFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-pink-500" size={40} />
      </div>
    );
  }

  if (!data || data.errorReasons.length === 0) {
    return (
      <div className="glass-panel text-center py-20 flex flex-col items-center justify-center">
        <Crosshair className="text-pink-400/30 mb-4" size={56} />
        <h2 className="text-xl font-bold text-white/60">Henüz hata nedeni verisi yok</h2>
        <p className="text-sm text-white/40 mt-2">
          Soğuk faz analizini tamamladıktan sonra radar burada görünecek.
        </p>
      </div>
    );
  }

  const radarData = data.errorReasons.map((er) => ({
    reason: er.errorReasonLabel,
    magnitude: er.totalMagnitude,
    count: er.voidCount,
    fullMark: Math.max(...data.errorReasons.map((e) => e.totalMagnitude)) * 1.2,
  }));

  const maxMagnitude = Math.max(...data.errorReasons.map((e) => e.totalMagnitude));

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="glass-panel p-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Crosshair className="text-pink-400" size={20} />
          <span className="text-white font-bold text-sm">Kök Neden Radarı</span>
        </div>
        <div className="text-[11px] text-white/40">
          Toplam zafiyet: <span className="text-pink-400 font-bold">{data.totalVoids}</span> magnitude
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-6 flex items-center justify-center min-h-[400px]"
        >
          <ResponsiveContainer width="100%" height={380}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke={RADAR_COLORS.grid} />
              <PolarAngleAxis
                dataKey="reason"
                tick={{ fontSize: 11, fill: RADAR_COLORS.axis, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
                axisLine={false}
              />
              <Radar
                name="Magnitude"
                dataKey="magnitude"
                stroke={RADAR_COLORS.stroke}
                fill={RADAR_COLORS.fill}
                strokeWidth={2}
                dot={{ r: 4, fill: RADAR_COLORS.stroke, strokeWidth: 0 }}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => [
                  `${value} magnitude`,
                  name,
                ]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Breakdown Cards */}
        <div className="flex flex-col gap-3">
          {data.errorReasons
            .sort((a, b) => b.totalMagnitude - a.totalMagnitude)
            .map((er, idx) => {
              const ratio = er.totalMagnitude / Math.max(1, maxMagnitude);
              return (
                <motion.div
                  key={er.errorReason}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass bg-white/[0.02] rounded-2xl border border-white/5 p-4 hover:border-pink-500/20 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: ratio > 0.7 ? "#ff2a55" : ratio > 0.4 ? "#ffb84d" : "#00f0ff",
                          boxShadow: `0 0 8px ${ratio > 0.7 ? "rgba(255,42,85,0.5)" : ratio > 0.4 ? "rgba(255,184,77,0.5)" : "rgba(0,240,255,0.5)"}`,
                        }}
                      />
                      <span className="text-white font-bold text-[13px]">{er.errorReasonLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-white/40">{er.voidCount} zafiyet</span>
                      <span className="text-[11px] bg-pink-500/10 px-2 py-0.5 rounded-full font-bold text-pink-400 border border-pink-500/20">
                        ×{er.totalMagnitude}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-white/[0.05] rounded-full h-1.5 mb-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ratio * 100}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.05 }}
                      className="h-full rounded-full"
                      style={{
                        background: ratio > 0.7
                          ? "linear-gradient(90deg, #ff2a55, #ff6b8a)"
                          : ratio > 0.4
                          ? "linear-gradient(90deg, #ffb84d, #ffd699)"
                          : "linear-gradient(90deg, #00f0ff, #66f7ff)",
                      }}
                    />
                  </div>

                  {/* Subject breakdown chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {er.subjectBreakdown.map((sb) => (
                      <span
                        key={sb.subjectId}
                        className="text-[11px] bg-white/[0.04] border border-white/10 px-2 py-1 rounded-lg text-white/60 font-medium"
                      >
                        {sb.subjectName}: <span className="text-white/90 font-bold">{sb.totalMagnitude}</span>
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
