"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  Clock,
  Loader2,
  X,
  CalendarDays,
  BookOpen,
  Sparkles,
  GripVertical,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { format, startOfWeek, addDays, addWeeks } from "date-fns";
import { tr } from "date-fns/locale";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// ---------- Types ----------

interface Topic {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  examType: { id: string; name: string };
  topics: Topic[];
}

interface ExamType {
  id: string;
  name: string;
  slug: string;
  subjects: {
    id: string;
    name: string;
    topics: Topic[];
  }[];
}

interface WeeklyPlanItem {
  id: string;
  dayOfWeek: number;
  subjectId: string;
  topicId: string | null;
  duration: number | null;
  questionCount: number | null;
  completed: boolean;
  notes: string | null;
  sortOrder: number;
  subject: { id: string; name: string; examType: { name: string } };
  topic: { id: string; name: string } | null;
}

interface WeeklyPlan {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  notes: string | null;
  items: WeeklyPlanItem[];
}

interface DraftItem {
  dayOfWeek: number;
  subjectId: string;
  topicId: string;
  duration: number;
}

// Dynamic Wizard Types
interface WizardQuestion {
  id: string;
  question: string;
  options: string[];
  context?: string;
}

interface WizardData {
  analysis: string;
  weakAreas: string[];
  strongAreas: string[];
  stats: {
    avgDailyHours?: number;
    totalStudyDays?: number;
    mostStudiedSubject?: string;
    leastStudiedSubject?: string;
  };
  questions: WizardQuestion[];
}

interface WizardAnswer {
  questionId: string;
  question: string;
  selectedOption: string;
  customNote?: string;
}

// DnD Types
const PLAN_ITEM_TYPE = "PLAN_ITEM";

interface DragItem {
  id: string;
  dayOfWeek: number;
  sortOrder: number;
}

// ---------- Constants ----------

const DAY_LABELS = ["Pazartesi", "Sali", "Carsamba", "Persembe", "Cuma", "Cumartesi", "Pazar"];

// ---------- DnD Components ----------

function DraggablePlanItem({
  item,
  toggling,
  onToggle,
  planId,
  onDrop,
}: {
  item: WeeklyPlanItem;
  toggling: boolean;
  onToggle: () => void;
  planId: string;
  onDrop: (itemId: string, newDay: number, newSort: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: PLAN_ITEM_TYPE,
    item: (): DragItem => ({
      id: item.id,
      dayOfWeek: item.dayOfWeek,
      sortOrder: item.sortOrder,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(ref);

  return (
    <div
      ref={ref}
      className={`group relative p-2.5 rounded-xl border transition-all ${
        isDragging
          ? "opacity-30 border-pink-500/30 bg-pink-500/5"
          : item.completed
          ? "bg-white/[0.02] border-white/[0.05] opacity-60"
          : "bg-white/[0.04] border-white/[0.08] hover:border-pink-500/20"
      }`}
      style={{ cursor: "grab" }}
    >
      <div className="flex items-start gap-2">
        {/* Drag Handle */}
        <div className="mt-0.5 flex-shrink-0 text-white/15 group-hover:text-white/30 transition-colors cursor-grab">
          <GripVertical size={14} />
        </div>

        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          disabled={toggling}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            item.completed
              ? "bg-pink-500 border-pink-500 text-white"
              : "border-white/20 hover:border-pink-400/50"
          }`}
        >
          {toggling ? (
            <Loader2 size={10} className="animate-spin" />
          ) : item.completed ? (
            <Check size={10} strokeWidth={3} />
          ) : null}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-xs font-semibold truncate ${
              item.completed
                ? "text-white/40 line-through"
                : "text-white/90"
            }`}
          >
            {item.subject.name}
          </p>
          {item.topic && (
            <p
              className={`text-[10px] truncate mt-0.5 ${
                item.completed
                  ? "text-white/25 line-through"
                  : "text-white/50"
              }`}
            >
              {item.topic.name}
            </p>
          )}
          {item.duration && (
            <div className="flex items-center gap-1 mt-1">
              <Clock
                size={9}
                className={
                  item.completed
                    ? "text-white/20"
                    : "text-amber-400/70"
                }
              />
              <span
                className={`text-[9px] font-medium ${
                  item.completed
                    ? "text-white/20"
                    : "text-amber-400/70"
                }`}
              >
                {item.duration} dk
              </span>
            </div>
          )}
          {item.notes && (
            <p className="text-[9px] text-white/30 mt-1 truncate">
              {item.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DroppableDayColumn({
  dayIdx,
  dayDate,
  items,
  planId,
  toggling,
  onToggle,
  onDrop,
  onAddClick,
}: {
  dayIdx: number;
  dayDate: Date;
  items: WeeklyPlanItem[];
  planId: string;
  toggling: Set<string>;
  onToggle: (item: WeeklyPlanItem) => void;
  onDrop: (itemId: string, newDay: number, newSort: number) => void;
  onAddClick: () => void;
}) {
  const dayName = format(dayDate, "EEEE", { locale: tr });
  const dayShort = format(dayDate, "d MMM", { locale: tr });

  const [{ isOver }, drop] = useDrop({
    accept: PLAN_ITEM_TYPE,
    drop: (dragItem: DragItem) => {
      if (dragItem.dayOfWeek !== dayIdx) {
        onDrop(dragItem.id, dayIdx, items.length);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop as any}
      className={`bg-white/5 backdrop-blur-xl border rounded-2xl p-3 flex flex-col min-h-[180px] transition-all ${
        isOver
          ? "border-pink-500/40 bg-pink-500/5 shadow-[0_0_20px_rgba(255,42,133,0.15)]"
          : "border-pink-500/15"
      }`}
    >
      {/* Day Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
        <div>
          <p className="text-xs font-bold text-pink-400 uppercase tracking-wider">
            {dayName}
          </p>
          <p className="text-[10px] text-white/40 mt-0.5">
            {dayShort}
          </p>
        </div>
        {items.length > 0 && (
          <span className="text-[10px] font-bold text-white/30 bg-white/5 px-2 py-0.5 rounded-lg">
            {items.filter((i) => i.completed).length}/{items.length}
          </span>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 space-y-2">
        {items.map((item) => (
          <DraggablePlanItem
            key={item.id}
            item={item}
            toggling={toggling.has(item.id)}
            onToggle={() => onToggle(item)}
            planId={planId}
            onDrop={onDrop}
          />
        ))}
      </div>

      {/* Drop indicator */}
      {isOver && (
        <div className="mt-2 py-3 rounded-xl border-2 border-dashed border-pink-500/30 bg-pink-500/5 flex items-center justify-center">
          <span className="text-[10px] text-pink-400/60 font-bold">Buraya bırak</span>
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={onAddClick}
        className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-white/30 hover:text-pink-400 bg-white/[0.02] hover:bg-white/[0.05] border border-dashed border-white/[0.08] hover:border-pink-500/20 transition-all"
      >
        <Plus size={14} />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Ekle
        </span>
      </button>
    </div>
  );
}

// ---------- Component ----------

export default function WeeklyPlan() {
  // Week navigation
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  // Data
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [addItemDay, setAddItemDay] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Dynamic Wizard State
  const [showWizard, setShowWizard] = useState(false);
  const [wizardData, setWizardData] = useState<WizardData | null>(null);
  const [wizardLoading, setWizardLoading] = useState(false);
  const [wizardStep, setWizardStep] = useState(0); // 0 = analysis, 1..N = questions
  const [wizardAnswers, setWizardAnswers] = useState<Map<string, WizardAnswer>>(new Map());

  // Create plan form
  const [createTitle, setCreateTitle] = useState("");
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);

  // Add item form
  const [addSubjectId, setAddSubjectId] = useState("");
  const [addTopicId, setAddTopicId] = useState("");
  const [addDuration, setAddDuration] = useState("");

  // ---------- Derived ----------

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  const weekLabel = useMemo(() => {
    const startStr = format(weekStart, "d MMM", { locale: tr });
    const endStr = format(weekEnd, "d MMM yyyy", { locale: tr });
    return `${startStr} \u2013 ${endStr}`;
  }, [weekStart, weekEnd]);

  const startDateStr = useMemo(
    () => format(weekStart, "yyyy-MM-dd"),
    [weekStart]
  );

  const defaultTitle = useMemo(() => {
    const s = format(weekStart, "d MMM", { locale: tr });
    const e = format(weekEnd, "d MMM", { locale: tr });
    return `${s} \u2013 ${e} Plan\u0131`;
  }, [weekStart, weekEnd]);

  const completedCount = useMemo(
    () => (plan?.items ?? []).filter((i) => i.completed).length,
    [plan]
  );

  const totalCount = useMemo(() => (plan?.items ?? []).length, [plan]);

  const progressPercent = useMemo(
    () => (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0),
    [completedCount, totalCount]
  );

  const itemsByDay = useMemo(() => {
    const map: Record<number, WeeklyPlanItem[]> = {};
    for (let d = 0; d < 7; d++) map[d] = [];
    for (const item of plan?.items ?? []) {
      if (map[item.dayOfWeek]) {
        map[item.dayOfWeek].push(item);
      }
    }
    return map;
  }, [plan]);

  const addTopics = useMemo(
    () => subjects.find((s) => s.id === addSubjectId)?.topics ?? [],
    [subjects, addSubjectId]
  );

  // ---------- Fetch ----------

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await fetch("/api/exam-types");
      if (!res.ok) return;
      const examTypes: ExamType[] = await res.json();
      const allSubjects: Subject[] = [];
      for (const et of examTypes) {
        if (et.subjects) {
          for (const s of et.subjects) {
            allSubjects.push({
              ...s,
              examType: { id: et.id, name: et.name },
            });
          }
        }
        if (allSubjects.length === 0) {
          const sRes = await fetch(`/api/subjects/${et.id}`);
          if (sRes.ok) {
            const subs = await sRes.json();
            for (const s of subs) {
              allSubjects.push({
                ...s,
                examType: { id: et.id, name: et.name },
              });
            }
          }
        }
      }
      setSubjects(allSubjects);
    } catch (err) {
      console.error("Dersler yuklenirken hata:", err);
    }
  }, []);

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weekly-plans?startDate=${startDateStr}`);
      if (!res.ok) {
        setPlan(null);
        return;
      }
      const data = await res.json();
      // API returns array when startDate is used
      if (Array.isArray(data)) {
        setPlan(data.length > 0 ? data[0] : null);
      } else {
        setPlan(data || null);
      }
    } catch (err) {
      console.error("Plan yuklenirken hata:", err);
      setPlan(null);
    } finally {
      setLoading(false);
    }
  }, [startDateStr]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  // ---------- Actions ----------

  const handleToggleItem = useCallback(
    async (item: WeeklyPlanItem) => {
      if (!plan) return;
      setToggling((prev) => new Set(prev).add(item.id));
      try {
        const res = await fetch(
          `/api/weekly-plans/${plan.id}/items/${item.id}/toggle`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: !item.completed }),
          }
        );
        if (!res.ok) throw new Error();
        // Update locally
        setPlan((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map((i) =>
              i.id === item.id ? { ...i, completed: !i.completed } : i
            ),
          };
        });
      } catch {
        toast.error("Durum guncellenemedi");
      } finally {
        setToggling((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }
    },
    [plan]
  );

  const handleCreatePlan = useCallback(async () => {
    if (draftItems.length === 0) {
      toast.error("En az bir madde ekleyin");
      return;
    }
    setSaving(true);
    try {
      const endDate = format(addDays(weekStart, 6), "yyyy-MM-dd");
      const res = await fetch("/api/weekly-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: createTitle || defaultTitle,
          startDate: startDateStr,
          endDate,
          items: draftItems.map((d) => ({
            dayOfWeek: d.dayOfWeek,
            subjectId: d.subjectId,
            topicId: d.topicId || null,
            duration: d.duration || null,
          })),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Plan oluşturuldu");
      setShowCreateDialog(false);
      setDraftItems([]);
      setCreateTitle("");
      fetchPlan();
    } catch {
      toast.error("Plan oluşturulamadı");
    } finally {
      setSaving(false);
    }
  }, [draftItems, createTitle, defaultTitle, startDateStr, weekStart, fetchPlan]);

  const handleAddItem = useCallback(async () => {
    if (!plan || !addSubjectId) {
      toast.error("Ders secimi zorunlu");
      return;
    }
    setSaving(true);
    try {
      const existingItems = plan.items.map((i) => ({
        dayOfWeek: i.dayOfWeek,
        subjectId: i.subjectId,
        topicId: i.topicId,
        duration: i.duration,
        questionCount: i.questionCount,
        completed: i.completed,
        notes: i.notes,
      }));
      const newItem = {
        dayOfWeek: addItemDay,
        subjectId: addSubjectId,
        topicId: addTopicId || null,
        duration: addDuration ? parseInt(addDuration) : null,
        questionCount: null,
        completed: false,
        notes: null,
      };
      const res = await fetch(`/api/weekly-plans/${plan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [...existingItems, newItem],
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Madde eklendi");
      setShowAddItemDialog(false);
      setAddSubjectId("");
      setAddTopicId("");
      setAddDuration("");
      fetchPlan();
    } catch {
      toast.error("Madde eklenemedi");
    } finally {
      setSaving(false);
    }
  }, [plan, addItemDay, addSubjectId, addTopicId, addDuration, fetchPlan]);

  const handleDeletePlan = useCallback(async () => {
    if (!plan) return;
    if (!window.confirm("Bu plan\u0131 silmek istedi\u011finize emin misiniz?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/weekly-plans/${plan.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Plan silindi");
      setPlan(null);
    } catch {
      toast.error("Plan silinemedi");
    } finally {
      setDeleting(false);
    }
  }, [plan]);

  // Drag & Drop handler
  const handleDrop = useCallback(
    async (itemId: string, newDayOfWeek: number, newSortOrder: number) => {
      if (!plan) return;

      // Optimistic UI update
      setPlan((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.id === itemId ? { ...i, dayOfWeek: newDayOfWeek, sortOrder: newSortOrder } : i
          ),
        };
      });

      // API call
      try {
        const res = await fetch(`/api/weekly-plans/${plan.id}/reorder`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, newDayOfWeek, newSortOrder }),
        });
        if (!res.ok) throw new Error();
        const updatedPlan = await res.json();
        setPlan(updatedPlan);
      } catch {
        toast.error("Sıra güncellenemedi");
        fetchPlan(); // Revert on failure
      }
    },
    [plan, fetchPlan]
  );

  // ---------- Dynamic Wizard ----------

  const openWizard = useCallback(async () => {
    setWizardStep(0);
    setWizardAnswers(new Map());
    setWizardData(null);
    setShowWizard(true);
    setWizardLoading(true);

    try {
      const res = await fetch("/api/ai/plan-wizard/analyze", {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        if (res.status === 403) {
          toast.error("AI erişiminiz aktif değil");
          setShowWizard(false);
          return;
        }
        throw new Error(err?.error || "Analiz başarısız");
      }
      const data: WizardData = await res.json();
      setWizardData(data);
    } catch (err: any) {
      toast.error(err?.message || "Veri analizi başarısız. Tekrar deneyin.");
      setShowWizard(false);
    } finally {
      setWizardLoading(false);
    }
  }, []);

  const handleWizardAnswer = useCallback((questionId: string, question: string, selectedOption: string, customNote?: string) => {
    setWizardAnswers((prev) => {
      const next = new Map(prev);
      next.set(questionId, { questionId, question, selectedOption, customNote });
      return next;
    });
  }, []);

  const handleAIGeneratePlan = useCallback(async () => {
    if (!wizardData) return;

    if (plan) {
      if (!window.confirm("Mevcut plan\u0131 silip AI ile yeni plan olu\u015fturulacak. Devam etmek istiyor musunuz?")) {
        return;
      }
      // Delete existing plan first
      try {
        await fetch(`/api/weekly-plans/${plan.id}`, { method: "DELETE" });
        setPlan(null);
      } catch {
        toast.error("Mevcut plan silinemedi");
        return;
      }
    }

    setAiGenerating(true);
    try {
      const endDate = format(addDays(weekStart, 6), "yyyy-MM-dd");

      // Build wizard context from dynamic answers
      const wizardContext = {
        analysis: wizardData.analysis,
        weakAreas: wizardData.weakAreas,
        strongAreas: wizardData.strongAreas,
        questions: Array.from(wizardAnswers.values()),
      };

      const res = await fetch("/api/ai/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStartDate: startDateStr,
          weekEndDate: endDate,
          wizardContext,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        if (res.status === 403) {
          toast.error("AI erişiminiz aktif değil");
        } else if (res.status === 409) {
          toast.error(errData?.error || "Bu hafta için zaten bir plan mevcut");
          fetchPlan();
        } else {
          throw new Error(errData?.error || "Plan oluşturulamadı");
        }
        return;
      }
      const data = await res.json();
      setPlan(data);
      toast.success("AI planınızı oluşturdu!");
      setShowWizard(false);
    } catch (err: any) {
      toast.error(err?.message || "AI plan oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setAiGenerating(false);
    }
  }, [plan, weekStart, startDateStr, fetchPlan, wizardData, wizardAnswers]);

  // ---------- Draft Item Helpers ----------

  const addDraftItem = useCallback(
    (dayOfWeek: number, subjectId: string, topicId: string, duration: number) => {
      setDraftItems((prev) => [...prev, { dayOfWeek, subjectId, topicId, duration }]);
    },
    []
  );

  const removeDraftItem = useCallback((index: number) => {
    setDraftItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ---------- Render Helpers ----------

  const goToPrevWeek = useCallback(
    () => setWeekStart((prev) => addWeeks(prev, -1)),
    []
  );

  const goToNextWeek = useCallback(
    () => setWeekStart((prev) => addWeeks(prev, 1)),
    []
  );

  const goToCurrentWeek = useCallback(
    () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 })),
    []
  );

  // ---------- Render ----------

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Week Navigation */}
        <div className="bg-white/5 backdrop-blur-xl border border-pink-500/15 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarDays
                size={28}
                className="text-pink-400 drop-shadow-[0_0_10px_rgba(255,42,133,0.4)]"
              />
              <h2 className="text-xl font-bold text-white/90">Haftalik Plan</h2>
            </div>
            <button
              onClick={goToCurrentWeek}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white/[0.05] border border-white/10 text-white/60 hover:text-white hover:border-pink-400/30 transition-all"
            >
              Bu Hafta
            </button>
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={goToPrevWeek}
              className="p-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-pink-400/30 text-white/50 hover:text-white transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-bold text-white/70 tracking-wide uppercase">
              {weekLabel}
            </span>
            <button
              onClick={goToNextWeek}
              className="p-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-pink-400/30 text-white/50 hover:text-white transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-pink-400" />
          </div>
        )}

        {/* No Plan */}
        {!loading && !plan && !showCreateDialog && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-pink-500/15 rounded-2xl p-10 text-center"
          >
            <CalendarDays
              size={48}
              className="mx-auto text-white/20 mb-4"
            />
            <p className="text-white/50 mb-6">
              Bu hafta için henüz bir plan oluşturulmamış.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={openWizard}
                disabled={aiGenerating}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-[0_4px_15px_rgba(255,42,133,0.4)] hover:shadow-[0_6px_20px_rgba(255,42,133,0.5)] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {aiGenerating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                {aiGenerating ? "AI Plan Oluşturuluyor..." : "AI ile Plan Oluştur"}
              </button>
              <span className="text-white/30 text-xs">veya</span>
              <button
                onClick={() => {
                  setCreateTitle(defaultTitle);
                  setDraftItems([]);
                  setShowCreateDialog(true);
                }}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all"
              >
                Manuel Plan Oluştur
              </button>
            </div>
          </motion.div>
        )}

        {/* Plan Exists */}
        {!loading && plan && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Progress Bar & Plan Header */}
            <div className="bg-white/5 backdrop-blur-xl border border-pink-500/15 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white/90">
                  {plan.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-pink-400">
                    {completedCount}/{totalCount} (%{progressPercent})
                  </span>
                  <button
                    onClick={openWizard}
                    disabled={aiGenerating}
                    title="AI ile yeniden oluştur"
                    className="p-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-amber-400/30 text-white/30 hover:text-amber-400 transition-all disabled:opacity-50"
                  >
                    {aiGenerating ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Sparkles size={16} />
                    )}
                  </button>
                  <button
                    onClick={handleDeletePlan}
                    disabled={deleting}
                    className="p-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-rose-400/30 text-white/30 hover:text-rose-400 transition-all"
                  >
                    {deleting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2.5 rounded-full bg-white/[0.08] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-pink-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              {/* AI Explanation */}
              {plan.notes && (
                <div className="mt-3 flex items-start gap-2 text-xs text-white/50 bg-white/[0.03] rounded-xl p-3 border border-white/5">
                  <Sparkles size={12} className="text-amber-400/60 mt-0.5 flex-shrink-0" />
                  <p className="leading-relaxed">{plan.notes}</p>
                </div>
              )}
              {/* DnD hint */}
              <p className="mt-2 text-[10px] text-white/25 text-center">
                Maddeleri sürükleyerek günler arası taşıyabilirsin
              </p>
            </div>

            {/* 7-Day Grid with DnD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {Array.from({ length: 7 }, (_, dayIdx) => (
                <DroppableDayColumn
                  key={dayIdx}
                  dayIdx={dayIdx}
                  dayDate={addDays(weekStart, dayIdx)}
                  items={itemsByDay[dayIdx] || []}
                  planId={plan.id}
                  toggling={toggling}
                  onToggle={handleToggleItem}
                  onDrop={handleDrop}
                  onAddClick={() => {
                    setAddItemDay(dayIdx);
                    setAddSubjectId("");
                    setAddTopicId("");
                    setAddDuration("");
                    setShowAddItemDialog(true);
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ---------- AI Wizard ---------- */}
        <AnimatePresence>
          {showWizard && (
            <DynamicWizardModal
              data={wizardData}
              loading={wizardLoading}
              step={wizardStep}
              answers={wizardAnswers}
              onAnswer={handleWizardAnswer}
              onNext={() => {
                if (!wizardData) return;
                setWizardStep((s) => Math.min(s + 1, wizardData.questions.length));
              }}
              onBack={() => setWizardStep((s) => Math.max(s - 1, 0))}
              onComplete={handleAIGeneratePlan}
              onClose={() => {
                if (!aiGenerating) setShowWizard(false);
              }}
              generating={aiGenerating}
            />
          )}
        </AnimatePresence>

        {/* ---------- Create Plan Dialog ---------- */}
        <AnimatePresence>
          {showCreateDialog && (
            <CreatePlanDialog
              subjects={subjects}
              title={createTitle}
              setTitle={setCreateTitle}
              draftItems={draftItems}
              addDraftItem={addDraftItem}
              removeDraftItem={removeDraftItem}
              saving={saving}
              onSave={handleCreatePlan}
              onClose={() => {
                setShowCreateDialog(false);
                setDraftItems([]);
              }}
            />
          )}
        </AnimatePresence>

        {/* ---------- Add Item Dialog ---------- */}
        <AnimatePresence>
          {showAddItemDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setShowAddItemDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-slate-950/95 backdrop-blur-xl border border-pink-500/15 rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-white/90">
                    {DAY_LABELS[addItemDay]} - Madde Ekle
                  </h3>
                  <button
                    onClick={() => setShowAddItemDialog(false)}
                    className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">
                      Ders
                    </label>
                    <select
                      value={addSubjectId}
                      onChange={(e) => {
                        setAddSubjectId(e.target.value);
                        setAddTopicId("");
                      }}
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/90 focus:outline-none focus:border-pink-500/30 transition-all appearance-none"
                    >
                      <option value="">Ders secin...</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.examType.name} - {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Topic */}
                  {addTopics.length > 0 && (
                    <div>
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">
                        Konu
                      </label>
                      <select
                        value={addTopicId}
                        onChange={(e) => setAddTopicId(e.target.value)}
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/90 focus:outline-none focus:border-pink-500/30 transition-all appearance-none"
                      >
                        <option value="">Konu secin (istege bagli)...</option>
                        {addTopics.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Duration */}
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">
                      Sure (dakika)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={addDuration}
                      onChange={(e) => setAddDuration(e.target.value)}
                      placeholder="Ornegin: 45"
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-pink-500/30 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddItemDialog(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white/50 bg-white/[0.05] border border-white/10 hover:text-white/70 hover:bg-white/[0.08] transition-all"
                  >
                    Iptal
                  </button>
                  <button
                    onClick={handleAddItem}
                    disabled={saving || !addSubjectId}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-[0_4px_15px_rgba(255,42,133,0.3)] hover:shadow-[0_6px_20px_rgba(255,42,133,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    Kaydet
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
}

// ---------- Create Plan Dialog Component ----------

function CreatePlanDialog({
  subjects,
  title,
  setTitle,
  draftItems,
  addDraftItem,
  removeDraftItem,
  saving,
  onSave,
  onClose,
}: {
  subjects: Subject[];
  title: string;
  setTitle: (v: string) => void;
  draftItems: DraftItem[];
  addDraftItem: (dayOfWeek: number, subjectId: string, topicId: string, duration: number) => void;
  removeDraftItem: (index: number) => void;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  // Per-day add form state
  const [activeDayTab, setActiveDayTab] = useState(0);
  const [formSubjectId, setFormSubjectId] = useState("");
  const [formTopicId, setFormTopicId] = useState("");
  const [formDuration, setFormDuration] = useState("");

  const formTopics = useMemo(
    () => subjects.find((s) => s.id === formSubjectId)?.topics ?? [],
    [subjects, formSubjectId]
  );

  const draftItemsForDay = useMemo(
    () =>
      draftItems
        .map((d, idx) => ({ ...d, _index: idx }))
        .filter((d) => d.dayOfWeek === activeDayTab),
    [draftItems, activeDayTab]
  );

  const handleAddToDraft = () => {
    if (!formSubjectId) {
      toast.error("Ders secimi zorunlu");
      return;
    }
    addDraftItem(
      activeDayTab,
      formSubjectId,
      formTopicId,
      formDuration ? parseInt(formDuration) : 0
    );
    setFormSubjectId("");
    setFormTopicId("");
    setFormDuration("");
  };

  const getSubjectName = (subjectId: string) => {
    const s = subjects.find((sub) => sub.id === subjectId);
    return s ? `${s.examType.name} - ${s.name}` : "";
  };

  const getTopicName = (subjectId: string, topicId: string) => {
    if (!topicId) return null;
    const s = subjects.find((sub) => sub.id === subjectId);
    return s?.topics.find((t) => t.id === topicId)?.name ?? null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-950/95 backdrop-blur-xl border border-pink-500/15 rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white/90">
            Yeni Plan Oluştur
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Title Input */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">
            Plan Basligi
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Haftalik plan basligi..."
            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-pink-500/30 transition-all"
          />
        </div>

        {/* Day Tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {DAY_LABELS.map((label, idx) => {
            const count = draftItems.filter((d) => d.dayOfWeek === idx).length;
            return (
              <button
                key={idx}
                onClick={() => setActiveDayTab(idx)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeDayTab === idx
                    ? "bg-gradient-to-r from-pink-500/20 to-pink-600/20 text-pink-300 border border-pink-500/30"
                    : "bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-white/60 hover:bg-white/[0.05]"
                }`}
              >
                {label.slice(0, 3)}
                {count > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-pink-500/30 text-[9px] text-pink-300">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Items for selected day */}
        <div className="mb-4 space-y-2">
          {draftItemsForDay.length === 0 && (
            <p className="text-xs text-white/30 text-center py-3">
              Bu gun icin henuz madde eklenmemis.
            </p>
          )}
          {draftItemsForDay.map((item) => (
            <div
              key={item._index}
              className="flex items-center justify-between bg-white/[0.04] border border-white/[0.08] rounded-xl p-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white/80 truncate">
                  {getSubjectName(item.subjectId)}
                </p>
                {getTopicName(item.subjectId, item.topicId) && (
                  <p className="text-[10px] text-white/40 truncate">
                    {getTopicName(item.subjectId, item.topicId)}
                  </p>
                )}
                {item.duration > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock size={9} className="text-amber-400/70" />
                    <span className="text-[9px] text-amber-400/70 font-medium">
                      {item.duration} dk
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => removeDraftItem(item._index)}
                className="p-1.5 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Add Form for Day */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-5">
          <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">
            {DAY_LABELS[activeDayTab]} - Madde Ekle
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={formSubjectId}
              onChange={(e) => {
                setFormSubjectId(e.target.value);
                setFormTopicId("");
              }}
              className="bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white/90 focus:outline-none focus:border-pink-500/30 transition-all appearance-none"
            >
              <option value="">Ders secin...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.examType.name} - {s.name}
                </option>
              ))}
            </select>

            <select
              value={formTopicId}
              onChange={(e) => setFormTopicId(e.target.value)}
              disabled={formTopics.length === 0}
              className="bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white/90 focus:outline-none focus:border-pink-500/30 transition-all appearance-none disabled:opacity-40"
            >
              <option value="">Konu (istege bagli)...</option>
              {formTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                value={formDuration}
                onChange={(e) => setFormDuration(e.target.value)}
                placeholder="dk"
                className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white/90 placeholder:text-white/30 focus:outline-none focus:border-pink-500/30 transition-all"
              />
              <button
                onClick={handleAddToDraft}
                disabled={!formSubjectId}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30 hover:bg-pink-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                <Plus size={12} />
                Ekle
              </button>
            </div>
          </div>
        </div>

        {/* Total summary */}
        {draftItems.length > 0 && (
          <div className="flex items-center gap-2 mb-5 px-1">
            <BookOpen size={14} className="text-white/30" />
            <span className="text-xs text-white/40">
              Toplam {draftItems.length} madde,{" "}
              {draftItems.reduce((s, d) => s + (d.duration || 0), 0)} dakika
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white/50 bg-white/[0.05] border border-white/10 hover:text-white/70 hover:bg-white/[0.08] transition-all"
          >
            Iptal
          </button>
          <button
            onClick={onSave}
            disabled={saving || draftItems.length === 0}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-[0_4px_15px_rgba(255,42,133,0.3)] hover:shadow-[0_6px_20px_rgba(255,42,133,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Plani Kaydet
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------- Dynamic AI Wizard Modal Component ----------

function DynamicWizardModal({
  data,
  loading,
  step,
  answers,
  onAnswer,
  onNext,
  onBack,
  onComplete,
  onClose,
  generating,
}: {
  data: WizardData | null;
  loading: boolean;
  step: number;
  answers: Map<string, WizardAnswer>;
  onAnswer: (questionId: string, question: string, selectedOption: string, customNote?: string) => void;
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
  onClose: () => void;
  generating: boolean;
}) {
  const totalSteps = data ? data.questions.length + 1 : 1; // +1 for analysis step
  const isAnalysisStep = step === 0;
  const questionIndex = step - 1;
  const isLastStep = data ? step === data.questions.length : false;
  const currentQuestion = data && questionIndex >= 0 ? data.questions[questionIndex] : null;
  const currentAnswer = currentQuestion ? answers.get(currentQuestion.id) : null;
  const [customNote, setCustomNote] = useState("");

  // Reset custom note on step change
  useEffect(() => {
    if (currentQuestion && currentAnswer?.customNote) {
      setCustomNote(currentAnswer.customNote);
    } else {
      setCustomNote("");
    }
  }, [step, currentQuestion, currentAnswer?.customNote]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={() => {
        if (!generating && !loading) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-slate-950/95 backdrop-blur-xl border border-pink-500/15 rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-pink-500/20 border border-amber-500/20">
              <Brain size={18} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white/90">AI Strateji Sihirbazı</h3>
          </div>
          <div className="flex items-center gap-3">
            {!loading && data && (
              <span className="text-xs font-bold text-white/40 bg-white/[0.05] px-2.5 py-1 rounded-lg">
                {step + 1}/{totalSteps}
              </span>
            )}
            <button
              onClick={onClose}
              disabled={generating || loading}
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles size={32} className="text-amber-400" />
            </motion.div>
            <div className="text-center">
              <p className="text-base font-semibold text-white/80 mb-1">Verilerin analiz ediliyor...</p>
              <p className="text-xs text-white/40">
                Çalışma kayıtların, deneme sonuçların ve konu haritanı inceliyorum
              </p>
            </div>
            <div className="flex gap-1 mt-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-amber-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Loaded Content */}
        {!loading && data && (
          <>
            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden mb-6">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>

            <AnimatePresence mode="wait">
              {/* Analysis Step (Step 0) */}
              {isAnalysisStep && (
                <motion.div
                  key="analysis"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Analysis Summary */}
                  <div className="bg-gradient-to-br from-amber-500/10 to-pink-500/5 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain size={16} className="text-amber-400" />
                      <span className="text-sm font-bold text-amber-300">Analiz Özeti</span>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">
                      {data.analysis}
                    </p>
                  </div>

                  {/* Stats Cards */}
                  {data.stats && (
                    <div className="grid grid-cols-2 gap-2">
                      {data.stats.avgDailyHours !== undefined && (
                        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-center">
                          <p className="text-lg font-bold text-cyan-400 font-mono">{data.stats.avgDailyHours.toFixed(1)}</p>
                          <p className="text-[10px] text-white/40">Günlük ort. saat</p>
                        </div>
                      )}
                      {data.stats.totalStudyDays !== undefined && (
                        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-center">
                          <p className="text-lg font-bold text-pink-400 font-mono">{data.stats.totalStudyDays}</p>
                          <p className="text-[10px] text-white/40">Çalışılan gün</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Weak & Strong Areas */}
                  <div className="space-y-2">
                    {data.weakAreas.length > 0 && (
                      <div className="flex items-start gap-2">
                        <TrendingDown size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="flex flex-wrap gap-1.5">
                          {data.weakAreas.slice(0, 5).map((area, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-300 font-medium"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {data.strongAreas.length > 0 && (
                      <div className="flex items-start gap-2">
                        <TrendingUp size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                        <div className="flex flex-wrap gap-1.5">
                          {data.strongAreas.slice(0, 5).map((area, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 font-medium"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-white/30 text-center pt-2">
                    Bu analiz senin verilerine göre hazırlandı. Devam ederek sana özel sorulara geçebilirsin.
                  </p>
                </motion.div>
              )}

              {/* Dynamic Question Steps */}
              {!isAnalysisStep && currentQuestion && (
                <motion.div
                  key={`q-${currentQuestion.id}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Question context hint */}
                  {currentQuestion.context && (
                    <div className="flex items-start gap-2 mb-3 text-[11px] text-white/40 bg-white/[0.03] rounded-lg p-2.5 border border-white/[0.05]">
                      <AlertCircle size={12} className="text-amber-400/50 mt-0.5 flex-shrink-0" />
                      <span>{currentQuestion.context}</span>
                    </div>
                  )}

                  <p className="text-base font-semibold text-white/90 mb-4">
                    {currentQuestion.question}
                  </p>

                  {/* Options */}
                  <div className="space-y-2 mb-4">
                    {currentQuestion.options.map((opt, optIdx) => (
                      <label
                        key={optIdx}
                        onClick={() => {
                          onAnswer(currentQuestion.id, currentQuestion.question, opt, customNote || undefined);
                        }}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          currentAnswer?.selectedOption === opt
                            ? "bg-pink-500/10 border-pink-500/30"
                            : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/15"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            currentAnswer?.selectedOption === opt
                              ? "border-pink-400 bg-pink-500"
                              : "border-white/30"
                          }`}
                        >
                          {currentAnswer?.selectedOption === opt && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            currentAnswer?.selectedOption === opt ? "text-white" : "text-white/70"
                          }`}
                        >
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Optional Note Textarea */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-white/40 mb-1.5">
                      <MessageSquare size={11} />
                      Eklemek istediğin bir şey var mı? (opsiyonel)
                    </label>
                    <textarea
                      value={customNote}
                      onChange={(e) => {
                        setCustomNote(e.target.value);
                        if (currentAnswer) {
                          onAnswer(currentQuestion.id, currentQuestion.question, currentAnswer.selectedOption, e.target.value || undefined);
                        }
                      }}
                      placeholder="Serbest metin..."
                      rows={2}
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-pink-500/30 transition-all resize-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6">
              {step > 0 ? (
                <button
                  onClick={onBack}
                  disabled={generating}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white/50 bg-white/[0.05] border border-white/10 hover:text-white/70 hover:bg-white/[0.08] transition-all disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                  Geri
                </button>
              ) : (
                <div />
              )}

              {isLastStep ? (
                <button
                  onClick={onComplete}
                  disabled={generating || !!(currentQuestion && !currentAnswer)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-[0_4px_15px_rgba(255,42,133,0.4)] hover:shadow-[0_6px_20px_rgba(255,42,133,0.5)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {generating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  {generating ? "Oluşturuluyor..." : "Plan Oluştur"}
                </button>
              ) : (
                <button
                  onClick={onNext}
                  disabled={isAnalysisStep ? false : !currentAnswer}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30 hover:bg-pink-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isAnalysisStep ? "Sorulara Geç" : "Devam"}
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
