import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Paper, Handwriting } from '../components/ui/Skeuomorphic';
import { motion, AnimatePresence } from 'motion/react';
import { Folder, Plus, Trash2, CheckCircle2, Circle, MoreVertical } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export const Tasks = () => {
  const { folders, tasks, addTask, toggleTask, deleteTask, addFolder, currentUser } = useApp();
  const [activeFolderId, setActiveFolderId] = useState<string>(folders[0]?.id || '');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newFolderInput, setNewFolderInput] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  const activeTasks = tasks.filter(t => t.folderId === activeFolderId);
  const activeFolder = folders.find(f => f.id === activeFolderId);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    addTask(newTaskInput, activeFolderId);
    setNewTaskInput('');
  };

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderInput.trim()) return;
    
    // Pick a random color from a preset list
    const colors = ['bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-orange-100', 'bg-pink-100'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    addFolder(newFolderInput, randomColor);
    setNewFolderInput('');
    setShowNewFolderInput(false);
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* Folder Tabs (Sidebar Style for iPad) */}
      <div className="w-full md:w-64 flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
           <Handwriting className="text-xl">Dosyalar</Handwriting>
           <button 
             onClick={() => setShowNewFolderInput(!showNewFolderInput)}
             className="p-1 hover:bg-slate-200 rounded-full transition-colors"
           >
             <Plus size={20} className="text-slate-600" />
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
                className="w-full px-3 py-2 bg-white rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={newFolderInput}
                onChange={e => setNewFolderInput(e.target.value)}
              />
            </motion.form>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 md:grid-cols-1 gap-3 overflow-y-auto max-h-[30vh] md:max-h-full">
           {folders.map(folder => (
             <button
               key={folder.id}
               onClick={() => setActiveFolderId(folder.id)}
               className={clsx(
                 "relative p-3 rounded-lg text-left transition-all duration-200 border border-transparent flex items-center gap-3",
                 activeFolderId === folder.id 
                    ? "bg-white shadow-md border-slate-100 scale-[1.02]" 
                    : "bg-white/40 hover:bg-white/70"
               )}
             >
               <div className={clsx("w-3 h-full absolute left-0 top-0 bottom-0 rounded-l-lg", folder.color)}></div>
               <Folder size={18} className="text-slate-500 ml-2" />
               <span className="font-medium text-slate-700 truncate">{folder.name}</span>
               {activeFolderId === folder.id && (
                  <motion.div layoutId="active-indicator" className="absolute right-3 w-2 h-2 rounded-full bg-yellow-500" />
               )}
             </button>
           ))}
        </div>
      </div>

      {/* Task List (Paper View) */}
      <div className="flex-1 h-full">
        <Paper className="h-full flex flex-col relative" style={{ minHeight: '500px' }}>
           {/* Header */}
           <div className="flex items-center justify-between pb-6 border-b border-slate-200">
             <div>
                <Handwriting className="text-3xl">{activeFolder?.name}</Handwriting>
                <p className="text-xs text-slate-400 mt-1">
                   {activeTasks.filter(t => t.completed).length} / {activeTasks.length} tamamlandı
                </p>
             </div>
             <div className={clsx("w-4 h-4 rounded-full", activeFolder?.color)}></div>
           </div>

           {/* Tasks */}
           <div className="flex-1 overflow-y-auto mt-4 pr-2 space-y-1">
              {activeTasks.map((task) => (
                 <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={task.id}
                    className="group flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-100 last:border-0"
                 >
                    <button onClick={() => toggleTask(task.id)} className="text-slate-400 hover:text-green-600 transition-colors">
                       {task.completed ? <CheckCircle2 size={22} className="text-green-600" /> : <Circle size={22} />}
                    </button>
                    
                    <div className="flex-1">
                       <p className={clsx("text-slate-800 text-lg font-serif", task.completed && "line-through text-slate-400 decoration-slate-300")}>
                          {task.title}
                       </p>
                       <div className="flex gap-2 mt-1">
                          <span className="text-[10px] text-slate-400">
                             {format(new Date(task.createdAt), 'd MMM', { locale: tr })}
                          </span>
                          <span className="text-[10px] bg-slate-100 px-1.5 rounded text-slate-500 uppercase tracking-wide">
                              {task.assignedBy === 'furkan' ? 'Furkan' : 'Şeyda'}
                          </span>
                       </div>
                    </div>

                    <button 
                       onClick={() => deleteTask(task.id)}
                       className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                    >
                       <Trash2 size={16} />
                    </button>
                 </motion.div>
              ))}

              {activeTasks.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <CheckCircle2 size={48} className="mb-4 opacity-50" />
                    <p className="font-serif italic text-lg">Bu klasörde görev yok.</p>
                 </div>
              )}
           </div>

           {/* Add Task Bar */}
           <div className="mt-4 pt-4 border-t-2 border-slate-100 border-dashed">
              <form onSubmit={handleAddTask} className="flex gap-2">
                 <input 
                    type="text" 
                    placeholder="Yeni bir görev ekle..."
                    className="flex-1 bg-transparent font-serif text-lg placeholder:text-slate-300 focus:outline-none"
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                 />
                 <button 
                    type="submit"
                    disabled={!newTaskInput.trim()}
                    className="bg-slate-800 text-white p-2 rounded-full hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                 >
                    <Plus size={20} />
                 </button>
              </form>
           </div>
        </Paper>
      </div>
    </div>
  );
};
