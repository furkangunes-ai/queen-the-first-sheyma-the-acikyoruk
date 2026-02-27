"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { clsx } from 'clsx';
import { CheckCircle2, Circle, TrendingUp, Calendar, AlertCircle, Loader2, GraduationCap, Heart, CheckCircle, CheckSquare, ChevronRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface DashboardTask {
  id: string;
  title: string;
  completed: boolean;
  priority: string;
  folder: { name: string; color: string } | null;
  completions: Array<{ completedAt: string }>;
}

interface DashboardExam {
  id: string;
  title: string;
  date: string;
  examType: { name: string };
  subjectResults: Array<{
    subjectId: string;
    subject: { name: string };
    correctCount: number;
    wrongCount: number;
    emptyCount: number;
    netScore: number;
  }>;
}

interface DashboardCheckIn {
  id: string;
  mood: number | null;
  energy: number | null;
  sleep: number | null;
  date: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [exams, setExams] = useState<DashboardExam[]>([]);
  const [todayCheckIn, setTodayCheckIn] = useState<DashboardCheckIn | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiInsightLoading, setAiInsightLoading] = useState(false);

  const userName = session?.user?.name || 'Kullanıcı';
  const isAdmin = (session?.user as any)?.role === 'admin';

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksRes, examsRes, checkInRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/exams?limit=5'),
        fetch('/api/check-ins?limit=1'),
      ]);

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }
      if (examsRes.ok) {
        const examsData = await examsRes.json();
        setExams(examsData);
      }
      if (checkInRes.ok) {
        const checkInsData = await checkInRes.json();
        if (checkInsData.length > 0) {
          const latest = checkInsData[0];
          const today = format(new Date(), 'yyyy-MM-dd');
          const checkInDate = format(new Date(latest.date), 'yyyy-MM-dd');
          if (checkInDate === today) {
            setTodayCheckIn(latest);
          }
        }
      }
    } catch (err) {
      console.error('Dashboard verileri yüklenirken hata:', err);
      toast.error('Dashboard verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Fetch AI daily insight (only for AI-enabled users — silently fails otherwise)
  useEffect(() => {
    const fetchAIInsight = async () => {
      try {
        setAiInsightLoading(true);
        const res = await fetch('/api/ai/dashboard-insight');
        if (res.ok) {
          const data = await res.json();
          if (data.content) {
            setAiInsight(data.content);
          }
        }
        // 403 = AI not enabled — silently ignore
      } catch {
        // Silently ignore — don't break dashboard
      } finally {
        setAiInsightLoading(false);
      }
    };
    fetchAIInsight();
  }, []);

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const todaysTasks = pendingTasks.slice(0, 5);

  const lastExam = exams.length > 0 ? exams[0] : null;
  const lastExamTotalNet = lastExam
    ? lastExam.subjectResults.reduce((sum, sr) => sum + sr.netScore, 0)
    : 0;

  const averageNet = exams.length > 0
    ? (exams.reduce((sum, exam) =>
      sum + exam.subjectResults.reduce((s, sr) => s + sr.netScore, 0), 0
    ) / exams.length).toFixed(1)
    : '0';

  const MOOD_EMOJIS: Record<number, string> = {
    1: '\u{1F61E}',
    2: '\u{1F615}',
    3: '\u{1F610}',
    4: '\u{1F642}',
    5: '\u{1F60A}',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="animate-spin text-pink-500" size={40} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 h-full">
      {/* Left Column: Welcome & Quick Stats */}
      <div className="flex flex-col gap-6 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 lg:p-8 relative overflow-hidden group"
        >
          {/* Decorative background glow inside the card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-pink-500/20 transition-colors duration-500" />

          <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-gradient-candy relative z-10">
            Merhaba, {userName}!
          </h1>
          <p className="text-white/60 mb-8 font-medium text-[15px] max-w-sm relative z-10">
            Bugün {format(new Date(), 'd MMMM EEEE', { locale: tr })}.
            {!isAdmin ? ' Hedeflerine ulaşmak için harika bir gün ✨' : ' Yönetici paneline hoş geldin.'}
          </p>

          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="glass bg-white/[0.03] p-5 rounded-3xl border border-white/5 hover-lift">
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <TrendingUp size={18} />
                <span className="font-bold text-xs uppercase tracking-wider">Ortalama</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white tracking-tighter">{averageNet}</span>
                <span className="text-sm text-white/40 font-medium">net</span>
              </div>
            </div>
            <div className="glass bg-white/[0.03] p-5 rounded-3xl border border-white/5 hover-lift">
              <div className="flex items-center gap-2 text-pink-400 mb-2">
                <AlertCircle size={18} />
                <span className="font-bold text-xs uppercase tracking-wider">Bekleyen</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white tracking-tighter">{pendingTasks.length}</span>
                <span className="text-sm text-white/40 font-medium">görev</span>
              </div>
            </div>
          </div>

          {/* Today's Check-in Status */}
          <div className="mt-6 pt-5 border-t border-white/5 relative z-10">
            {todayCheckIn ? (
              <div className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-full text-2xl shadow-inner border border-white/10">
                  {MOOD_EMOJIS[todayCheckIn.mood || 3]}
                </div>
                <div>
                  <span className="text-sm font-semibold text-white/80">Bugünkü ruh halin</span>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {todayCheckIn.energy && (
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-1 rounded-full border border-cyan-500/20 uppercase tracking-widest font-bold">
                        Enerji: {todayCheckIn.energy}/5
                      </span>
                    )}
                    {todayCheckIn.sleep && (
                      <span className="text-[10px] bg-pink-500/10 text-pink-300 px-2 py-1 rounded-full border border-pink-500/20 uppercase tracking-widest font-bold">
                        Uyku: {todayCheckIn.sleep} saat
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => router.push('/check-in')}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-pink-500/30 text-pink-300 hover:bg-pink-500/10 hover:border-pink-500/50 transition-all font-medium text-sm"
              >
                <Heart size={16} className="animate-pulse" />
                <span>Bugünkü check-in'ini henüz yapmadın →</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* AI Daily Insight */}
        {(aiInsight || aiInsightLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-panel p-5 lg:p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[50px] pointer-events-none" />
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Sparkles size={14} className="text-white" />
              </div>
              <span className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-bold">Günün Önerisi</span>
            </div>
            {aiInsightLoading ? (
              <div className="flex items-center gap-2 py-2 relative z-10">
                <div className="w-2 h-2 rounded-full bg-amber-400/60 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-amber-400/40 animate-pulse [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-amber-400/20 animate-pulse [animation-delay:0.4s]" />
              </div>
            ) : (
              <p className="text-sm text-white/65 leading-relaxed relative z-10">{aiInsight}</p>
            )}
          </motion.div>
        )}

        {/* Last Exam Result */}
        {lastExam && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div
              className="glass-panel p-6 lg:p-8 cursor-pointer hover-lift group relative overflow-hidden"
              onClick={() => router.push(`/exams/${lastExam.id}`)}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-cyan-500/20 transition-colors duration-500" />

              <div className="flex justify-between items-start mb-6 relative z-10">
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <GraduationCap className="text-pink-400" size={24} />
                  Son Deneme Sonucu
                </h2>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${lastExam.examType.name === 'TYT' ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20' : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                    }`}>
                    {lastExam.examType.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center py-8 relative z-10">
                <div className="w-36 h-36 rounded-full glass border border-pink-400/30 flex items-center justify-center bg-white/[0.02] shadow-[inset_0_0_20px_rgba(255,42,133,0.1)] relative z-10 glow-pink-soft group-hover:glow-pink transition-all duration-300">
                  <div className="text-center">
                    <span className="block text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-pink-400 to-pink-600">
                      {lastExamTotalNet.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-1 block">Net</span>
                  </div>
                </div>
                {/* Decorative rotating dashed ring */}
                <div className="absolute w-44 h-44 rounded-full border border-dashed border-cyan-400/30 animate-[spin_10s_linear_infinite] opacity-50"></div>
                <div className="absolute w-[184px] h-[184px] rounded-full border border-dashed border-pink-400/20 animate-[spin_15s_linear_infinite_reverse] opacity-50"></div>
              </div>

              <div className="text-center mt-4 relative z-10">
                <h3 className="font-semibold text-white/80">{lastExam.title}</h3>
                <p className="text-xs text-white/40 uppercase tracking-widest mt-1 mb-4">
                  {format(new Date(lastExam.date), 'dd MMMM yyyy', { locale: tr })}
                </p>
                <div className="flex flex-wrap justify-center gap-2 lg:gap-3 mt-2">
                  {lastExam.subjectResults.slice(0, 4).map(sr => (
                    <span key={sr.subjectId} className="text-[11px] bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/5 text-white/60 font-medium">
                      {sr.subject.name}: <span className="font-bold text-white">{sr.netScore.toFixed(1)}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!lastExam && (
          <div className="glass-panel text-center py-12 px-6">
            <GraduationCap className="mx-auto text-pink-400/40 mb-4" size={48} />
            <h2 className="text-xl font-bold text-white/60 mb-2">Henüz deneme eklenmemiş</h2>
            <p className="text-sm text-white/40 mb-6">İlk deneme sonucunu ekleyerek ilerlemeni takip etmeye başla.</p>
            <button
              onClick={() => router.push('/exams')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 text-white px-6 py-2.5 rounded-full font-medium text-sm transition-all shadow-lg shadow-pink-500/20"
            >
              İlk Denemeyi Ekle
            </button>
          </div>
        )}
      </div>

      {/* Right Column: Todo List */}
      <div className="h-full">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel h-full flex flex-col relative"
        >
          <div className="p-6 lg:p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <CheckSquare size={24} className="text-cyan-400" />
                Yapılacaklar
              </h2>
              <div className="glass bg-white/[0.05] border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="text-xs font-bold text-pink-300">{completedTasks.length}</span>
                <span className="text-xs text-white/30">/</span>
                <span className="text-xs font-bold text-white/70">{tasks.length}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 no-scrollbar">
              {todaysTasks.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center relative">
                  <div className="absolute inset-0 bg-pink-500/5 blur-3xl rounded-full" />
                  <CheckCircle size={48} className="text-pink-400/20 mb-4" />
                  <p className="text-white/40 font-medium z-10">Bugün için bekleyen görev yok!</p>
                  <p className="text-white/30 text-sm mt-1 z-10">Harika gidiyorsun.</p>
                </div>
              ) : (
                todaysTasks.map((task, idx) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + (idx * 0.05) }}
                    className="group flex items-start gap-4 p-4 glass bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-pink-500/30 rounded-2xl transition-all duration-300 cursor-pointer"
                    onClick={() => router.push('/tasks')}
                  >
                    <div className="mt-0.5 relative">
                      {task.completed ? (
                        <CheckCircle2 size={22} className="text-cyan-400" />
                      ) : (
                        <>
                          <Circle size={22} className="text-white/20 group-hover:text-pink-400/50 transition-colors" />
                          <div className="absolute inset-0 bg-pink-400/20 rounded-full scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-md" />
                        </>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={clsx("text-[15px] leading-snug font-medium transition-colors",
                        task.completed ? "line-through text-white/30" : "text-white/80 group-hover:text-white"
                      )}>
                        {task.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {task.folder && (
                          <span className="text-[10px] glass bg-white/[0.05] px-2 py-1 rounded-md text-white/60 border border-white/10 uppercase tracking-widest font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.folder.color || '#ff2a85' }} />
                            {task.folder.name}
                          </span>
                        )}
                        {task.priority === 'high' && (
                          <span className="text-[10px] bg-rose-500/10 px-2 py-1 rounded-md text-rose-400 border border-rose-500/20 uppercase tracking-widest font-bold">
                            Yüksek Öncelik
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}

              {pendingTasks.length > 5 && (
                <div className="text-center pt-6 pb-2">
                  <button
                    onClick={() => router.push('/tasks')}
                    className="inline-flexItems-center justify-center gap-2 text-sm text-pink-400 hover:text-pink-300 font-medium transition-colors hover:glow-pink-soft px-4 py-2 rounded-full border border-transparent hover:border-pink-500/30"
                  >
                    Tümünü Gör ({pendingTasks.length} görev) →
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
