"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Paper, Handwriting } from "@/components/skeuomorphic";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  BookOpen, PenTool, Plus, Trash2, Camera, Loader2, X,
  CheckCircle, Clock, Target, Filter, Calendar,
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
  dusuk: { label: "Düşük", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  orta: { label: "Orta", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  yuksek: { label: "Yüksek", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
};

const DIFFICULTY_MAP: Record<string, { label: string; color: string }> = {
  kolay: { label: "Kolay", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  orta: { label: "Orta", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  zor: { label: "Zor", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
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

  if (loading) {
    return (
      <Paper className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-pink-400/50 mr-3" size={24} />
        <span className="text-white/50 text-sm">Yükleniyor...</span>
      </Paper>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Paper className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Handwriting className="text-2xl sm:text-3xl">Günlük Çalışma</Handwriting>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-white/40" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-sm bg-white/[0.06] border border-pink-500/[0.12] text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent rounded-lg [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{totalQuestions}</p>
            <p className="text-[10px] text-pink-400 uppercase font-medium">Soru</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{totalCorrect}</p>
            <p className="text-[10px] text-emerald-400 uppercase font-medium">Doğru</p>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-rose-400">{totalWrong}</p>
            <p className="text-[10px] text-rose-400 uppercase font-medium">Yanlış</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{totalReviews}</p>
            <p className="text-[10px] text-purple-400 uppercase font-medium">Tekrar</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{totalStudyMinutes}</p>
            <p className="text-[10px] text-amber-400 uppercase font-medium">Dakika</p>
          </div>
        </div>
      </Paper>

      {/* Tabs + Add Buttons */}
      <Paper>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("questions")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "questions"
                  ? "bg-pink-500 text-white shadow-md shadow-pink-500/10"
                  : "bg-white/[0.06] text-white/60 active:bg-white/10"
              }`}
            >
              <PenTool size={16} />
              Soru Çözümü
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "reviews"
                  ? "bg-purple-600 text-white shadow-md shadow-pink-500/10"
                  : "bg-white/[0.06] text-white/60 active:bg-white/10"
              }`}
            >
              <BookOpen size={16} />
              Konu Tekrarı
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowNewTopic(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white/[0.06] text-white/60 active:bg-white/10 transition-colors"
            >
              <Plus size={14} />
              Konu Ekle
            </button>
            <button
              onClick={() => activeTab === "questions" ? setShowStudyForm(true) : setShowReviewForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-pink-500 text-white active:bg-pink-400 transition-colors shadow-md shadow-pink-500/10"
            >
              <Plus size={16} />
              Ekle
            </button>
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
              <div className="bg-white/[0.03] border border-pink-500/15 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white/70">Yeni Konu Ekle</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={newTopicSubjectId}
                    onChange={(e) => setNewTopicSubjectId(e.target.value)}
                    className="p-2 text-sm bg-white/[0.06] border border-pink-500/[0.12] text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent rounded-lg"
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
                    className="p-2 text-sm bg-white/[0.06] border border-pink-500/[0.12] text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent rounded-lg"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddTopic}
                      disabled={addingTopic}
                      className="flex-1 px-3 py-2 bg-pink-500 text-white text-sm rounded-lg active:bg-pink-400 disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {addingTopic ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                      Ekle
                    </button>
                    <button
                      onClick={() => setShowNewTopic(false)}
                      className="px-3 py-2 bg-white/[0.04] border border-pink-500/15 text-sm rounded-lg active:bg-white/5"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Study Form */}
        <AnimatePresence>
          {showStudyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-pink-300">Soru Çözümü Kaydet</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <select value={sSubjectId} onChange={(e) => { setSSubjectId(e.target.value); setSTopicId(""); }} className="p-2 text-sm bg-white/[0.06] border border-pink-500/[0.12] text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent rounded-lg">
                    <option value="">Ders seçin...</option>
                    {Object.entries(groupedSubjects).map(([etName, subs]) => (
                      <optgroup key={etName} label={etName}>
                        {subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <select value={sTopicId} onChange={(e) => setSTopicId(e.target.value)} className="p-2 text-sm bg-white/[0.06] border border-pink-500/[0.12] text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent rounded-lg">
                    <option value="">Konu (opsiyonel)...</option>
                    {sTopics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <input type="number" min={0} placeholder="Soru sayısı *" value={sQuestionCount} onChange={(e) => setSQuestionCount(e.target.value)} className="p-2 text-sm bg-white/[0.06] border border-pink-500/[0.12] text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent rounded-lg" />
                  <input type="number" min={0} placeholder="Doğru" value={sCorrectCount} onChange={(e) => setSCorrectCount(e.target.value)} className="p-2 text-sm bg-white/[0.06] border border-pink-500/[0.12] text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent rounded-lg" />
                  <input type="number" min={0} placeholder="Yanlış" value={sWrongCount} onChange={(e) => setSWrongCount(e.target.value)} className="p-2 text-sm bg-white/[0.06] border border-pink-500/[0.12] text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent rounded-lg" />
                  <select value={sDifficulty} onChange={(e) => setSDifficulty(e.target.value)} className="p-2 text-sm bg-white/[0.06] border border-pink-500/[0.12] text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent rounded-lg">
                    {DIFFICULTY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <input type="text" placeholder="Kaynak (opsiyonel)" value={sSource} onChange={(e) => setSSource(e.target.value)} className="p-2 text-sm bg-white/[0.06] border border-pink-500/[0.12] text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent rounded-lg" />
                  <input type="number" min={0} placeholder="Süre (dk)" value={sDuration} onChange={(e) => setSDuration(e.target.value)} className="p-2 text-sm bg-white/[0.06] border border-pink-500/[0.12] text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent rounded-lg" />
                  <input type="text" placeholder="Not (opsiyonel)" value={sNotes} onChange={(e) => setSNotes(e.target.value)} className="p-2 text-sm bg-white/[0.06] border border-pink-500/[0.12] text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent rounded-lg" />
                </div>

                {/* Photo */}
                <div className="flex items-center gap-3">
                  <input type="file" accept="image/*" capture="environment" className="hidden" ref={sFileRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleStudyPhoto(f); }} />
                  {sPhotoPreview ? (
                    <div className="relative w-12 h-12 rounded overflow-hidden border border-blue-500/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={sPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button onClick={() => { setSPhotoFile(null); if (sPhotoPreview) URL.revokeObjectURL(sPhotoPreview); setSPhotoPreview(null); }} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center"><X size={10} /></button>
                    </div>
                  ) : (
                    <button onClick={() => sFileRef.current?.click()} className="px-3 py-2 bg-white/[0.04] border border-blue-500/20 text-pink-400 text-sm rounded-lg active:bg-blue-500/10 flex items-center gap-1">
                      <Camera size={14} /> Foto
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button onClick={handleSaveStudy} disabled={saving} className="px-4 py-2 bg-pink-500 text-white text-sm rounded-lg active:bg-pink-400 disabled:opacity-50 flex items-center gap-1">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Kaydet
                  </button>
                  <button onClick={resetStudyForm} className="px-4 py-2 bg-white/[0.04] border border-pink-500/15 text-sm rounded-lg active:bg-white/5">İptal</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Review Form */}
        <AnimatePresence>
          {showReviewForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-purple-300">Konu Tekrarı Kaydet</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <select value={rSubjectId} onChange={(e) => { setRSubjectId(e.target.value); setRTopicId(""); }} className="p-2 text-sm bg-white/[0.06] border border-pink-500/[0.12] text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent rounded-lg">
                    <option value="">Ders seçin...</option>
                    {Object.entries(groupedSubjects).map(([etName, subs]) => (
                      <optgroup key={etName} label={etName}>
                        {subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <select value={rTopicId} onChange={(e) => setRTopicId(e.target.value)} className="p-2 text-sm bg-white/[0.06] border border-pink-500/[0.12] text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent rounded-lg">
                    <option value="">Konu seçin *...</option>
                    {rTopics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <input type="number" min={0} placeholder="Süre (dk)" value={rDuration} onChange={(e) => setRDuration(e.target.value)} className="p-2 text-sm bg-white/[0.06] border border-pink-500/[0.12] text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent rounded-lg" />
                  <select value={rConfidence} onChange={(e) => setRConfidence(e.target.value)} className="p-2 text-sm bg-white/[0.06] border border-pink-500/[0.12] text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent rounded-lg">
                    {CONFIDENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <select value={rMethod} onChange={(e) => setRMethod(e.target.value)} className="p-2 text-sm bg-white/[0.06] border border-pink-500/[0.12] text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent rounded-lg">
                    {METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <input type="text" placeholder="Not (opsiyonel)" value={rNotes} onChange={(e) => setRNotes(e.target.value)} className="p-2 text-sm bg-white/[0.06] border border-pink-500/[0.12] text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent rounded-lg" />
                </div>

                {/* Photo */}
                <div className="flex items-center gap-3">
                  <input type="file" accept="image/*" capture="environment" className="hidden" ref={rFileRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleReviewPhoto(f); }} />
                  {rPhotoPreview ? (
                    <div className="relative w-12 h-12 rounded overflow-hidden border border-purple-500/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={rPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button onClick={() => { setRPhotoFile(null); if (rPhotoPreview) URL.revokeObjectURL(rPhotoPreview); setRPhotoPreview(null); }} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center"><X size={10} /></button>
                    </div>
                  ) : (
                    <button onClick={() => rFileRef.current?.click()} className="px-3 py-2 bg-white/[0.04] border border-purple-500/20 text-purple-400 text-sm rounded-lg active:bg-purple-500/10 flex items-center gap-1">
                      <Camera size={14} /> Foto
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button onClick={handleSaveReview} disabled={saving} className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Kaydet
                  </button>
                  <button onClick={resetReviewForm} className="px-4 py-2 bg-white/[0.04] border border-pink-500/15 text-sm rounded-lg active:bg-white/5">İptal</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "questions" ? (
            <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {studies.length === 0 ? (
                <div className="text-center py-12 text-white/40">
                  <PenTool className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Bugün soru çözümü kaydı yok</p>
                  <button onClick={() => setShowStudyForm(true)} className="mt-3 text-pink-400 text-sm font-medium hover:text-pink-300 flex items-center gap-1 mx-auto">
                    <Plus size={14} /> İlk kaydını ekle
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {studies.map((s) => {
                    const diffInfo = s.difficulty ? DIFFICULTY_MAP[s.difficulty] : null;
                    return (
                      <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.04] border border-pink-500/15 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white/90 text-sm">{s.subject.name}</span>
                              <span className="text-xs text-white/40">{s.subject.examType.name}</span>
                              {s.topic && <span className="text-xs bg-white/[0.06] px-2 py-0.5 rounded-full text-white/60">{s.topic.name}</span>}
                              {diffInfo && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diffInfo.color}`}>{diffInfo.label}</span>}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="text-pink-400 font-semibold">{s.questionCount} soru</span>
                              <span className="text-emerald-400">{s.correctCount} D</span>
                              <span className="text-rose-400">{s.wrongCount} Y</span>
                              <span className="text-amber-400">{s.emptyCount} B</span>
                              {s.duration && <span className="text-white/40 flex items-center gap-1"><Clock size={12} /> {s.duration} dk</span>}
                            </div>
                            {s.source && <p className="text-xs text-white/50 mt-1">Kaynak: {s.source}</p>}
                            {s.notes && <p className="text-xs text-white/50 mt-1 italic">{s.notes}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            {s.photoUrl && <Camera size={14} className="text-blue-400" />}
                            <button onClick={() => handleDeleteStudy(s.id)} className="p-1.5 text-white/40 hover:text-rose-400 active:bg-rose-500/10 rounded transition-colors">
                              <Trash2 size={14} />
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
            <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-white/40">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Bugün konu tekrarı kaydı yok</p>
                  <button onClick={() => setShowReviewForm(true)} className="mt-3 text-purple-400 text-sm font-medium hover:text-purple-300 flex items-center gap-1 mx-auto">
                    <Plus size={14} /> İlk kaydını ekle
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => {
                    const confInfo = r.confidence ? CONFIDENCE_MAP[r.confidence] : null;
                    return (
                      <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.04] border border-pink-500/15 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white/90 text-sm">{r.topic.name}</span>
                              <span className="text-xs text-white/40">{r.subject.name} - {r.subject.examType.name}</span>
                              {confInfo && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${confInfo.color}`}>{confInfo.label}</span>}
                              {r.method && <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">{r.method === "video" ? "Video" : r.method === "kitap" ? "Kitap" : r.method === "ders_notu" ? "Ders Notu" : r.method === "soru_cozumu" ? "Soru Çözümü" : "Diğer"}</span>}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              {r.duration && <span className="text-white/50 flex items-center gap-1"><Clock size={12} /> {r.duration} dk</span>}
                            </div>
                            {r.notes && <p className="text-xs text-white/50 mt-1 italic">{r.notes}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            {r.photoUrl && <Camera size={14} className="text-purple-400" />}
                            <button onClick={() => handleDeleteReview(r.id)} className="p-1.5 text-white/40 hover:text-rose-400 active:bg-rose-500/10 rounded transition-colors">
                              <Trash2 size={14} />
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
      </Paper>
    </div>
  );
}
