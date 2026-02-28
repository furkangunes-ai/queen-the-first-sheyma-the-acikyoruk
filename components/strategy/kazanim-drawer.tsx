"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Loader2,
  ChevronRight,
  Star,
  StickyNote,
  Check,
} from "lucide-react";
import { toast } from "sonner";
// Note: LEVEL_COLORS/LEVEL_LABELS from @/lib/constants use a different scale.
// This drawer uses OSYM-specific level labels and colors defined below.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface KazanimProgress {
  checked: boolean;
  notes: string | null;
}

interface Kazanim {
  id: string;
  topicId: string;
  code: string;
  subTopicName: string | null;
  description: string;
  details: string | null;
  isKeyKazanim: boolean;
  sortOrder: number;
  progress: KazanimProgress | null;
}

interface KazanimDrawerProps {
  open: boolean;
  onClose: () => void;
  topicId: string;
  topicName: string;
  onLevelChange?: (topicId: string, level: number) => void;
}

// ---------------------------------------------------------------------------
// Level config for the drawer (OSYM-style labels, as specified)
// ---------------------------------------------------------------------------

const DRAWER_LEVEL_LABELS: Record<number, string> = {
  0: "Hic bilmiyorum",
  1: "Cok az",
  2: "Temel",
  3: "Orta",
  4: "Iyi",
  5: "Cok iyi",
};

const DRAWER_LEVEL_COLORS: Record<number, string> = {
  0: "bg-white/20",
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-amber-500",
  4: "bg-emerald-500",
  5: "bg-green-500",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function KazanimDrawer({
  open,
  onClose,
  topicId,
  topicName,
  onLevelChange,
}: KazanimDrawerProps) {
  // Data
  const [kazanimlar, setKazanimlar] = useState<Kazanim[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  // Notes debounce timers
  const noteTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  // Track local note values for optimistic display
  const [localNotes, setLocalNotes] = useState<Map<string, string>>(new Map());

  // -------------------------------------------------------------------------
  // Fetch kazanimlar when drawer opens
  // -------------------------------------------------------------------------

  const fetchKazanimlar = useCallback(async () => {
    if (!topicId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/topic-kazanims?topicId=${topicId}`);
      if (!res.ok) throw new Error("Kazanimlar yuklenemedi");
      const data: Kazanim[] = await res.json();
      setKazanimlar(data);

      // Initialize local notes from existing progress
      const notesMap = new Map<string, string>();
      for (const k of data) {
        if (k.progress?.notes) {
          notesMap.set(k.id, k.progress.notes);
        }
      }
      setLocalNotes(notesMap);
    } catch (err) {
      console.error("KazanimDrawer: fetch failed", err);
      setError("Kazanimlar yuklenirken bir hata olustu.");
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    if (open) {
      fetchKazanimlar();
      // Reset UI state when opening
      setExpandedDetails(new Set());
      setExpandedNotes(new Set());
    }

    // Cleanup note timers on close
    return () => {
      noteTimers.current.forEach((timer) => clearTimeout(timer));
      noteTimers.current.clear();
    };
  }, [open, fetchKazanimlar]);

  // -------------------------------------------------------------------------
  // Grouped data
  // -------------------------------------------------------------------------

  const grouped = useMemo(() => {
    const map = new Map<string, Kazanim[]>();
    for (const k of kazanimlar) {
      const key = k.subTopicName ?? "__none__";
      const list = map.get(key) || [];
      list.push(k);
      map.set(key, list);
    }
    return map;
  }, [kazanimlar]);

  // -------------------------------------------------------------------------
  // Progress stats
  // -------------------------------------------------------------------------

  const { checkedCount, totalCount, percentage, autoLevel } = useMemo(() => {
    const total = kazanimlar.length;
    const checked = kazanimlar.filter((k) => k.progress?.checked).length;
    const pct = total > 0 ? Math.round((checked / total) * 100) : 0;

    // Auto-level: map percentage to 0-5
    let level = 0;
    if (pct >= 90) level = 5;
    else if (pct >= 70) level = 4;
    else if (pct >= 50) level = 3;
    else if (pct >= 30) level = 2;
    else if (pct >= 10) level = 1;
    else level = 0;

    return { checkedCount: checked, totalCount: total, percentage: pct, autoLevel: level };
  }, [kazanimlar]);

  // -------------------------------------------------------------------------
  // Toggle checkbox
  // -------------------------------------------------------------------------

  const toggleCheck = useCallback(
    async (kazanimId: string) => {
      const kazanim = kazanimlar.find((k) => k.id === kazanimId);
      if (!kazanim) return;

      const newChecked = !(kazanim.progress?.checked ?? false);

      // Optimistic update
      setKazanimlar((prev) =>
        prev.map((k) =>
          k.id === kazanimId
            ? {
                ...k,
                progress: {
                  checked: newChecked,
                  notes: k.progress?.notes ?? null,
                },
              }
            : k
        )
      );

      setSavingIds((prev) => new Set(prev).add(kazanimId));

      try {
        const res = await fetch("/api/kazanim-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kazanimId, checked: newChecked }),
        });

        if (!res.ok) throw new Error("Kaydedilemedi");

        const data = await res.json();

        // If API returns autoLevel, propagate to parent
        if (data.autoLevel !== undefined && onLevelChange) {
          onLevelChange(topicId, data.autoLevel);
        }
      } catch (err) {
        console.error("KazanimDrawer: toggle failed", err);
        toast.error("Kazanim durumu kaydedilemedi");

        // Revert optimistic update
        setKazanimlar((prev) =>
          prev.map((k) =>
            k.id === kazanimId
              ? {
                  ...k,
                  progress: kazanim.progress,
                }
              : k
          )
        );
      } finally {
        setSavingIds((prev) => {
          const next = new Set(prev);
          next.delete(kazanimId);
          return next;
        });
      }
    },
    [kazanimlar, topicId, onLevelChange]
  );

  // -------------------------------------------------------------------------
  // Notes — debounced auto-save
  // -------------------------------------------------------------------------

  const saveNotes = useCallback(
    async (kazanimId: string, notes: string) => {
      setSavingIds((prev) => new Set(prev).add(kazanimId));

      try {
        const res = await fetch("/api/kazanim-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kazanimId, notes }),
        });

        if (!res.ok) throw new Error("Not kaydedilemedi");

        // Update kazanimlar with saved notes
        setKazanimlar((prev) =>
          prev.map((k) =>
            k.id === kazanimId
              ? {
                  ...k,
                  progress: {
                    checked: k.progress?.checked ?? false,
                    notes: notes || null,
                  },
                }
              : k
          )
        );
      } catch (err) {
        console.error("KazanimDrawer: save notes failed", err);
        toast.error("Not kaydedilemedi");
      } finally {
        setSavingIds((prev) => {
          const next = new Set(prev);
          next.delete(kazanimId);
          return next;
        });
      }
    },
    []
  );

  const handleNoteChange = useCallback(
    (kazanimId: string, value: string) => {
      // Update local state immediately
      setLocalNotes((prev) => {
        const next = new Map(prev);
        next.set(kazanimId, value);
        return next;
      });

      // Clear existing timer
      const existing = noteTimers.current.get(kazanimId);
      if (existing) clearTimeout(existing);

      // Set new debounced save
      const timer = setTimeout(() => {
        saveNotes(kazanimId, value);
        noteTimers.current.delete(kazanimId);
      }, 800);

      noteTimers.current.set(kazanimId, timer);
    },
    [saveNotes]
  );

  // -------------------------------------------------------------------------
  // Toggle helpers
  // -------------------------------------------------------------------------

  const toggleDetails = useCallback((id: string) => {
    setExpandedDetails((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleNotes = useCallback((id: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // -------------------------------------------------------------------------
  // Close on Escape
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // -------------------------------------------------------------------------
  // Lock body scroll when open
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[#0f0f23]/95 backdrop-blur-xl border-l border-white/10 flex flex-col"
          >
            {/* ---- Header ---- */}
            <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-white/10 shrink-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-white/90 truncate">
                  {topicName}
                </h2>

                {/* Auto-level badge */}
                {totalCount > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-white/50">Seviye:</span>
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2, 3, 4, 5].map((lvl) => (
                        <span
                          key={lvl}
                          className={`w-2 h-2 rounded-full transition-all ${
                            lvl <= autoLevel
                              ? DRAWER_LEVEL_COLORS[lvl]
                              : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-white/70">
                      {autoLevel}/5 - {DRAWER_LEVEL_LABELS[autoLevel]}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ---- Body (scrollable) ---- */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
                  <span className="ml-3 text-sm text-white/50">
                    Kazanimlar yukleniyor...
                  </span>
                </div>
              )}

              {/* Error */}
              {error && !loading && (
                <div className="text-center py-16">
                  <p className="text-sm text-red-400">{error}</p>
                  <button
                    onClick={fetchKazanimlar}
                    className="mt-3 text-xs text-pink-400 hover:text-pink-300 underline"
                  >
                    Tekrar dene
                  </button>
                </div>
              )}

              {/* Empty state */}
              {!loading && !error && kazanimlar.length === 0 && (
                <div className="text-center py-16 text-white/30">
                  <p className="text-sm">
                    Bu konu icin kazanim bulunamadi.
                  </p>
                </div>
              )}

              {/* Kazanim groups */}
              {!loading && !error && kazanimlar.length > 0 && (
                <div className="space-y-5">
                  {Array.from(grouped.entries()).map(
                    ([groupName, groupKazanimlar]) => (
                      <div key={groupName}>
                        {/* SubTopic header */}
                        {groupName !== "__none__" && (
                          <div className="text-xs font-semibold text-white/60 uppercase tracking-wide pb-2 mb-3 border-b border-white/10">
                            {groupName}
                          </div>
                        )}

                        {/* Kazanim rows */}
                        <div className="space-y-2">
                          {groupKazanimlar.map((kazanim, idx) => {
                            const isChecked =
                              kazanim.progress?.checked ?? false;
                            const isSaving = savingIds.has(kazanim.id);
                            const hasDetails =
                              kazanim.details && kazanim.details.trim().length > 0;
                            const isDetailsOpen = expandedDetails.has(
                              kazanim.id
                            );
                            const isNotesOpen = expandedNotes.has(kazanim.id);
                            const noteValue =
                              localNotes.get(kazanim.id) ??
                              kazanim.progress?.notes ??
                              "";

                            return (
                              <motion.div
                                key={kazanim.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.15,
                                  delay: idx * 0.02,
                                }}
                                className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden"
                              >
                                {/* Main row */}
                                <div className="flex items-start gap-3 px-3.5 py-3">
                                  {/* Checkbox */}
                                  <button
                                    onClick={() => toggleCheck(kazanim.id)}
                                    disabled={isSaving}
                                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${
                                      isChecked
                                        ? "bg-pink-500 border-pink-500 text-white"
                                        : "border-white/20 bg-transparent hover:border-pink-400/50"
                                    } ${
                                      isSaving
                                        ? "opacity-50 cursor-not-allowed"
                                        : "cursor-pointer"
                                    }`}
                                  >
                                    {isChecked && (
                                      <Check className="w-3 h-3" />
                                    )}
                                  </button>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {/* Code badge */}
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20 shrink-0">
                                        {kazanim.code}
                                      </span>

                                      {/* Key kazanim marker */}
                                      {kazanim.isKeyKazanim && (
                                        <Star className="w-3 h-3 text-amber-400 shrink-0" />
                                      )}
                                    </div>

                                    {/* Description */}
                                    <p
                                      className={`text-sm mt-1 leading-relaxed transition-colors ${
                                        isChecked
                                          ? "text-white/40 line-through"
                                          : "text-white/80"
                                      }`}
                                    >
                                      {kazanim.description}
                                    </p>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-3 mt-2">
                                      {/* Details toggle */}
                                      {hasDetails && (
                                        <button
                                          onClick={() =>
                                            toggleDetails(kazanim.id)
                                          }
                                          className="flex items-center gap-1 text-[11px] text-white/40 hover:text-pink-400 transition-colors"
                                        >
                                          <motion.div
                                            animate={{
                                              rotate: isDetailsOpen ? 90 : 0,
                                            }}
                                            transition={{ duration: 0.15 }}
                                          >
                                            <ChevronRight className="w-3 h-3" />
                                          </motion.div>
                                          Detaylar
                                        </button>
                                      )}

                                      {/* Notes toggle */}
                                      <button
                                        onClick={() =>
                                          toggleNotes(kazanim.id)
                                        }
                                        className={`flex items-center gap-1 text-[11px] transition-colors ${
                                          isNotesOpen || noteValue
                                            ? "text-pink-400"
                                            : "text-white/40 hover:text-pink-400"
                                        }`}
                                      >
                                        <StickyNote className="w-3 h-3" />
                                        Not
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Expandable: Details */}
                                <AnimatePresence initial={false}>
                                  {hasDetails && isDetailsOpen && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{
                                        height: "auto",
                                        opacity: 1,
                                      }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{
                                        duration: 0.2,
                                        ease: "easeInOut",
                                      }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-3.5 pb-3 pl-12">
                                        <div className="text-xs text-white/50 leading-relaxed whitespace-pre-line bg-white/[0.02] rounded-lg px-3 py-2 border border-white/[0.04]">
                                          {kazanim.details}
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* Expandable: Notes */}
                                <AnimatePresence initial={false}>
                                  {isNotesOpen && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{
                                        height: "auto",
                                        opacity: 1,
                                      }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{
                                        duration: 0.2,
                                        ease: "easeInOut",
                                      }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-3.5 pb-3 pl-12">
                                        <textarea
                                          value={noteValue}
                                          onChange={(e) =>
                                            handleNoteChange(
                                              kazanim.id,
                                              e.target.value
                                            )
                                          }
                                          placeholder="Notlarini buraya yaz..."
                                          rows={2}
                                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/20 resize-none focus:outline-none focus:border-pink-500/30 transition-colors"
                                        />
                                        {isSaving && (
                                          <div className="flex items-center gap-1 mt-1">
                                            <Loader2 className="w-3 h-3 text-pink-400 animate-spin" />
                                            <span className="text-[10px] text-white/30">
                                              Kaydediliyor...
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* ---- Footer: Progress bar ---- */}
            {!loading && totalCount > 0 && (
              <div className="shrink-0 px-5 py-4 border-t border-white/10">
                {/* Progress text */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">
                    {checkedCount}/{totalCount} kazanim tamamlandi
                  </span>
                  <span className="text-xs font-medium text-pink-400">
                    %{percentage}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{
                      type: "spring",
                      damping: 20,
                      stiffness: 200,
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-pink-500 to-pink-400"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
