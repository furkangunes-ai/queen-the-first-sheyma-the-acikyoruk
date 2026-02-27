"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Search,
  Filter,
  Activity,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────

interface TopicStudyDay {
  date: string;
  questionCount: number;
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
  wrongRate: number;
  duration: number;
}

interface TopicExamWrong {
  date: string;
  examTitle: string;
  count: number;
}

interface TopicProgressData {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  examTypeName: string;
  totalStudySessions: number;
  totalQuestions: number;
  totalCorrect: number;
  totalWrong: number;
  totalEmpty: number;
  totalDuration: number;
  wrongRate: number;
  lastStudied: string | null;
  totalReviews: number;
  lastReview: string | null;
  totalExamWrongs: number;
  knowledgeLevel: number | null;
  trend: "improving" | "stable" | "declining" | "insufficient";
  trendDetail: string;
  studyHistory: TopicStudyDay[];
  examWrongHistory: TopicExamWrong[];
}

interface ProgressSummary {
  totalTopics: number;
  improvingCount: number;
  decliningCount: number;
  stableCount: number;
  insufficientCount: number;
}

// ─── Constants ─────────────────────────────────────

const COLORS = [
  "#ff2a85",
  "#ff7eb3",
  "#00f0ff",
  "#bb66ff",
  "#ffb84d",
  "#ff3366",
  "#00e5ff",
  "#ff99cc",
];

const TREND_CONFIG = {
  improving: {
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    label: "İyileşiyor",
    glow: "shadow-emerald-500/20",
  },
  stable: {
    icon: Minus,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    label: "Sabit",
    glow: "shadow-amber-500/20",
  },
  declining: {
    icon: TrendingDown,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    label: "Kötüleşiyor",
    glow: "shadow-red-500/20",
  },
  insufficient: {
    icon: Minus,
    color: "text-white/40",
    bg: "bg-white/5",
    border: "border-white/10",
    label: "Yetersiz Veri",
    glow: "",
  },
};

const KNOWLEDGE_LABELS = [
  "Hiç bilmiyor",
  "Çok az",
  "Temel",
  "Orta",
  "İyi",
  "Çok iyi",
];

const tooltipStyle = {
  borderRadius: "16px",
  border: "1px solid rgba(255,42,133,0.2)",
  backgroundColor: "rgba(17,9,21,0.95)",
  boxShadow: "0 8px 32px rgba(255,42,133,0.15)",
  color: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(12px)",
};

// ─── Expanded Topic Card ──────────────────────────

function TopicDetailChart({ topic }: { topic: TopicProgressData }) {
  const chartData = useMemo(() => {
    // Merge study history into daily aggregates
    const dateMap = new Map<
      string,
      { date: string; questions: number; correct: number; wrong: number; wrongRate: number }
    >();
    for (const h of topic.studyHistory) {
      const existing = dateMap.get(h.date);
      if (existing) {
        existing.questions += h.questionCount;
        existing.correct += h.correctCount;
        existing.wrong += h.wrongCount;
        existing.wrongRate = existing.questions > 0
          ? Math.round((existing.wrong / existing.questions) * 100)
          : 0;
      } else {
        dateMap.set(h.date, {
          date: h.date,
          questions: h.questionCount,
          correct: h.correctCount,
          wrong: h.wrongCount,
          wrongRate: h.wrongRate,
        });
      }
    }
    return Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [topic.studyHistory]);

  if (chartData.length < 2) {
    return (
      <div className="text-center py-6 text-white/40 text-sm">
        Grafik için en az 2 farklı günde çalışma verisi gerekli
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Wrong Rate Trend Chart */}
      <div>
        <h4 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
          <Activity size={14} className="text-pink-400" />
          Yanlış Oranı Değişimi (%)
        </h4>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`grad-${topic.topicId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff2a85" stopOpacity={0.3} />
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
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `%${v}`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => [`%${value}`, "Yanlış Oranı"]}
              labelFormatter={(v) => {
                const d = new Date(v);
                return d.toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                });
              }}
            />
            <Area
              type="monotone"
              dataKey="wrongRate"
              stroke="#ff2a85"
              strokeWidth={2}
              fill={`url(#grad-${topic.topicId})`}
              activeDot={{ r: 5, fill: "#ff2a85", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Question Count Bar Chart */}
      <div>
        <h4 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
          <BarChart2 size={14} className="text-cyan-400" />
          Soru Çözme Dağılımı
        </h4>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelFormatter={(v) => {
                const d = new Date(v);
                return d.toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                });
              }}
            />
            <Legend
              wrapperStyle={{
                color: "rgba(255,255,255,0.8)",
                fontSize: "11px",
              }}
              iconType="circle"
            />
            <Bar
              dataKey="correct"
              name="Doğru"
              stackId="a"
              fill="#10b981"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="wrong"
              name="Yanlış"
              stackId="a"
              fill="#ff2a85"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Exam Wrong History */}
      {topic.examWrongHistory.length > 0 && (
        <div>
          <h4 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
            <XCircle size={14} className="text-red-400" />
            Deneme Yanlışları
          </h4>
          <div className="flex flex-wrap gap-2">
            {topic.examWrongHistory.map((ew, i) => (
              <div
                key={i}
                className="glass bg-red-500/5 border border-red-500/20 rounded-xl px-3 py-2 text-xs"
              >
                <span className="text-white/60">
                  {new Date(ew.date).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <span className="text-red-400 font-bold ml-2">
                  {ew.count} yanlış
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Topic Card ───────────────────────────────────

function TopicCard({ topic, index }: { topic: TopicProgressData; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const trendCfg = TREND_CONFIG[topic.trend];
  const TrendIcon = trendCfg.icon;

  const correctRate =
    topic.totalQuestions > 0
      ? Math.round((topic.totalCorrect / topic.totalQuestions) * 100)
      : 0;

  const lastStudiedText = topic.lastStudied
    ? new Date(topic.lastStudied).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
      })
    : "—";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className={`glass bg-white/[0.02] rounded-2xl border transition-all duration-300 overflow-hidden ${
        topic.trend === "declining"
          ? "border-red-500/20 hover:border-red-500/40"
          : topic.trend === "improving"
          ? "border-emerald-500/20 hover:border-emerald-500/40"
          : "border-white/5 hover:border-pink-500/20"
      }`}
    >
      {/* Card Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 sm:p-5 flex items-start gap-4 text-left"
      >
        {/* Trend Indicator */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-xl ${trendCfg.bg} border ${trendCfg.border} flex items-center justify-center ${trendCfg.glow} shadow-lg`}
        >
          <TrendIcon size={18} className={trendCfg.color} />
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-bold text-[15px] truncate">
              {topic.topicName}
            </h3>
            <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 font-medium">
              {topic.subjectName}
            </span>
            <span className="text-[10px] text-white/30 bg-white/[0.03] px-2 py-0.5 rounded-full border border-white/5">
              {topic.examTypeName}
            </span>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <BookOpen size={12} className="text-pink-400" />
              {topic.totalStudySessions} oturum
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-400" />
              %{correctRate} doğru
            </span>
            <span className="flex items-center gap-1">
              <BarChart2 size={12} className="text-cyan-400" />
              {topic.totalQuestions} soru
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-amber-400" />
              {lastStudiedText}
            </span>
            {topic.knowledgeLevel !== null && (
              <span className="flex items-center gap-1">
                <Activity size={12} className="text-purple-400" />
                {KNOWLEDGE_LABELS[topic.knowledgeLevel]}
              </span>
            )}
          </div>

          {/* Trend Detail */}
          <div className="mt-2">
            <span
              className={`text-xs font-medium ${trendCfg.color} ${trendCfg.bg} px-2 py-0.5 rounded-full border ${trendCfg.border}`}
            >
              {trendCfg.label}: {topic.trendDetail}
            </span>
          </div>
        </div>

        {/* Wrong Rate + Expand */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="text-right">
            <div className="text-2xl font-bold text-white tracking-tighter">
              %{topic.wrongRate}
            </div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest">
              Yanlış Oranı
            </div>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} className="text-white/30" />
          </motion.div>
        </div>
      </button>

      {/* Expanded Detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-white/5">
              {/* Detail Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="glass bg-white/[0.03] rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-emerald-400">
                    {topic.totalCorrect}
                  </div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">
                    Doğru
                  </div>
                </div>
                <div className="glass bg-white/[0.03] rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-red-400">
                    {topic.totalWrong}
                  </div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">
                    Yanlış
                  </div>
                </div>
                <div className="glass bg-white/[0.03] rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-cyan-400">
                    {topic.totalReviews}
                  </div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">
                    Tekrar
                  </div>
                </div>
                <div className="glass bg-white/[0.03] rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-amber-400">
                    {topic.totalExamWrongs}
                  </div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">
                    Deneme Yanlışı
                  </div>
                </div>
              </div>

              {/* Charts */}
              <TopicDetailChart topic={topic} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────

interface TopicProgressProps {
  examTypeFilter?: string;
}

export default function TopicProgress({ examTypeFilter }: TopicProgressProps) {
  const [data, setData] = useState<{
    summary: ProgressSummary;
    topics: TopicProgressData[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [trendFilter, setTrendFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (examTypeFilter && examTypeFilter !== "all") {
        params.set("examTypeId", examTypeFilter);
      }
      const res = await fetch(`/api/analytics/topic-progress?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Konu gelişim verileri yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [examTypeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get unique subjects for filter
  const subjects = useMemo(() => {
    if (!data) return [];
    const subjectMap = new Map<string, string>();
    data.topics.forEach((t) => {
      subjectMap.set(t.subjectId, t.subjectName);
    });
    return Array.from(subjectMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [data]);

  // Filter topics
  const filteredTopics = useMemo(() => {
    if (!data) return [];
    return data.topics.filter((t) => {
      if (trendFilter !== "all" && t.trend !== trendFilter) return false;
      if (subjectFilter !== "all" && t.subjectId !== subjectFilter) return false;
      if (
        searchQuery &&
        !t.topicName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !t.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [data, trendFilter, subjectFilter, searchQuery]);

  // Problem topics (declining or stable with high wrong rate)
  const problemTopics = useMemo(() => {
    if (!data) return [];
    return data.topics.filter(
      (t) =>
        t.trend === "declining" ||
        (t.trend === "stable" && t.wrongRate > 40 && t.totalStudySessions >= 3)
    );
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-pink-500" size={40} />
      </div>
    );
  }

  if (!data || data.topics.length === 0) {
    return (
      <div className="glass-panel text-center py-20 flex flex-col items-center justify-center">
        <Activity className="text-pink-400/30 mb-4" size={56} />
        <h2 className="text-xl font-bold text-white/60">
          Henüz konu bazlı çalışma verisi yok
        </h2>
        <p className="text-sm text-white/40 mt-2 max-w-md">
          Günlük çalışma kaydı girerken konu seçimi yapın. Veriler biriktikçe
          konu bazlı gelişim analizi burada görünecek.
        </p>
      </div>
    );
  }

  const { summary } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass hover-lift p-5 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-[30px] group-hover:bg-pink-500/20 transition-all opacity-50" />
          <BookOpen className="text-pink-400 mb-2" size={24} />
          <span className="text-3xl font-bold text-white tracking-tighter">
            {summary.totalTopics}
          </span>
          <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-1">
            Takip Edilen
          </span>
        </div>
        <div className="glass hover-lift p-5 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[30px] group-hover:bg-emerald-500/20 transition-all opacity-50" />
          <TrendingUp className="text-emerald-400 mb-2" size={24} />
          <span className="text-3xl font-bold text-white tracking-tighter">
            {summary.improvingCount}
          </span>
          <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-1">
            İyileşiyor
          </span>
        </div>
        <div className="glass hover-lift p-5 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-[30px] group-hover:bg-amber-500/20 transition-all opacity-50" />
          <Minus className="text-amber-400 mb-2" size={24} />
          <span className="text-3xl font-bold text-white tracking-tighter">
            {summary.stableCount}
          </span>
          <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-1">
            Sabit
          </span>
        </div>
        <div className="glass hover-lift p-5 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-[30px] group-hover:bg-red-500/20 transition-all opacity-50" />
          <TrendingDown className="text-red-400 mb-2" size={24} />
          <span className="text-3xl font-bold text-white tracking-tighter">
            {summary.decliningCount}
          </span>
          <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-1">
            Kötüleşiyor
          </span>
        </div>
      </div>

      {/* Problem Topics Alert */}
      {problemTopics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel border-red-500/20 bg-red-500/5 p-5"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-white font-bold text-[15px] mb-1">
                Dikkat: {problemTopics.length} konuda çalışma yöntemi etkisiz
              </h3>
              <p className="text-white/50 text-sm mb-3">
                Bu konularda çalışma yapıldığı halde yanlış oranı düşmüyor veya
                artıyor. Farklı bir çalışma yöntemi denenebilir.
              </p>
              <div className="flex flex-wrap gap-2">
                {problemTopics.slice(0, 6).map((t) => (
                  <span
                    key={t.topicId}
                    className="text-xs bg-red-500/10 text-red-300 px-3 py-1.5 rounded-lg border border-red-500/20 font-medium"
                  >
                    {t.subjectName} — {t.topicName}
                    <span className="text-red-400/70 ml-1">(%{t.wrongRate})</span>
                  </span>
                ))}
                {problemTopics.length > 6 && (
                  <span className="text-xs text-white/30 px-2 py-1.5">
                    +{problemTopics.length - 6} konu daha
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            type="text"
            placeholder="Konu veya ders ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-pink-500/30 transition-colors"
          />
        </div>

        {/* Trend Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { key: "all", label: "Tümü" },
            { key: "declining", label: "Kötüleşen" },
            { key: "stable", label: "Sabit" },
            { key: "improving", label: "İyileşen" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setTrendFilter(f.key)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                trendFilter === f.key
                  ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                  : "bg-white/[0.03] text-white/40 border border-white/5 hover:bg-white/[0.06]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Subject Filter */}
        {subjects.length > 1 && (
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-pink-500/30 transition-colors"
          >
            <option value="all">Tüm Dersler</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Topic List */}
      <div className="flex flex-col gap-3">
        {filteredTopics.length === 0 ? (
          <div className="glass-panel text-center py-10">
            <Filter className="text-white/20 mx-auto mb-3" size={32} />
            <p className="text-white/50 text-sm">
              Filtrelere uygun konu bulunamadı
            </p>
          </div>
        ) : (
          filteredTopics.map((topic, i) => (
            <TopicCard key={topic.topicId} topic={topic} index={i} />
          ))
        )}
      </div>
    </div>
  );
}
