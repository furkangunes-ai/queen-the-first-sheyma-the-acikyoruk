"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Paper, Handwriting } from '@/components/skeuomorphic';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  Shield, Send, ClipboardList, Heart, TrendingUp, Loader2,
  CheckCircle2, Zap, Smile, FolderOpen, Bell, RefreshCw,
} from 'lucide-react';

// ---------- types ----------

interface TrendItem {
  examId: string;
  examTitle: string;
  date: string;
  examTypeName: string;
  totalNet: number;
  subjectNets: Array<{
    subjectId: string;
    subjectName: string;
    netScore: number;
  }>;
}

interface CheckIn {
  id: string;
  date: string;
  mood: number | null;
  energy: number | null;
  notes: string | null;
}

interface FolderItem {
  id: string;
  name: string;
  color: string;
}

interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
}

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender?: { displayName: string } | null;
}

interface UserItem {
  id: string;
  displayName: string;
  role: string;
}

// ---------- helpers ----------

const moodLabel = (v: number | null) => {
  if (v === null) return '-';
  const labels: Record<number, string> = { 1: 'Çok Kötü', 2: 'Kötü', 3: 'Normal', 4: 'İyi', 5: 'Harika' };
  return labels[v] ?? String(v);
};

const energyLabel = (v: number | null) => {
  if (v === null) return '-';
  const labels: Record<number, string> = { 1: 'Çok Düşük', 2: 'Düşük', 3: 'Orta', 4: 'Yüksek', 5: 'Çok Yüksek' };
  return labels[v] ?? String(v);
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'az önce';
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
};

// ---------- component ----------

export default function AdminPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const isAdmin = (session?.user as any)?.role === 'admin';

  // Redirect non-admin users
  useEffect(() => {
    if (sessionStatus === 'authenticated' && !isAdmin) {
      router.replace('/');
    }
  }, [sessionStatus, isAdmin, router]);

  // --- data states ---
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);

  const [loading, setLoading] = useState(true);

  // --- form states ---
  const [taskTitle, setTaskTitle] = useState('');
  const [taskFolderId, setTaskFolderId] = useState('');
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  const [msgRecipientId, setMsgRecipientId] = useState('');
  const [msgTitle, setMsgTitle] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [msgSubmitting, setMsgSubmitting] = useState(false);

  // --- fetch helpers ---

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [trendsRes, tasksRes, checkInsRes, foldersRes, notifsRes, usersRes] = await Promise.allSettled([
        fetch('/api/analytics/trends?limit=5'),
        fetch('/api/tasks'),
        fetch('/api/check-ins?limit=3'),
        fetch('/api/folders'),
        fetch('/api/notifications'),
        fetch('/api/users'),
      ]);

      if (trendsRes.status === 'fulfilled' && trendsRes.value.ok)
        setTrends(await trendsRes.value.json());
      if (tasksRes.status === 'fulfilled' && tasksRes.value.ok) {
        const allTasks: TaskItem[] = await tasksRes.value.json();
        setTasks(allTasks);
      }
      if (checkInsRes.status === 'fulfilled' && checkInsRes.value.ok)
        setCheckIns(await checkInsRes.value.json());
      if (foldersRes.status === 'fulfilled' && foldersRes.value.ok) {
        const allFolders: FolderItem[] = await foldersRes.value.json();
        setFolders(allFolders);
        if (allFolders.length > 0 && !taskFolderId) setTaskFolderId(allFolders[0].id);
      }
      if (notifsRes.status === 'fulfilled' && notifsRes.value.ok)
        setNotifications(await notifsRes.value.json());
      if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
        const allUsers: UserItem[] = await usersRes.value.json();
        setUsers(allUsers.filter(u => u.role !== 'admin'));
        if (allUsers.filter(u => u.role !== 'admin').length > 0 && !msgRecipientId) {
          setMsgRecipientId(allUsers.filter(u => u.role !== 'admin')[0].id);
        }
      }
    } catch {
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // --- computed ---
  const completedCount = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const lastCheckIn = checkIns.length > 0 ? checkIns[0] : null;

  const avgNet = trends.length > 0
    ? (trends.reduce((s, t) => s + t.totalNet, 0) / trends.length).toFixed(1)
    : '0';
  const latestNet = trends.length > 0 ? trends[trends.length - 1].totalNet.toFixed(1) : '0';

  // --- handlers ---

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskFolderId) return;
    setTaskSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: taskTitle.trim(), folderId: taskFolderId }),
      });
      if (!res.ok) throw new Error('Görev oluşturulamadı');
      toast.success('Görev başarıyla atandı!');
      setTaskTitle('');
      fetchAll();
    } catch {
      toast.error('Görev atanırken hata oluştu');
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleMsgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgTitle.trim() || !msgBody.trim() || !msgRecipientId) return;
    setMsgSubmitting(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: msgRecipientId,
          title: msgTitle.trim(),
          message: msgBody.trim(),
          type: 'encouragement',
        }),
      });
      if (!res.ok) throw new Error('Bildirim gönderilemedi');
      toast.success('Teşvik mesajı gönderildi!');
      setMsgTitle('');
      setMsgBody('');
      fetchAll();
    } catch {
      toast.error('Mesaj gönderilirken hata oluştu');
    } finally {
      setMsgSubmitting(false);
    }
  };

  // --- render ---

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-slate-400" size={36} />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="text-blue-600" size={28} />
          <Handwriting as="h1" className="text-3xl text-slate-900">
            Yönetici Paneli
          </Handwriting>
        </div>
        <button
          onClick={() => fetchAll()}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
          title="Yenile"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* ===== Section 1: Seyda'nin Genel Durumu ===== */}
      <Paper className="rotate-[-0.5deg]">
        <Handwriting as="h2" className="text-2xl mb-6 text-slate-900">
          Şeyda&apos;nın Genel Durumu
        </Handwriting>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Son Deneme */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 shadow-inner"
          >
            <div className="flex items-center gap-2 text-indigo-700 mb-1">
              <TrendingUp size={16} />
              <span className="font-bold text-[10px] uppercase tracking-wider">Son Deneme</span>
            </div>
            <span className="text-2xl font-serif text-slate-800">{latestNet}</span>
            <span className="text-xs text-slate-500 ml-1">net</span>
          </motion.div>

          {/* Ortalama Net */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-inner"
          >
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <TrendingUp size={16} />
              <span className="font-bold text-[10px] uppercase tracking-wider">Ortalama</span>
            </div>
            <span className="text-2xl font-serif text-slate-800">{avgNet}</span>
            <span className="text-xs text-slate-500 ml-1">net</span>
          </motion.div>

          {/* Gorev Tamamlama */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-inner"
          >
            <div className="flex items-center gap-2 text-green-700 mb-1">
              <CheckCircle2 size={16} />
              <span className="font-bold text-[10px] uppercase tracking-wider">Görev</span>
            </div>
            <span className="text-2xl font-serif text-slate-800">{completionRate}%</span>
            <span className="text-xs text-slate-500 ml-1">{completedCount}/{totalTasks}</span>
          </motion.div>

          {/* Son Check-in */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-amber-50 p-4 rounded-lg border border-amber-200 shadow-inner"
          >
            <div className="flex items-center gap-2 text-amber-700 mb-1">
              <Smile size={16} />
              <span className="font-bold text-[10px] uppercase tracking-wider">Ruh Hali</span>
            </div>
            {lastCheckIn ? (
              <div>
                <span className="text-lg font-serif text-slate-800">{moodLabel(lastCheckIn.mood)}</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Zap size={12} className="text-amber-600" />
                  <span className="text-xs text-slate-500">{energyLabel(lastCheckIn.energy)}</span>
                </div>
              </div>
            ) : (
              <span className="text-sm text-slate-400 italic">Veri yok</span>
            )}
          </motion.div>
        </div>

        {/* Recent exam results list */}
        {trends.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Son Denemeler
            </h3>
            <div className="space-y-2">
              {trends.map((t) => (
                <div
                  key={t.examId}
                  className="flex items-center justify-between bg-white rounded-lg border border-slate-100 p-3"
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-700">{t.examTitle}</span>
                    <span className="text-xs text-slate-400 ml-2">
                      {new Date(t.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                      {t.examTypeName}
                    </span>
                    <span className="text-lg font-bold text-slate-800">
                      {t.totalNet.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {trends.length === 0 && (
          <p className="text-sm text-slate-400 italic text-center py-4">
            Henüz deneme verisi yok.
          </p>
        )}
      </Paper>

      {/* Two-column layout for forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ===== Section 2: Gorev Ata ===== */}
        <Paper className="rotate-[0.3deg]">
          <div className="flex items-center gap-2 mb-6">
            <ClipboardList className="text-blue-600" size={22} />
            <Handwriting as="h2" className="text-2xl text-slate-900">
              Görev Ata
            </Handwriting>
          </div>

          <form onSubmit={handleTaskSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                Görev Başlığı
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Örneğin: Paragraf testi çöz..."
                className="w-full px-4 py-2.5 bg-white rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                Klasör
              </label>
              <select
                value={taskFolderId}
                onChange={(e) => setTaskFolderId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
              >
                {folders.length === 0 && (
                  <option value="">Klasör bulunamadı</option>
                )}
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={taskSubmitting || !taskTitle.trim() || !taskFolderId}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              {taskSubmitting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <ClipboardList size={16} />
              )}
              Görev Ata
            </button>
          </form>
        </Paper>

        {/* ===== Section 3: Tesvik Mesaji Gonder ===== */}
        <Paper className="rotate-[-0.3deg]">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="text-rose-500" size={22} />
            <Handwriting as="h2" className="text-2xl text-slate-900">
              Teşvik Mesajı Gönder
            </Handwriting>
          </div>

          <form onSubmit={handleMsgSubmit} className="flex flex-col gap-4">
            {users.length > 0 && (
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  Alıcı
                </label>
                <select
                  value={msgRecipientId}
                  onChange={(e) => setMsgRecipientId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.displayName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                Başlık
              </label>
              <input
                type="text"
                value={msgTitle}
                onChange={(e) => setMsgTitle(e.target.value)}
                placeholder="Örneğin: Harika gidiyorsun!"
                className="w-full px-4 py-2.5 bg-white rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                Mesaj
              </label>
              <textarea
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
                placeholder="Teşvikçi bir mesaj yaz..."
                rows={3}
                className="w-full px-4 py-2.5 bg-white rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={msgSubmitting || !msgTitle.trim() || !msgBody.trim()}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-5 py-2.5 rounded-lg shadow hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
            >
              {msgSubmitting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Send size={16} />
              )}
              Mesajı Gönder
            </button>
          </form>
        </Paper>
      </div>

      {/* ===== Section 4: Son Gonderilen Bildirimler ===== */}
      <Paper className="rotate-[0.2deg]">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="text-amber-600" size={22} />
          <Handwriting as="h2" className="text-2xl text-slate-900">
            Son Bildirimler
          </Handwriting>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-10">
            <Bell className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-sm text-slate-400 italic">Henüz bildirim gönderilmemiş.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.slice(0, 10).map((n, idx) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    n.isRead
                      ? 'bg-white border-slate-100'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className={`mt-0.5 p-1.5 rounded-full ${
                    n.type === 'encouragement' ? 'bg-rose-100 text-rose-600' :
                    n.type === 'task_assigned' ? 'bg-blue-100 text-blue-600' :
                    n.type === 'milestone' ? 'bg-amber-100 text-amber-600' :
                    n.type === 'streak' ? 'bg-orange-100 text-orange-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {n.type === 'encouragement' ? <Heart size={14} /> :
                     n.type === 'task_assigned' ? <ClipboardList size={14} /> :
                     <Bell size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700 truncate">{n.title}</span>
                      {!n.isRead && (
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{timeAgo(n.createdAt)}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Paper>
    </div>
  );
}
