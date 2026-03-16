"use client";

import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * Compact streak counter for the top header bar.
 * Shows flame icon + current streak number.
 * Fetches from /api/gamification on mount.
 */
export default function CompactStreak() {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/gamification')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.streak) setStreak(data.streak.currentStreak ?? 0);
      })
      .catch(() => {});
  }, []);

  if (streak === null) return null;

  return (
    <div className={clsx(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-bold transition-all",
      streak > 0
        ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
        : "bg-white/[0.03] border-white/10 text-white/30"
    )}>
      <Flame size={14} className={streak > 0 ? "text-orange-400" : "text-white/20"} />
      <span className="tabular-nums">{streak}</span>
    </div>
  );
}
