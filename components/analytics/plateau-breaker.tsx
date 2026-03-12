"use client";

import React, { useState, useEffect } from "react";
import {
  ComposedChart,
  Area,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Zap, Loader2, TrendingUp, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface DataPoint {
  x: number;
  y: number;
  date: string;
  examTitle: string;
}

interface TrendPoint {
  date: string;
  predicted: number;
  lower: number;
  upper: number;
}

interface RegressionData {
  slope: number;
  intercept: number;
  rSquared: number;
  n: number;
  dataPoints: DataPoint[];
  trendLine: TrendPoint[];
  weeklyGrowth: number;
  currentEstimate: number;
  ceiling: number;
  predictions: Array<{
    targetNet: number;
    estimatedDate: string | null;
    daysFromNow: number | null;
    confidence: number;
  }>;
}

interface BarrierTopic {
  topicId: string;
  topicName: string;
  subjectName: string;
  totalSeverity: number;
  unresolved: number;
}

const tooltipStyle = {
  borderRadius: "16px",
  border: "1px solid rgba(255,42,133,0.2)",
  backgroundColor: "rgba(17,9,21,0.95)",
  boxShadow: "0 8px 32px rgba(255,42,133,0.15)",
  color: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(12px)",
};

export default function PlateauBreaker({
  examTypeFilter,
  subjectFilter,
}: {
  examTypeFilter?: string;
  subjectFilter?: string;
}) {
  const [regression, setRegression] = useState<RegressionData | null>(null);
  const [barriers, setBarriers] = useState<BarrierTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const typeParam = examTypeFilter && examTypeFilter !== "all" ? `examTypeId=${examTypeFilter}` : "";
        const subjectParam = subjectFilter && subjectFilter !== "all" ? `&subjectId=${subjectFilter}` : "";
        const params = `${typeParam}${subjectParam}`;

        const [regRes, topicsRes] = await Promise.all([
          fetch(`/api/analytics/regression?${params}&targets=70,80,90,100`),
          fetch(`/api/analytics/topics?${params}`),
        ]);

        if (!regRes.ok || !topicsRes.ok) throw new Error();

        const regData = await regRes.json();
        const topicsData = await topicsRes.json();

        setRegression(regData);

        // Top 3 barrier topics (highest severity, unresolved)
        const topBarriers = topicsData
          .filter((t: any) => t.unresolvedCount > 0)
          .sort((a: any, b: any) => b.totalSeverity - a.totalSeverity)
          .slice(0, 3)
          .map((t: any) => ({
            topicId: t.topicId,
            topicName: t.topicName,
            subjectName: t.subjectName,
            totalSeverity: t.totalSeverity,
            unresolved: t.unresolvedCount,
          }));

        setBarriers(topBarriers);
      } catch {
        toast.error("Plato kırıcı verileri yüklenemedi");
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

  if (!regression || regression.n < 2) {
    return (
      <div className="glass-panel text-center py-20 flex flex-col items-center justify-center">
        <Zap className="text-yellow-400/30 mb-4" size={56} />
        <h2 className="text-xl font-bold text-white/60">Projeksiyon için yeterli veri yok</h2>
        <p className="text-sm text-white/40 mt-2">
          En az 2 deneme sonucu girildikten sonra plato kırıcı burada görünecek.
        </p>
      </div>
    );
  }

  // Build chart data: merge data points and trend line
  const chartData = regression.trendLine.map((tp) => ({
    date: tp.date,
    predicted: tp.predicted,
    lower: tp.lower,
    upper: tp.upper,
    confidence: [tp.lower, tp.upper],
  }));

  // Add actual data points with matching dates
  const actualPoints = regression.dataPoints.map((dp) => ({
    date: dp.date,
    actual: dp.y,
    examTitle: dp.examTitle,
  }));

  // Find the nearest reachable target
  const reachableTarget = regression.predictions.find(
    (p) => p.daysFromNow !== null && p.daysFromNow > 0
  );

  // Detect plateau: if weekly growth is very low relative to current estimate
  const isPlateauing =
    regression.weeklyGrowth > 0 &&
    regression.weeklyGrowth < regression.currentEstimate * 0.005;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="glass-panel p-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Zap className="text-yellow-400" size={20} />
          <span className="text-white font-bold text-sm">Plato Kırıcı Projeksiyon</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-white/40">
          <span>
            Tavan: <span className="text-cyan-400 font-bold">{regression.ceiling}</span>
          </span>
          <span>
            Güncel tahmin: <span className="text-pink-400 font-bold">{regression.currentEstimate}</span>
          </span>
          <span>
            Haftalık büyüme: <span className="text-green-400 font-bold">+{regression.weeklyGrowth}</span>
          </span>
        </div>
      </div>

      {/* Plateau Warning */}
      {isPlateauing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-4 border border-yellow-500/20 bg-yellow-500/5 flex items-center gap-3"
        >
          <AlertTriangle className="text-yellow-400 flex-shrink-0" size={20} />
          <div>
            <p className="text-yellow-300 font-bold text-sm">Plato Tespit Edildi</p>
            <p className="text-white/50 text-[12px]">
              Haftalık büyüme oranın çok düşük. Aşağıdaki bariyer konuları çözmek platonu kırabilir.
            </p>
          </div>
        </motion.div>
      )}

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-4 sm:p-6"
      >
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
            <defs>
              <linearGradient id="plateauConfidence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff2a85" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ff2a85" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              data={chartData}
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }}
              tickLine={false}
              axisLine={false}
              domain={[0, Math.ceil(regression.ceiling * 1.05)]}
            />
            <Tooltip contentStyle={tooltipStyle} />

            {/* Ceiling reference line */}
            <ReferenceLine
              y={regression.ceiling}
              stroke="rgba(0, 240, 255, 0.3)"
              strokeDasharray="8 4"
              label={{
                value: `Tavan: ${regression.ceiling}`,
                position: "insideTopRight",
                fill: "rgba(0, 240, 255, 0.5)",
                fontSize: 11,
              }}
            />

            {/* Target reference line */}
            {reachableTarget && (
              <ReferenceLine
                y={reachableTarget.targetNet}
                stroke="rgba(255, 184, 77, 0.3)"
                strokeDasharray="4 4"
                label={{
                  value: `Hedef: ${reachableTarget.targetNet}`,
                  position: "insideTopRight",
                  fill: "rgba(255, 184, 77, 0.5)",
                  fontSize: 11,
                }}
              />
            )}

            {/* Confidence band */}
            <Area
              data={chartData}
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="url(#plateauConfidence)"
              name="Üst Sınır"
            />
            <Area
              data={chartData}
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="transparent"
              name="Alt Sınır"
            />

            {/* Predicted trend line */}
            <Line
              data={chartData}
              type="monotone"
              dataKey="predicted"
              stroke="#ff2a85"
              strokeWidth={2.5}
              dot={false}
              name="Projeksiyon"
            />

            {/* Actual data points */}
            <Scatter
              data={actualPoints}
              dataKey="actual"
              fill="#00f0ff"
              name="Gerçek Net"
              shape={(props: any) => {
                const { cx, cy } = props;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill="#00f0ff"
                    stroke="#fff"
                    strokeWidth={1.5}
                  />
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Barrier Topics */}
      {barriers.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-white font-bold text-sm flex items-center gap-2 px-1">
            <AlertTriangle className="text-red-400" size={16} />
            En Büyük Bariyer Konuları
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {barriers.map((b, idx) => (
              <motion.div
                key={b.topicId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="glass bg-white/[0.02] rounded-2xl border border-red-500/10 p-4 hover:border-red-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[11px] text-white/40 font-medium">{b.subjectName}</span>
                  <span className="text-[10px] bg-red-500/10 px-2 py-0.5 rounded-full text-red-400 font-bold border border-red-500/20">
                    #{idx + 1}
                  </span>
                </div>
                <p className="text-white font-bold text-[14px] mb-2">{b.topicName}</p>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-red-400">
                    {b.unresolved} çözülmemiş
                  </span>
                  <span className="text-white/30">|</span>
                  <span className="text-white/50">
                    Severity: <span className="text-pink-400 font-bold">{b.totalSeverity.toFixed(1)}</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-[11px] text-white/30 px-1">
            Bu konuları çözmek, net artış hızını doğrudan artırır ve plato eşiğini yukarı iter.
          </p>
        </div>
      )}

      {/* Prediction Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {regression.predictions.map((pred) => (
          <motion.div
            key={pred.targetNet}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass bg-white/[0.02] rounded-2xl border border-white/5 p-4 text-center hover:border-pink-500/20 transition-all"
          >
            <span className="text-2xl font-bold text-white tracking-tighter block">
              {pred.targetNet}
            </span>
            <span className="text-[10px] text-white/30 uppercase tracking-widest">net hedef</span>
            {pred.daysFromNow !== null ? (
              <>
                <div className="mt-2 text-[13px] font-bold text-pink-400">
                  {pred.daysFromNow <= 0 ? "Ulaşıldı!" : `${pred.daysFromNow} gün`}
                </div>
                {pred.estimatedDate && (
                  <div className="text-[11px] text-white/40">{pred.estimatedDate}</div>
                )}
              </>
            ) : (
              <div className="mt-2 text-[11px] text-white/30">
                {pred.targetNet >= regression.ceiling ? "Tavana yakın" : "Hesaplanamıyor"}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
