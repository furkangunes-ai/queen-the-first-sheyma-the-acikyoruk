"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { clsx } from 'clsx';
import {
  PenTool, Plus, Trash2, Loader2, X,
  Clock, BookMarked, BrainCircuit, Activity,
  ChevronLeft, ChevronRight, Check
} from "lucide-react";
import { format, startOfWeek, addDays, isToday } from "date-fns";
import { tr } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { filterSubjectsByTrack, type ExamTrack } from "@/lib/exam-track-filter";
import { getTurkeyDateString } from "@/lib/utils";

// ---------- Types ----------

interface Topic {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  examType: { name: string; slug: string };
  topics: Topic[];
}

interface DailyStudyEntry {
  id: string;
  date: string;
  questionCount: number;
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
  difficulty: string | null;
  source: string | null;
  duration: number | null;
  notes: string | null;
  subject: { name: string; examType: { name: string } };
  topic: { name: string } | null;
}

interface TopicReviewEntry {
  id: string;
  date: string;
  duration: number | null;
  confidence: string | null;
  method: string | null;
  notes: string | null;
  subject: { name: string; examType: { name: string } };
  topic: { name: string };
}

// ---------- Constants ----------

const CONFIDENCE_OPTIONS = [
  { value: "dusuk", label: "Düşük" },
  { value: "orta", label: "Orta" },
  { value: "yuksek", label: "Yüksek" },
];

const METHOD_OPTIONS = [
  { value: "video", label: "Video" },
  { value: "kitap", label: "Kitap" },
  { value: "ders_notu", label: "Ders Notu" },
  { value: "soru_cozumu", label: "Soru Çözümü" },
  { value: "diger", label: "Diğer" },
];

const DIFFICULTY_OPTIONS = [
  { value: "kolay", label: "Kolay" },
  { value: "orta", label: "Orta" },
  { value: "zor", label: "Zor" },
];

const CONFIDENCE_MAP: Record<string, { label: string; color: string }> = {
  dusuk: { label: "Düşük", color: "bg-rose-500/10 text-rose-400 border-rose-500/30" },
  orta: { label: "Orta", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  yuksek: { label: "Yüksek", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
};

const DIFFICULTY_MAP: Record<string, { label: string; color: string }> = {
  kolay: { label: "Kolay", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  orta: { label: "Orta", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  zor: { label: "Zor", color: "bg-rose-500/10 text-rose-400 border-rose-500/30" },
};

const METHOD_LABEL_MAP: Record<string, string> = {
  video: "Video",
  kitap: "Kitap",
  ders_notu: "Ders Notu",
  soru_cozumu: "Soru Çözümü",
  diger: "Diğer",
};

// ---------- Component ----------

export default function StudyPage() {
  const { data: session } = useSession();
  const examTrack = (session?.user as any)?.examTrack as ExamTrack;

  const [selectedDate, setSelectedDate] = useState(getTurkeyDateString());

  // Data
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studies, setStudies] = useState<DailyStudyEntry[]>([]);
  const [reviews, setReviews] = useState<TopicReviewEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Unified form
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Shared fields
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [totalDuration, setTotalDuration] = useState("");
  const [notes, setNotes] = useState("");

  // Activity toggles
  const [didReview, setDidReview] = useState(false);
  const [didQuestions, setDidQuestions] = useState(false);

  // Review specific
  const [reviewConfidence, setReviewConfidence] = useState("");
  const [reviewMethod, setReviewMethod] = useState("");
  const [reviewDuration, setReviewDuration] = useState("");

  // Questions specific
  const [questionCount, setQuestionCount] = useState("");
  const [correctCount, setCorrectCount] = useState("");
  const [wrongCount, setWrongCount] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [source, setSource] = useState("");
  const [questionDuration, setQuestionDuration] = useState("");

  // Split duration mode
  const [splitDuration, setSplitDuration] = useState(false);

  // Source memory
  const [pastSources, setPastSources] = useState<string[]>([]);
  const [showCustomSource, setShowCustomSource] = useState(false);

  // New topic
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicSubjectId, setNewTopicSubjectId] = useState("");
  const [addingTopic, setAddingTopic] = useState(false);

  // Week calendar
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [weekStudyDays, setWeekStudyDays] = useState<Set<string>>(new Set());
  const [weekReviewDays, setWeekReviewDays] = useState<Set<string>>(new Set());

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const weekEnd = useMemo(() => addDays(weekStart, 7), [weekStart]);

  const weekLabel = useMemo(() => {
    const end = addDays(weekStart, 6);
    const startStr = format(weekStart, "d MMM", { locale: tr });
    const endStr = format(end, "d MMM yyyy", { locale: tr });
    return `${startStr} – ${endStr}`;
  }, [weekStart]);

  // Derived
  const topics = useMemo(() => {
    return subjects.find((s) => s.id === subjectId)?.topics ?? [];
  }, [subjects, subjectId]);

  // ---------- Fetch ----------

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, studyRes, reviewRes, sourcesRes] = await Promise.all([
        fetch("/api/exam-types"),
        fetch(`/api/daily-study?date=${selectedDate}`),
        fetch(`/api/topic-reviews?date=${selectedDate}`),
        fetch("/api/daily-study/sources"),
      ]);

      if (subRes.ok) {
        const examTypes = await subRes.json();
        const allSubjects: Subject[] = [];
        for (const et of examTypes) {
          if (et.subjects) {
            for (const s of et.subjects) {
              allSubjects.push({ ...s, examType: { name: et.name, slug: et.slug } });
            }
          }
        }
        if (allSubjects.length === 0) {
          for (const et of examTypes) {
            const sRes = await fetch(`/api/subjects/${et.id}`);
            if (sRes.ok) {
              const subs = await sRes.json();
              for (const s of subs) {
                allSubjects.push({ ...s, examType: { name: et.name, slug: et.slug } });
              }
            }
          }
        }
        const filtered = filterSubjectsByTrack(allSubjects, examTrack);
        setSubjects(filtered);
      }

      if (studyRes.ok) setStudies(await studyRes.json());
      if (reviewRes.ok) setReviews(await reviewRes.json());
      if (sourcesRes.ok) setPastSources(await sourcesRes.json());
    } catch (err) {
      console.error("Veri yüklenirken hata:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, examTrack]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchWeekSummary = useCallback(async () => {
    try {
      const startStr = getTurkeyDateString(weekStart);
      const endStr = getTurkeyDateString(weekEnd);
      const [studyRes, reviewRes] = await Promise.all([
        fetch(`/api/daily-study?startDate=${startStr}&endDate=${endStr}`),
        fetch(`/api/topic-reviews?startDate=${startStr}&endDate=${endStr}`),
      ]);
      if (studyRes.ok) {
        const data: DailyStudyEntry[] = await studyRes.json();
        setWeekStudyDays(new Set(data.map((d) => getTurkeyDateString(new Date(d.date)))));
      }
      if (reviewRes.ok) {
        const data: TopicReviewEntry[] = await reviewRes.json();
        setWeekReviewDays(new Set(data.map((d) => getTurkeyDateString(new Date(d.date)))));
      }
    } catch {
      // silent
    }
  }, [weekStart, weekEnd]);

  useEffect(() => {
    fetchWeekSummary();
  }, [fetchWeekSummary]);

  // ---------- Stats ----------

  const totalQuestions = studies.reduce((sum, s) => sum + s.questionCount, 0);
  const totalCorrect = studies.reduce((sum, s) => sum + s.correctCount, 0);
  const totalWrong = studies.reduce((sum, s) => sum + s.wrongCount, 0);
  const totalReviews = reviews.length;
  const totalStudyMinutes = studies.reduce((sum, s) => sum + (s.duration || 0), 0) +
    reviews.reduce((sum, r) => sum + (r.duration || 0), 0);

  // ---------- Save ----------

  function canSave() {
    if (!subjectId) return false;
    if (!didReview && !didQuestions) return false;
    if (didQuestions && !questionCount) return false;
    if (didReview && !topicId) return false;
    return true;
  }

  async function handleSave(silent = false) {
    if (!subjectId) {
      if (!silent) toast.error("Ders seçimi zorunlu");
      return;
    }
    if (!didReview && !didQuestions) {
      if (!silent) toast.error("En az bir aktivite seç");
      return;
    }
    if (didQuestions && !questionCount) {
      if (!silent) toast.error("Soru sayısını gir");
      return;
    }

    setSaving(true);
    try {
      const promises: Promise<Response>[] = [];

      // Determine durations
      let qDur: number | null = null;
      let rDur: number | null = null;

      if (splitDuration) {
        qDur = questionDuration ? parseInt(questionDuration) : null;
        rDur = reviewDuration ? parseInt(reviewDuration) : null;
      } else if (totalDuration) {
        const total = parseInt(totalDuration);
        if (didQuestions && didReview) {
          // Split evenly if both active
          qDur = Math.ceil(total / 2);
          rDur = Math.floor(total / 2);
        } else if (didQuestions) {
          qDur = total;
        } else {
          rDur = total;
        }
      }

      if (didQuestions) {
        const qCount = parseInt(questionCount) || 0;
        const cCount = parseInt(correctCount) || 0;
        const wCount = parseInt(wrongCount) || 0;

        promises.push(
          fetch("/api/daily-study", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date: selectedDate,
              subjectId,
              topicId: topicId || null,
              questionCount: qCount,
              correctCount: cCount,
              wrongCount: wCount,
              emptyCount: qCount - cCount - wCount,
              difficulty: difficulty || null,
              source: source || null,
              duration: qDur,
              notes: notes || null,
            }),
          })
        );
      }

      if (didReview) {
        if (!topicId) {
          if (!silent) toast.error("Konu tekrarı için konu seçimi zorunlu");
          setSaving(false);
          return;
        }
        promises.push(
          fetch("/api/topic-reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date: selectedDate,
              subjectId,
              topicId,
              duration: rDur,
              confidence: reviewConfidence || null,
              method: reviewMethod || null,
              notes: notes || null,
            }),
          })
        );
      }

      const results = await Promise.all(promises);
      const allOk = results.every((r) => r.ok);

      if (!allOk) throw new Error("Kayıt başarısız");

      if (!silent) {
        const labels: string[] = [];
        if (didReview) labels.push("Konu tekrarı");
        if (didQuestions) labels.push("Soru çözümü");
        toast.success(`${labels.join(" + ")} kaydedildi`);
      } else {
        toast.success("Otomatik kaydedildi");
      }

      resetForm();
      fetchData();
      fetchWeekSummary();
    } catch {
      toast.error("Kayıt sırasında hata oluştu");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setShowAddForm(false);
    setSubjectId("");
    setTopicId("");
    setTotalDuration("");
    setNotes("");
    setDidReview(false);
    setDidQuestions(false);
    setReviewConfidence("");
    setReviewMethod("");
    setReviewDuration("");
    setQuestionCount("");
    setCorrectCount("");
    setWrongCount("");
    setDifficulty("");
    setSource("");
    setShowCustomSource(false);
    setQuestionDuration("");
    setSplitDuration(false);
  }

  // ---------- Delete ----------

  async function handleDeleteStudy(id: string) {
    try {
      const res = await fetch(`/api/daily-study?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Silindi");
      fetchData();
    } catch {
      toast.error("Silinemedi");
    }
  }

  async function handleDeleteReview(id: string) {
    try {
      const res = await fetch(`/api/topic-reviews?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Silindi");
      fetchData();
    } catch {
      toast.error("Silinemedi");
    }
  }

  // ---------- Add Topic ----------

  async function handleAddTopic() {
    if (!newTopicName.trim() || !newTopicSubjectId) {
      toast.error("Konu adı ve ders zorunlu");
      return;
    }
    setAddingTopic(true);
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTopicName.trim(), subjectId: newTopicSubjectId }),
      });
      if (!res.ok) throw new Error();
      const newTopic = await res.json();
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === newTopicSubjectId
            ? { ...s, topics: [...s.topics, newTopic] }
            : s
        )
      );
      toast.success(`"${newTopic.name}" konusu eklendi`);
      setNewTopicName("");
      setShowNewTopic(false);
    } catch {
      toast.error("Konu eklenemedi");
    } finally {
      setAddingTopic(false);
    }
  }

  // ---------- Grouped subjects ----------

  const groupedSubjects = useMemo(() => {
    const map: Record<string, Subject[]> = {};
    subjects.forEach((s) => {
      const key = s.examType.name;
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return map;
  }, [subjects]);

  // ---------- Render ----------

  const inputClass = "w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-pink-400/40 focus:border-pink-400/30 transition-all hover:border-white/20 [color-scheme:dark]";

  if (loading) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent pointer-events-none" />
        <Loader2 className="animate-spin text-pink-400 mb-4 drop-shadow-[0_0_10px_rgba(255,42,133,0.5)]" size={40} />
        <span className="text-white/60 font-bold tracking-wide">Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 relative">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-pink-500/8 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Header */}
      <div className="glass-panel p-5 sm:p-6 relative z-10 border-white/10 rounded-2xl">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BookMarked size={28} className="text-pink-400 drop-shadow-[0_0_10px_rgba(255,42,133,0.4)]" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Ders Çalışması
              </h1>
            </div>
            <button
              onClick={() => {
                const now = new Date();
                setWeekStart(startOfWeek(now, { weekStartsOn: 1 }));
                setSelectedDate(getTurkeyDateString(now));
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/[0.05] border border-white/10 text-white/60 hover:text-white hover:border-pink-400/30 transition-all"
            >
              Bugün
            </button>
          </div>

          {/* Compact Week Calendar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekStart((prev) => addDays(prev, -7))}
              className="p-1.5 rounded-lg bg-white/[0.03] border border-white/10 hover:border-pink-400/30 text-white/50 hover:text-white transition-all shrink-0"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex-1 grid grid-cols-7 gap-1">
              {weekDays.map((day) => {
                const dayStr = getTurkeyDateString(day);
                const isSelected = dayStr === selectedDate;
                const isDayToday = isToday(day);
                const hasStudy = weekStudyDays.has(dayStr);
                const hasReview = weekReviewDays.has(dayStr);

                return (
                  <button
                    key={dayStr}
                    onClick={() => setSelectedDate(dayStr)}
                    className={clsx(
                      "flex flex-col items-center py-2 rounded-xl transition-all relative",
                      isSelected
                        ? "bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-[0_0_12px_rgba(255,42,133,0.3)]"
                        : isDayToday
                          ? "bg-white/[0.05] ring-1 ring-pink-400/40 text-white"
                          : "bg-white/[0.02] text-white/50 hover:bg-white/[0.05]"
                    )}
                  >
                    <span className={clsx(
                      "text-[9px] font-bold uppercase tracking-widest",
                      isSelected ? "text-white/80" : "text-white/30"
                    )}>
                      {format(day, "EEE", { locale: tr })}
                    </span>
                    <span className={clsx("text-base font-black", isSelected ? "text-white" : "")}>
                      {format(day, "d")}
                    </span>
                    <div className="flex gap-0.5 mt-0.5 h-1">
                      {hasStudy && <div className={clsx("w-1 h-1 rounded-full", isSelected ? "bg-white/70" : "bg-pink-400")} />}
                      {hasReview && <div className={clsx("w-1 h-1 rounded-full", isSelected ? "bg-white/50" : "bg-purple-400")} />}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setWeekStart((prev) => addDays(prev, 7))}
              className="p-1.5 rounded-lg bg-white/[0.03] border border-white/10 hover:border-pink-400/30 text-white/50 hover:text-white transition-all shrink-0"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <p className="text-[11px] font-bold text-white/30 text-center tracking-wider uppercase">{weekLabel}</p>
        </div>

        {/* Compact Stats */}
        <div className="grid grid-cols-5 gap-2">
          {[
            { label: "Soru", value: totalQuestions, color: "text-blue-400" },
            { label: "Doğru", value: totalCorrect, color: "text-emerald-400" },
            { label: "Yanlış", value: totalWrong, color: "text-rose-400" },
            { label: "Tekrar", value: totalReviews, color: "text-purple-400" },
            { label: "Dakika", value: totalStudyMinutes, color: "text-amber-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5 text-center">
              <p className={`text-xl font-black ${stat.color} font-mono`}>{stat.value}</p>
              <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="glass-panel p-5 sm:p-6 relative z-10 border-white/10 rounded-2xl min-h-[400px] flex flex-col">
        {/* Action Bar */}
        <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-white/5">
          <p className="text-xs text-white/30 font-medium hidden sm:block">
            Çalışmalarını buradan kaydet
          </p>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setShowNewTopic(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/[0.03] border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all"
            >
              <Plus size={12} className="text-pink-400" />
              Konu Ekle
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-[0_0_12px_rgba(255,42,133,0.3)] border border-pink-400/20 transition-all"
            >
              <Plus size={14} />
              Kayıt Ekle
            </motion.button>
          </div>
        </div>

        {/* New Topic Form */}
        <AnimatePresence>
          {showNewTopic && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold text-pink-300 uppercase tracking-widest">Yeni Konu</h3>
                  <button onClick={() => setShowNewTopic(false)} className="text-white/30 hover:text-white p-1"><X size={14} /></button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select value={newTopicSubjectId} onChange={(e) => setNewTopicSubjectId(e.target.value)} className={clsx(inputClass, "sm:w-1/3")}>
                    <option value="">Ders...</option>
                    {Object.entries(groupedSubjects).map(([etName, subs]) => (
                      <optgroup key={etName} label={etName}>
                        {subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Konu adı..."
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    className={clsx(inputClass, "flex-1")}
                  />
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAddTopic}
                    disabled={addingTopic || !newTopicName.trim() || !newTopicSubjectId}
                    className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold text-sm rounded-xl disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    {addingTopic ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Ekle
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== Unified Add Form ===== */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-gradient-to-br from-pink-500/5 to-purple-500/5 border border-white/10 rounded-2xl p-5 space-y-5">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BookMarked size={16} className="text-pink-400" />
                    Çalışma Kaydı
                  </h3>
                  <button onClick={async () => {
                    if (canSave()) {
                      await handleSave(true);
                    } else {
                      resetForm();
                    }
                  }} className="text-white/30 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
                    <X size={16} />
                  </button>
                </div>

                {/* Step 1: Subject + Topic */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Ders & Konu</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={subjectId}
                      onChange={(e) => { setSubjectId(e.target.value); setTopicId(""); }}
                      className={inputClass}
                    >
                      <option value="">Ders seç...</option>
                      {Object.entries(groupedSubjects).map(([etName, subs]) => (
                        <optgroup key={etName} label={etName}>
                          {subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </optgroup>
                      ))}
                    </select>
                    <select
                      value={topicId}
                      onChange={(e) => setTopicId(e.target.value)}
                      className={inputClass}
                      disabled={!subjectId}
                    >
                      <option value="">Konu seç (opsiyonel)...</option>
                      {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Step 2: Activity Toggle Chips */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Ne yaptın?</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDidReview(!didReview)}
                      className={clsx(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all",
                        didReview
                          ? "bg-purple-500/15 border-purple-400/40 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                          : "bg-white/[0.02] border-white/10 text-white/40 hover:text-white/60 hover:border-white/20"
                      )}
                    >
                      {didReview ? <Check size={14} className="text-purple-400" /> : <BrainCircuit size={14} />}
                      Konu Tekrarı
                    </button>
                    <button
                      onClick={() => setDidQuestions(!didQuestions)}
                      className={clsx(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all",
                        didQuestions
                          ? "bg-pink-500/15 border-pink-400/40 text-pink-300 shadow-[0_0_12px_rgba(255,42,133,0.15)]"
                          : "bg-white/[0.02] border-white/10 text-white/40 hover:text-white/60 hover:border-white/20"
                      )}
                    >
                      {didQuestions ? <Check size={14} className="text-pink-400" /> : <PenTool size={14} />}
                      Test / Soru Çözdüm
                    </button>
                  </div>
                </div>

                {/* Activity-specific Fields */}
                <AnimatePresence mode="sync">
                  {/* Review Fields */}
                  {didReview && (
                    <motion.div
                      key="review-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <BrainCircuit size={14} className="text-purple-400" />
                          <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">Konu Tekrarı Detayları</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {/* Confidence as pill buttons */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Anlama Seviyesi</label>
                            <div className="flex gap-1.5">
                              {CONFIDENCE_OPTIONS.map((opt) => (
                                <button
                                  key={opt.value}
                                  onClick={() => setReviewConfidence(reviewConfidence === opt.value ? "" : opt.value)}
                                  className={clsx(
                                    "flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-all",
                                    reviewConfidence === opt.value
                                      ? CONFIDENCE_MAP[opt.value].color
                                      : "bg-white/[0.02] border-white/10 text-white/30 hover:text-white/50"
                                  )}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          {/* Method as pill buttons */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Yöntem</label>
                            <div className="flex flex-wrap gap-1.5">
                              {METHOD_OPTIONS.map((opt) => (
                                <button
                                  key={opt.value}
                                  onClick={() => setReviewMethod(reviewMethod === opt.value ? "" : opt.value)}
                                  className={clsx(
                                    "px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all",
                                    reviewMethod === opt.value
                                      ? "bg-blue-500/15 border-blue-400/40 text-blue-300"
                                      : "bg-white/[0.02] border-white/10 text-white/30 hover:text-white/50"
                                  )}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Questions Fields */}
                  {didQuestions && (
                    <motion.div
                      key="question-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-pink-500/5 border border-pink-500/15 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <PenTool size={14} className="text-pink-400" />
                          <span className="text-xs font-bold text-pink-300 uppercase tracking-widest">Soru Çözümü</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Toplam Soru *</label>
                            <input type="number" min={0} value={questionCount} onChange={(e) => setQuestionCount(e.target.value)} className={inputClass} placeholder="0" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Doğru</label>
                            <input type="number" min={0} value={correctCount} onChange={(e) => setCorrectCount(e.target.value)} className={inputClass} placeholder="0" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Yanlış</label>
                            <input type="number" min={0} value={wrongCount} onChange={(e) => setWrongCount(e.target.value)} className={inputClass} placeholder="0" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Zorluk</label>
                          <div className="flex gap-1.5">
                            {DIFFICULTY_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => setDifficulty(difficulty === opt.value ? "" : opt.value)}
                                className={clsx(
                                  "flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-all",
                                  difficulty === opt.value
                                    ? DIFFICULTY_MAP[opt.value].color
                                    : "bg-white/[0.02] border-white/10 text-white/30 hover:text-white/50"
                                )}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Kaynak</label>
                          {pastSources.length > 0 && !showCustomSource ? (
                            <div className="flex flex-wrap gap-1.5">
                              {pastSources.map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => setSource(source === s ? "" : s)}
                                  className={clsx(
                                    "px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all",
                                    source === s
                                      ? "bg-cyan-500/15 border-cyan-400/40 text-cyan-300"
                                      : "bg-white/[0.02] border-white/10 text-white/30 hover:text-white/50"
                                  )}
                                >
                                  {s}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => { setShowCustomSource(true); setSource(""); }}
                                className="px-3 py-1.5 rounded-lg text-[11px] font-bold border border-dashed border-white/15 text-white/30 hover:text-white/50 hover:border-white/25 transition-all"
                              >
                                + Yeni Kaynak
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <input type="text" value={source} onChange={(e) => setSource(e.target.value)} className={clsx(inputClass, "flex-1")} placeholder="Kitap, test adı..." />
                              {pastSources.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => { setShowCustomSource(false); setSource(""); }}
                                  className="px-3 py-2 rounded-xl text-[10px] font-bold bg-white/[0.03] border border-white/10 text-white/30 hover:text-white/50 transition-all shrink-0"
                                >
                                  Listeden Seç
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Duration + Notes (shared) */}
                {(didReview || didQuestions) && (
                  <div className="space-y-3 pt-2 border-t border-white/5">
                    {/* Duration */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock size={12} className="text-cyan-400" />
                          Süre
                        </label>
                        {didReview && didQuestions && (
                          <button
                            onClick={() => setSplitDuration(!splitDuration)}
                            className={clsx(
                              "text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all",
                              splitDuration
                                ? "bg-cyan-500/10 border-cyan-400/30 text-cyan-300"
                                : "bg-white/[0.02] border-white/10 text-white/30 hover:text-white/50"
                            )}
                          >
                            {splitDuration ? "Ayrı Süreler" : "Süreyi Ayır"}
                          </button>
                        )}
                      </div>

                      {splitDuration && didReview && didQuestions ? (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-purple-300/60 uppercase tracking-widest">Tekrar süresi</label>
                            <div className="relative">
                              <input type="number" min={0} value={reviewDuration} onChange={(e) => setReviewDuration(e.target.value)} className={inputClass} placeholder="0" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20">dk</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-pink-300/60 uppercase tracking-widest">Test süresi</label>
                            <div className="relative">
                              <input type="number" min={0} value={questionDuration} onChange={(e) => setQuestionDuration(e.target.value)} className={inputClass} placeholder="0" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20">dk</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="relative max-w-xs">
                          <input type="number" min={0} value={totalDuration} onChange={(e) => setTotalDuration(e.target.value)} className={inputClass} placeholder="Toplam süre" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20">dk</span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Not</label>
                      <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} placeholder="Opsiyonel not..." />
                    </div>

                    {/* Save */}
                    <div className="flex justify-end pt-2">
                      <motion.button
                        whileHover={!saving ? { scale: 1.02 } : {}}
                        whileTap={!saving ? { scale: 0.97 } : {}}
                        onClick={handleSave}
                        disabled={saving || !subjectId || (!didReview && !didQuestions)}
                        className={clsx(
                          "px-8 py-3 font-bold text-sm rounded-xl disabled:opacity-40 flex items-center gap-2 transition-all",
                          didReview && didQuestions
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                            : didReview
                              ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                              : "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-[0_0_15px_rgba(255,42,133,0.3)]"
                        )}
                      >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        EKLE
                        {didReview && didQuestions && (
                          <span className="text-[10px] opacity-70 ml-1">(2 kayıt)</span>
                        )}
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entry List */}
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar relative z-10">
          {studies.length === 0 && reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Activity className="w-12 h-12 text-pink-400/50 mb-4" />
              <p className="text-lg font-bold text-white/40 mb-1">Bugün kayıt yok</p>
              <p className="text-xs text-white/25 max-w-xs mb-5">Soru çözümü veya konu tekrarı kayıtlarını ekle</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-pink-300 text-sm font-bold rounded-xl transition-colors"
              >
                İlk kaydını ekle
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Combined & sorted entries */}
              {[
                ...studies.map((s) => ({ type: "study" as const, data: s })),
                ...reviews.map((r) => ({ type: "review" as const, data: r })),
              ].map((entry, idx) => {
                if (entry.type === "study") {
                  const s = entry.data as DailyStudyEntry;
                  const diffInfo = s.difficulty ? DIFFICULTY_MAP[s.difficulty] : null;
                  return (
                    <motion.div
                      key={`s-${s.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group bg-white/[0.02] border border-white/5 hover:border-pink-500/20 rounded-xl p-4 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            <PenTool size={12} className="text-pink-400 shrink-0" />
                            <span className="font-bold text-white text-sm">{s.subject.name}</span>
                            <span className="text-[9px] uppercase font-bold text-white/30 bg-white/5 px-1.5 py-0.5 rounded">{s.subject.examType.name}</span>
                            {s.topic && <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-lg text-white/60">{s.topic.name}</span>}
                            {diffInfo && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${diffInfo.color}`}>{diffInfo.label}</span>}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="text-pink-400 font-bold">{s.questionCount} soru</span>
                            <span className="text-emerald-400 font-bold">{s.correctCount}D</span>
                            <span className="text-rose-400 font-bold">{s.wrongCount}Y</span>
                            <span className="text-amber-400 font-bold">{s.emptyCount}B</span>
                            {s.duration && (
                              <span className="text-cyan-400/70 font-medium text-xs flex items-center gap-1">
                                <Clock size={10} /> {s.duration} dk
                              </span>
                            )}
                          </div>

                          {(s.source || s.notes) && (
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/40">
                              {s.source && <span>Kaynak: {s.source}</span>}
                              {s.notes && <span className="italic">Not: {s.notes}</span>}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteStudy(s.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/20 hover:text-rose-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                          title="Sil"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </motion.div>
                  );
                } else {
                  const r = entry.data as TopicReviewEntry;
                  const confInfo = r.confidence ? CONFIDENCE_MAP[r.confidence] : null;
                  return (
                    <motion.div
                      key={`r-${r.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group bg-white/[0.02] border border-white/5 hover:border-purple-500/20 rounded-xl p-4 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            <BrainCircuit size={12} className="text-purple-400 shrink-0" />
                            <span className="font-bold text-white text-sm">{r.topic.name}</span>
                            <span className="text-[9px] uppercase font-bold text-white/30 bg-white/5 px-1.5 py-0.5 rounded">{r.subject.name}</span>
                            {confInfo && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${confInfo.color}`}>{confInfo.label}</span>}
                            {r.method && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-blue-500/10 border-blue-500/20 text-blue-300">{METHOD_LABEL_MAP[r.method] || r.method}</span>}
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            {r.duration && (
                              <span className="text-cyan-400/70 font-medium text-xs flex items-center gap-1">
                                <Clock size={10} /> {r.duration} dk
                              </span>
                            )}
                          </div>

                          {r.notes && (
                            <p className="mt-2 text-[11px] text-white/40 italic">Not: {r.notes}</p>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteReview(r.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/20 hover:text-rose-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                          title="Sil"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </motion.div>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
