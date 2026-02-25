"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Bell, MessageCircle, Award, Flame, CheckCircle, Loader2, Inbox } from 'lucide-react';

// ---------- types ----------

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender?: { displayName: string } | null;
}

// ---------- helpers ----------

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'az önce';
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;
  const weeks = Math.floor(days / 7);
  return `${weeks} hafta önce`;
};

const typeIcon = (type: string) => {
  switch (type) {
    case 'encouragement':
      return <MessageCircle size={16} />;
    case 'milestone':
      return <Award size={16} />;
    case 'streak':
      return <Flame size={16} />;
    case 'task_assigned':
      return <CheckCircle size={16} />;
    default:
      return <Bell size={16} />;
  }
};

const typeBorderColor = (type: string): string => {
  switch (type) {
    case 'encouragement':
      return 'border-l-rose-400';
    case 'milestone':
      return 'border-l-amber-400';
    case 'streak':
      return 'border-l-orange-400';
    case 'task_assigned':
      return 'border-l-blue-400';
    case 'reminder':
      return 'border-l-purple-400';
    default:
      return 'border-l-white/20';
  }
};

const typeIconBg = (type: string): string => {
  switch (type) {
    case 'encouragement':
      return 'bg-rose-500/15 text-rose-400';
    case 'milestone':
      return 'bg-amber-500/15 text-amber-400';
    case 'streak':
      return 'bg-orange-500/15 text-orange-400';
    case 'task_assigned':
      return 'bg-blue-500/15 text-blue-400';
    case 'reminder':
      return 'bg-purple-500/15 text-purple-400';
    default:
      return 'bg-white/[0.06] text-white/50';
  }
};

// ---------- component ----------

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Fetch unread count (lightweight, polled)
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?unreadOnly=true');
      if (!res.ok) return;
      const data: NotificationItem[] = await res.json();
      setUnreadCount(data.length);
    } catch {
      // silently fail
    }
  }, []);

  // Fetch full notification list
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error();
      const data: NotificationItem[] = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch {
      toast.error('Bildirimler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll unread count every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch full list when sheet opens
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  // Mark as read
  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error();

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      toast.error('Bildirim okundu olarak işaretlenemedi');
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="relative p-2 rounded-full active:bg-white/10 transition-colors text-white/50"
          aria-label="Bildirimler"
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-pink-500 text-white text-[10px] font-bold px-1 leading-none"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-pink-500/10">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Bell size={20} className="text-white/70" />
            Bildirimler
            {unreadCount > 0 && (
              <span className="text-xs bg-pink-500/15 text-pink-300 px-2 py-0.5 rounded-full font-medium">
                {unreadCount} okunmamış
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-pink-400/50" size={24} />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/40">
              <Inbox size={40} className="mb-3 opacity-50" />
              <p className="text-sm italic">Henüz bildirim yok.</p>
            </div>
          ) : (
            <div className="divide-y divide-pink-500/5">
              <AnimatePresence>
                {notifications.map((n, idx) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => {
                      if (!n.isRead) markAsRead(n.id);
                    }}
                    className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors border-l-4 ${typeBorderColor(n.type)} ${
                      n.isRead
                        ? 'bg-white/[0.04] active:bg-white/[0.06]'
                        : 'bg-amber-500/5 active:bg-amber-500/10'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`mt-0.5 p-2 rounded-full flex-shrink-0 ${typeIconBg(n.type)}`}>
                      {typeIcon(n.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm truncate ${n.isRead ? 'font-medium text-white/60' : 'font-semibold text-white/90'}`}>
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span className="inline-block w-2 h-2 rounded-full bg-pink-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-white/50 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-white/40">
                          {timeAgo(n.createdAt)}
                        </span>
                        {n.sender?.displayName && (
                          <span className="text-[10px] bg-white/[0.06] text-white/40 px-1.5 py-0.5 rounded">
                            {n.sender.displayName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Read indicator */}
                    {n.isRead && (
                      <CheckCircle size={14} className="text-emerald-400 flex-shrink-0 mt-1" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
