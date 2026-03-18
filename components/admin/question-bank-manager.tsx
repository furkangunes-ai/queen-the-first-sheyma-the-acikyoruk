"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Upload, Trash2, Loader2, ChevronDown, ChevronUp, FileJson,
  CheckCircle2, AlertTriangle, BookOpen, HelpCircle,
} from "lucide-react";

// ---------- types ----------

interface Subject {
  id: string;
  name: string;
  examType: { name: string; slug: string };
  topics: { id: string; name: string }[];
}

interface QuestionBankEntry {
  id: string;
  title: string | null;
  type: string;
  difficulty: number;
  subject: { id: string; name: string } | null;
  topic: { id: string; name: string } | null;
  _count: { questions: number };
  createdAt: string;
}

// ---------- sample JSON for help ----------

const SAMPLE_JSON = `{
  "title": "Türev Soruları - Set 1",
  "difficulty": 3,
  "questions": [
    {
      "question": "f(x) = x² + 3x fonksiyonunun türevi nedir?",
      "options": ["2x + 3", "x² + 3", "2x", "3x + 2", "x + 3"],
      "correctAnswer": 0,
      "explanation": "Kuvvet kuralı: f'(x) = 2x + 3"
    },
    {
      "question": "d/dx [sin(x)] = ?",
      "options": ["-cos(x)", "cos(x)", "sin(x)", "-sin(x)", "tan(x)"],
      "correctAnswer": 1,
      "explanation": "Sinüsün türevi kosinüstür."
    }
  ]
}`;

// ---------- component ----------

export default function QuestionBankManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [banks, setBanks] = useState<QuestionBankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  // Form state
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [expandedBank, setExpandedBank] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<any[]>([]);
  const [expandLoading, setExpandLoading] = useState(false);

  // Filter state
  const [filterSubjectId, setFilterSubjectId] = useState("");

  const topics = subjects.find((s) => s.id === selectedSubjectId)?.topics || [];

  // ---------- fetch ----------

  const fetchSubjects = useCallback(async () => {
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
      setSubjects(allSubjects);
    } catch {
      toast.error("Müfredat yüklenemedi");
    }
  }, []);

  const fetchBanks = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterSubjectId) params.set("subjectId", filterSubjectId);
      const res = await fetch(`/api/admin/question-bank?${params}`);
      if (!res.ok) throw new Error();
      setBanks(await res.json());
    } catch {
      toast.error("Soru bankaları yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [filterSubjectId]);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);
  useEffect(() => { fetchBanks(); }, [fetchBanks]);

  // ---------- import ----------

  const handleImport = async () => {
    if (!selectedSubjectId) {
      toast.error("Ders seçimi zorunlu");
      return;
    }
    if (!jsonInput.trim()) {
      toast.error("JSON alanı boş");
      return;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      toast.error("Geçersiz JSON formatı");
      return;
    }

    // Support both { questions: [...] } and direct [...]
    const questions = Array.isArray(parsed) ? parsed : parsed.questions;
    const title = parsed.title || null;
    const difficulty = parsed.difficulty || 3;

    if (!Array.isArray(questions) || questions.length === 0) {
      toast.error("Soru bulunamadı. 'questions' dizisi olmalı.");
      return;
    }

    setImporting(true);
    try {
      const res = await fetch("/api/admin/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subjectId: selectedSubjectId,
          topicId: selectedTopicId || null,
          difficulty,
          questions,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.details) {
          toast.error(data.details.slice(0, 3).join("\n"), { duration: 6000 });
        } else {
          toast.error(data.error || "İçe aktarma başarısız");
        }
        return;
      }
      toast.success(`${questions.length} soru başarıyla eklendi!`);
      setJsonInput("");
      fetchBanks();
    } catch {
      toast.error("Sunucu hatası");
    } finally {
      setImporting(false);
    }
  };

  // ---------- delete ----------

  const handleDelete = async (id: string) => {
    if (!confirm("Bu soru setini silmek istediğine emin misin?")) return;
    try {
      const res = await fetch(`/api/admin/question-bank?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Set silindi");
      setBanks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      toast.error("Silinemedi");
    }
  };

  // ---------- expand to view questions ----------

  const handleExpand = async (bankId: string) => {
    if (expandedBank === bankId) {
      setExpandedBank(null);
      return;
    }
    setExpandedBank(bankId);
    setExpandLoading(true);
    try {
      // Fetch questions for this bank via a detail query
      const res = await fetch(`/api/admin/question-bank?id=${bankId}`);
      // We'll reuse the list endpoint; questions are not included there, so let's fetch items directly
      // Actually, we should add a detail endpoint. For now, use Prisma indirectly — just show count.
      // For simplicity, we'll show expanded info from what we have.
      setExpandedQuestions([]);
    } catch {
      // ignore
    } finally {
      setExpandLoading(false);
    }
  };

  // ---------- render ----------

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="flex flex-col gap-8 relative z-10">
      {/* Import Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(255,42,133,0.05)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white/90">Toplu Soru Yükle</h3>
              <p className="text-xs text-white/40">JSON formatında soru ekle</p>
            </div>
          </div>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white/80 text-xs border border-white/5 transition-colors"
          >
            <HelpCircle size={14} />
            {showHelp ? "Gizle" : "Örnek JSON"}
          </button>
        </div>

        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <pre className="bg-black/40 rounded-xl p-4 text-xs text-emerald-300/80 font-mono overflow-x-auto border border-white/5">
                {SAMPLE_JSON}
              </pre>
              <p className="text-xs text-white/40 mt-2">
                <strong>correctAnswer:</strong> 0 = A, 1 = B, 2 = C, 3 = D, 4 = E &nbsp;|&nbsp;
                <strong>options:</strong> 4 veya 5 şık &nbsp;|&nbsp;
                <strong>explanation:</strong> opsiyonel
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subject / Topic Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5 font-medium">Ders *</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => { setSelectedSubjectId(e.target.value); setSelectedTopicId(""); }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 text-sm focus:border-pink-500/30 focus:ring-1 focus:ring-pink-500/20 outline-none transition-colors"
            >
              <option value="">Ders seç...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.examType.name} — {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5 font-medium">Konu (opsiyonel)</label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              disabled={!selectedSubjectId}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 text-sm focus:border-pink-500/30 focus:ring-1 focus:ring-pink-500/20 outline-none transition-colors disabled:opacity-40"
            >
              <option value="">Tüm konular</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* JSON Input */}
        <div className="mb-4">
          <label className="block text-sm text-white/60 mb-1.5 font-medium">
            JSON <span className="text-white/30">({jsonInput ? "hazır" : "yapıştır"})</span>
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={12}
            placeholder='{"questions": [{"question": "...", "options": ["A","B","C","D","E"], "correctAnswer": 0}]}'
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-emerald-300/80 font-mono focus:border-pink-500/30 focus:ring-1 focus:ring-pink-500/20 outline-none transition-colors resize-y placeholder:text-white/20"
          />
        </div>

        {/* Preview count */}
        {jsonInput.trim() && (() => {
          try {
            const parsed = JSON.parse(jsonInput);
            const qs = Array.isArray(parsed) ? parsed : parsed.questions;
            if (Array.isArray(qs)) {
              return (
                <p className="text-sm text-emerald-400/80 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  {qs.length} soru algılandı
                  {parsed.title && <span className="text-white/40">— {parsed.title}</span>}
                </p>
              );
            }
          } catch {
            return (
              <p className="text-sm text-red-400/80 mb-4 flex items-center gap-2">
                <AlertTriangle size={14} />
                Geçersiz JSON
              </p>
            );
          }
          return null;
        })()}

        {/* Import Button */}
        <button
          onClick={handleImport}
          disabled={importing || !selectedSubjectId || !jsonInput.trim()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 font-bold text-sm border border-emerald-500/20 hover:border-emerald-400/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {importing ? <Loader2 size={16} className="animate-spin" /> : <FileJson size={16} />}
          {importing ? "Yükleniyor..." : "Soruları İçe Aktar"}
        </button>
      </div>

      {/* Existing Banks List */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(255,42,133,0.05)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white/90">Soru Setleri</h3>
              <p className="text-xs text-white/40">{banks.length} set, {banks.reduce((s, b) => s + b._count.questions, 0)} soru</p>
            </div>
          </div>

          {/* Filter */}
          <select
            value={filterSubjectId}
            onChange={(e) => { setFilterSubjectId(e.target.value); setLoading(true); }}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/70 text-xs outline-none"
          >
            <option value="">Tüm Dersler</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.examType.name} — {s.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
          </div>
        ) : banks.length === 0 ? (
          <p className="text-center text-white/30 py-8">Henüz soru seti yok</p>
        ) : (
          <div className="space-y-3">
            {banks.map((bank) => (
              <motion.div
                key={bank.id}
                layout
                className="bg-white/[0.03] rounded-xl border border-white/5 overflow-hidden"
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white/80 truncate">
                        {bank.title || "İsimsiz Set"}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                        {bank._count.questions} soru
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-bold">
                        Zorluk: {bank.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                      {bank.subject && <span>{bank.subject.name}</span>}
                      {bank.topic && <span>→ {bank.topic.name}</span>}
                      <span>•</span>
                      <span>{new Date(bank.createdAt).toLocaleDateString("tr-TR")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <button
                      onClick={() => handleDelete(bank.id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
