"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Flame, Award, Trophy, Loader2, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────

interface BadgeData {
  type: string;
  name: string;
  description: string;
  emoji: string;
  earnedAt: string;
}

interface GamificationData {
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string | null;
  };
  badges: BadgeData[];
  totalBadges: number;
  possibleBadges: number;
}

// ─── Streak Counter ───────────────────────────────

function StreakCounter({
  currentStreak,
  longestStreak,
}: {
  currentStreak: number;
  longestStreak: number;
}) {
  const isActive = currentStreak > 0;

  return (
    <div className="glass hover-lift p-5 relative overflow-hidden group">
      <div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity ${
          isActive ? "bg-orange-500/20" : "bg-white/5"
        }`}
      />

      <div className="flex items-center gap-4 relative z-10">
        <motion.div
          animate={
            isActive
              ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0],
                }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            isActive
              ? "bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 shadow-lg shadow-orange-500/20"
              : "bg-white/5 border border-white/10"
          }`}
        >
          <Flame
            size={28}
            className={isActive ? "text-orange-400" : "text-white/20"}
          />
        </motion.div>

        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-4xl font-bold tracking-tighter ${
                isActive ? "text-orange-400" : "text-white/30"
              }`}
            >
              {currentStreak}
            </span>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
              gün streak
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Trophy size={12} className="text-amber-400/60" />
            <span className="text-[10px] text-white/30 font-medium">
              En uzun: {longestStreak} gün
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Badge Showcase ───────────────────────────────

function BadgeShowcase({
  badges,
  totalBadges,
  possibleBadges,
}: {
  badges: BadgeData[];
  totalBadges: number;
  possibleBadges: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const displayBadges = expanded ? badges : badges.slice(0, 6);

  return (
    <div className="glass p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none opacity-20" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-amber-400" />
          <span className="text-white font-bold text-sm">Rozetler</span>
        </div>
        <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 font-bold">
          {totalBadges}/{possibleBadges}
        </span>
      </div>

      {badges.length === 0 ? (
        <div className="text-center py-4 relative z-10">
          <Star className="text-white/10 mx-auto mb-2" size={24} />
          <p className="text-white/30 text-xs">
            Henüz rozet kazanılmadı. Çalışmaya devam!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 relative z-10">
            {displayBadges.map((badge, i) => (
              <motion.div
                key={badge.type}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass bg-white/[0.03] rounded-xl border border-white/5 p-3 flex flex-col items-center text-center hover:border-amber-500/20 transition-colors group"
                title={badge.description}
              >
                <span className="text-2xl mb-1">{badge.emoji}</span>
                <span className="text-[10px] text-white/70 font-bold truncate w-full">
                  {badge.name}
                </span>
                <span className="text-[8px] text-white/30 mt-0.5">
                  {new Date(badge.earnedAt).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </motion.div>
            ))}
          </div>

          {badges.length > 6 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 text-xs text-amber-400/60 hover:text-amber-400 font-medium transition-colors relative z-10 w-full text-center"
            >
              {expanded
                ? "Daha az göster"
                : `+${badges.length - 6} rozet daha`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Widget ──────────────────────────────────

export default function StreakBadgeWidget() {
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/gamification");
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      // Silent fail — gamification is not critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="glass p-5 flex items-center justify-center">
        <Loader2 className="animate-spin text-white/20" size={20} />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      <StreakCounter
        currentStreak={data.streak.currentStreak}
        longestStreak={data.streak.longestStreak}
      />
      <BadgeShowcase
        badges={data.badges}
        totalBadges={data.totalBadges}
        possibleBadges={data.possibleBadges}
      />
    </div>
  );
}
