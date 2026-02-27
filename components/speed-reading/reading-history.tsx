"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Clock,
  Loader2,
  Trash2,
  TrendingUp,
  BookOpen,
  Target,
  Zap,
  Gauge,
  CheckCircle,
  XCircle,
  Grid3X3,
  Eye,
  Maximize2,
  Trophy,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SessionData {
  id: string;
  type: "rsvp";
  title: string | null;
  wordCount: number;
  wordsRead: number;
  initialWpm: number;
  finalWpm: number;
  chunkSize: number;
  autoSpeed: boolean;
  duration: number;
  completed: boolean;
  comprehension: number | null;
  createdAt: string;
}

interface ExerciseData {
  id: string;
  type: "schulte" | "tachistoscope" | "peripheral";
  exerciseType: string;
  difficulty: number;
  score: number;
  duration: number;
  completed: boolean;
  metadata: Record<string, any> | null;
  createdAt: string;
}

type HistoryItem = SessionData | ExerciseData;
type FilterType = "all" | "rsvp" | "schulte" | "tachistoscope" | "peripheral";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const typeConfig: Record<
  string,
  { icon: typeof BookOpen; label: string; color: string; bgColor: string }
> = {
  rsvp: {
    icon: BookOpen,
    label: "RSVP Okuma",
    color: "text-pink-400",
    bgColor: "from-pink-500/20 to-pink-600/10 border-pink-500/20",
  },
  schulte: {
    icon: Grid3X3,
    label: "Schulte Tablosu",
    color: "text-cyan-400",
    bgColor: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/20",
  },
  tachistoscope: {
    icon: Eye,
    label: "Hızlı Tanıma",
    color: "text-amber-400",
    bgColor: "from-amber-500/20 to-amber-600/10 border-amber-500/20",
  },
  peripheral: {
    icon: Maximize2,
    label: "Görüş Alanı",
    color: "text-emerald-400",
    bgColor: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20",
  },
};

export default function ReadingHistory() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sessionsRes, exercisesRes] = await Promise.all([
        fetch("/api/speed-reading"),
        fetch("/api/speed-reading/exercises"),
      ]);
      if (!sessionsRes.ok || !exercisesRes.ok)
        throw new Error("Fetch failed");

      const sessionsData = await sessionsRes.json();
      const exercisesData = await exercisesRes.json();

      // Add type marker to sessions
      setSessions(
        sessionsData.map((s: any) => ({ ...s, type: "rsvp" as const }))
      );
      // Add type marker to exercises
      setExercises(
        exercisesData.map((e: any) => ({
          ...e,
          type: e.exerciseType as "schulte" | "tachistoscope" | "peripheral",
        }))
      );
    } catch {
      toast.error("Geçmiş yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteSession = async (id: string) => {
    if (!window.confirm("Bu oturumu silmek istediğine emin misin?")) return;
    try {
      const res = await fetch(`/api/speed-reading?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Oturum silindi");
    } catch {
      toast.error("Silme başarısız");
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (!window.confirm("Bu egzersizi silmek istediğine emin misin?")) return;
    try {
      const res = await fetch(`/api/speed-reading/exercises?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setExercises((prev) => prev.filter((e) => e.id !== id));
      toast.success("Egzersiz silindi");
    } catch {
      toast.error("Silme başarısız");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-pink-400" size={40} />
      </div>
    );
  }

  // Merge and sort all items
  const allItems: HistoryItem[] = [
    ...sessions,
    ...exercises,
  ].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Apply filter
  const filteredItems =
    filter === "all"
      ? allItems
      : allItems.filter((item) => item.type === filter);

  if (allItems.length === 0) {
    return (
      <div className="glass-panel text-center py-20">
        <BookOpen className="mx-auto text-pink-500/50 mb-6" size={64} />
        <h3 className="text-2xl font-bold text-white mb-3">
          Henüz egzersiz kaydı yok
        </h3>
        <p className="text-base text-white/50">
          Bir egzersiz yaparak başla — RSVP, Schulte, Hızlı Tanıma veya Görüş Alanı
        </p>
      </div>
    );
  }

  // Summary stats
  const totalExercises = allItems.length;
  const totalDuration = allItems.reduce((sum, item) => sum + item.duration, 0);
  const thisWeek = allItems.filter((item) => {
    const d = new Date(item.createdAt);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  }).length;

  // Best RSVP WPM
  const bestWpm =
    sessions.length > 0
      ? Math.max(...sessions.map((s) => s.finalWpm))
      : 0;

  // Chart data (all types, chronological)
  const chartData = [...allItems]
    .reverse()
    .slice(-20) // Last 20 items
    .map((item) => {
      const label = format(new Date(item.createdAt), "d MMM", { locale: tr });
      if (item.type === "rsvp") {
        const s = item as SessionData;
        return {
          label,
          rsvp: Math.round((s.finalWpm / 15) * 100) / 100, // Normalize to ~0-100
          schulte: null,
          tachistoscope: null,
          peripheral: null,
        };
      } else {
        const e = item as ExerciseData;
        return {
          label,
          rsvp: null,
          schulte: e.type === "schulte" ? e.score : null,
          tachistoscope: e.type === "tachistoscope" ? e.score : null,
          peripheral: e.type === "peripheral" ? e.score : null,
        };
      }
    });

  // Filter buttons config
  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: "all", label: "Hepsi", count: allItems.length },
    { key: "rsvp", label: "RSVP", count: sessions.length },
    {
      key: "schulte",
      label: "Schulte",
      count: exercises.filter((e) => e.type === "schulte").length,
    },
    {
      key: "tachistoscope",
      label: "Hızlı Tanıma",
      count: exercises.filter((e) => e.type === "tachistoscope").length,
    },
    {
      key: "peripheral",
      label: "Görüş Alanı",
      count: exercises.filter((e) => e.type === "peripheral").length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            icon: Target,
            value: totalExercises,
            label: "Toplam Egzersiz",
            color: "text-pink-400",
          },
          {
            icon: TrendingUp,
            value: bestWpm > 0 ? `${bestWpm} WPM` : "-",
            label: "En Yüksek WPM",
            color: "text-cyan-400",
          },
          {
            icon: Zap,
            value: thisWeek,
            label: "Bu Hafta",
            color: "text-amber-400",
          },
          {
            icon: Clock,
            value: formatTime(totalDuration),
            label: "Toplam Süre",
            color: "text-emerald-400",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-panel p-4 text-center space-y-1"
          >
            <stat.icon size={18} className={`mx-auto ${stat.color}`} />
            <p className="text-xl font-bold text-white/90 font-mono">
              {stat.value}
            </p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Trend Chart */}
      {chartData.length >= 2 && (
        <div className="glass-panel p-5">
          <h3 className="text-sm font-medium text-white/60 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-pink-400" />
            Skor Gelişimi
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(17,9,21,0.95)",
                  border: "1px solid rgba(255,42,133,0.15)",
                  borderRadius: "12px",
                  color: "rgba(255,255,255,0.9)",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.6)" }}
              />
              <Line
                type="monotone"
                dataKey="rsvp"
                stroke="#ff2a85"
                strokeWidth={2}
                dot={{ fill: "#ff2a85", r: 3 }}
                name="RSVP"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="schulte"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={{ fill: "#22d3ee", r: 3 }}
                name="Schulte"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="tachistoscope"
                stroke="#fbbf24"
                strokeWidth={2}
                dot={{ fill: "#fbbf24", r: 3 }}
                name="Hızlı Tanıma"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="peripheral"
                stroke="#34d399"
                strokeWidth={2}
                dot={{ fill: "#34d399", r: 3 }}
                name="Görüş Alanı"
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f.key
                ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
            }`}
          >
            {f.label}
            {f.count > 0 && (
              <span className="ml-1.5 text-white/20">{f.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Item List */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white/60">
          Kayıtlar ({filteredItems.length})
        </h3>
        {filteredItems.map((item, idx) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;

          if (item.type === "rsvp") {
            const session = item as SessionData;
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="glass-panel p-4 flex items-center gap-4 group"
              >
                {/* Type Badge */}
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.bgColor} border flex flex-col items-center justify-center flex-shrink-0`}
                >
                  <span className="text-base font-bold text-pink-300 font-mono">
                    {session.finalWpm}
                  </span>
                  <span className="text-[7px] text-pink-300/50 uppercase tracking-wider">
                    WPM
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon size={12} className={config.color} />
                    <h4 className="text-sm font-medium text-white/90 truncate">
                      {session.title || "İsimsiz Okuma"}
                    </h4>
                    {session.completed ? (
                      <CheckCircle
                        size={12}
                        className="text-emerald-400 flex-shrink-0"
                      />
                    ) : (
                      <XCircle
                        size={12}
                        className="text-white/20 flex-shrink-0"
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-white/40">
                    <span>
                      {format(
                        new Date(session.createdAt),
                        "d MMM yyyy, HH:mm",
                        { locale: tr }
                      )}
                    </span>
                    <span>{session.wordsRead} kelime</span>
                    <span>{formatTime(session.duration)}</span>
                    {session.comprehension && (
                      <span className="text-amber-400/70">
                        Anlama: {session.comprehension}/5
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDeleteSession(session.id)}
                  className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            );
          } else {
            const exercise = item as ExerciseData;
            const meta = exercise.metadata || {};

            // Build description based on type
            let description = "";
            let scoreDisplay = `%${Math.round(exercise.score)}`;
            if (exercise.type === "schulte") {
              description = `${meta.gridSize || "?"}×${meta.gridSize || "?"} tablo`;
              if (meta.completionTimeMs) {
                scoreDisplay = `${(meta.completionTimeMs / 1000).toFixed(1)}s`;
              }
              if (meta.errors !== undefined) {
                description += ` · ${meta.errors} hata`;
              }
            } else if (exercise.type === "tachistoscope") {
              const modeLabels: Record<string, string> = {
                word: "Kelime",
                phrase: "İfade",
                number: "Sayı",
              };
              description = `${modeLabels[meta.mode] || meta.mode} · ${meta.displayMs || "?"}ms`;
              if (meta.correctCount !== undefined) {
                description += ` · ${meta.correctCount}/${meta.totalCount}`;
              }
            } else if (exercise.type === "peripheral") {
              description = `Seviye ${meta.level || exercise.difficulty}`;
              if (meta.correctCount !== undefined) {
                description += ` · ${meta.correctCount}/${meta.totalCount} tur`;
              }
            }

            return (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="glass-panel p-4 flex items-center gap-4 group"
              >
                {/* Type Badge */}
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.bgColor} border flex flex-col items-center justify-center flex-shrink-0`}
                >
                  <span
                    className={`text-base font-bold font-mono ${config.color}`}
                  >
                    {scoreDisplay}
                  </span>
                  <span
                    className={`text-[7px] uppercase tracking-wider opacity-50 ${config.color}`}
                  >
                    {exercise.type === "schulte" ? "süre" : "skor"}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon size={12} className={config.color} />
                    <h4 className="text-sm font-medium text-white/90">
                      {config.label}
                    </h4>
                    {exercise.score >= 80 && (
                      <Trophy
                        size={12}
                        className="text-amber-400 flex-shrink-0"
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-white/40">
                    <span>
                      {format(
                        new Date(exercise.createdAt),
                        "d MMM yyyy, HH:mm",
                        { locale: tr }
                      )}
                    </span>
                    <span>{description}</span>
                    <span>{formatTime(exercise.duration)}</span>
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDeleteExercise(exercise.id)}
                  className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            );
          }
        })}
      </div>
    </div>
  );
}
