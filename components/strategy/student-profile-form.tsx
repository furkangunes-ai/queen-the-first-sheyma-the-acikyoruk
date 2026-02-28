"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { User, Clock, Calendar, Target, Loader2, Check } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StudentProfileData {
  dailyStudyHours: number | null;
  availableDays: number[];
  studyRegularity: string | null;
  breakPreference: string | null;
  examDate: string | null;
  targetRank: number | null;
  examTrack: string | null; // "sayisal" | "ea" | "sozel"
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAY_LABELS = ["Pzt", "Sal", "\u00c7ar", "Per", "Cum", "Cmt", "Paz"];

const BREAK_OPTIONS = [
  { value: "25_5", label: "25/5 Pomodoro" },
  { value: "45_15", label: "45/15" },
  { value: "60_15", label: "60/15" },
];

const REGULARITY_OPTIONS = [
  { value: "duzenli", label: "Düzenli" },
  { value: "duzensiz", label: "Düzensiz" },
];

const EXAM_TRACK_OPTIONS = [
  { value: "sayisal", label: "Sayısal", desc: "TYT + AYT (Mat, Fiz, Kim, Bio)" },
  { value: "ea", label: "Eşit Ağırlık", desc: "TYT + AYT (Mat, Edebiyat, Tarih, Coğ)" },
  { value: "sozel", label: "Sözel", desc: "TYT + AYT (Edebiyat, Tarih, Coğ, Felsefe grubu)" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseInitialData(data: StudentProfileData | null | undefined): StudentProfileData {
  return {
    dailyStudyHours: data?.dailyStudyHours ?? null,
    availableDays: Array.isArray(data?.availableDays) ? data.availableDays : [],
    studyRegularity: data?.studyRegularity ?? null,
    breakPreference: data?.breakPreference ?? null,
    examDate: data?.examDate ?? null,
    targetRank: data?.targetRank ?? null,
    examTrack: data?.examTrack ?? null,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function StudentProfileForm({
  initialData,
  onSave,
  onSkip,
}: {
  initialData?: StudentProfileData | null;
  onSave: (data: StudentProfileData) => Promise<void>;
  onSkip?: () => void;
}) {
  const [form, setForm] = useState<StudentProfileData>(() => parseInitialData(initialData));
  const [saving, setSaving] = useState(false);

  // Sync when initialData changes (e.g. after fetch)
  useEffect(() => {
    if (initialData) {
      setForm(parseInitialData(initialData));
    }
  }, [initialData]);

  // ---- Field handlers ----

  const toggleDay = (day: number) => {
    setForm((prev) => {
      const days = prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day].sort((a, b) => a - b);
      return { ...prev, availableDays: days };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      toast.success("Profil kaydedildi!");
    } catch {
      toast.error("Profil kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  // ---- Render helpers ----

  const sectionClass =
    "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-5 space-y-3";
  const labelClass = "block text-sm font-medium text-white/70 mb-1";
  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-pink-400/60 focus:ring-1 focus:ring-pink-400/40 transition-colors";

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit}
      className="space-y-6 max-w-xl mx-auto"
    >
      {/* ---- Header ---- */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-amber-500 flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">\u00d6\u011frenci Profili</h2>
          <p className="text-xs text-white/50">
            \u00c7al\u0131\u015fma al\u0131\u015fkanl\u0131klar\u0131n\u0131 belirle, sana \u00f6zel plan olu\u015ftural\u0131m.
          </p>
        </div>
      </div>

      {/* ---- 0. Alan Seçimi ---- */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 text-pink-400">
          <Target className="w-4 h-4" />
          <span className="text-sm font-semibold">Alan Seçimi</span>
        </div>
        <label className={labelClass}>
          Hangi alanda hazırlanıyorsun?
        </label>
        <div className="space-y-2">
          {EXAM_TRACK_OPTIONS.map((opt) => {
            const active = form.examTrack === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, examTrack: opt.value }))}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                  active
                    ? "bg-pink-500/20 border-pink-400/60 text-pink-300"
                    : "bg-white/5 border-white/10 text-white/40 hover:border-white/30 hover:text-white/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                  <span className="font-medium text-sm">{opt.label}</span>
                </div>
                <p className="text-[11px] text-white/30 mt-0.5 ml-5">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- 1. Günlük Çalışma Saati ---- */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 text-amber-400">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-semibold">G\u00fcnl\u00fck \u00c7al\u0131\u015fma Saati</span>
        </div>
        <label className={labelClass}>
          G\u00fcnde ortalama ka\u00e7 saat \u00e7al\u0131\u015f\u0131yorsun?
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={16}
            step={0.5}
            value={form.dailyStudyHours ?? 4}
            onChange={(e) =>
              setForm((p) => ({ ...p, dailyStudyHours: parseFloat(e.target.value) }))
            }
            className="flex-1 accent-pink-500 bg-white/10 rounded-lg h-2 cursor-pointer"
          />
          <span className="min-w-[3.5rem] text-center text-lg font-bold text-pink-400">
            {form.dailyStudyHours ?? 4} sa
          </span>
        </div>
      </div>

      {/* ---- 2. M\u00fcsait G\u00fcnler ---- */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 text-amber-400">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-semibold">M\u00fcsait G\u00fcnler</span>
        </div>
        <label className={labelClass}>
          Hangi g\u00fcnler \u00e7al\u0131\u015fabilirsin?
        </label>
        <div className="flex flex-wrap gap-2">
          {DAY_LABELS.map((label, idx) => {
            const selected = form.availableDays.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleDay(idx)}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                  selected
                    ? "bg-pink-500/20 border-pink-400/60 text-pink-300"
                    : "bg-white/5 border-white/10 text-white/40 hover:border-white/30 hover:text-white/60"
                }`}
              >
                {selected && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- 3. \u00c7al\u0131\u015fma D\u00fczeni ---- */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 text-amber-400">
          <Target className="w-4 h-4" />
          <span className="text-sm font-semibold">\u00c7al\u0131\u015fma D\u00fczeni</span>
        </div>
        <label className={labelClass}>
          \u00c7al\u0131\u015fma d\u00fczenin nas\u0131l?
        </label>
        <div className="flex gap-3">
          {REGULARITY_OPTIONS.map((opt) => {
            const active = form.studyRegularity === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, studyRegularity: opt.value }))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                  active
                    ? "bg-pink-500/20 border-pink-400/60 text-pink-300"
                    : "bg-white/5 border-white/10 text-white/40 hover:border-white/30 hover:text-white/60"
                }`}
              >
                {active && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- 4. Mola Tercihi ---- */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 text-amber-400">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-semibold">Mola Tercihi</span>
        </div>
        <label className={labelClass}>
          Hangi mola d\u00f6ng\u00fcs\u00fcn\u00fc tercih edersin?
        </label>
        <div className="flex flex-wrap gap-3">
          {BREAK_OPTIONS.map((opt) => {
            const active = form.breakPreference === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, breakPreference: opt.value }))}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                  active
                    ? "bg-pink-500/20 border-pink-400/60 text-pink-300"
                    : "bg-white/5 border-white/10 text-white/40 hover:border-white/30 hover:text-white/60"
                }`}
              >
                {active && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- 5. YKS S\u0131nav Tarihi ---- */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 text-amber-400">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-semibold">YKS S\u0131nav Tarihi</span>
        </div>
        <label className={labelClass}>
          S\u0131nav tarihin ne zaman?
        </label>
        <input
          type="date"
          value={form.examDate ? form.examDate.slice(0, 10) : ""}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              examDate: e.target.value || null,
            }))
          }
          className={inputClass}
        />
        {form.examDate && (() => {
          const diff = Math.ceil(
            (new Date(form.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          if (diff > 0) {
            return (
              <p className="text-xs text-white/40 mt-1">
                S\u0131nava <span className="text-amber-400 font-semibold">{diff}</span> g\u00fcn kald\u0131.
              </p>
            );
          }
          return null;
        })()}
      </div>

      {/* ---- 6. Hedef S\u0131ralama ---- */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 text-amber-400">
          <Target className="w-4 h-4" />
          <span className="text-sm font-semibold">Hedef S\u0131ralama</span>
        </div>
        <label className={labelClass}>
          Hedefledi\u011fin s\u0131ralama nedir? (iste\u011fe ba\u011fl\u0131)
        </label>
        <input
          type="number"
          min={1}
          max={3000000}
          placeholder="\u00d6rn: 10000"
          value={form.targetRank ?? ""}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              targetRank: e.target.value ? parseInt(e.target.value, 10) : null,
            }))
          }
          className={inputClass}
        />
      </div>

      {/* ---- Actions ---- */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-semibold text-sm shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Kaydet
            </>
          )}
        </button>

        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            disabled={saving}
            className="px-5 py-3 rounded-xl border border-white/10 text-white/50 text-sm font-medium hover:text-white/70 hover:border-white/20 transition-all duration-200"
          >
            Atla
          </button>
        )}
      </div>
    </motion.form>
  );
}
