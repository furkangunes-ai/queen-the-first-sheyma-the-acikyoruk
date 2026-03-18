"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { clsx } from "clsx";
import {
  Play, Loader2, CheckCircle2, XCircle, MinusCircle,
  ArrowRight, RotateCcw, Clock, Target, BookOpen, ChevronDown,
  Trophy, Zap, AlertTriangle,
} from "lucide-react";
import { filterSubjectsByTrack, type ExamTrack } from "@/lib/exam-track-filter";

// ---------- types ----------

interface Subject {
  id: string;
  name: string;
  examType: { name: string; slug: string };
  topics: { id: string; name: string }[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  difficulty: number;
  subject: { id: string; name: string } | null;
  topic: { id: string; name: string } | null;
}

interface QuizResult {
  questionId: string;
  question: string;
  options: string[];
  selectedAnswer: number | null;
  correctAnswer: number;
  explanation: string | null;
  status: "correct" | "wrong" | "empty";
}

interface QuizSummary {
  total: number;
  correct: number;
  wrong: number;
  empty: number;
  net: number;
  successRate: number;
}

type Phase = "setup" | "quiz" | "result";

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

// ---------- component ----------

export default function QuizPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const examTrack = (session?.user as any)?.examTrack as ExamTrack | undefined;

  // Setup state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(searchParams.get("subjectId") || "");
  const [selectedTopicId, setSelectedTopicId] = useState(searchParams.get("topicId") || "");
  const [questionCount, setQuestionCount] = useState(10);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Quiz state
  const [phase, setPhase] = useState<Phase>("setup");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number | null>>(new Map());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Timer
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Result state
  const [results, setResults] = useState<QuizResult[]>([]);
  const [summary, setSummary] = useState<QuizSummary | null>(null);
  const [showExplanation, setShowExplanation] = useState<string | null>(null);

  const topics = subjects.find((s) => s.id === selectedSubjectId)?.topics || [];
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers.get(currentQuestion.id) : undefined;

  // ---------- fetch subjects ----------

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/curriculum");
        if (!res.ok) throw new Error();
        const data = await res.json();
        const allSubjects: Subject[] = [];
        data.forEach((et: any) => {
          et.subjects?.forEach((s: any) => {
            allSubjects.push({ ...s, examType: { name: et.name, slug: et.slug } });
          });
        });
        const filtered = examTrack ? filterSubjectsByTrack(allSubjects as any, examTrack) : allSubjects;
        setSubjects(filtered as Subject[]);
      } catch {
        toast.error("Müfredat yüklenemedi");
      } finally {
        setLoadingSubjects(false);
      }
    })();
  }, [examTrack]);

  // Timer tick
  useEffect(() => {
    if (phase === "quiz") {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, startTime]);

  // ---------- start quiz ----------

  const startQuiz = async () => {
    if (!selectedSubjectId && !selectedTopicId) {
      toast.error("Ders veya konu seçmelisin");
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedTopicId) params.set("topicId", selectedTopicId);
      else params.set("subjectId", selectedSubjectId);
      params.set("count", String(questionCount));

      const res = await fetch(`/api/quiz?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();

      if (!data.questions || data.questions.length === 0) {
        toast.error("Bu konu için henüz soru yok");
        return;
      }

      setQuestions(data.questions);
      setCurrentIndex(0);
      setAnswers(new Map());
      setStartTime(Date.now());
      setElapsed(0);
      setPhase("quiz");
    } catch {
      toast.error("Sorular yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  // ---------- answer / navigate ----------

  const selectAnswer = (optionIndex: number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => {
      const next = new Map(prev);
      // Toggle: same answer clicked again → deselect (empty)
      if (next.get(currentQuestion.id) === optionIndex) {
        next.delete(currentQuestion.id);
      } else {
        next.set(currentQuestion.id, optionIndex);
      }
      return next;
    });
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  // ---------- submit ----------

  const submitQuiz = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);

    const answerPayload = questions.map((q) => ({
      questionId: q.id,
      selectedAnswer: answers.has(q.id) ? answers.get(q.id) : -1,
    }));

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answerPayload,
          topicId: selectedTopicId || null,
          subjectId: selectedSubjectId || null,
          durationSeconds: elapsed,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResults(data.results);
      setSummary(data.summary);
      setPhase("result");
    } catch {
      toast.error("Sonuçlar gönderilemedi");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- reset ----------

  const resetQuiz = () => {
    setPhase("setup");
    setQuestions([]);
    setResults([]);
    setSummary(null);
    setCurrentIndex(0);
    setAnswers(new Map());
    setShowExplanation(null);
  };

  // ---------- format time ----------

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ---------- render ----------

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">

        {/* ====== SETUP PHASE ====== */}
        {phase === "setup" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="text-center mb-4">
              <h1 className="text-2xl lg:text-3xl font-black text-white/90 mb-2">Soru Çöz</h1>
              <p className="text-white/40 text-sm">Konu seç, soru sayısını belirle, başla.</p>
            </div>

            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10">
              {loadingSubjects ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {/* Subject */}
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5 font-medium">Ders</label>
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => { setSelectedSubjectId(e.target.value); setSelectedTopicId(""); }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 text-sm focus:border-pink-500/30 outline-none"
                    >
                      <option value="">Ders seç...</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.examType.name} — {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Topic */}
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5 font-medium">Konu (opsiyonel)</label>
                    <select
                      value={selectedTopicId}
                      onChange={(e) => setSelectedTopicId(e.target.value)}
                      disabled={!selectedSubjectId}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 text-sm focus:border-pink-500/30 outline-none disabled:opacity-40"
                    >
                      <option value="">Tüm konular (karışık)</option>
                      {topics.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Count */}
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5 font-medium">Soru Sayısı</label>
                    <div className="flex gap-2">
                      {[5, 10, 15, 20].map((n) => (
                        <button
                          key={n}
                          onClick={() => setQuestionCount(n)}
                          className={clsx(
                            "flex-1 py-3 rounded-xl text-sm font-bold border transition-all",
                            questionCount === n
                              ? "bg-gradient-to-r from-pink-500/20 to-cyan-500/20 text-white border-pink-500/20"
                              : "bg-white/[0.03] text-white/50 border-white/5 hover:bg-white/[0.06]"
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Start Button */}
                  <button
                    onClick={startQuiz}
                    disabled={loading || (!selectedSubjectId && !selectedTopicId)}
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500/20 to-cyan-500/20 text-white font-black text-lg border border-pink-500/20 hover:border-pink-400/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} />}
                    {loading ? "Yükleniyor..." : "Başla"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ====== QUIZ PHASE ====== */}
        {phase === "quiz" && currentQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4"
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between glass-panel px-4 py-3 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white/70">
                  {currentIndex + 1} / {questions.length}
                </span>
                {currentQuestion.topic && (
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-[10px] font-bold">
                    {currentQuestion.topic.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Clock size={14} />
                <span className="font-mono">{formatTime(elapsed)}</span>
              </div>
            </div>

            {/* Question Dots */}
            <div className="flex gap-1.5 flex-wrap px-1">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={clsx(
                    "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                    i === currentIndex
                      ? "bg-gradient-to-r from-pink-500/30 to-cyan-500/30 text-white border border-pink-500/30"
                      : answers.has(q.id)
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        : "bg-white/[0.03] text-white/30 border border-white/5"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
                className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10"
              >
                <p className="text-base sm:text-lg text-white/90 font-medium leading-relaxed mb-6 whitespace-pre-wrap">
                  {currentQuestion.question}
                </p>

                <div className="flex flex-col gap-2.5">
                  {currentQuestion.options.map((opt: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => selectAnswer(i)}
                      className={clsx(
                        "flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-xl border transition-all",
                        currentAnswer === i
                          ? "bg-gradient-to-r from-pink-500/15 to-cyan-500/15 border-pink-500/30 text-white"
                          : "bg-white/[0.03] border-white/5 text-white/70 hover:bg-white/[0.06] hover:text-white/90"
                      )}
                    >
                      <span
                        className={clsx(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0",
                          currentAnswer === i
                            ? "bg-pink-500/20 text-pink-300"
                            : "bg-white/5 text-white/40"
                        )}
                      >
                        {OPTION_LABELS[i]}
                      </span>
                      <span className="text-sm">{opt}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="px-5 py-3 rounded-xl bg-white/[0.03] text-white/50 text-sm font-bold border border-white/5 hover:bg-white/[0.06] disabled:opacity-30 transition-all"
              >
                Önceki
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={submitQuiz}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 font-black text-sm border border-emerald-500/20 hover:border-emerald-400/40 transition-all disabled:opacity-40"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Target size={16} />}
                  {submitting ? "Gönderiliyor..." : "Bitir"}
                </button>
              ) : (
                <button
                  onClick={goNext}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500/10 to-cyan-500/10 text-white/80 font-bold text-sm border border-white/10 hover:border-pink-500/20 transition-all"
                >
                  Sonraki
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ====== RESULT PHASE ====== */}
        {phase === "result" && summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Summary Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-2xl font-black text-white/90 mb-1">Sonuçlar</h2>
              <p className="text-white/40 text-sm mb-6">
                {formatTime(elapsed)} sürdü
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                  <div className="text-2xl font-black text-emerald-400">{summary.correct}</div>
                  <div className="text-xs text-white/40">Doğru</div>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                  <div className="text-2xl font-black text-red-400">{summary.wrong}</div>
                  <div className="text-xs text-white/40">Yanlış</div>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                  <div className="text-2xl font-black text-white/30">{summary.empty}</div>
                  <div className="text-xs text-white/40">Boş</div>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                  <div className="text-2xl font-black text-cyan-400">{summary.net.toFixed(2)}</div>
                  <div className="text-xs text-white/40">Net</div>
                </div>
              </div>

              {/* Success bar */}
              <div className="w-full bg-white/5 rounded-full h-3 mb-2">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-pink-500 to-cyan-500 transition-all"
                  style={{ width: `${summary.successRate}%` }}
                />
              </div>
              <p className="text-sm text-white/50">%{summary.successRate} başarı</p>
            </div>

            {/* Question Review */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10">
              <h3 className="text-lg font-bold text-white/80 mb-4">Soru Detayları</h3>
              <div className="flex flex-col gap-3">
                {results.map((r, i) => (
                  <div key={r.questionId} className="bg-white/[0.03] rounded-xl border border-white/5 overflow-hidden">
                    <button
                      onClick={() => setShowExplanation(showExplanation === r.questionId ? null : r.questionId)}
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      <span className="flex-shrink-0">
                        {r.status === "correct" && <CheckCircle2 size={18} className="text-emerald-400" />}
                        {r.status === "wrong" && <XCircle size={18} className="text-red-400" />}
                        {r.status === "empty" && <MinusCircle size={18} className="text-white/30" />}
                      </span>
                      <span className="flex-1 text-sm text-white/70 truncate">
                        <span className="text-white/40 mr-2">{i + 1}.</span>
                        {r.question}
                      </span>
                      <ChevronDown
                        size={14}
                        className={clsx(
                          "text-white/30 transition-transform",
                          showExplanation === r.questionId && "rotate-180"
                        )}
                      />
                    </button>

                    <AnimatePresence>
                      {showExplanation === r.questionId && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-2">
                            {r.options?.map((opt: string, oi: number) => (
                              <div
                                key={oi}
                                className={clsx(
                                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs",
                                  oi === r.correctAnswer && "bg-emerald-500/10 text-emerald-400",
                                  oi === r.selectedAnswer && oi !== r.correctAnswer && "bg-red-500/10 text-red-400",
                                  oi !== r.correctAnswer && oi !== r.selectedAnswer && "text-white/40"
                                )}
                              >
                                <span className="font-bold w-5">{OPTION_LABELS[oi]}</span>
                                <span>{opt}</span>
                                {oi === r.correctAnswer && <CheckCircle2 size={12} className="ml-auto" />}
                                {oi === r.selectedAnswer && oi !== r.correctAnswer && <XCircle size={12} className="ml-auto" />}
                              </div>
                            ))}
                            {r.explanation && (
                              <div className="mt-2 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10 text-xs text-cyan-300/80">
                                <strong>Açıklama:</strong> {r.explanation}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={resetQuiz}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.03] text-white/60 font-bold text-sm border border-white/5 hover:bg-white/[0.06] transition-all"
              >
                <RotateCcw size={14} />
                Yeni Quiz
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
