"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { clsx } from 'clsx';
import { getTurkeyDateString } from '@/lib/utils';
import {
  Circle,
  Loader2,
  CheckCircle,
  CalendarDays,
  Clock,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import ActionHub from '@/components/home/action-hub';
import NextActionWidget from '@/components/home/next-action-widget';
import StreakBadgeWidget from '@/components/gamification/streak-badge-widget';

interface WeeklyPlanItem {
  id: string;
  dayOfWeek: number;
  duration: number | null;
  questionCount: number | null;
  completed: boolean;
  notes: string | null;
  sortOrder: number;
  subject: {
    id: string;
    name: string;
    examType: { id: string; name: string };
  };
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

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const userName = session?.user?.name || 'Kullanici';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [planRes, gamRes] = await Promise.all([
        fetch('/api/weekly-plans?current=true'),
        fetch('/api/gamification'),
      ]);
      if (planRes.ok) {
        setWeeklyPlan(await planRes.json());
      }
      if (gamRes.ok) {
        const gamData = await gamRes.json();
        setStreak(gamData.streak?.currentStreak ?? 0);
      }
    } catch (err) {
      console.error('Dashboard verileri yuklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Turkiye saatine gore bugunun gununu hesapla (0=Pazartesi..6=Pazar)
  const turkeyNow = new Date(getTurkeyDateString() + 'T12:00:00+03:00');
  const todayDayOfWeek = (turkeyNow.getDay() + 6) % 7;
  const todayPlanItems = weeklyPlan?.items?.filter(i => i.dayOfWeek === todayDayOfWeek) || [];
  const todayPlanCompleted = todayPlanItems.filter(i => i.completed).length;

  const handleTogglePlanItem = async (itemId: string, currentCompleted: boolean) => {
    if (!weeklyPlan) return;
    setWeeklyPlan(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId ? { ...item, completed: !currentCompleted } : item
        ),
      };
    });
    try {
      const res = await fetch(`/api/weekly-plans/${weeklyPlan.id}/items/${itemId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentCompleted }),
      });
      if (!res.ok) {
        setWeeklyPlan(prev => {
          if (!prev) return prev;
          return { ...prev, items: prev.items.map(item => item.id === itemId ? { ...item, completed: currentCompleted } : item) };
        });
        toast.error('Plan ogesi guncellenirken hata olustu');
      }
    } catch {
      setWeeklyPlan(prev => {
        if (!prev) return prev;
        return { ...prev, items: prev.items.map(item => item.id === itemId ? { ...item, completed: currentCompleted } : item) };
      });
      toast.error('Plan ogesi guncellenirken hata olustu');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="animate-spin text-pink-500" size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8 max-w-4xl mx-auto">
      {/* Welcome + Streak */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gradient-candy">
            Merhaba, {userName}!
          </h1>
          <p className="text-sm text-white/50 mt-1">
            {format(new Date(), 'd MMMM EEEE', { locale: tr })}
          </p>
        </div>
        {/* Compact Streak Counter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={clsx(
            "flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all",
            streak > 0
              ? "bg-orange-500/10 border-orange-500/20 shadow-lg shadow-orange-500/10"
              : "bg-white/[0.03] border-white/10"
          )}
        >
          <motion.div
            animate={streak > 0 ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4 }}
          >
            <Flame size={20} className={streak > 0 ? "text-orange-400" : "text-white/20"} />
          </motion.div>
          <span className={clsx(
            "text-xl font-bold tracking-tighter",
            streak > 0 ? "text-orange-400" : "text-white/30"
          )}>
            {streak}
          </span>
          <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold hidden sm:block">
            gun
          </span>
        </motion.div>
      </motion.div>

      {/* Siradaki Hamlen — Canli Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03 }}
      >
        <NextActionWidget />
      </motion.div>

      {/* Orta satir: Bugunun Plani + Streak/Rozet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {/* Bugunun Plani */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="glass-panel relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-48 h-48 bg-amber-500/8 rounded-full blur-[50px] pointer-events-none" />
          <div className="p-5 lg:p-6">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <CalendarDays size={20} className="text-amber-400" />
                Bugunun Plani
              </h2>
              {todayPlanItems.length > 0 && (
                <div className="glass bg-white/[0.05] border-white/10 px-3 py-1 rounded-xl flex items-center gap-1.5">
                  <span className="text-xs font-bold text-amber-300">{todayPlanCompleted}</span>
                  <span className="text-xs text-white/30">/</span>
                  <span className="text-xs font-bold text-white/70">{todayPlanItems.length}</span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {todayPlanItems.length > 0 && (
              <div className="mb-4 relative z-10">
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 to-pink-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(todayPlanCompleted / todayPlanItems.length) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 relative z-10">
              {todayPlanItems.length === 0 ? (
                <div className="text-center py-6 flex flex-col items-center">
                  <CalendarDays size={32} className="text-amber-400/20 mb-2" />
                  <p className="text-white/40 font-medium text-sm">Bugun icin plan yok</p>
                  <button
                    onClick={() => router.push('/plan')}
                    className="mt-3 flex items-center gap-1.5 text-xs text-amber-300/70 hover:text-amber-300 transition-colors"
                  >
                    <span>Plan olustur</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              ) : (
                todayPlanItems.slice(0, 5).map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + (idx * 0.03) }}
                    className={clsx(
                      "group flex items-center gap-3 p-2.5 lg:p-3 glass rounded-xl border transition-all duration-300 cursor-pointer",
                      item.completed
                        ? "bg-white/[0.01] border-white/5 opacity-50"
                        : "bg-white/[0.02] hover:bg-white/[0.05] border-white/5 hover:border-amber-500/30"
                    )}
                    onClick={() => handleTogglePlanItem(item.id, item.completed)}
                  >
                    <div className="flex-shrink-0">
                      {item.completed ? (
                        <CheckCircle size={16} className="text-amber-400" />
                      ) : (
                        <Circle size={16} className="text-white/20 group-hover:text-amber-400/50 transition-colors" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={clsx(
                        "text-[12px] font-medium transition-colors truncate",
                        item.completed ? "line-through text-white/30" : "text-white/80 group-hover:text-white"
                      )}>
                        {item.subject.name}
                        {item.topic && (
                          <span className="text-white/40 font-normal"> — {item.topic.name}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={clsx(
                        "text-[8px] px-1 py-0.5 rounded border uppercase tracking-widest font-bold",
                        item.subject.examType.name === 'TYT'
                          ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                          : "bg-purple-500/10 text-purple-300 border-purple-500/20"
                      )}>
                        {item.subject.examType.name}
                      </span>
                      {item.duration && (
                        <span className="text-[9px] text-white/30 flex items-center gap-0.5">
                          <Clock size={8} />
                          {item.duration}dk
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              {todayPlanItems.length > 5 && (
                <p className="text-[10px] text-white/25 text-center pt-1">
                  +{todayPlanItems.length - 5} daha
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Streak & Rozet Vitrini */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.09 }}
        >
          <StreakBadgeWidget />
        </motion.div>
      </div>

      {/* Alt satir: Calisma Bilgisi Gir + Verilerimi Analiz Et */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <ActionHub onNavigate={(path) => router.push(path)} />
      </motion.div>
    </div>
  );
}
