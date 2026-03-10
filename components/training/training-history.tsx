"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  History,
  Brain,
  BookOpen,
  Clock,
  Target,
  Trophy,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface ExerciseRecord {
  id: string;
  exerciseType: string;
  difficulty: number;
  score: number;
  duration: number;
  completed: boolean;
  metadata: any;
  createdAt: string;
}

type FilterType = "all" | "mental-math" | "paragraph-reading";

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}dk ${secs}s`;
}

function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "d MMM yyyy, HH:mm", { locale: tr });
}

const typeConfig: Record<
  string,
  {
    icon: typeof Brain;
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  "mental-math": {
    icon: Brain,
    label: "İşlem Hızı",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/15",
    borderColor: "border-cyan-500/20",
  },
  "paragraph-reading": {
    icon: BookOpen,
    label: "Paragraf",
    color: "text-purple-400",
    bgColor: "bg-purple-500/15",
    borderColor: "border-purple-500/20",
  },
};

const filters: { key: FilterType; label: string }[] = [
  { key: "all", label: "Hepsi" },
  { key: "mental-math", label: "İşlem Hızı" },
  { key: "paragraph-reading", label: "Paragraf" },
];

export default function TrainingHistory() {
  const [exercises, setExercises] = useState<ExerciseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchExercises = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.set("type", filter);
      }
      const url =
        filter === "all"
          ? "/api/speed-reading/exercises"
          : `/api/speed-reading/exercises?${params}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setExercises(data);
    } catch {
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  // Filter exercises for display (API may not support type filter, so also filter client-side)
  const filteredExercises =
    filter === "all"
      ? exercises
      : exercises.filter((e) => e.exerciseType === filter);

  // Sort newest first
  const sortedExercises = [...filteredExercises].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Summary stats (always computed from all exercises)
  const totalExercises = exercises.length;
  const averageScore =
    exercises.length > 0
      ? Math.round(
          exercises.reduce((sum, e) => sum + e.score, 0) / exercises.length
        )
      : 0;
  const totalDurationSeconds = exercises.reduce(
    (sum, e) => sum + e.duration,
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-cyan-400" size={40} />
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="glass-panel text-center py-20">
        <History className="mx-auto text-white/20 mb-6" size={64} />
        <h3 className="text-2xl font-bold text-white mb-3">
          Henüz antrenman kaydı yok
        </h3>
        <p className="text-base text-white/50">
          Bir antrenman tamamlayarak geçmişini oluşturmaya başla.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          <History size={20} className="text-white/60" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Antrenman Geçmişi</h3>
          <p className="text-xs text-white/40">
            Tamamlanan egzersizlerin ve sonuçların
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: Target,
            value: totalExercises,
            label: "Toplam Egzersiz",
            color: "text-emerald-400",
          },
          {
            icon: Trophy,
            value: `%${averageScore}`,
            label: "Ortalama Skor",
            color: "text-amber-400",
          },
          {
            icon: Clock,
            value: formatDuration(totalDurationSeconds),
            label: "Toplam Süre",
            color: "text-pink-400",
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-4 text-center space-y-1"
          >
            <stat.icon size={18} className={`mx-auto ${stat.color}`} />
            <p className="text-xl font-bold text-white/90 font-mono">
              {stat.value}
            </p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {filters.map((f) => {
          const count =
            f.key === "all"
              ? exercises.length
              : exercises.filter((e) => e.exerciseType === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.key
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
              }`}
            >
              {f.label}
              {count > 0 && (
                <span className="ml-1.5 text-white/20">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Exercise List */}
      <div className="glass-panel p-5 space-y-4">
        <h4 className="text-sm font-medium text-white/60">
          Kayıtlar ({sortedExercises.length})
        </h4>

        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          <AnimatePresence>
            {sortedExercises.map((exercise, idx) => {
              const config = typeConfig[exercise.exerciseType] || {
                icon: Brain,
                label: exercise.exerciseType,
                color: "text-white/60",
                bgColor: "bg-white/10",
                borderColor: "border-white/10",
              };
              const Icon = config.icon;

              return (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
                >
                  {/* Type Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl ${config.bgColor} border ${config.borderColor} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon size={18} className={config.color} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white/90">
                        {config.label}
                      </span>
                      <span className="text-[10px] text-white/30 px-1.5 py-0.5 rounded bg-white/5">
                        Zorluk {exercise.difficulty}
                      </span>
                      {exercise.score >= 80 && (
                        <Trophy
                          size={12}
                          className="text-amber-400 flex-shrink-0"
                        />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-white/40">
                      <span>{formatDate(exercise.createdAt)}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {formatDuration(exercise.duration)}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-lg font-bold font-mono ${
                        exercise.score >= 80
                          ? "text-emerald-400"
                          : exercise.score >= 50
                          ? "text-amber-400"
                          : "text-red-400"
                      }`}
                    >
                      %{Math.round(exercise.score)}
                    </p>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider">
                      Skor
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {sortedExercises.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-white/30">
                Bu kategoride kayıt bulunamadı.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
