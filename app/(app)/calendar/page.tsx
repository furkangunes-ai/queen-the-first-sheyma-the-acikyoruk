"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Brain,
  CheckSquare,
  Heart,
  Clock,
  Loader2,
} from "lucide-react";

// ---------- Types ----------

interface StudyEntry {
  subject: string;
  duration: number;
  questionCount: number;
  correctCount: number;
}

interface ExerciseEntry {
  exerciseType: string;
  difficulty: number;
  score: number;
  duration: number;
}

interface ReviewEntry {
  confidence: number;
  method: string;
  duration: number;
}

interface PlanItem {
  item: {
    subjectName: string;
    topicName: string;
    duration: number;
    completed: boolean;
  };
  planId: string;
}

interface CheckInData {
  mood: number;
  energy: number;
  sleep: number;
}

interface DayData {
  studies: StudyEntry[];
  exercises: ExerciseEntry[];
  reviews: ReviewEntry[];
  planItems: PlanItem[];
  checkIn: CheckInData | null;
}

interface CalendarData {
  days: Record<string, DayData>;
  summary: {
    totalStudyDays: number;
    totalDuration: number;
    totalExercises: number;
  };
}

// ---------- Constants ----------

const MONTH_NAMES = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

const DAY_NAMES = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

// ---------- Helpers ----------

function getTodayString(): string {
  return new Date().toLocaleDateString("sv-SE", {
    timeZone: "Europe/Istanbul",
  });
}

function formatMonthParam(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function formatDayKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDurationSec(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins}dk`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hours}s ${rem}dk` : `${hours}s`;
}

function formatDurationMin(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}dk`;
  const hours = Math.floor(minutes / 60);
  const rem = Math.round(minutes % 60);
  return rem > 0 ? `${hours}s ${rem}dk` : `${hours}s`;
}

function getCalendarGrid(
  year: number,
  month: number
): Array<{ day: number; currentMonth: boolean; key: string }> {
  const firstDay = new Date(year, month, 1);
  // getDay() returns 0=Sun, we need Mon=0
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: Array<{
    day: number;
    currentMonth: boolean;
    key: string;
  }> = [];

  // Previous month trailing days
  for (let i = startDow - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    cells.push({
      day: d,
      currentMonth: false,
      key: formatDayKey(prevYear, prevMonth, d),
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      currentMonth: true,
      key: formatDayKey(year, month, d),
    });
  }

  // Next month leading days
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    for (let d = 1; d <= remaining; d++) {
      cells.push({
        day: d,
        currentMonth: false,
        key: formatDayKey(nextYear, nextMonth, d),
      });
    }
  }

  return cells;
}

function hasActivity(dayData: DayData | undefined): {
  study: boolean;
  plan: boolean;
  checkIn: boolean;
} {
  if (!dayData) return { study: false, plan: false, checkIn: false };
  return {
    study:
      dayData.studies.length > 0 ||
      dayData.exercises.length > 0 ||
      dayData.reviews.length > 0,
    plan: dayData.planItems.some((p) => p.item.completed),
    checkIn: dayData.checkIn !== null,
  };
}

// ---------- Component ----------

export default function CalendarPage() {
  const today = useMemo(() => getTodayString(), []);
  const todayDate = useMemo(() => new Date(today), [today]);

  const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth());
  const [selectedDay, setSelectedDay] = useState<string>(today);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      const monthParam = formatMonthParam(currentYear, currentMonth);
      const res = await fetch(
        `/api/calendar/activities?month=${monthParam}`
      );
      if (!res.ok) throw new Error("Fetch failed");
      const data: CalendarData = await res.json();
      setCalendarData(data);
    } catch {
      setCalendarData(null);
    } finally {
      setLoading(false);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const calendarGrid = useMemo(
    () => getCalendarGrid(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const selectedDayData = useMemo((): DayData | null => {
    if (!calendarData) return null;
    return calendarData.days[selectedDay] ?? null;
  }, [calendarData, selectedDay]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Total duration in seconds (studies/reviews are minutes, exercises are seconds)
  const totalDurationSec = useMemo(() => {
    if (!selectedDayData) return 0;
    let total = 0;
    selectedDayData.studies.forEach((s) => (total += s.duration * 60));
    selectedDayData.exercises.forEach((e) => (total += e.duration));
    selectedDayData.reviews.forEach((r) => (total += r.duration * 60));
    return total;
  }, [selectedDayData]);

  const selectedDateFormatted = useMemo(() => {
    const d = new Date(selectedDay);
    const dayNum = d.getDate();
    const monthName = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();
    return `${dayNum} ${monthName} ${year}`;
  }, [selectedDay]);

  const isFutureDay = useMemo(() => {
    return selectedDay > today;
  }, [selectedDay, today]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-full flex flex-col gap-6 lg:gap-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <CalendarDays className="text-cyan-400 w-8 h-8" />
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Aktivite Takvimi
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Calendar Panel */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="glass-panel p-5 sm:p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={goToPrevMonth}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06] border border-white/5 hover:border-cyan-500/30 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={goToNextMonth}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06] border border-white/5 hover:border-cyan-500/30 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Day Names Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAY_NAMES.map((name) => (
                <div
                  key={name}
                  className="text-center text-[11px] font-bold text-white/40 uppercase tracking-widest py-2"
                >
                  {name}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-cyan-400" size={32} />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {calendarGrid.map((cell) => {
                  const isToday = cell.key === today;
                  const isSelected = cell.key === selectedDay;
                  const activity = hasActivity(
                    calendarData?.days[cell.key]
                  );
                  const hasAny =
                    activity.study || activity.plan || activity.checkIn;

                  return (
                    <button
                      key={cell.key}
                      onClick={() => setSelectedDay(cell.key)}
                      className={`
                        relative aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 text-sm font-semibold border
                        ${
                          !cell.currentMonth
                            ? "text-white/15 border-transparent hover:bg-white/[0.02]"
                            : isSelected
                              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_16px_rgba(0,240,255,0.15)]"
                              : isToday
                                ? "text-white border-cyan-400/40 ring-1 ring-cyan-400/40 hover:bg-white/[0.05]"
                                : "text-white/70 border-transparent hover:bg-white/[0.05] hover:border-white/10"
                        }
                      `}
                    >
                      <span>{cell.day}</span>

                      {/* Activity Dots */}
                      {hasAny && cell.currentMonth && (
                        <div className="flex items-center gap-0.5">
                          {activity.study && (
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          )}
                          {activity.plan && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          )}
                          {activity.checkIn && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-[11px] text-white/40 font-medium">
                  Çalışma
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] text-white/40 font-medium">
                  Plan tamamlandı
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[11px] text-white/40 font-medium">
                  Check-in
                </span>
              </div>
            </div>

            {/* Summary Stats */}
            {calendarData?.summary && !loading && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5">
                  <span className="text-lg font-bold text-cyan-400">
                    {calendarData.summary.totalStudyDays}
                  </span>
                  <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mt-0.5">
                    Çalışma Günü
                  </p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5">
                  <span className="text-lg font-bold text-emerald-400">
                    {formatDurationSec(calendarData.summary.totalDuration)}
                  </span>
                  <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mt-0.5">
                    Toplam Süre
                  </p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5">
                  <span className="text-lg font-bold text-amber-400">
                    {calendarData.summary.totalExercises}
                  </span>
                  <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mt-0.5">
                    Antrenman
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Day Detail Panel */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="glass-panel p-5 sm:p-6 sticky top-6">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/5">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {selectedDateFormatted}
              </h3>
              {totalDurationSec > 0 && (
                <span className="flex items-center gap-1.5 text-[11px] bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-lg border border-cyan-500/20 font-bold">
                  <Clock size={12} />
                  {formatDurationSec(totalDurationSec)}
                </span>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {!selectedDayData ||
                (selectedDayData.studies.length === 0 &&
                  selectedDayData.exercises.length === 0 &&
                  selectedDayData.reviews.length === 0 &&
                  selectedDayData.planItems.length === 0 &&
                  !selectedDayData.checkIn) ? (
                  <div className="text-center py-12 flex flex-col items-center">
                    <CalendarDays
                      className="text-white/10 mb-3"
                      size={48}
                    />
                    <p className="text-sm text-white/40 font-medium">
                      Bu gün için kayıt yok
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Studies */}
                    {selectedDayData.studies.length > 0 && (
                      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                        <h4 className="flex items-center gap-2 text-[11px] font-bold text-white/50 uppercase tracking-widest mb-3">
                          <BookOpen size={14} className="text-cyan-400" />
                          Günlük Çalışma
                        </h4>
                        <div className="space-y-2.5">
                          {selectedDayData.studies.map((s, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-white/80 truncate">
                                  {s.subject}
                                </p>
                                <p className="text-[11px] text-white/40">
                                  {s.questionCount} soru, {s.correctCount}{" "}
                                  doğru
                                </p>
                              </div>
                              <span className="text-[11px] text-cyan-400/70 font-semibold ml-2 shrink-0">
                                {formatDurationMin(s.duration)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Exercises */}
                    {selectedDayData.exercises.length > 0 && (
                      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                        <h4 className="flex items-center gap-2 text-[11px] font-bold text-white/50 uppercase tracking-widest mb-3">
                          <Brain size={14} className="text-purple-400" />
                          Antrenman
                        </h4>
                        <div className="space-y-2.5">
                          {selectedDayData.exercises.map((e, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-white/80 truncate">
                                  {e.exerciseType}
                                </p>
                                <p className="text-[11px] text-white/40">
                                  Zorluk {e.difficulty}, Skor{" "}
                                  {e.score}
                                </p>
                              </div>
                              <span className="text-[11px] text-purple-400/70 font-semibold ml-2 shrink-0">
                                {formatDurationSec(e.duration)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Plan Items */}
                    {selectedDayData.planItems.length > 0 && (
                      <div
                        className={`bg-white/[0.03] rounded-xl p-4 border border-white/5 ${isFutureDay ? "opacity-60" : ""}`}
                      >
                        <h4 className="flex items-center gap-2 text-[11px] font-bold text-white/50 uppercase tracking-widest mb-3">
                          <CheckSquare
                            size={14}
                            className="text-emerald-400"
                          />
                          Plan
                        </h4>
                        <div className="space-y-2.5">
                          {selectedDayData.planItems.map((p, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span
                                  className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                                    p.item.completed
                                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                                      : "border-white/10"
                                  }`}
                                >
                                  {p.item.completed && (
                                    <CheckSquare size={10} />
                                  )}
                                </span>
                                <div className="min-w-0">
                                  <p
                                    className={`text-[13px] font-semibold truncate ${p.item.completed ? "text-white/80" : "text-white/50"}`}
                                  >
                                    {p.item.subjectName}
                                  </p>
                                  <p className="text-[11px] text-white/30 truncate">
                                    {p.item.topicName}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[11px] text-emerald-400/60 font-semibold ml-2 shrink-0">
                                {formatDurationMin(p.item.duration)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Check-in */}
                    {selectedDayData.checkIn && (
                      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                        <h4 className="flex items-center gap-2 text-[11px] font-bold text-white/50 uppercase tracking-widest mb-3">
                          <Heart size={14} className="text-amber-400" />
                          Check-in
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <span className="text-lg font-bold text-amber-400">
                              {selectedDayData.checkIn.mood}
                            </span>
                            <p className="text-[10px] text-white/40 font-semibold mt-0.5">
                              Ruh Hali
                            </p>
                          </div>
                          <div className="text-center">
                            <span className="text-lg font-bold text-amber-400">
                              {selectedDayData.checkIn.energy}
                            </span>
                            <p className="text-[10px] text-white/40 font-semibold mt-0.5">
                              Enerji
                            </p>
                          </div>
                          <div className="text-center">
                            <span className="text-lg font-bold text-amber-400">
                              {selectedDayData.checkIn.sleep}s
                            </span>
                            <p className="text-[10px] text-white/40 font-semibold mt-0.5">
                              Uyku
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
