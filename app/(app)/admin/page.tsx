"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  Shield, Send, ClipboardList, Heart, TrendingUp, Loader2,
  CheckCircle2, Zap, Smile, FolderOpen, Bell, RefreshCw,
  Sparkles, Star
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
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="animate-spin text-pink-400 mb-4 drop-shadow-[0_0_15px_rgba(255,42,133,0.5)]" size={48} />
        <p className="text-white/60 font-bold tracking-wide">Yönetici Paneli Yükleniyor...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex flex-col gap-8 pb-12 relative z-10">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Header */}
      <div className="flex items-center justify-between glass-panel p-6 sm:p-8 relative z-10 overflow-hidden shadow-[0_8px_32px_rgba(255,42,133,0.05)] border-white/10 rounded-3xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none transform translate-x-1/2 -translate-y-1/2" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 shadow-inner">
            <Shield className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" size={32} />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md mb-1">
              Yönetici Paneli
            </h1>
            <p className="text-sm font-bold tracking-widest uppercase text-white/50">
              Genel Durum ve Yönetim
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 15 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fetchAll()}
          className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/10 transition-colors text-white/60 hover:text-white relative z-10 shadow-lg"
          title="Yenile"
        >
          <RefreshCw size={20} />
        </motion.button>
      </div>

      {/* ===== Section 1: Seyda'nin Genel Durumu ===== */}
      <div className="glass-panel p-6 sm:p-8 relative z-10 shadow-[0_8px_32px_rgba(255,42,133,0.05)] border-white/10 rounded-3xl overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/5 rounded-full blur-[60px] pointer-events-none" />

        <div className="flex items-center gap-3 mb-8 relative z-10">
          <Sparkles className="text-pink-400" size={24} />
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 drop-shadow-sm tracking-tight">
            Şeyda'nın Genel Durumu
          </h2>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Son Deneme */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="group bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 p-5 rounded-2xl border border-indigo-500/20 shadow-lg relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-2 text-indigo-400 mb-2">
              <TrendingUp size={16} />
              <span className="font-bold text-[10px] uppercase tracking-wider">Son Deneme</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-black text-white/90 drop-shadow-md tracking-tight">{latestNet}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-white/40 ml-1.5">net</span>
            </div>
          </motion.div>

          {/* Ortalama Net */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-5 rounded-2xl border border-blue-500/20 shadow-lg relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Star size={16} />
              <span className="font-bold text-[10px] uppercase tracking-wider">Ortalama</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-black text-white/90 drop-shadow-md tracking-tight">{avgNet}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-white/40 ml-1.5">net</span>
            </div>
          </motion.div>

          {/* Gorev Tamamlama */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="group bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-5 rounded-2xl border border-emerald-500/20 shadow-lg relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <CheckCircle2 size={16} />
              <span className="font-bold text-[10px] uppercase tracking-wider">Görev</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white/90 drop-shadow-md tracking-tight">{completionRate}%</span>
              <span className="text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md">{completedCount}/{totalTasks}</span>
            </div>
          </motion.div>

          {/* Son Check-in */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-5 rounded-2xl border border-amber-500/20 shadow-lg relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Smile size={16} />
              <span className="font-bold text-[10px] uppercase tracking-wider">Ruh Hali</span>
            </div>
            {lastCheckIn ? (
              <div>
                <span className="text-xl font-black text-white/90 drop-shadow-md tracking-tight block truncate">{moodLabel(lastCheckIn.mood)}</span>
                <div className="flex items-center gap-1.5 mt-1 bg-amber-500/10 self-start px-2 py-0.5 rounded-md border border-amber-500/20">
                  <Zap size={10} className="text-amber-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300/80">{energyLabel(lastCheckIn.energy)} Enerji</span>
                </div>
              </div>
            ) : (
              <span className="text-sm font-bold text-white/40 italic">Veri yok</span>
            )}
          </motion.div>
        </div>

        {/* Recent exam results list */}
        {trends.length > 0 && (
          <div className="mt-8 border-t border-white/5 pt-8">
            <h3 className="text-sm font-black text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-pink-400" /> Son Denemeler
            </h3>
            <div className="grid gap-3">
              {trends.map((t) => (
                <div
                  key={t.examId}
                  className="flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] transition-colors rounded-xl border border-white/5 hover:border-pink-500/20 p-4"
                >
                  <div className="flex-1">
                    <span className="text-base font-bold tracking-wide text-white/90">{t.examTitle}</span>
                    <span className="text-xs font-medium text-white/40 ml-3 bg-black/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {new Date(t.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-lg text-white/60 border border-white/5">
                      {t.examTypeName}
                    </span>
                    <span className="text-xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 drop-shadow-md w-16 text-right">
                      {t.totalNet.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {trends.length === 0 && (
          <div className="mt-8 border-t border-white/5 pt-8 flex flex-col items-center justify-center p-8 opacity-50">
            <TrendingUp size={32} className="text-white/40 mb-3" />
            <p className="text-sm font-bold tracking-wide text-white/60">Henüz deneme verisi yok.</p>
          </div>
        )}
      </div>

      {/* Two-column layout for forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ===== Section 2: Gorev Ata ===== */}
        <div className="glass-panel p-6 sm:p-8 relative z-10 shadow-[0_8px_32px_rgba(255,42,133,0.05)] border-white/10 rounded-3xl overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none" />

          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20 shadow-inner">
              <ClipboardList className="text-blue-400 drop-shadow-sm" size={24} />
            </div>
            <h2 className="text-2xl font-black text-white drop-shadow-sm tracking-tight">
              Görev Ata
            </h2>
          </div>

          <form onSubmit={handleTaskSubmit} className="flex flex-col gap-5 relative z-10">
            <div>
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1.5 block">
                GÖREV BAŞLIĞI
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Örneğin: Paragraf testi çöz..."
                className="w-full px-4 py-3 bg-white/[0.03] rounded-xl border border-white/10 text-sm font-medium tracking-wide text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/30 transition-all shadow-inner [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1.5 block">
                KLASÖR
              </label>
              <select
                value={taskFolderId}
                onChange={(e) => setTaskFolderId(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.03] rounded-xl border border-white/10 text-sm font-medium tracking-wide text-white focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/30 transition-all shadow-inner [color-scheme:dark]"
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

            <motion.button
              whileHover={!taskSubmitting && !!taskTitle.trim() ? { scale: 1.02 } : {}}
              whileTap={!taskSubmitting && !!taskTitle.trim() ? { scale: 0.98 } : {}}
              type="submit"
              disabled={taskSubmitting || !taskTitle.trim() || !taskFolderId}
              className="mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-black tracking-widest px-5 py-3.5 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm uppercase"
            >
              {taskSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <ClipboardList size={18} />
              )}
              GÖREV ATA
            </motion.button>
          </form>
        </div>

        {/* ===== Section 3: Tesvik Mesaji Gonder ===== */}
        <div className="glass-panel p-6 sm:p-8 relative z-10 shadow-[0_8px_32px_rgba(255,42,133,0.05)] border-white/10 rounded-3xl overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-[40px] pointer-events-none" />

          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="bg-pink-500/10 p-2.5 rounded-xl border border-pink-500/20 shadow-inner">
              <Heart className="text-pink-400 drop-shadow-sm" size={24} />
            </div>
            <h2 className="text-2xl font-black text-white drop-shadow-sm tracking-tight">
              Teşvik Mesajı
            </h2>
          </div>

          <form onSubmit={handleMsgSubmit} className="flex flex-col gap-5 relative z-10">
            {users.length > 0 && (
              <div>
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1.5 block">
                  ALICI
                </label>
                <select
                  value={msgRecipientId}
                  onChange={(e) => setMsgRecipientId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.03] rounded-xl border border-white/10 text-sm font-medium tracking-wide text-white focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-400/30 transition-all shadow-inner [color-scheme:dark]"
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
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1.5 block">
                BAŞLIK
              </label>
              <input
                type="text"
                value={msgTitle}
                onChange={(e) => setMsgTitle(e.target.value)}
                placeholder="Örneğin: Harika gidiyorsun!"
                className="w-full px-4 py-3 bg-white/[0.03] rounded-xl border border-white/10 text-sm font-medium tracking-wide text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-400/30 transition-all shadow-inner [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1.5 block">
                MESAJ
              </label>
              <textarea
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
                placeholder="Teşvikçi bir mesaj yaz..."
                rows={3}
                className="w-full px-4 py-3 bg-white/[0.03] rounded-xl border border-white/10 text-sm font-medium tracking-wide text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-400/30 transition-all shadow-inner resize-none custom-scrollbar [color-scheme:dark]"
              />
            </div>

            <motion.button
              whileHover={!msgSubmitting && !!msgTitle.trim() && !!msgBody.trim() ? { scale: 1.02 } : {}}
              whileTap={!msgSubmitting && !!msgTitle.trim() && !!msgBody.trim() ? { scale: 0.98 } : {}}
              type="submit"
              disabled={msgSubmitting || !msgTitle.trim() || !msgBody.trim()}
              className="mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-black tracking-widest px-5 py-3.5 rounded-xl shadow-[0_0_15px_rgba(255,42,133,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm uppercase"
            >
              {msgSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
              MESAJI GÖNDER
            </motion.button>
          </form>
        </div>
      </div>

      {/* ===== Section 4: Son Gonderilen Bildirimler ===== */}
      <div className="glass-panel p-6 sm:p-8 relative z-10 shadow-[0_8px_32px_rgba(255,42,133,0.05)] border-white/10 rounded-3xl overflow-hidden mt-4">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[60px] pointer-events-none" />

        <div className="flex items-center gap-3 mb-8 relative z-10">
          <Bell className="text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" size={26} />
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 drop-shadow-sm tracking-tight">
            Son Gönderilen Bildirimler
          </h2>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-10 opacity-50 flex flex-col items-center">
            <Bell className="text-white/40 mb-3" size={40} />
            <p className="text-sm font-bold tracking-wide text-white/60">Henüz bildirim gönderilmemiş.</p>
          </div>
        ) : (
          <div className="grid gap-3 relative z-10">
            <AnimatePresence>
              {notifications.slice(0, 10).map((n, idx) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={1 ? // Always use the new style instead of checking isRead because we are admin 
                    "flex items-start gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                    : "flex items-start gap-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 transition-colors"
                  }
                >
                  <div className={`mt-0.5 p-2 rounded-xl shadow-inner border ${n.type === 'encouragement' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      n.type === 'task_assigned' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        n.type === 'milestone' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          n.type === 'streak' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                            'bg-white/[0.06] text-white/50 border-white/10'
                    }`}>
                    {n.type === 'encouragement' ? <Heart size={16} /> :
                      n.type === 'task_assigned' ? <ClipboardList size={16} /> :
                        <Bell size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold tracking-wide text-white/90 truncate">{n.title}</span>
                      {/*!n.isRead && ( // Not critical for admin to see read status of all notifications but we could leave it
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                      )*/}
                    </div>
                    <p className="text-xs font-medium tracking-wide text-white/60 line-clamp-2">{n.message}</p>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-2 block">{timeAgo(n.createdAt)}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
