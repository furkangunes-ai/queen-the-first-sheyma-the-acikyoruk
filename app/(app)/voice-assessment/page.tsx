"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mic,
  Loader2,
  CheckCircle,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { useContinuousVoiceInput } from "@/hooks/useContinuousVoiceInput";
import {
  SubjectSelector,
  type SubjectOption,
} from "@/components/voice-assessment/subject-selector";
import {
  CurriculumDisplay,
  type CurriculumSubjectData,
  type CurriculumTopic,
} from "@/components/voice-assessment/curriculum-display";
import { VoiceRecorder } from "@/components/voice-assessment/voice-recorder";
import {
  AssessmentResult,
  type AssessmentData,
} from "@/components/voice-assessment/assessment-result";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Step = "select" | "record" | "processing" | "review" | "done";

interface TopicWithKazanim {
  id: string;
  name: string;
  sortOrder: number;
  kazanimlar: Array<{
    id: string;
    code: string;
    description: string;
    isKeyKazanim: boolean;
  }>;
}

interface SubjectFull {
  id: string;
  name: string;
  examType: { id: string; name: string };
  topics: TopicWithKazanim[];
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function VoiceAssessmentPage() {
  const { data: session } = useSession();
  const [step, setStep] = useState<Step>("select");
  const [subjects, setSubjects] = useState<SubjectFull[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | "all" | null>(null);
  const [knowledgeMap, setKnowledgeMap] = useState<Map<string, number>>(new Map());
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [saving, setSaving] = useState(false);
  const [correctionMode, setCorrectionMode] = useState(false);

  // Voice hook
  const voice = useContinuousVoiceInput();

  // ------ Data fetching ------

  useEffect(() => {
    fetchSubjects();
    fetchKnowledge();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/curriculum");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubjects(data.subjects || []);

      // Build subject options
      const options: SubjectOption[] = (data.subjects || []).map((s: SubjectFull) => ({
        id: s.id,
        name: s.name,
        examTypeName: s.examType.name,
        examTypeId: s.examType.id,
        topicCount: s.topics.length,
      }));
      setSubjectOptions(options);
    } catch {
      toast.error("Ders listesi yüklenemedi");
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchKnowledge = async () => {
    try {
      const res = await fetch("/api/topic-knowledge");
      if (!res.ok) return;
      const data = await res.json();
      const map = new Map<string, number>();
      for (const k of data) {
        map.set(k.topicId, k.level);
      }
      setKnowledgeMap(map);
    } catch {
      // non-critical
    }
  };

  // ------ Computed data ------

  const selectedCurriculum: CurriculumSubjectData[] = useMemo(() => {
    const filtered =
      selectedSubjectId === "all"
        ? subjects
        : subjects.filter((s) => s.id === selectedSubjectId);

    return filtered.map((s) => ({
      id: s.id,
      name: s.name,
      examTypeName: s.examType.name,
      topics: s.topics.map((t) => ({
        id: t.id,
        name: t.name,
        sortOrder: t.sortOrder,
        currentLevel: knowledgeMap.get(t.id),
        kazanimlar: t.kazanimlar || [],
      })),
    }));
  }, [subjects, selectedSubjectId, knowledgeMap]);

  const allTopicNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of subjects) {
      for (const t of s.topics) {
        map.set(t.id, `${s.name} — ${t.name}`);
      }
    }
    return map;
  }, [subjects]);

  // ------ Handlers ------

  const handleSubjectSelect = (subjectId: string | "all") => {
    setSelectedSubjectId(subjectId);
    setStep("record");
  };

  const handleRecordingComplete = async () => {
    const transcript = voice.fullTranscript.trim();
    if (!transcript) {
      toast.error("Ses kaydı boş. Lütfen konuşarak bilgi verin.");
      return;
    }

    voice.stopListening();
    setStep("processing");

    try {
      // Build curriculum payload for AI
      const curriculum = selectedCurriculum.map((s) => ({
        id: s.id,
        name: s.name,
        examTypeName: s.examTypeName,
        topics: s.topics.map((t, i) => ({
          id: t.id,
          name: t.name,
          sortOrder: i + 1,
          kazanimlar: t.kazanimlar.map((k) => ({
            id: k.id,
            code: k.code,
            description: k.description,
            isKeyKazanim: k.isKeyKazanim,
          })),
        })),
      }));

      const res = await fetch("/api/ai/voice-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, curriculum }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "İşleme hatası");
      }

      const result: AssessmentData = await res.json();
      setAssessmentData(result);
      setStep("review");
    } catch (err: any) {
      toast.error(err.message || "Değerlendirme işlenirken hata oluştu");
      setStep("record");
    }
  };

  const handleVoiceCorrection = () => {
    setCorrectionMode(true);
    voice.clearTranscript();
  };

  const handleCorrectionComplete = async () => {
    const transcript = voice.fullTranscript.trim();
    if (!transcript) {
      toast.error("Düzeltme kaydı boş");
      setCorrectionMode(false);
      return;
    }

    voice.stopListening();
    setCorrectionMode(false);
    setStep("processing");

    try {
      const res = await fetch("/api/ai/voice-correction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          currentAssessment: assessmentData,
        }),
      });

      if (!res.ok) throw new Error("Düzeltme işlenemedi");

      const result: AssessmentData = await res.json();
      setAssessmentData(result);
      setStep("review");
      toast.success("Düzeltmeler uygulandı");
    } catch (err: any) {
      toast.error(err.message || "Düzeltme işlenirken hata oluştu");
      setStep("review");
    }
  };

  const handleConfirmAndSave = async () => {
    if (!assessmentData) return;
    setSaving(true);

    try {
      const payload = {
        topics: assessmentData.topics.map((t) => ({
          topicId: t.topicId,
          suggestedLevel: t.suggestedLevel,
          kazanimlar: t.kazanimlar,
        })),
      };

      const res = await fetch("/api/voice-assessment/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Kaydetme başarısız");

      const result = await res.json();
      toast.success(
        `${result.topicKnowledgeUpdated} konu ve ${result.kazanimProgressUpdated} kazanım güncellendi`
      );
      setStep("done");
    } catch (err: any) {
      toast.error(err.message || "Kaydetme sırasında hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setStep("select");
    setSelectedSubjectId(null);
    setAssessmentData(null);
    setCorrectionMode(false);
    voice.clearTranscript();
    // Refresh knowledge data
    fetchKnowledge();
  };

  // ------ Render ------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        {step !== "select" && step !== "done" && (
          <button
            onClick={() => {
              if (step === "record") {
                voice.stopListening();
                setStep("select");
              } else if (step === "review") {
                setStep("record");
              }
            }}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gradient-candy font-display tracking-tight flex items-center gap-2">
            <Mic className="w-6 h-6" />
            Sesli Değerlendirme
          </h1>
          <p className="text-white/50 text-sm mt-0.5">
            {step === "select" && "Müfredat hakimiyetini sesli olarak değerlendir"}
            {step === "record" && "Konuları görüntülerken durumunu anlat"}
            {step === "processing" && "Değerlendirme işleniyor..."}
            {step === "review" && "Sonuçları kontrol et ve onayla"}
            {step === "done" && "Değerlendirme tamamlandı!"}
          </p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {(["select", "record", "review"] as const).map((s, i) => (
          <React.Fragment key={s}>
            <div
              className={`flex items-center gap-1.5 text-xs ${
                step === s
                  ? "text-cyan-400"
                  : step === "done" || (["select", "record", "processing", "review", "done"].indexOf(step) > ["select", "record", "processing", "review", "done"].indexOf(s))
                  ? "text-zinc-500"
                  : "text-zinc-600"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium border ${
                  step === s
                    ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                    : step === "done" || (["select", "record", "processing", "review", "done"].indexOf(step) > ["select", "record", "processing", "review", "done"].indexOf(s))
                    ? "border-zinc-600 bg-zinc-800 text-zinc-500"
                    : "border-zinc-700 text-zinc-600"
                }`}
              >
                {step === "done" || (["select", "record", "processing", "review", "done"].indexOf(step) > ["select", "record", "processing", "review", "done"].indexOf(s)) ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  i + 1
                )}
              </div>
              <span className="hidden sm:inline">
                {s === "select" && "Ders Seç"}
                {s === "record" && "Kayıt"}
                {s === "review" && "Onay"}
              </span>
            </div>
            {i < 2 && <div className="flex-1 h-px bg-zinc-700/50" />}
          </React.Fragment>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step + (correctionMode ? "-correction" : "")}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {/* Step 1: Subject Selection */}
          {step === "select" && (
            <SubjectSelector
              subjects={subjectOptions}
              onSelect={handleSubjectSelect}
              loading={loadingSubjects}
            />
          )}

          {/* Step 2: Recording */}
          {step === "record" && !correctionMode && (
            <div className="space-y-6">
              {/* Curriculum panel */}
              <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/30 p-4 max-h-[50vh] overflow-y-auto">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-zinc-500 uppercase tracking-wide">
                    Müfredat — konuları görerek anlat
                  </span>
                </div>
                <CurriculumDisplay subjects={selectedCurriculum} />
              </div>

              {/* Voice recorder */}
              <VoiceRecorder
                isListening={voice.isListening}
                isPaused={voice.isPaused}
                isSupported={voice.isSupported}
                formattedTime={voice.formattedTime}
                fullTranscript={voice.fullTranscript}
                interimText={voice.interimText}
                onStart={voice.startListening}
                onStop={handleRecordingComplete}
                onPause={voice.pauseListening}
                onResume={voice.resumeListening}
              />
            </div>
          )}

          {/* Correction mode within review */}
          {step === "review" && correctionMode && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-white">Sesle Düzeltme</h3>
                <p className="text-sm text-zinc-400">
                  Düzeltmelerini sesli olarak anlat. Örn: &quot;Türev konusunu 4 yapın&quot;,
                  &quot;Limit aslında 2 olmalı&quot;
                </p>
              </div>

              {/* Show current assessment so user can see topics while correcting */}
              {assessmentData && (
                <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/30 p-4 max-h-[40vh] overflow-y-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-zinc-500 uppercase tracking-wide">
                      Mevcut Değerlendirme — düzeltmek istediğin konuları söyle
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {assessmentData.topics.map((topic) => (
                      <div
                        key={topic.topicId}
                        className="flex items-center gap-2 text-sm text-zinc-300 px-2 py-1.5 rounded bg-zinc-800/40"
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            topic.suggestedLevel >= 4
                              ? "bg-emerald-500"
                              : topic.suggestedLevel >= 3
                              ? "bg-yellow-500"
                              : topic.suggestedLevel >= 1
                              ? "bg-orange-500"
                              : "bg-red-500"
                          }`}
                        />
                        <span className="flex-1 truncate">{topic.topicName}</span>
                        <span className="text-xs text-zinc-500 font-mono">
                          {topic.suggestedLevel}/5
                        </span>
                      </div>
                    ))}
                    {assessmentData.unmentionedTopics.length > 0 && (
                      <div className="text-xs text-zinc-600 mt-2 px-2">
                        + {assessmentData.unmentionedTopics.length} konu henüz değerlendirilmedi
                      </div>
                    )}
                  </div>
                </div>
              )}

              <VoiceRecorder
                isListening={voice.isListening}
                isPaused={voice.isPaused}
                isSupported={voice.isSupported}
                formattedTime={voice.formattedTime}
                fullTranscript={voice.fullTranscript}
                interimText={voice.interimText}
                onStart={voice.startListening}
                onStop={handleCorrectionComplete}
                onPause={voice.pauseListening}
                onResume={voice.resumeListening}
              />

              <button
                onClick={() => {
                  voice.stopListening();
                  setCorrectionMode(false);
                }}
                className="w-full py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                İptal
              </button>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
              <p className="text-sm text-zinc-400">
                Değerlendirme AI tarafından işleniyor...
              </p>
              <p className="text-xs text-zinc-600">
                Bu birkaç saniye sürebilir
              </p>
            </div>
          )}

          {/* Step 4: Review */}
          {step === "review" && !correctionMode && assessmentData && (
            <AssessmentResult
              data={assessmentData}
              onDataChange={setAssessmentData}
              onConfirm={handleConfirmAndSave}
              onVoiceCorrection={handleVoiceCorrection}
              saving={saving}
              allTopicNames={allTopicNames}
            />
          )}

          {/* Step 5: Done */}
          {step === "done" && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-medium text-white">
                Değerlendirme Kaydedildi!
              </h3>
              <p className="text-sm text-zinc-400 text-center max-w-sm">
                Konu hakimiyet seviyelerin ve kazanım ilerlemeniz güncellendi.
                Strateji sayfasından detayları görebilirsin.
              </p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg border border-zinc-600 text-zinc-300 hover:bg-zinc-800 transition-colors text-sm"
                >
                  Yeni Değerlendirme
                </button>
                <Link
                  href="/strategy"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white transition-colors text-sm"
                >
                  Strateji Sayfası
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
