"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { clsx } from 'clsx';
import {
  BookOpen, PenTool, Plus, Trash2, Camera, Loader2, X,
  CheckCircle, Clock, Target, Filter, Calendar, BookMarked, BrainCircuit, Activity
} from "lucide-react";

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
  photoUrl: string | null;
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
  photoUrl: string | null;
  notes: string | null;
  subject: { name: string; examType: { name: string } };
  topic: { name: string };
}

type ActiveTab = "questions" | "reviews";

// ---------- Constants ----------

const DIFFICULTY_OPTIONS = [
  { value: "", label: "Zorluk..." },
  { value: "kolay", label: "Kolay" },
  { value: "orta", label: "Orta" },
  { value: "zor", label: "Zor" },
];

const CONFIDENCE_OPTIONS = [
  { value: "", label: "Özgüven..." },
  { value: "dusuk", label: "Düşük" },
  { value: "orta", label: "Orta" },
  { value: "yuksek", label: "Yüksek" },
];

const METHOD_OPTIONS = [
  { value: "", label: "Yöntem..." },
  { value: "video", label: "Video" },
  { value: "kitap", label: "Kitap" },
  { value: "ders_notu", label: "Ders Notu" },
  { value: "soru_cozumu", label: "Soru Çözümü" },
  { value: "diger", label: "Diğer" },
];

const CONFIDENCE_MAP: Record<string, { label: string; color: string }> = {
  dusuk: { label: "Düşük", color: "bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]" },
  orta: { label: "Orta", color: "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]" },
  yuksek: { label: "Yüksek", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]" },
};

const DIFFICULTY_MAP: Record<string, { label: string; color: string }> = {
  kolay: { label: "Kolay", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]" },
  orta: { label: "Orta", color: "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]" },
  zor: { label: "Zor", color: "bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]" },
};

// ---------- Helper: Upload Photo ----------

async function uploadPhoto(file: File): Promise<{ photoUrl: string; photoR2Key: string }> {
  const presignRes = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  });
  if (!presignRes.ok) throw new Error("Upload alınamadı");
  const { uploadUrl, publicUrl, r2Key } = await presignRes.json();
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!uploadRes.ok) throw new Error("Dosya yüklenemedi");
  return { photoUrl: publicUrl, photoR2Key: r2Key };
}

// ---------- Component ----------

export default function StudyPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("questions");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Data
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studies, setStudies] = useState<DailyStudyEntry[]>([]);
  const [reviews, setReviews] = useState<TopicReviewEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [showStudyForm, setShowStudyForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Study form fields
  const [sSubjectId, setSSubjectId] = useState("");
  const [sTopicId, setSTopicId] = useState("");
  const [sQuestionCount, setSQuestionCount] = useState("");
  const [sCorrectCount, setSCorrectCount] = useState("");
  const [sWrongCount, setSWrongCount] = useState("");
  const [sDifficulty, setSDifficulty] = useState("");
  const [sSource, setSSource] = useState("");
  const [sDuration, setSDuration] = useState("");
  const [sNotes, setSNotes] = useState("");
  const [sPhotoFile, setSPhotoFile] = useState<File | null>(null);
  const [sPhotoPreview, setSPhotoPreview] = useState<string | null>(null);
  const sFileRef = useRef<HTMLInputElement>(null);

  // Review form fields
  const [rSubjectId, setRSubjectId] = useState("");
  const [rTopicId, setRTopicId] = useState("");
  const [rDuration, setRDuration] = useState("");
  const [rConfidence, setRConfidence] = useState("");
  const [rMethod, setRMethod] = useState("");
  const [rNotes, setRNotes] = useState("");
  const [rPhotoFile, setRPhotoFile] = useState<File | null>(null);
  const [rPhotoPreview, setRPhotoPreview] = useState<string | null>(null);
  const rFileRef = useRef<HTMLInputElement>(null);

  // New topic
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicSubjectId, setNewTopicSubjectId] = useState("");
  const [addingTopic, setAddingTopic] = useState(false);

  // ---------- Derived ----------

  const sTopics = useMemo(() => {
    return subjects.find((s) => s.id === sSubjectId)?.topics ?? [];
  }, [subjects, sSubjectId]);

  const rTopics = useMemo(() => {
    return subjects.find((s) => s.id === rSubjectId)?.topics ?? [];
  }, [subjects, rSubjectId]);

  // ---------- Fetch ----------

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, studyRes, reviewRes] = await Promise.all([
        fetch("/api/exam-types"),
        fetch(`/api/daily-study?date=${selectedDate}`),
        fetch(`/api/topic-reviews?date=${selectedDate}`),
      ]);

      if (subRes.ok) {
        const examTypes = await subRes.json();
        // Flatten subjects from all exam types
        const allSubjects: Subject[] = [];
        for (const et of examTypes) {
          if (et.subjects) {
            for (const s of et.subjects) {
              allSubjects.push({ ...s, examType: { name: et.name, slug: et.slug } });
            }
          }
        }
        // If exam-types doesn't include subjects, fetch separately
        if (allSubjects.length === 0) {
          // Fetch TYT and AYT subjects
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
        setSubjects(allSubjects);
      }

      if (studyRes.ok) setStudies(await studyRes.json());
      if (reviewRes.ok) setReviews(await reviewRes.json());
    } catch (err) {
      console.error("Veri yüklenirken hata:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------- Stats ----------

  const totalQuestions = studies.reduce((sum, s) => sum + s.questionCount, 0);
  const totalCorrect = studies.reduce((sum, s) => sum + s.correctCount, 0);
  const totalWrong = studies.reduce((sum, s) => sum + s.wrongCount, 0);
  const totalReviews = reviews.length;
  const totalStudyMinutes = studies.reduce((sum, s) => sum + (s.duration || 0), 0) +
    reviews.reduce((sum, r) => sum + (r.duration || 0), 0);

  // ---------- Save Study ----------

  async function handleSaveStudy() {
    if (!sSubjectId || !sQuestionCount) {
      toast.error("Ders ve soru sayısı zorunlu");
      return;
    }
    setSaving(true);
    try {
      let photoUrl = null;
      let photoR2Key = null;
      if (sPhotoFile) {
        const result = await uploadPhoto(sPhotoFile);
        photoUrl = result.photoUrl;
        photoR2Key = result.photoR2Key;
      }

      const qCount = parseInt(sQuestionCount) || 0;
      const cCount = parseInt(sCorrectCount) || 0;
      const wCount = parseInt(sWrongCount) || 0;

      const res = await fetch("/api/daily-study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          subjectId: sSubjectId,
          topicId: sTopicId || null,
          questionCount: qCount,
          correctCount: cCount,
          wrongCount: wCount,
          emptyCount: qCount - cCount - wCount,
          difficulty: sDifficulty || null,
          source: sSource || null,
          duration: sDuration ? parseInt(sDuration) : null,
          notes: sNotes || null,
          photoUrl,
          photoR2Key,
        }),
      });
      if (!res.ok) throw new Error("Kayıt başarısız");
      toast.success("Soru çözümü kaydedildi");
      resetStudyForm();
      fetchData();
    } catch {
      toast.error("Kayıt sırasında hata oluştu");
    } finally {
      setSaving(false);
    }
  }

  function resetStudyForm() {
    setShowStudyForm(false);
    setSSubjectId("");
    setSTopicId("");
    setSQuestionCount("");
    setSCorrectCount("");
    setSWrongCount("");
    setSDifficulty("");
    setSSource("");
    setSDuration("");
    setSNotes("");
    setSPhotoFile(null);
    if (sPhotoPreview) URL.revokeObjectURL(sPhotoPreview);
    setSPhotoPreview(null);
  }

  // ---------- Save Review ----------

  async function handleSaveReview() {
    if (!rSubjectId || !rTopicId) {
      toast.error("Ders ve konu zorunlu");
      return;
    }
    setSaving(true);
    try {
      let photoUrl = null;
      let photoR2Key = null;
      if (rPhotoFile) {
        const result = await uploadPhoto(rPhotoFile);
        photoUrl = result.photoUrl;
        photoR2Key = result.photoR2Key;
      }

      const res = await fetch("/api/topic-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          subjectId: rSubjectId,
          topicId: rTopicId,
          duration: rDuration ? parseInt(rDuration) : null,
          confidence: rConfidence || null,
          method: rMethod || null,
          notes: rNotes || null,
          photoUrl,
          photoR2Key,
        }),
      });
      if (!res.ok) throw new Error("Kayıt başarısız");
      toast.success("Konu tekrarı kaydedildi");
      resetReviewForm();
      fetchData();
    } catch {
      toast.error("Kayıt sırasında hata oluştu");
    } finally {
      setSaving(false);
    }
  }

  function resetReviewForm() {
    setShowReviewForm(false);
    setRSubjectId("");
    setRTopicId("");
    setRDuration("");
    setRConfidence("");
    setRMethod("");
    setRNotes("");
    setRPhotoFile(null);
    if (rPhotoPreview) URL.revokeObjectURL(rPhotoPreview);
    setRPhotoPreview(null);
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
      // Update local subjects
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

  // ---------- Photo Helpers ----------

  function handleStudyPhoto(file: File) {
    setSPhotoFile(file);
    setSPhotoPreview(URL.createObjectURL(file));
  }

  function handleReviewPhoto(file: File) {
    setRPhotoFile(file);
    setRPhotoPreview(URL.createObjectURL(file));
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

  const inputClass = "w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-400/30 transition-all hover:border-white/20 [color-scheme:dark]";

  if (loading) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent pointer-events-none" />
        <Loader2 className="animate-spin text-pink-400 mb-4 drop-shadow-[0_0_10px_rgba(255,42,133,0.5)]" size={40} />
        <span className="text-white/60 font-bold tracking-wide">Çalışma verileri yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Header & Stats Container */}
      <div className="glass-panel p-6 sm:p-8 relative z-10 overflow-hidden shadow-[0_8px_32px_rgba(255,42,133,0.05)] border-white/10 rounded-3xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-[40px] pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <BookMarked size={36} className="text-pink-400 drop-shadow-[0_0_15px_rgba(255,42,133,0.4)]" />
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
              Günlük Çalışma
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 p-2 rounded-xl shadow-inner backdrop-blur-sm self-start sm:self-auto">
            <Calendar size={18} className="text-pink-300 ml-2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-bold text-white uppercase tracking-wider focus:outline-none [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 relative z-10">
          {[
            { label: "Soru", value: totalQuestions, color: "from-blue-500/20 to-blue-500/5", text: "text-blue-400", border: "border-blue-500/20" },
            { label: "Doğru", value: totalCorrect, color: "from-emerald-500/20 to-emerald-500/5", text: "text-emerald-400", border: "border-emerald-500/20" },
            { label: "Yanlış", value: totalWrong, color: "from-rose-500/20 to-rose-500/5", text: "text-rose-400", border: "border-rose-500/20" },
            { label: "Tekrar", value: totalReviews, color: "from-purple-500/20 to-purple-500/5", text: "text-purple-400", border: "border-purple-500/20" },
            { label: "Dakika", value: totalStudyMinutes, color: "from-amber-500/20 to-amber-500/5", text: "text-amber-400", border: "border-amber-500/20" }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-gradient-to-br ${stat.color} border ${stat.border} rounded-2xl p-4 text-center shadow-lg relative overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className={`text-3xl font-black ${stat.text} drop-shadow-md font-mono tracking-tight`}>{stat.value}</p>
              <p className={`text-[11px] ${stat.text} uppercase font-bold tracking-widest mt-1 opacity-80`}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass-panel p-6 sm:p-8 relative z-10 shadow-[0_8px_32px_rgba(255,42,133,0.05)] border-white/10 rounded-3xl min-h-[500px] flex flex-col">
        {/* Tabs & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 border-b border-white/5 pb-6">
          <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/10 self-start">
            <button
              onClick={() => setActiveTab("questions")}
              className={clsx(
                "flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                activeTab === "questions"
                  ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-[0_4px_15px_rgba(255,42,133,0.4)]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <PenTool size={16} className={activeTab === "questions" ? "drop-shadow-md" : ""} />
              Soru Çözümü
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={clsx(
                "flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                activeTab === "reviews"
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-[0_4px_15px_rgba(168,85,247,0.4)]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <BrainCircuit size={16} className={activeTab === "reviews" ? "drop-shadow-md" : ""} />
              Konu Tekrarı
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowNewTopic(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-white/[0.03] border border-white/10 hover:border-white/30 text-white/70 hover:text-white hover:bg-white/[0.05] transition-all shadow-sm"
            >
              <Plus size={14} className="text-pink-400" />
              KONU EKLE
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => activeTab === "questions" ? setShowStudyForm(true) : setShowReviewForm(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-[0_0_15px_rgba(255,42,133,0.3)] hover:shadow-[0_0_25px_rgba(255,42,133,0.5)] border border-pink-400/20 transition-all"
            >
              <Plus size={16} />
              {activeTab === "questions" ? "KAYIT EKLE" : "TEKRAR EKLE"}
            </motion.button>
          </div>
        </div>

        {/* Input Forms */}
        <div className="space-y-4 mb-2">
          {/* New Topic Form */}
          <AnimatePresence>
            {showNewTopic && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.98 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.98 }}
                className="overflow-hidden mb-4"
              >
                <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 rounded-2xl p-5 shadow-inner backdrop-blur-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 uppercase tracking-widest">Yeni Konu Ekle</h3>
                    <button onClick={() => setShowNewTopic(false)} className="text-white/40 hover:text-white p-1 bg-white/5 rounded-lg"><X size={14} /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <select
                      value={newTopicSubjectId}
                      onChange={(e) => setNewTopicSubjectId(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Ders seçin...</option>
                      {Object.entries(groupedSubjects).map(([etName, subs]) => (
                        <optgroup key={etName} label={etName}>
                          {subs.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Konu adı..."
                      value={newTopicName}
                      onChange={(e) => setNewTopicName(e.target.value)}
                      className={inputClass}
                    />
                    <motion.button
                      whileHover={!addingTopic ? { scale: 1.02 } : {}}
                      whileTap={!addingTopic ? { scale: 0.98 } : {}}
                      onClick={handleAddTopic}
                      disabled={addingTopic || !newTopicName.trim() || !newTopicSubjectId}
                      className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold text-sm rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,42,133,0.3)] transition-all"
                    >
                      {addingTopic ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                      KAYDET
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Study Form */}
          <AnimatePresence>
            {showStudyForm && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.98 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.98 }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20 rounded-2xl p-6 shadow-inner backdrop-blur-md">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-sm font-black text-pink-300 uppercase tracking-widest flex items-center gap-2">
                      <PenTool size={16} /> Soru Çözümü Kaydet
                    </h3>
                    <button onClick={resetStudyForm} className="text-white/40 hover:text-white p-1 bg-white/5 rounded-lg transition-colors"><X size={14} /></button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-5">
                    <select value={sSubjectId} onChange={(e) => { setSSubjectId(e.target.value); setSTopicId(""); }} className={inputClass}>
                      <option value="">Ders seçin...</option>
                      {Object.entries(groupedSubjects).map(([etName, subs]) => (
                        <optgroup key={etName} label={etName}>
                          {subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </optgroup>
                      ))}
                    </select>
                    <select value={sTopicId} onChange={(e) => setSTopicId(e.target.value)} className={inputClass}>
                      <option value="">Konu (opsiyonel)...</option>
                      {sTopics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <input type="number" min={0} placeholder="Toplam Soru *" value={sQuestionCount} onChange={(e) => setSQuestionCount(e.target.value)} className={inputClass} />
                    <input type="number" min={0} placeholder="Doğru (ops)" value={sCorrectCount} onChange={(e) => setSCorrectCount(e.target.value)} className={inputClass} />
                    <input type="number" min={0} placeholder="Yanlış (ops)" value={sWrongCount} onChange={(e) => setSWrongCount(e.target.value)} className={inputClass} />
                    <select value={sDifficulty} onChange={(e) => setSDifficulty(e.target.value)} className={inputClass}>
                      {DIFFICULTY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <input type="text" placeholder="Kaynak (ops)" value={sSource} onChange={(e) => setSSource(e.target.value)} className={inputClass} />
                    <input type="number" min={0} placeholder="Süre (dk)" value={sDuration} onChange={(e) => setSDuration(e.target.value)} className={inputClass} />
                    <input type="text" placeholder="Notlar (ops)" value={sNotes} onChange={(e) => setSNotes(e.target.value)} className={`lg:col-span-2 ${inputClass}`} />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <input type="file" accept="image/*" capture="environment" className="hidden" ref={sFileRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleStudyPhoto(f); }} />
                      {sPhotoPreview ? (
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-pink-500/50 shadow-md">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={sPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                          <button onClick={() => { setSPhotoFile(null); if (sPhotoPreview) URL.revokeObjectURL(sPhotoPreview); setSPhotoPreview(null); }} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><X size={20} className="text-white bg-rose-500 rounded-full p-0.5" /></button>
                        </div>
                      ) : (
                        <button onClick={() => sFileRef.current?.click()} className="px-4 py-2.5 bg-white/[0.04] border border-white/10 hover:border-pink-500/30 text-white/70 hover:text-pink-300 text-sm font-bold rounded-xl active:bg-white/5 flex items-center gap-2 transition-all">
                          <Camera size={16} /> Fotoğraf Ekle
                        </button>
                      )}
                    </div>

                    <motion.button
                      whileHover={!saving ? { scale: 1.02 } : {}}
                      whileTap={!saving ? { scale: 0.98 } : {}}
                      onClick={handleSaveStudy}
                      disabled={saving || !sSubjectId || !sQuestionCount}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-black tracking-widest text-sm rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,42,133,0.3)] transition-all"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <SaveIcon />}
                      KAYDET
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Review Form */}
          <AnimatePresence>
            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.98 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.98 }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl p-6 shadow-inner backdrop-blur-md">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-sm font-black text-purple-300 uppercase tracking-widest flex items-center gap-2">
                      <BrainCircuit size={16} /> Konu Tekrarı Kaydet
                    </h3>
                    <button onClick={resetReviewForm} className="text-white/40 hover:text-white p-1 bg-white/5 rounded-lg transition-colors"><X size={14} /></button>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                    <select value={rSubjectId} onChange={(e) => { setRSubjectId(e.target.value); setRTopicId(""); }} className={inputClass}>
                      <option value="">Ders seçin...</option>
                      {Object.entries(groupedSubjects).map(([etName, subs]) => (
                        <optgroup key={etName} label={etName}>
                          {subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </optgroup>
                      ))}
                    </select>
                    <select value={rTopicId} onChange={(e) => setRTopicId(e.target.value)} className={inputClass}>
                      <option value="">Konu seçin *...</option>
                      {rTopics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <input type="number" min={0} placeholder="Süre (dk)" value={rDuration} onChange={(e) => setRDuration(e.target.value)} className={inputClass} />
                    <select value={rConfidence} onChange={(e) => setRConfidence(e.target.value)} className={inputClass}>
                      {CONFIDENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <select value={rMethod} onChange={(e) => setRMethod(e.target.value)} className={inputClass}>
                      {METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <input type="text" placeholder="Notlar (ops)" value={rNotes} onChange={(e) => setRNotes(e.target.value)} className={`lg:col-span-3 ${inputClass}`} />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <input type="file" accept="image/*" capture="environment" className="hidden" ref={rFileRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleReviewPhoto(f); }} />
                      {rPhotoPreview ? (
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-purple-500/50 shadow-md">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={rPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                          <button onClick={() => { setRPhotoFile(null); if (rPhotoPreview) URL.revokeObjectURL(rPhotoPreview); setRPhotoPreview(null); }} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><X size={20} className="text-white bg-rose-500 rounded-full p-0.5" /></button>
                        </div>
                      ) : (
                        <button onClick={() => rFileRef.current?.click()} className="px-4 py-2.5 bg-white/[0.04] border border-white/10 hover:border-purple-500/30 text-white/70 hover:text-purple-300 text-sm font-bold rounded-xl active:bg-white/5 flex items-center gap-2 transition-all">
                          <Camera size={16} /> Fotoğraf Ekle
                        </button>
                      )}
                    </div>

                    <motion.button
                      whileHover={!saving ? { scale: 1.02 } : {}}
                      whileTap={!saving ? { scale: 0.98 } : {}}
                      onClick={handleSaveReview}
                      disabled={saving || !rSubjectId || !rTopicId}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-black tracking-widest text-sm rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <SaveIcon />}
                      KAYDET
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content Lists */}
        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar relative z-10">
          <AnimatePresence mode="wait">
            {activeTab === "questions" ? (
              <motion.div key="questions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                {studies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-50 text-center">
                    <Activity className="w-16 h-16 text-pink-400 mb-6 drop-shadow-[0_0_15px_rgba(255,42,133,0.5)]" />
                    <p className="text-xl font-bold text-white mb-2">Bugün soru çözümü kaydı yok</p>
                    <p className="text-sm font-medium tracking-wide text-white/50 max-w-xs">Soru çözümlerini kaydederek net başarılarını takip et</p>
                    <button onClick={() => setShowStudyForm(true)} className="mt-6 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-pink-300 text-sm font-bold rounded-xl transition-colors">
                      İlk kaydını ekle
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studies.map((s, idx) => {
                      const diffInfo = s.difficulty ? DIFFICULTY_MAP[s.difficulty] : null;
                      return (
                        <motion.div
                          key={s.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group bg-white/[0.02] border border-white/5 hover:border-pink-500/30 hover:bg-white/[0.04] rounded-2xl p-5 sm:p-6 transition-all shadow-sm hover:shadow-[0_4px_20px_rgba(255,42,133,0.05)] relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />

                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="font-black text-white text-lg tracking-tight group-hover:text-pink-300 transition-colors">{s.subject.name}</span>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 bg-white/5 px-2 py-0.5 rounded-md">{s.subject.examType.name}</span>
                                {s.topic && <span className="text-[11px] font-bold bg-white/10 px-2.5 py-1 rounded-lg text-white/70">{s.topic.name}</span>}
                                {diffInfo && <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${diffInfo.color}`}>{diffInfo.label}</span>}
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-4 text-sm bg-black/20 p-3 rounded-xl border border-white/5">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Toplam</span>
                                  <span className="text-pink-400 font-bold xl:text-lg">{s.questionCount} Soru</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Doğru</span>
                                  <span className="text-emerald-400 font-bold xl:text-lg">{s.correctCount}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Yanlış</span>
                                  <span className="text-rose-400 font-bold xl:text-lg">{s.wrongCount}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Boş</span>
                                  <span className="text-amber-400 font-bold xl:text-lg">{s.emptyCount}</span>
                                </div>
                                {s.duration && (
                                  <div className="flex flex-col col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-3 mt-2 sm:mt-0">
                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Süre</span>
                                    <span className="text-cyan-400 font-bold xl:text-lg flex items-center gap-1"><Clock size={14} className="opacity-50" /> {s.duration} dk</span>
                                  </div>
                                )}
                              </div>

                              <div className="mt-4 flex flex-col gap-1.5 border-l-2 border-pink-500/20 pl-3">
                                {s.source && <p className="text-xs font-medium text-white/60"><span className="text-white/30 uppercase text-[10px] tracking-widest mr-2">Kaynak</span> {s.source}</p>}
                                {s.notes && <p className="text-xs font-medium text-white/60 italic"><span className="text-white/30 uppercase text-[10px] tracking-widest mr-2 not-italic">Not</span> {s.notes}</p>}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-start bg-black/40 p-1.5 rounded-xl border border-white/5">
                              {s.photoUrl && (
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-blue-500/20 text-blue-400 transition-colors group/btn" title="Fotoğrafı Gör">
                                  <Camera size={14} className="group-hover/btn:scale-110 transition-transform" />
                                </button>
                              )}
                              <button onClick={() => handleDeleteStudy(s.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-colors group/btn" title="Sil">
                                <Trash2 size={14} className="group-hover/btn:scale-110 transition-transform" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                {reviews.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-50 text-center">
                    <BrainCircuit className="w-16 h-16 text-purple-400 mb-6 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                    <p className="text-xl font-bold text-white mb-2">Bugün konu tekrarı kaydı yok</p>
                    <p className="text-sm font-medium tracking-wide text-white/50 max-w-xs">Konu tekrarlarını kaydederek ilerlemeni ölçümle</p>
                    <button onClick={() => setShowReviewForm(true)} className="mt-6 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-purple-300 text-sm font-bold rounded-xl transition-colors">
                      İlk kaydını ekle
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r, idx) => {
                      const confInfo = r.confidence ? CONFIDENCE_MAP[r.confidence] : null;
                      return (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group bg-white/[0.02] border border-white/5 hover:border-purple-500/30 hover:bg-white/[0.04] rounded-2xl p-5 sm:p-6 transition-all shadow-sm hover:shadow-[0_4px_20px_rgba(168,85,247,0.05)] relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />

                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="font-black text-white text-lg tracking-tight group-hover:text-purple-300 transition-colors">{r.topic.name}</span>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 bg-white/5 px-2 py-0.5 rounded-md">{r.subject.name} - {r.subject.examType.name}</span>
                                {confInfo && <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${confInfo.color}`}>{confInfo.label}</span>}
                                {r.method && <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border text-blue-400 border-blue-500/30 bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                                  {r.method === "video" ? "Video" : r.method === "kitap" ? "Kitap" : r.method === "ders_notu" ? "Ders Notu" : r.method === "soru_cozumu" ? "Soru Çözümü" : "Diğer"}
                                </span>}
                              </div>

                              {r.duration && (
                                <div className="inline-flex items-center gap-2 mt-2 text-sm bg-black/20 px-3 py-1.5 rounded-xl border border-white/5">
                                  <Clock size={14} className="text-cyan-400" />
                                  <span className="font-bold text-white/80">{r.duration} dakika çalışıldı</span>
                                </div>
                              )}

                              {r.notes && (
                                <div className="mt-4 border-l-2 border-purple-500/20 pl-3">
                                  <p className="text-xs font-medium text-white/60 italic"><span className="text-white/30 uppercase text-[10px] tracking-widest mr-2 not-italic">Not</span> {r.notes}</p>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-start bg-black/40 p-1.5 rounded-xl border border-white/5">
                              {r.photoUrl && (
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-purple-500/20 text-purple-400 transition-colors group/btn" title="Fotoğrafı Gör">
                                  <Camera size={14} className="group-hover/btn:scale-110 transition-transform" />
                                </button>
                              )}
                              <button onClick={() => handleDeleteReview(r.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-colors group/btn" title="Sil">
                                <Trash2 size={14} className="group-hover/btn:scale-110 transition-transform" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Icon helper
function SaveIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
  );
}
