"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCw,
  Loader2,
  Sparkles,
  Eye,
  MessageSquare,
  Zap,
  FileText,
  Timer,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  useParagraphReading,
  type ParagraphData,
} from "@/hooks/useParagraphReading";

const DIFFICULTY_LABELS = ["", "Çok Kolay", "Kolay", "Orta", "Zor", "Çok Zor"];
const DIFFICULTY_COLORS = [
  "",
  "text-emerald-400",
  "text-emerald-400",
  "text-amber-400",
  "text-orange-400",
  "text-red-400",
];

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return minutes > 0 ? `${minutes}dk ${secs}sn` : `${secs}sn`;
}

export default function ParagraphComprehension() {
  const pr = useParagraphReading();
  const [paragraphs, setParagraphs] = useState<ParagraphData[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState(0); // 0 = all
  const readingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [readingElapsed, setReadingElapsed] = useState(0);

  // Fetch paragraphs
  useEffect(() => {
    const fetchParagraphs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ type: "paragraph", limit: "20" });
        if (difficulty > 0) params.set("difficulty", String(difficulty));
        const res = await fetch(`/api/question-bank?${params}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setParagraphs(
          data.map((d: any) => ({
            id: d.id,
            title: d.title,
            content: d.content,
            difficulty: d.difficulty,
            questions: d.questions.map((q: any) => ({
              id: q.id,
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
            })),
          }))
        );
      } catch {
        toast.error("Paragraflar yüklenirken hata oluştu");
      } finally {
        setLoading(false);
      }
    };
    fetchParagraphs();
  }, [difficulty]);

  // Reading timer
  useEffect(() => {
    if (pr.phase === "reading") {
      setReadingElapsed(0);
      readingTimerRef.current = setInterval(() => {
        setReadingElapsed(Date.now() - pr.readingStartTime);
      }, 100);
    } else {
      if (readingTimerRef.current) {
        clearInterval(readingTimerRef.current);
        readingTimerRef.current = null;
      }
    }
    return () => {
      if (readingTimerRef.current) clearInterval(readingTimerRef.current);
    };
  }, [pr.phase, pr.readingStartTime]);

  const startParagraph = (p: ParagraphData) => {
    pr.startReading(p);
  };

  const OPTION_LABELS = ["A", "B", "C", "D"];

  // ─── SETUP PHASE ───────────────────────────────

  if (pr.phase === "setup") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="text-purple-400" size={22} />
              Paragraf Anlama
            </h2>
            <p className="text-white/40 text-sm mt-1">
              Paragrafı oku, soruları cevapla, okuma hızını ölç
            </p>
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="flex gap-2">
          {[
            { v: 0, label: "Tümü" },
            { v: 1, label: "1" },
            { v: 2, label: "2" },
            { v: 3, label: "3" },
            { v: 4, label: "4" },
            { v: 5, label: "5" },
          ].map((d) => (
            <button
              key={d.v}
              onClick={() => setDifficulty(d.v)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                difficulty === d.v
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "bg-white/[0.03] text-white/40 border border-white/5 hover:bg-white/[0.06]"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Paragraph List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-purple-500" size={40} />
          </div>
        ) : paragraphs.length === 0 ? (
          <div className="glass-panel text-center py-20 flex flex-col items-center justify-center">
            <FileText className="text-purple-400/30 mb-4" size={56} />
            <h2 className="text-xl font-bold text-white/60">
              Henüz paragraf eklenmemiş
            </h2>
            <p className="text-sm text-white/40 mt-2">
              Admin panelinden paragraf ve soru ekleyin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paragraphs.map((p, i) => (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => startParagraph(p)}
                className="glass-panel p-5 text-left hover:border-purple-500/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white font-bold text-[15px] truncate flex-1">
                    {p.title || `Paragraf ${i + 1}`}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ${
                      DIFFICULTY_COLORS[p.difficulty]
                    }`}
                  >
                    Zorluk {p.difficulty}
                  </span>
                </div>
                <p className="text-white/40 text-sm line-clamp-3 mb-3">
                  {p.content}
                </p>
                <div className="flex items-center gap-4 text-xs text-white/30">
                  <span className="flex items-center gap-1">
                    <FileText size={12} />
                    {p.content.split(/\s+/).filter(Boolean).length} kelime
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare size={12} />
                    {p.questions.length} soru
                  </span>
                </div>
                <div className="mt-3 flex justify-end">
                  <span className="text-xs text-purple-400 group-hover:text-purple-300 font-medium flex items-center gap-1 transition-colors">
                    Başla <ChevronRight size={14} />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── READING PHASE ──────────────────────────────

  if (pr.phase === "reading" && pr.paragraph) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Timer Header */}
        <div className="flex items-center justify-between glass-panel p-4">
          <div className="flex items-center gap-3">
            <Eye className="text-purple-400" size={20} />
            <div>
              <h3 className="text-white font-bold text-sm">
                {pr.paragraph.title || "Paragraf Okuma"}
              </h3>
              <span className="text-white/30 text-xs">
                Dikkatlice oku, bitince devam et
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <Timer size={16} className="text-purple-400" />
            <span className="text-lg font-mono font-bold">
              {formatTime(readingElapsed)}
            </span>
          </div>
        </div>

        {/* Paragraph Content */}
        <div className="glass-panel p-6 sm:p-8">
          <p className="text-white/90 text-[15px] leading-relaxed whitespace-pre-wrap">
            {pr.paragraph.content}
          </p>
        </div>

        {/* Finish Reading Button */}
        <div className="flex justify-center">
          <button
            onClick={pr.finishReading}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all text-lg"
          >
            Okudum, Sorulara Geç
            <ChevronRight size={20} />
          </button>
        </div>
      </motion.div>
    );
  }

  // ─── QUESTIONS PHASE ────────────────────────────

  if (pr.phase === "questions" && pr.paragraph) {
    const question = pr.paragraph.questions[pr.currentQuestionIndex];
    const isAnswered = pr.selectedAnswer !== null;

    return (
      <motion.div
        key={`q-${pr.currentQuestionIndex}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        {/* Progress Header */}
        <div className="glass-panel p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="text-purple-400" size={20} />
            <span className="text-white font-bold text-sm">
              Soru {pr.currentQuestionIndex + 1} / {pr.paragraph.questions.length}
            </span>
          </div>
          <div className="text-xs text-white/40">
            Okuma: {formatTime(pr.readingTimeMs)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/[0.05] rounded-full h-1.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
            style={{
              width: `${
                ((pr.currentQuestionIndex + (isAnswered ? 1 : 0)) /
                  pr.paragraph.questions.length) *
                100
              }%`,
            }}
          />
        </div>

        {/* Question */}
        <div className="glass-panel p-6">
          <h3 className="text-white font-bold text-lg mb-6">{question.question}</h3>

          <div className="space-y-3">
            {question.options.map((opt: string, oi: number) => {
              const isSelected = pr.selectedAnswer === oi;
              const isCorrect = pr.showExplanation && oi === question.correctAnswer;
              const isWrong = pr.showExplanation && isSelected && oi !== question.correctAnswer;

              return (
                <button
                  key={oi}
                  onClick={() => !pr.showExplanation && pr.selectAnswer(oi)}
                  disabled={pr.showExplanation}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                    isCorrect
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                      : isWrong
                      ? "bg-red-500/10 border-red-500/40 text-red-300"
                      : isSelected
                      ? "bg-purple-500/10 border-purple-500/40 text-white"
                      : "bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/[0.05] hover:border-purple-500/20"
                  }`}
                >
                  <span
                    className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg text-xs font-bold ${
                      isCorrect
                        ? "bg-emerald-500/20 text-emerald-400"
                        : isWrong
                        ? "bg-red-500/20 text-red-400"
                        : isSelected
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-white/5 text-white/30"
                    }`}
                  >
                    {OPTION_LABELS[oi]}
                  </span>
                  <span className="text-sm font-medium">{opt}</span>
                  {isCorrect && <CheckCircle2 size={18} className="ml-auto text-emerald-400" />}
                  {isWrong && <XCircle size={18} className="ml-auto text-red-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {pr.showExplanation && question.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel border-purple-500/20 bg-purple-500/5 p-5"
            >
              <h4 className="text-purple-400 font-bold text-sm mb-2 flex items-center gap-2">
                <Sparkles size={14} />
                Açıklama
              </h4>
              <p className="text-white/70 text-sm leading-relaxed">
                {question.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button */}
        <div className="flex justify-center">
          {pr.showExplanation ? (
            <button
              onClick={pr.nextAfterExplanation}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
            >
              {pr.currentQuestionIndex + 1 < pr.paragraph.questions.length
                ? "Sonraki Soru"
                : "Sonuçları Gör"}
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={pr.confirmAnswer}
              disabled={pr.selectedAnswer === null}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Cevabı Onayla
              <CheckCircle2 size={18} />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // ─── RESULTS PHASE ──────────────────────────────

  if (pr.phase === "results" && pr.paragraph) {
    const accuracy = pr.totalQuestions > 0
      ? Math.round((pr.correctCount / pr.totalQuestions) * 100)
      : 0;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        {/* Results Header */}
        <div className="glass-panel p-8 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
          <Sparkles className="text-purple-400 mx-auto mb-4" size={40} />
          <h2 className="text-3xl font-bold text-white mb-2">Sonuçlar</h2>
          <p className="text-white/50">
            {pr.paragraph.title || "Paragraf Anlama Testi"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass hover-lift p-5 flex flex-col items-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-[30px] group-hover:bg-emerald-500/20 transition-all opacity-50" />
            <CheckCircle2 className="text-emerald-400 mb-2" size={24} />
            <span className="text-3xl font-bold text-white tracking-tighter">
              {pr.correctCount}/{pr.totalQuestions}
            </span>
            <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-1">
              Doğru
            </span>
          </div>
          <div className="glass hover-lift p-5 flex flex-col items-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-[30px] group-hover:bg-purple-500/20 transition-all opacity-50" />
            <Zap className="text-purple-400 mb-2" size={24} />
            <span className="text-3xl font-bold text-white tracking-tighter">
              %{accuracy}
            </span>
            <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-1">
              Başarı
            </span>
          </div>
          <div className="glass hover-lift p-5 flex flex-col items-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-[30px] group-hover:bg-cyan-500/20 transition-all opacity-50" />
            <Eye className="text-cyan-400 mb-2" size={24} />
            <span className="text-3xl font-bold text-white tracking-tighter">
              {pr.wordsPerMinute}
            </span>
            <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-1">
              Kelime/dk
            </span>
          </div>
          <div className="glass hover-lift p-5 flex flex-col items-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-[30px] group-hover:bg-amber-500/20 transition-all opacity-50" />
            <Clock className="text-amber-400 mb-2" size={24} />
            <span className="text-3xl font-bold text-white tracking-tighter">
              {formatTime(pr.readingTimeMs)}
            </span>
            <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-1">
              Okuma Süresi
            </span>
          </div>
        </div>

        {/* Answer Review */}
        <div className="glass-panel p-6">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <MessageSquare size={16} className="text-purple-400" />
            Cevap Detayları
          </h3>
          <div className="space-y-3">
            {pr.answers.map((answer, i) => {
              const question = pr.paragraph!.questions[i];
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    answer.correct
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-red-500/5 border-red-500/20"
                  }`}
                >
                  {answer.correct ? (
                    <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle size={18} className="text-red-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-white/80 text-sm truncate block">
                      {question.question}
                    </span>
                    {!answer.correct && (
                      <span className="text-xs text-white/40">
                        Doğru: {OPTION_LABELS[question.correctAnswer]}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-white/30">
                    {formatTime(answer.timeSpent)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={pr.reset}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 font-medium hover:bg-white/10 transition-all"
          >
            <RotateCw size={16} />
            Başka Paragraf
          </button>
        </div>
      </motion.div>
    );
  }

  return null;
}
