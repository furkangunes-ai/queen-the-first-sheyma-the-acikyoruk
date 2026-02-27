"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  BookOpen,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface QuestionInput {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const EMPTY_QUESTION: QuestionInput = {
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  explanation: "",
};

const DIFFICULTY_LABELS = ["", "Çok Kolay", "Kolay", "Orta", "Zor", "Çok Zor"];
const TYPE_OPTIONS = [
  { value: "paragraph", label: "Paragraf Anlama" },
  { value: "vocabulary", label: "Kelime Bilgisi" },
];

export default function QuestionUpload() {
  const [type, setType] = useState("paragraph");
  const [difficulty, setDifficulty] = useState(3);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [questions, setQuestions] = useState<QuestionInput[]>([{ ...EMPTY_QUESTION }]);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { ...EMPTY_QUESTION, options: ["", "", "", ""] }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuestionInput, value: any) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleSave = async () => {
    // Validate
    if (!content.trim()) {
      toast.error("Paragraf metni zorunludur");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`Soru ${i + 1}: Soru metni boş`);
        return;
      }
      const filledOptions = q.options.filter((o) => o.trim());
      if (filledOptions.length < 2) {
        toast.error(`Soru ${i + 1}: En az 2 şık gerekli`);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        type,
        difficulty,
        title: title.trim() || undefined,
        content: content.trim(),
        questions: questions.map((q) => ({
          question: q.question.trim(),
          options: q.options.filter((o) => o.trim()),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation.trim() || undefined,
        })),
      };

      const res = await fetch("/api/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Kayıt başarısız");
      }

      toast.success("Soru seti başarıyla kaydedildi!");

      // Reset form
      setTitle("");
      setContent("");
      setQuestions([{ ...EMPTY_QUESTION, options: ["", "", "", ""] }]);
    } catch (error: any) {
      toast.error(error.message || "Kayıt sırasında hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const OPTION_LABELS = ["A", "B", "C", "D"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gradient-candy flex items-center gap-2">
          <FileText size={24} />
          Soru Yükleme
        </h2>
        <p className="text-white/50 mt-1 text-sm">
          Paragraf veya kelime soruları oluşturun
        </p>
      </div>

      {/* Type & Difficulty */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 block">
            Tür
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-pink-500/30"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 block">
            Zorluk
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  difficulty === d
                    ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                    : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-white/30 mt-1 block">
            {DIFFICULTY_LABELS[difficulty]}
          </span>
        </div>
        <div>
          <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 block">
            Başlık (Opsiyonel)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Paragraf başlığı..."
            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-pink-500/30"
          />
        </div>
      </div>

      {/* Paragraph Content */}
      <div>
        <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 block">
          Paragraf Metni
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="Paragraf metnini buraya yapıştırın..."
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-pink-500/30 resize-y"
        />
        <span className="text-[10px] text-white/30 mt-1 block">
          {content.split(/\s+/).filter(Boolean).length} kelime
        </span>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-[15px] flex items-center gap-2">
            <BookOpen size={16} className="text-cyan-400" />
            Sorular ({questions.length})
          </h3>
          <button
            onClick={addQuestion}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs hover:bg-white/10 hover:text-white/80 transition-all"
          >
            <Plus size={12} />
            Soru Ekle
          </button>
        </div>

        {questions.map((q, qi) => (
          <motion.div
            key={qi}
            layout
            className="glass-panel p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 font-bold uppercase tracking-widest">
                Soru {qi + 1}
              </span>
              {questions.length > 1 && (
                <button
                  onClick={() => removeQuestion(qi)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* Question text */}
            <textarea
              value={q.question}
              onChange={(e) => updateQuestion(qi, "question", e.target.value)}
              rows={2}
              placeholder="Soru metni..."
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-pink-500/30 resize-y"
            />

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuestion(qi, "correctAnswer", oi)}
                    className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                      q.correctAnswer === oi
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-white/5 text-white/30 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {OPTION_LABELS[oi]}
                  </button>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    placeholder={`${OPTION_LABELS[oi]} seçeneği...`}
                    className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-pink-500/30"
                  />
                </div>
              ))}
            </div>

            {/* Explanation */}
            <input
              type="text"
              value={q.explanation}
              onChange={(e) => updateQuestion(qi, "explanation", e.target.value)}
              placeholder="Açıklama (opsiyonel)..."
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-pink-500/30"
            />
          </motion.div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Kaydet
        </button>
      </div>
    </div>
  );
}
