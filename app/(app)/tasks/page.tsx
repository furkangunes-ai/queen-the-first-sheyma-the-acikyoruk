"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Handwriting } from '@/components/skeuomorphic';
import { motion, AnimatePresence } from 'motion/react';
import { Folder, Plus, Trash2, CheckCircle2, Circle, Loader2, MessageCircle, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

interface FolderItem {
  id: string;
  name: string;
  color: string;
}

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: string;
  dueDate: string | null;
  isRecurring: boolean;
  recurrence: string | null;
  folderId: string;
  folder: FolderItem | null;
  completions: Array<{ id: string; completedAt: string }>;
  createdAt: string;
}

export default function TasksPage() {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [activeFolderId, setActiveFolderId] = useState<string>('');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newFolderInput, setNewFolderInput] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [submittingTask, setSubmittingTask] = useState(false);
  const [submittingFolder, setSubmittingFolder] = useState(false);

  // Fetch folders
  const fetchFolders = useCallback(async () => {
    try {
      setLoadingFolders(true);
      const res = await fetch('/api/folders');
      if (!res.ok) throw new Error(`Folders fetch failed: ${res.status}`);
      const data = await res.json();
      setFolders(data);
      // İlk yükleme için aktif klasörü ayarla
      setActiveFolderId(prev => {
        if (!prev && data.length > 0) return data[0].id;
        return prev;
      });
    } catch (err) {
      console.error('Klasörler yüklenirken hata:', err);
      toast.error('Klasörler yüklenirken hata oluştu');
    } finally {
      setLoadingFolders(false);
    }
  }, []);

  // Fetch tasks for active folder
  const fetchTasks = useCallback(async () => {
    if (!activeFolderId) return;
    try {
      setLoadingTasks(true);
      const res = await fetch(`/api/tasks?folderId=${activeFolderId}`);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Görevler yüklenirken hata:', err);
      toast.error('Görevler yüklenirken hata oluştu');
    } finally {
      setLoadingTasks(false);
    }
  }, [activeFolderId]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const activeTasks = tasks;
  const activeFolder = folders.find(f => f.id === activeFolderId);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim() || !activeFolderId) return;

    setSubmittingTask(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskInput.trim(),
          folderId: activeFolderId,
          priority: 'medium',
        }),
      });
      if (!res.ok) throw new Error('Create failed');

      setNewTaskInput('');
      fetchTasks();
      toast.success('Görev eklendi');
    } catch {
      toast.error('Görev eklenirken hata oluştu');
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleAddFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderInput.trim()) return;

    const colors = ['bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-orange-100', 'bg-pink-100', 'bg-yellow-100'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    setSubmittingFolder(true);
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderInput.trim(),
          color: randomColor,
        }),
      });
      if (!res.ok) throw new Error('Create failed');

      const newFolder = await res.json();
      setNewFolderInput('');
      setShowNewFolderInput(false);
      fetchFolders();
      setActiveFolderId(newFolder.id);
      toast.success('Klasör oluşturuldu');
    } catch {
      toast.error('Klasör oluşturulurken hata oluştu');
    } finally {
      setSubmittingFolder(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/toggle`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Toggle failed');

      // Optimistic update
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ));
    } catch {
      toast.error('Görev durumu değiştirilemedi');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');

      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Görev silindi');
    } catch {
      toast.error('Görev silinemedi');
    }
  };

  const completedCount = activeTasks.filter(t => t.completed).length;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-rose-500/10 text-rose-400 border-rose-500/15';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/15';
      case 'low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15';
      default: return 'bg-white/[0.03] text-white/50 border-pink-500/15';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return priority;
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* Folder Tabs */}
      <div className="w-full md:w-64 flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
          <Handwriting className="text-xl">Dosyalar</Handwriting>
          <button
            onClick={() => setShowNewFolderInput(!showNewFolderInput)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <Plus size={20} className="text-white/60" />
          </button>
        </div>

        {/* New Folder Input */}
        <AnimatePresence>
          {showNewFolderInput && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleAddFolder}
              className="mb-2 overflow-hidden"
            >
              <input
                autoFocus
                type="text"
                placeholder="Klasör Adı..."
                className="w-full px-3 py-2 bg-white/[0.06] rounded border border-pink-500/[0.12] text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400/50"
                value={newFolderInput}
                onChange={e => setNewFolderInput(e.target.value)}
                disabled={submittingFolder}
              />
            </motion.form>
          )}
        </AnimatePresence>

        {loadingFolders ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="animate-spin text-white/40" size={24} />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3 overflow-y-auto max-h-[30vh] md:max-h-full">
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setActiveFolderId(folder.id)}
                className={clsx(
                  "relative p-3 rounded-xl text-left transition-all duration-200 border border-transparent flex items-center gap-3",
                  activeFolderId === folder.id
                    ? "bg-white/[0.04] shadow-lg shadow-pink-500/[0.03] border-pink-500/15 scale-[1.02]"
                    : "bg-white/[0.03] hover:bg-white/10"
                )}
              >
                <div className={clsx("w-3 h-full absolute left-0 top-0 bottom-0 rounded-l-lg", folder.color)}></div>
                <Folder size={18} className="text-white/50 ml-2" />
                <span className="font-medium text-white/70 truncate">{folder.name}</span>
                {activeFolderId === folder.id && (
                  <motion.div layoutId="active-indicator" className="absolute right-3 w-2 h-2 rounded-full bg-pink-400" />
                )}
              </button>
            ))}

            {folders.length === 0 && (
              <div className="text-center py-6 text-white/40 text-sm italic">
                Henüz klasör yok
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="flex-1 h-full">
        <Paper className="h-full flex flex-col relative" style={{ minHeight: '500px' }}>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-pink-500/15">
            <div>
              <Handwriting className="text-3xl">{activeFolder?.name || 'Görevler'}</Handwriting>
              <p className="text-xs text-white/40 mt-1">
                {completedCount} / {activeTasks.length} tamamlandı
              </p>
            </div>
            {activeFolder && (
              <div className={clsx("w-4 h-4 rounded-full", activeFolder.color)}></div>
            )}
          </div>

          {/* Tasks */}
          <div className="flex-1 overflow-y-auto mt-4 pr-2 space-y-1">
            {loadingTasks ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-white/40" size={28} />
              </div>
            ) : activeTasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/20">
                <CheckCircle2 size={48} className="mb-4 opacity-50" />
                <p className="font-display italic text-lg">Bu klasörde görev yok.</p>
              </div>
            ) : (
              activeTasks.map((task) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={task.id}
                  className="group flex items-center gap-3 p-3 hover:bg-white/[0.03] rounded-xl transition-colors border-b border-white/10 last:border-0"
                >
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className="text-white/40 hover:text-emerald-400 transition-colors"
                  >
                    {task.completed ? <CheckCircle2 size={22} className="text-emerald-400" /> : <Circle size={22} />}
                  </button>

                  <div className="flex-1">
                    <p className={clsx(
                      "text-white/90 text-lg font-display",
                      task.completed && "line-through text-white/40 decoration-white/20"
                    )}>
                      {task.title}
                    </p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] text-white/40">
                        {format(new Date(task.createdAt), 'd MMM', { locale: tr })}
                      </span>
                      <span className={`text-[10px] px-1.5 rounded border uppercase tracking-wide font-bold ${getPriorityBadge(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                      {task.isRecurring && (
                        <span className="text-[10px] bg-blue-500/10 px-1.5 rounded text-pink-400 border border-pink-500/15 uppercase tracking-wide">
                          Tekrar
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="text-[10px] text-orange-500">
                          {format(new Date(task.dueDate), 'd MMM', { locale: tr })}
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-white/40 mt-1 line-clamp-1">{task.description}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-rose-400 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))
            )}
          </div>

          {/* Add Task Bar */}
          <div className="mt-4 pt-4 border-t-2 border-dashed border-pink-500/10">
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                placeholder="Yeni bir görev ekle..."
                className="flex-1 bg-transparent font-display text-lg text-white/90 placeholder:text-white/20 focus:outline-none"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                disabled={submittingTask || !activeFolderId}
              />
              <button
                type="submit"
                disabled={!newTaskInput.trim() || submittingTask || !activeFolderId}
                className="bg-pink-500 text-white p-2 rounded-full hover:bg-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submittingTask ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
              </button>
            </form>
          </div>
        </Paper>
      </div>
    </div>
  );
}
