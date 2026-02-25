"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Folder, Plus, Trash2, CheckCircle2, Circle, Loader2, ListTodo, FolderHeart } from 'lucide-react';
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

    const colors = ['bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-orange-400', 'bg-pink-400', 'bg-cyan-400'];
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
      // Optimistic update
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ));

      const res = await fetch(`/api/tasks/${taskId}/toggle`, {
        method: 'POST',
      });
      if (!res.ok) {
        // Revert on failure
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        ));
        throw new Error('Toggle failed');
      }

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
      default: return 'bg-white/[0.03] text-white/50 border-white/10';
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
    <div className="h-full flex flex-col md:flex-row gap-6 relative">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Folder Tabs Sidebar */}
      <div className="w-full md:w-72 flex flex-col gap-5 relative z-10 shrink-0">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 text-pink-400 drop-shadow-[0_0_10px_rgba(255,42,133,0.3)]">
            <FolderHeart size={28} />
            <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-sm">Klasörler</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowNewFolderInput(!showNewFolderInput)}
            className="p-1.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 rounded-lg transition-colors border border-pink-500/20 shadow-[0_0_10px_rgba(255,42,133,0.2)]"
          >
            <Plus size={20} />
          </motion.button>
        </div>

        {/* New Folder Input */}
        <AnimatePresence>
          {showNewFolderInput && (
            <motion.form
              initial={{ height: 0, opacity: 0, scale: 0.95 }}
              animate={{ height: 'auto', opacity: 1, scale: 1 }}
              exit={{ height: 0, opacity: 0, scale: 0.95 }}
              onSubmit={handleAddFolder}
              className="px-1 overflow-hidden"
            >
              <div className="bg-white/[0.02] border border-pink-500/20 rounded-xl p-2 flex gap-2 shadow-[0_4px_15px_rgba(255,42,133,0.1)] focus-within:border-pink-500/50 transition-colors">
                <input
                  autoFocus
                  type="text"
                  placeholder="Yeni klasör adı..."
                  className="w-full px-3 py-1.5 bg-transparent text-sm font-bold text-white/90 placeholder:text-white/30 focus:outline-none"
                  value={newFolderInput}
                  onChange={e => setNewFolderInput(e.target.value)}
                  disabled={submittingFolder}
                />
                <button
                  type="submit"
                  disabled={!newFolderInput.trim() || submittingFolder}
                  className="p-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-400 disabled:opacity-50 transition-colors shadow-lg shadow-pink-500/20 shrink-0"
                >
                  {submittingFolder ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {loadingFolders ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-pink-400/50" size={32} />
          </div>
        ) : (
          <div className="glass-panel flex-1 overflow-y-auto p-3 flex flex-col gap-2 shadow-[0_8px_32px_rgba(255,42,133,0.05)] border-white/10 rounded-2xl max-h-[30vh] md:max-h-full custom-scrollbar">
            {folders.map((folder, idx) => (
              <motion.button
                key={folder.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setActiveFolderId(folder.id)}
                className={clsx(
                  "relative p-3.5 rounded-xl text-left transition-all duration-300 flex items-center gap-3 overflow-hidden group",
                  activeFolderId === folder.id
                    ? "bg-gradient-to-r from-pink-500/20 to-pink-500/5 border border-pink-500/30 shadow-[0_4px_20px_rgba(255,42,133,0.1)] text-white"
                    : "bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-pink-500/20 text-white/60 hover:text-white"
                )}
              >
                {activeFolderId === folder.id && (
                  <motion.div layoutId="active-folder-bg" className="absolute inset-0 bg-pink-500/10 pointer-events-none" />
                )}

                <div className={clsx(
                  "w-1 h-full absolute left-0 top-0 bottom-0 transition-colors duration-300",
                  folder.color.replace('bg-', 'bg-').replace('-100', '-500'), // Quick hack to darken the generated colors for better neon effect
                  activeFolderId === folder.id ? "opacity-100 shadow-[0_0_10px_currentColor]" : "opacity-30 group-hover:opacity-70"
                )} />

                <Folder
                  size={20}
                  className={clsx(
                    "ml-1.5 transition-colors duration-300",
                    activeFolderId === folder.id ? "text-pink-300 drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]" : "text-white/40 group-hover:text-pink-400"
                  )}
                />

                <span className="font-bold truncate relative z-10 text-sm tracking-wide">{folder.name}</span>

                {activeFolderId === folder.id && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,1)]" />
                )}
              </motion.button>
            ))}

            {folders.length === 0 && (
              <div className="text-center py-10 flex flex-col items-center gap-3 opacity-50">
                <Folder size={40} className="text-pink-300 mb-2 drop-shadow-md" />
                <p className="text-white/60 text-sm font-bold tracking-wide">Henüz klasör yok</p>
                <span className="text-xs text-white/40">Yeni bir klasör oluşturarak başla</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task List Main Area */}
      <div className="flex-1 h-full flex flex-col relative z-10">
        <div className="glass-panel h-full flex flex-col overflow-hidden shadow-[0_8px_32px_rgba(255,42,133,0.05)] border-white/10 rounded-3xl">
          {/* Header */}
          <div className="px-6 sm:px-8 py-6 border-b border-pink-500/15 bg-white/[0.02] flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none transform translate-x-1/2 -translate-y-1/2" />

            <div className="relative z-10 flex items-center gap-4">
              <div className={clsx(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                activeFolder ? activeFolder.color.replace('bg-', 'bg-').replace('-100', '-500') + '/20' : 'bg-white/5'
              )}>
                <ListTodo size={24} className={clsx(
                  activeFolder ? activeFolder.color.replace('bg-', 'text-').replace('-100', '-500') : 'text-white/40'
                )} />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1 drop-shadow-sm">
                  {activeFolder?.name || 'Görevler'}
                </h2>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-300/70">
                  <span>{activeTasks.length} Toplam</span>
                  <span className="w-1 h-1 rounded-full bg-pink-500/50" />
                  <span>{completedCount} Tamamlanan</span>
                </div>
              </div>
            </div>

            {/* Progress Circle (Visual Only) */}
            {activeTasks.length > 0 && (
              <div className="relative w-12 h-12 shrink-0 hidden sm:block">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="20" className="stroke-white/10" strokeWidth="4" fill="none" />
                  <circle
                    cx="24" cy="24" r="20"
                    className="stroke-pink-500 drop-shadow-[0_0_5px_rgba(255,42,133,0.5)] transition-all duration-1000 ease-out"
                    strokeWidth="4" fill="none"
                    strokeDasharray={125.6}
                    strokeDashoffset={125.6 - (completedCount / activeTasks.length) * 125.6}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-black text-pink-300">
                    {Math.round((completedCount / activeTasks.length) * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Tasks Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
            {loadingTasks ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-pink-400" size={40} />
              </div>
            ) : activeTasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                <div className="w-24 h-24 mb-6 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/20 shadow-[0_0_30px_rgba(255,42,133,0.1)]">
                  <ListTodo size={40} className="text-pink-400 drop-shadow-md" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Görev Bulunamadı</h3>
                <p className="text-sm font-medium tracking-wide text-white/50 max-w-xs mx-auto">
                  Alt kısımdaki alanı kullanarak bu klasöre yeni görevler ekleyebilirsin.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 relative">
                <AnimatePresence>
                  {activeTasks.map((task, idx) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      transition={{ type: "spring", damping: 25, stiffness: 300, delay: idx * 0.03 }}
                      key={task.id}
                      className={clsx(
                        "group flex items-start sm:items-center gap-4 p-4 rounded-xl transition-all duration-300 border relative overflow-hidden",
                        task.completed
                          ? "bg-white/[0.01] border-white/5 opacity-60 hover:opacity-100"
                          : "bg-white/[0.03] border-white/10 hover:bg-white/[0.05] hover:border-pink-500/30 hover:shadow-[0_4px_20px_rgba(255,42,133,0.05)]"
                      )}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={clsx(
                          "mt-0.5 sm:mt-0 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-300 shrink-0",
                          task.completed
                            ? "border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                            : "border-white/20 hover:border-pink-500/50 hover:bg-pink-500/10 text-transparent"
                        )}
                      >
                        {task.completed && <CheckCircle2 size={16} />}
                      </button>

                      {/* Task Info */}
                      <div className="flex-1 min-w-0">
                        <p className={clsx(
                          "text-base font-bold tracking-wide transition-all duration-300 line-clamp-2",
                          task.completed ? "text-white/40 line-through decoration-white/20" : "text-white/90 group-hover:text-pink-100"
                        )}>
                          {task.title}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded-md">
                            {format(new Date(task.createdAt), 'd MMM', { locale: tr })}
                          </span>

                          <span className={clsx(
                            "text-[9px] px-2 py-0.5 rounded-md uppercase tracking-widest font-black border",
                            getPriorityBadge(task.priority)
                          )}>
                            {getPriorityLabel(task.priority)}
                          </span>

                          {task.isRecurring && (
                            <span className="text-[9px] bg-cyan-500/10 px-2 py-0.5 rounded-md text-cyan-400 border border-cyan-500/20 uppercase tracking-widest font-black shadow-[0_0_5px_rgba(34,211,238,0.2)]">
                              Tekrar
                            </span>
                          )}

                          {task.dueDate && (
                            <span className="text-[9px] bg-amber-500/10 px-2 py-0.5 rounded-md text-amber-400 border border-amber-500/20 uppercase tracking-widest font-black ml-auto sm:ml-0">
                              Son: {format(new Date(task.dueDate), 'd MMM', { locale: tr })}
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs font-medium text-white/50 mt-2 line-clamp-1 border-l-2 border-white/10 pl-2">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-white/30 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 rounded-lg transition-all absolute right-4 top-1/2 -translate-y-1/2 shadow-lg sm:relative sm:right-auto sm:top-auto sm:translate-y-0 shrink-0"
                        title="Görevi Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Add Task Input Area */}
          <div className="p-4 sm:p-6 border-t border-pink-500/15 bg-black/20 relative z-20">
            <form onSubmit={handleAddTask} className="flex items-center gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-pink-400/50">
                  <Plus size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Yeni görev ekle... (Örn: Matematik soru çözümü)"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm font-bold tracking-wide text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-pink-500/50 shadow-inner transition-all duration-300"
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  disabled={submittingTask || !activeFolderId}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!newTaskInput.trim() || submittingTask || !activeFolderId}
                className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-3.5 rounded-xl hover:shadow-[0_0_20px_rgba(255,42,133,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shrink-0 shadow-[0_0_10px_rgba(255,42,133,0.2)]"
              >
                {submittingTask ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={20} className="font-black drop-shadow-md" />}
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
