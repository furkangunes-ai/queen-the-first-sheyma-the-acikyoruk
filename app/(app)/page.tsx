"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Handwriting, Tape } from '@/components/skeuomorphic';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { clsx } from 'clsx';
import { CheckCircle2, Circle, TrendingUp, Calendar, AlertCircle, Loader2, GraduationCap, Heart } from 'lucide-react';
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
    } catch {
      toast.error('Dashboard verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
      {/* Left Column: Welcome & Quick Stats */}
      <div className="flex flex-col gap-8">
        <Paper className="rotate-[-1deg]">
          <Tape className="-top-3 left-1/2 -translate-x-1/2" />
          <Handwriting as="h1" className="text-3xl mb-2 text-slate-900">
            Merhaba, {userName}!
          </Handwriting>
          <p className="text-slate-600 mb-6 font-medium">
            Bugün {format(new Date(), 'd MMMM EEEE', { locale: tr })}.
            {!isAdmin ? ' Hedeflerine ulaşmak için harika bir gün.' : ' Yönetici paneline hoş geldin.'}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-yellow-50 p-4 rounded border border-yellow-200 shadow-inner">
              <div className="flex items-center gap-2 text-yellow-700 mb-1">
                <TrendingUp size={18} />
                <span className="font-bold text-xs uppercase tracking-wider">Ortalama</span>
              </div>
              <span className="text-3xl font-serif text-slate-800">{averageNet}</span>
              <span className="text-xs text-slate-500 ml-1">net</span>
            </div>
            <div className="bg-blue-50 p-4 rounded border border-blue-200 shadow-inner">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <AlertCircle size={18} />
                <span className="font-bold text-xs uppercase tracking-wider">Bekleyen</span>
              </div>
              <span className="text-3xl font-serif text-slate-800">{pendingTasks.length}</span>
              <span className="text-xs text-slate-500 ml-1">görev</span>
            </div>
          </div>

          {/* Today's Check-in Status */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            {todayCheckIn ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl">{MOOD_EMOJIS[todayCheckIn.mood || 3]}</span>
                <div>
                  <span className="text-sm font-medium text-slate-600">Bugünkü ruh halin</span>
                  <div className="flex gap-2 mt-0.5">
                    {todayCheckIn.energy && (
                      <span className="text-[10px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-200 uppercase tracking-wide font-bold">
                        Enerji: {todayCheckIn.energy}/5
                      </span>
                    )}
                    {todayCheckIn.sleep && (
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200 uppercase tracking-wide font-bold">
                        Uyku: {todayCheckIn.sleep} saat
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => router.push('/check-in')}
                className="w-full flex items-center gap-2 text-sm text-slate-400 hover:text-blue-500 transition-colors"
              >
                <Heart size={16} />
                <span>Bugünkü check-in&apos;ini henüz yapmadın →</span>
              </button>
            )}
          </div>
        </Paper>

        {/* Last Exam Result */}
        {lastExam && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Paper
              className="rotate-[1deg] bg-indigo-50/50 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/exams/${lastExam.id}`)}
            >
              <Tape className="-top-3 right-10" />
              <div className="flex justify-between items-start mb-4">
                <Handwriting className="text-xl">Son Deneme</Handwriting>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    lastExam.examType.name === 'TYT' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {lastExam.examType.name}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    {format(new Date(lastExam.date), 'dd.MM.yyyy')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center py-6 relative">
                <div className="w-32 h-32 rounded-full border-4 border-indigo-200 flex items-center justify-center bg-white shadow-sm z-10">
                  <div className="text-center">
                    <span className="block text-3xl font-bold text-indigo-900">
                      {lastExamTotalNet.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">Toplam Net</span>
                  </div>
                </div>
                <div className="absolute w-40 h-40 rounded-full border border-dashed border-indigo-300 animate-spin-slow opacity-50"></div>
              </div>

              <div className="text-center mt-2">
                <h3 className="font-bold text-slate-700">{lastExam.title}</h3>
                <div className="flex justify-center gap-3 mt-1">
                  {lastExam.subjectResults.slice(0, 4).map(sr => (
                    <span key={sr.subjectId} className="text-[10px] text-slate-500">
                      {sr.subject.name}: <span className="font-bold">{sr.netScore.toFixed(1)}</span>
                    </span>
                  ))}
                </div>
              </div>
            </Paper>
          </motion.div>
        )}

        {!lastExam && (
          <Paper className="rotate-[1deg] text-center py-10">
            <GraduationCap className="mx-auto text-slate-300 mb-3" size={40} />
            <Handwriting className="text-lg text-slate-400">Henüz deneme eklenmemiş</Handwriting>
            <button
              onClick={() => router.push('/exams')}
              className="mt-3 text-sm text-blue-500 hover:text-blue-700 transition-colors"
            >
              İlk denemeyi ekle →
            </button>
          </Paper>
        )}
      </div>

      {/* Right Column: Todo List */}
      <div className="h-full">
        <Paper className="h-full flex flex-col relative rotate-[0.5deg]">
          <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-slate-100 to-transparent z-10 rounded-t"></div>

          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-slate-100 border-dashed">
            <Handwriting className="text-2xl">Yapılacaklar</Handwriting>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{completedTasks.length}/{tasks.length}</span>
              <Calendar className="text-slate-400" size={20} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {todaysTasks.length === 0 ? (
              <div className="text-center py-10 text-slate-400 italic">
                Bugün için bekleyen görev yok!
              </div>
            ) : (
              todaysTasks.map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group flex items-start gap-3 p-3 hover:bg-yellow-50/50 rounded transition-colors cursor-pointer"
                  onClick={() => router.push('/tasks')}
                >
                  <div className="mt-0.5 text-slate-400">
                    {task.completed ? <CheckCircle2 size={20} className="text-green-600" /> : <Circle size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className={clsx("text-slate-700 leading-snug font-medium", task.completed && "line-through text-slate-400")}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {task.folder && (
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200 uppercase tracking-wide">
                          {task.folder.name}
                        </span>
                      )}
                      {task.priority === 'high' && (
                        <span className="text-[10px] bg-red-50 px-1.5 py-0.5 rounded text-red-500 border border-red-200 uppercase tracking-wide font-bold">
                          Yüksek
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}

            {pendingTasks.length > 5 && (
              <div className="text-center pt-4">
                <button
                  onClick={() => router.push('/tasks')}
                  className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                >
                  ve {pendingTasks.length - 5} görev daha →
                </button>
              </div>
            )}
          </div>
        </Paper>
      </div>
    </div>
  );
}
