"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format, startOfWeek, addDays, addWeeks } from "date-fns";
import { tr } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import {
  ChevronLeft,
  ChevronRight,
  Bot,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Target,
  Clock,
  BookOpen,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ---------- Types ----------

interface NetScoreChange {
  subjectName: string;
  previousNet: number;
  currentNet: number;
}

interface WeeklyAnalysisData {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  plannedItems: number;
  completedItems: number;
  totalStudyMinutes: number;
  totalQuestions: number;
  netScoreChanges: NetScoreChange[] | null;
  aiSummary: string | null;
  aiRecommendations: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------- Helpers ----------

function getMonday(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

function formatDateRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  return `${format(weekStart, "d MMM", { locale: tr })} - ${format(weekEnd, "d MMM yyyy", { locale: tr })}`;
}

function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} dk`;
  if (minutes === 0) return `${hours} sa`;
  return `${hours} sa ${minutes} dk`;
}

function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

// ---------- Sub-components ----------

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white/5 backdrop-blur-md border border-pink-500/15 rounded-2xl ${className}`}
    >
      {children}
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  iconColor = "text-pink-400",
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  iconColor?: string;
}) {
  return (
    <GlassCard className="p-4 flex flex-col items-center justify-center py-5">
      <Icon className={`${iconColor} mb-1.5`} size={20} />
      <span className="text-2xl font-bold text-white/90">{value}</span>
      <span className="text-[10px] text-white/50 uppercase tracking-widest mt-0.5">
        {label}
      </span>
    </GlassCard>
  );
}

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="bg-slate-900/95 rounded-lg shadow-lg shadow-pink-500/10 border border-pink-500/15 p-3 text-sm">
      <p className="font-medium text-white/70 mb-1">{item.label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} style={{ color: entry.color }} className="text-sm">
          <span
            className="inline-block w-2 h-2 rounded-full mr-1.5"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// ---------- Main Component ----------

export default function WeeklyAnalysis() {
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [analysis, setAnalysis] = useState<WeeklyAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Week navigation
  const goToPreviousWeek = useCallback(() => {
    setWeekStart((prev) => addWeeks(prev, -1));
  }, []);

  const goToNextWeek = useCallback(() => {
    setWeekStart((prev) => addWeeks(prev, 1));
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setWeekStart(getMonday(new Date()));
  }, []);

  const isCurrentWeek =
    toISODate(weekStart) === toISODate(getMonday(new Date()));

  // Fetch analysis
  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/weekly-analysis?weekStartDate=${toISODate(weekStart)}`
      );
      if (!res.ok) {
        throw new Error("Analiz verileri alinamadi");
      }
      const data = await res.json();
      setAnalysis(data || null);
    } catch (err: any) {
      setError(err.message || "Bir hata olustu");
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  // Generate analysis
  const generateAnalysis = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const weekEnd = addDays(weekStart, 6);
      const res = await fetch("/api/weekly-analysis/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStartDate: toISODate(weekStart),
          weekEndDate: toISODate(weekEnd),
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "Analiz olusturulamadi");
      }
      const data = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message || "Bir hata olustu");
    } finally {
      setGenerating(false);
    }
  }, [weekStart]);

  // Compute derived values
  const completionPercentage =
    analysis && analysis.plannedItems > 0
      ? Math.round((analysis.completedItems / analysis.plannedItems) * 100)
      : 0;

  const averageNetChange =
    analysis?.netScoreChanges && analysis.netScoreChanges.length > 0
      ? analysis.netScoreChanges.reduce(
          (sum, n) => sum + (n.currentNet - n.previousNet),
          0
        ) / analysis.netScoreChanges.length
      : 0;

  // Bar chart data for planned vs completed
  const chartData =
    analysis && analysis.plannedItems > 0
      ? [
          {
            label: "Plan",
            Planlanan: analysis.plannedItems,
            Tamamlanan: analysis.completedItems,
          },
        ]
      : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Week Navigation */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousWeek}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-pink-500/15 transition-colors"
            aria-label="Onceki hafta"
          >
            <ChevronLeft size={18} className="text-white/70" />
          </button>

          <div className="flex items-center gap-3">
            <span className="text-white/90 font-semibold text-sm sm:text-base">
              {formatDateRange(weekStart)}
            </span>
            {!isCurrentWeek && (
              <button
                onClick={goToCurrentWeek}
                className="text-xs px-3 py-1 rounded-lg bg-pink-500/15 text-pink-400 hover:bg-pink-500/25 border border-pink-500/20 transition-colors font-medium"
              >
                Bu Hafta
              </button>
            )}
          </div>

          <button
            onClick={goToNextWeek}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-pink-500/15 transition-colors"
            aria-label="Sonraki hafta"
          >
            <ChevronRight size={18} className="text-white/70" />
          </button>
        </div>
      </GlassCard>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-pink-400" size={32} />
          <span className="ml-3 text-white/50 text-sm">Yukleniyor...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <GlassCard className="p-6 text-center">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <button
            onClick={fetchAnalysis}
            className="text-xs px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 border border-pink-500/15 transition-colors"
          >
            Tekrar Dene
          </button>
        </GlassCard>
      )}

      {/* Empty State - No analysis exists */}
      {!loading && !error && !analysis && (
        <GlassCard className="p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-4">
            <Bot size={28} className="text-pink-400" />
          </div>
          <h3 className="text-white/90 font-semibold text-lg mb-2">
            Haftalik Analiz Bulunamadi
          </h3>
          <p className="text-white/50 text-sm mb-6 max-w-md">
            Bu hafta icin henuz bir analiz olusturulmamis. AI destekli haftalik
            analizinizi olusturmak icin asagidaki butona tiklayin.
          </p>
          <button
            onClick={generateAnalysis}
            disabled={generating}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold text-sm transition-all shadow-lg shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Analiz Olusturuluyor...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Analiz Olustur</span>
              </>
            )}
          </button>
        </GlassCard>
      )}

      {/* Analysis Content */}
      {!loading && !error && analysis && (
        <>
          {/* Re-generate button */}
          <div className="flex justify-end">
            <button
              onClick={generateAnalysis}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-pink-500/15 text-white/70 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  <span>Yeniden olusturuluyor...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Yeniden Olustur</span>
                </>
              )}
            </button>
          </div>

          {/* Summary Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              icon={Target}
              value={`%${completionPercentage}`}
              label="Plan Tamamlama"
              iconColor="text-pink-400"
            />
            <StatCard
              icon={Clock}
              value={formatMinutes(analysis.totalStudyMinutes)}
              label="Toplam Calisma"
              iconColor="text-amber-400"
            />
            <StatCard
              icon={BookOpen}
              value={analysis.totalQuestions}
              label="Cozulen Soru"
              iconColor="text-indigo-400"
            />
            <StatCard
              icon={averageNetChange >= 0 ? TrendingUp : TrendingDown}
              value={`${averageNetChange >= 0 ? "+" : ""}${averageNetChange.toFixed(1)}`}
              label="Net Degisim"
              iconColor={
                averageNetChange >= 0 ? "text-emerald-400" : "text-red-400"
              }
            />
          </div>

          {/* Completion detail */}
          {analysis.plannedItems > 0 && (
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">
                  Plan Ilerleme
                </span>
                <span className="text-white/70 text-sm font-semibold">
                  {analysis.completedItems} / {analysis.plannedItems}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-pink-500 to-pink-400 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, completionPercentage)}%` }}
                />
              </div>
            </GlassCard>
          )}

          {/* Planned vs Completed Bar Chart */}
          {chartData && (
            <GlassCard className="p-4 sm:p-6">
              <h3 className="text-white/50 font-bold uppercase tracking-wider text-xs mb-4">
                Planlanan vs Tamamlanan
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 20, bottom: 10, left: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}
                  />
                  <Bar
                    dataKey="Planlanan"
                    fill="#f472b6"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                  />
                  <Bar
                    dataKey="Tamamlanan"
                    fill="#fbbf24"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          )}

          {/* Net Score Changes Table */}
          {analysis.netScoreChanges &&
            analysis.netScoreChanges.length > 0 && (
              <GlassCard className="p-4 sm:p-6">
                <h3 className="text-white/50 font-bold uppercase tracking-wider text-xs mb-4">
                  Net Degisimleri
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-white/50 text-xs font-semibold uppercase tracking-wider pb-3 pr-4">
                          Ders
                        </th>
                        <th className="text-center text-white/50 text-xs font-semibold uppercase tracking-wider pb-3 px-4">
                          Onceki Net
                        </th>
                        <th className="text-center text-white/50 text-xs font-semibold uppercase tracking-wider pb-3 px-4">
                          Guncel Net
                        </th>
                        <th className="text-right text-white/50 text-xs font-semibold uppercase tracking-wider pb-3 pl-4">
                          Degisim
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.netScoreChanges.map(
                        (change: NetScoreChange, idx: number) => {
                          const diff = change.currentNet - change.previousNet;
                          const isPositive = diff > 0;
                          const isNegative = diff < 0;

                          return (
                            <tr
                              key={idx}
                              className="border-b border-white/5 last:border-b-0"
                            >
                              <td className="py-3 pr-4 text-white/90 font-medium">
                                {change.subjectName}
                              </td>
                              <td className="py-3 px-4 text-center text-white/60">
                                {change.previousNet.toFixed(1)}
                              </td>
                              <td className="py-3 px-4 text-center text-white/90 font-semibold">
                                {change.currentNet.toFixed(1)}
                              </td>
                              <td className="py-3 pl-4 text-right">
                                <span
                                  className={`inline-flex items-center gap-1 font-semibold ${
                                    isPositive
                                      ? "text-emerald-400"
                                      : isNegative
                                        ? "text-red-400"
                                        : "text-white/50"
                                  }`}
                                >
                                  {isPositive && <ArrowUp size={14} />}
                                  {isNegative && <ArrowDown size={14} />}
                                  {isPositive ? "+" : ""}
                                  {diff.toFixed(1)}
                                </span>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}

          {/* AI Summary */}
          {analysis.aiSummary && (
            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bot size={18} className="text-pink-400" />
                <h3 className="text-white/50 font-bold uppercase tracking-wider text-xs">
                  AI Yorumu
                </h3>
              </div>
              <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white/90 prose-p:text-white/70 prose-strong:text-white/90 prose-ul:text-white/70 prose-li:text-white/70 prose-a:text-pink-400">
                <ReactMarkdown>{analysis.aiSummary}</ReactMarkdown>
              </div>
            </GlassCard>
          )}

          {/* AI Recommendations */}
          {analysis.aiRecommendations && (
            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-amber-400" />
                <h3 className="text-white/50 font-bold uppercase tracking-wider text-xs">
                  Oneriler
                </h3>
              </div>
              <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white/90 prose-p:text-white/70 prose-strong:text-white/90 prose-ul:text-white/70 prose-li:text-white/70 prose-a:text-pink-400">
                <ReactMarkdown>{analysis.aiRecommendations}</ReactMarkdown>
              </div>
            </GlassCard>
          )}
        </>
      )}
    </div>
  );
}
