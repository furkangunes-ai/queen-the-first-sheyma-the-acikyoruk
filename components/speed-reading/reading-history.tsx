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
  title: string | null;
  wordCount: number;
  wordsRead: number;
  initialWpm: number;
  finalWpm: number;
  chunkSize: number;
  autoSpeed: boolean;
  duration: number;
  completed: boolean;
  createdAt: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function ReadingHistory() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/speed-reading");
      if (!res.ok) throw new Error("Fetch failed");
      setSessions(await res.json());
    } catch {
      toast.error("Geçmiş yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleDelete = async (id: string) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-pink-400" size={40} />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="glass-panel text-center py-20">
        <BookOpen
          className="mx-auto text-pink-500/50 mb-6"
          size={64}
        />
        <h3 className="text-2xl font-bold text-white mb-3">
          Henüz oturum kaydı yok
        </h3>
        <p className="text-base text-white/50">
          Okuma sekmesinden bir metin okuyarak başla
        </p>
      </div>
    );
  }

  // Stats
  const avgWpm = Math.round(
    sessions.reduce((sum, s) => sum + s.finalWpm, 0) / sessions.length
  );
  const bestWpm = Math.max(...sessions.map((s) => s.finalWpm));
  const totalWordsRead = sessions.reduce((sum, s) => sum + s.wordsRead, 0);
  const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);

  // Chart data (chronological order)
  const chartData = [...sessions]
    .reverse()
    .map((s) => ({
      label: format(new Date(s.createdAt), "d MMM", { locale: tr }),
      wpm: s.finalWpm,
    }));

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            icon: Gauge,
            value: avgWpm,
            label: "Ortalama WPM",
            color: "text-pink-400",
          },
          {
            icon: TrendingUp,
            value: bestWpm,
            label: "En Yüksek WPM",
            color: "text-cyan-400",
          },
          {
            icon: BookOpen,
            value: totalWordsRead.toLocaleString("tr-TR"),
            label: "Toplam Kelime",
            color: "text-amber-400",
          },
          {
            icon: Clock,
            value: formatTime(totalTime),
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

      {/* WPM Trend Chart */}
      {chartData.length >= 2 && (
        <div className="glass-panel p-5">
          <h3 className="text-sm font-medium text-white/60 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-pink-400" />
            WPM Gelişimi
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
                dataKey="wpm"
                stroke="#ff2a85"
                strokeWidth={2}
                dot={{ fill: "#ff2a85", r: 4 }}
                activeDot={{ r: 6, fill: "#ff7eb3" }}
                name="WPM"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Session List */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white/60">
          Oturumlar ({sessions.length})
        </h3>
        {sessions.map((session, idx) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="glass-panel p-4 flex items-center gap-4 group"
          >
            {/* WPM Badge */}
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/20 flex flex-col items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-pink-300 font-mono">
                {session.finalWpm}
              </span>
              <span className="text-[8px] text-pink-300/50 uppercase tracking-wider">
                WPM
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-white/90 truncate">
                  {session.title || "İsimsiz Okuma"}
                </h4>
                {session.completed ? (
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle size={14} className="text-white/20 flex-shrink-0" />
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-white/40">
                <span>
                  {format(new Date(session.createdAt), "d MMMM yyyy, HH:mm", {
                    locale: tr,
                  })}
                </span>
                <span>{session.wordsRead} kelime</span>
                <span>{formatTime(session.duration)}</span>
                <span>
                  {session.chunkSize > 1
                    ? `${session.chunkSize}'li grup`
                    : "Tekli"}
                </span>
                {session.autoSpeed && (
                  <span className="flex items-center gap-1">
                    <Zap size={10} className="text-amber-400" />
                    Oto
                  </span>
                )}
              </div>
              {session.initialWpm !== session.finalWpm && (
                <div className="mt-1 text-xs">
                  <span className="text-white/30">{session.initialWpm}</span>
                  <span className="text-white/20 mx-1">→</span>
                  <span className="text-pink-300/80 font-medium">
                    {session.finalWpm} WPM
                  </span>
                  {session.finalWpm > session.initialWpm && (
                    <span className="text-emerald-400/80 ml-1">
                      (+{session.finalWpm - session.initialWpm})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Delete */}
            <button
              onClick={() => handleDelete(session.id)}
              className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
