"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Target,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Save,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────

interface TargetData {
  id: string;
  subjectId: string;
  subjectName: string;
  examTypeName: string;
  targetNet: number;
  actualNet: number | null;
  actualExamDate: string | null;
  actualExamTitle: string | null;
  gap: number | null;
  progress: number;
}

interface Subject {
  id: string;
  name: string;
  examType: { id: string; name: string };
}

// ─── Constants ─────────────────────────────────────

const COLORS_BY_PROGRESS = {
  achieved: { bg: "from-emerald-500/20 to-emerald-600/20", border: "border-emerald-500/30", text: "text-emerald-400", glow: "shadow-emerald-500/20" },
  close: { bg: "from-amber-500/20 to-amber-600/20", border: "border-amber-500/30", text: "text-amber-400", glow: "shadow-amber-500/20" },
  far: { bg: "from-pink-500/20 to-pink-600/20", border: "border-pink-500/30", text: "text-pink-400", glow: "shadow-pink-500/20" },
  noData: { bg: "from-white/5 to-white/[0.02]", border: "border-white/10", text: "text-white/40", glow: "" },
};

function getProgressStyle(progress: number, hasActual: boolean) {
  if (!hasActual) return COLORS_BY_PROGRESS.noData;
  if (progress >= 100) return COLORS_BY_PROGRESS.achieved;
  if (progress >= 75) return COLORS_BY_PROGRESS.close;
  return COLORS_BY_PROGRESS.far;
}

// ─── Target Card ──────────────────────────────────

function TargetCard({
  target,
  onDelete,
  index,
}: {
  target: TargetData;
  onDelete: (id: string) => void;
  index: number;
}) {
  const style = getProgressStyle(target.progress, target.actualNet !== null);
  const isAchieved = target.progress >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className={`glass rounded-2xl border ${style.border} p-5 relative overflow-hidden group hover-lift`}
    >
      {/* Background Glow */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity bg-gradient-to-br ${style.bg}`}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
          <h3 className="text-white font-bold text-[15px]">{target.subjectName}</h3>
          <span className="text-[10px] text-white/30 bg-white/[0.03] px-2 py-0.5 rounded-full border border-white/5">
            {target.examTypeName}
          </span>
        </div>
        <button
          onClick={() => onDelete(target.id)}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Target vs Actual */}
      <div className="flex items-end gap-3 mb-4 relative z-10">
        <div className="flex-1">
          <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">
            Hedef
          </div>
          <div className={`text-3xl font-bold tracking-tighter ${style.text}`}>
            {target.targetNet.toFixed(1)}
          </div>
        </div>
        <div className="text-white/20 text-lg font-bold pb-1">→</div>
        <div className="flex-1">
          <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">
            Gerçek
          </div>
          <div className="text-3xl font-bold text-white tracking-tighter">
            {target.actualNet !== null ? target.actualNet.toFixed(1) : "—"}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 mb-3">
        <div className="w-full bg-white/[0.05] rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, target.progress)}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.05 + 0.2 }}
            className={`h-full rounded-full bg-gradient-to-r ${style.bg}`}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs relative z-10">
        <span className={`font-bold ${style.text}`}>
          {isAchieved ? (
            <span className="flex items-center gap-1">
              <CheckCircle2 size={14} /> Hedefe ulaşıldı!
            </span>
          ) : target.gap !== null ? (
            <span className="flex items-center gap-1">
              <Target size={14} /> {Math.abs(target.gap).toFixed(1)} net kaldı
            </span>
          ) : (
            "Deneme verisi yok"
          )}
        </span>
        {target.actualExamDate && (
          <span className="text-white/30">
            {new Date(target.actualExamDate).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "short",
            })}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Add Target Form ──────────────────────────────

function AddTargetForm({
  subjects,
  existingSubjectIds,
  onSave,
  onCancel,
}: {
  subjects: Subject[];
  existingSubjectIds: Set<string>;
  onSave: (targets: { subjectId: string; targetNet: number }[]) => Promise<void>;
  onCancel: () => void;
}) {
  const [targets, setTargets] = useState<{ subjectId: string; targetNet: string }[]>([]);
  const [saving, setSaving] = useState(false);

  // Group subjects by exam type
  const groupedSubjects = useMemo(() => {
    const groups = new Map<string, Subject[]>();
    for (const s of subjects) {
      if (existingSubjectIds.has(s.id)) continue; // Already has target
      const key = s.examType.name;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(s);
    }
    return groups;
  }, [subjects, existingSubjectIds]);

  const availableSubjects = subjects.filter(
    (s) => !existingSubjectIds.has(s.id) && !targets.some((t) => t.subjectId === s.id)
  );

  const addRow = () => {
    if (availableSubjects.length === 0) return;
    setTargets([...targets, { subjectId: availableSubjects[0].id, targetNet: "" }]);
  };

  const removeRow = (index: number) => {
    setTargets(targets.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const valid = targets
      .filter((t) => t.subjectId && t.targetNet)
      .map((t) => ({
        subjectId: t.subjectId,
        targetNet: parseFloat(t.targetNet),
      }))
      .filter((t) => !isNaN(t.targetNet) && t.targetNet >= 0);

    if (valid.length === 0) {
      toast.error("En az bir geçerli hedef girin");
      return;
    }

    setSaving(true);
    try {
      await onSave(valid);
      setTargets([]);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    // Auto-add first row
    if (targets.length === 0 && availableSubjects.length > 0) {
      setTargets([{ subjectId: availableSubjects[0].id, targetNet: "" }]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass-panel p-6"
    >
      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
        <Target className="text-pink-400" size={20} />
        Hedef Net Belirle
      </h3>

      <div className="space-y-3 mb-4">
        {targets.map((t, i) => (
          <div key={i} className="flex items-center gap-3">
            <select
              value={t.subjectId}
              onChange={(e) => {
                const updated = [...targets];
                updated[i].subjectId = e.target.value;
                setTargets(updated);
              }}
              className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-pink-500/30 transition-colors"
            >
              {Array.from(groupedSubjects.entries()).map(([groupName, groupSubjects]) => (
                <optgroup key={groupName} label={groupName}>
                  {groupSubjects
                    .filter(
                      (s) =>
                        s.id === t.subjectId ||
                        !targets.some((other, oi) => oi !== i && other.subjectId === s.id)
                    )
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
            <input
              type="number"
              step="0.5"
              min="0"
              placeholder="Hedef net"
              value={t.targetNet}
              onChange={(e) => {
                const updated = [...targets];
                updated[i].targetNet = e.target.value;
                setTargets(updated);
              }}
              className="w-28 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm text-center focus:outline-none focus:border-pink-500/30 transition-colors"
            />
            <button
              onClick={() => removeRow(i)}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {availableSubjects.filter((s) => !targets.some((t) => t.subjectId === s.id)).length >
          0 && (
          <button
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm hover:bg-white/10 hover:text-white/80 transition-all"
          >
            <Plus size={14} />
            Ders Ekle
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-white/50 text-sm hover:text-white/80 transition-colors"
        >
          İptal
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 text-white text-sm font-semibold shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Kaydet
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────

export default function TargetTracking() {
  const [targets, setTargets] = useState<TargetData[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [targetsRes, examTypesRes] = await Promise.all([
        fetch("/api/target-scores"),
        fetch("/api/exam-types"),
      ]);

      if (targetsRes.ok) {
        setTargets(await targetsRes.json());
      }

      if (examTypesRes.ok) {
        const examTypes: { id: string; name: string }[] = await examTypesRes.json();
        // Fetch subjects for each exam type
        const allSubjects: Subject[] = [];
        for (const et of examTypes) {
          const sRes = await fetch(`/api/subjects/${et.id}`);
          if (sRes.ok) {
            const subs = await sRes.json();
            for (const s of subs) {
              allSubjects.push({
                id: s.id,
                name: s.name,
                examType: { id: et.id, name: et.name },
              });
            }
          }
        }
        setSubjects(allSubjects);
      }
    } catch {
      toast.error("Hedef verileri yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const existingSubjectIds = useMemo(
    () => new Set(targets.map((t) => t.subjectId)),
    [targets]
  );

  const handleSave = async (
    newTargets: { subjectId: string; targetNet: number }[]
  ) => {
    try {
      const res = await fetch("/api/target-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targets: newTargets }),
      });
      if (!res.ok) throw new Error();
      toast.success("Hedefler kaydedildi!");
      setShowForm(false);
      await fetchData();
    } catch {
      toast.error("Hedefler kaydedilemedi");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/target-scores?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Hedef silindi");
      setTargets((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast.error("Hedef silinemedi");
    }
  };

  // Summary stats
  const stats = useMemo(() => {
    const withData = targets.filter((t) => t.actualNet !== null);
    const achieved = withData.filter((t) => t.progress >= 100);
    const totalGap = withData.reduce((s, t) => s + Math.max(0, t.gap ?? 0), 0);
    return {
      total: targets.length,
      achieved: achieved.length,
      withData: withData.length,
      totalGap: totalGap.toFixed(1),
    };
  }, [targets]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-pink-500" size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header + Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="text-pink-400" size={22} />
            Hedef Net Takibi
          </h2>
          <p className="text-white/40 text-sm mt-1">
            Ders bazlı hedef netlerini belirle ve ilerlemeyi takip et
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500/20 to-pink-600/20 text-pink-300 border border-pink-500/30 text-sm font-medium hover:from-pink-500/30 hover:to-pink-600/30 transition-all"
        >
          <Plus size={16} />
          Hedef Ekle
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <AddTargetForm
            subjects={subjects}
            existingSubjectIds={existingSubjectIds}
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {targets.length === 0 && !showForm ? (
        <div className="glass-panel text-center py-20 flex flex-col items-center justify-center">
          <Target className="text-pink-400/30 mb-4" size={56} />
          <h2 className="text-xl font-bold text-white/60">
            Henüz hedef belirlenmemiş
          </h2>
          <p className="text-sm text-white/40 mt-2 max-w-md">
            Ders bazlı hedef netlerini belirleyerek ilerlemenizi takip edin.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 text-white text-sm font-semibold shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all"
          >
            <Sparkles size={16} />
            İlk Hedefini Belirle
          </button>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          {targets.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass hover-lift p-5 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-[30px] group-hover:bg-pink-500/20 transition-all opacity-50" />
                <Target className="text-pink-400 mb-2" size={24} />
                <span className="text-3xl font-bold text-white tracking-tighter">
                  {stats.total}
                </span>
                <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-1">
                  Toplam Hedef
                </span>
              </div>
              <div className="glass hover-lift p-5 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[30px] group-hover:bg-emerald-500/20 transition-all opacity-50" />
                <CheckCircle2 className="text-emerald-400 mb-2" size={24} />
                <span className="text-3xl font-bold text-white tracking-tighter">
                  {stats.achieved}
                </span>
                <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-1">
                  Ulaşılan
                </span>
              </div>
              <div className="glass hover-lift p-5 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-[30px] group-hover:bg-amber-500/20 transition-all opacity-50" />
                <TrendingUp className="text-amber-400 mb-2" size={24} />
                <span className="text-3xl font-bold text-white tracking-tighter">
                  {stats.withData}
                </span>
                <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-1">
                  Veri Olan
                </span>
              </div>
              <div className="glass hover-lift p-5 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-[30px] group-hover:bg-cyan-500/20 transition-all opacity-50" />
                <AlertTriangle className="text-cyan-400 mb-2" size={24} />
                <span className="text-3xl font-bold text-white tracking-tighter">
                  {stats.totalGap}
                </span>
                <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-1">
                  Toplam Fark
                </span>
              </div>
            </div>
          )}

          {/* Target Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {targets.map((target, i) => (
              <TargetCard
                key={target.id}
                target={target}
                onDelete={handleDelete}
                index={i}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
