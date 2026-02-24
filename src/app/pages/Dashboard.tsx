import React, { useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { Paper, Handwriting, Tape } from '../components/ui/Skeuomorphic';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { clsx } from 'clsx';
import { CheckCircle2, Circle, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export const Dashboard = () => {
  const { currentUser, tasks, exams } = useApp();

  const pendingTasks = tasks.filter(t => !t.completed);
  const todaysTasks = pendingTasks.slice(0, 5); // Show top 5
  
  const lastExam = exams.length > 0 ? exams[exams.length - 1] : null;
  const averageScore = exams.length > 0 
    ? (exams.reduce((acc, curr) => acc + curr.score, 0) / exams.length).toFixed(1)
    : '0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
      {/* Left Column: Welcome & Quick Stats */}
      <div className="flex flex-col gap-8">
        <Paper className="rotate-[-1deg]">
          <Tape className="-top-3 left-1/2 -translate-x-1/2" />
          <Handwriting as="h1" className="text-3xl mb-2 text-slate-900">
            Merhaba, {currentUser === 'seyda' ? 'Şeyda' : 'Furkan'}!
          </Handwriting>
          <p className="text-slate-600 mb-6 font-medium">
            Bugün {format(new Date(), 'd MMMM EEEE', { locale: tr })}. 
            {currentUser === 'seyda' ? ' Hedeflerine ulaşmak için harika bir gün.' : ' Yönetici paneline hoş geldin.'}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-yellow-50 p-4 rounded border border-yellow-200 shadow-inner">
              <div className="flex items-center gap-2 text-yellow-700 mb-1">
                <TrendingUp size={18} />
                <span className="font-bold text-xs uppercase tracking-wider">Ortalama</span>
              </div>
              <span className="text-3xl font-serif text-slate-800">{averageScore}</span>
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
        </Paper>

        {/* Last Exam Result */}
        {lastExam && (
          <Paper className="rotate-[1deg] bg-indigo-50/50">
             <Tape className="-top-3 right-10" />
             <div className="flex justify-between items-start mb-4">
               <Handwriting className="text-xl">Son Deneme</Handwriting>
               <span className="text-xs font-bold text-slate-400 uppercase">{format(new Date(lastExam.date), 'dd.MM.yyyy')}</span>
             </div>
             
             <div className="flex items-center justify-center py-6 relative">
                <div className="w-32 h-32 rounded-full border-4 border-indigo-200 flex items-center justify-center bg-white shadow-sm z-10">
                   <div className="text-center">
                      <span className="block text-3xl font-bold text-indigo-900">{lastExam.score}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide">Net</span>
                   </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute w-40 h-40 rounded-full border border-dashed border-indigo-300 animate-spin-slow opacity-50"></div>
             </div>
             
             <div className="text-center mt-2">
                <h3 className="font-bold text-slate-700">{lastExam.title}</h3>
                <p className="text-xs text-slate-500">{lastExam.totalQuestions} Soru Üzerinden</p>
             </div>
          </Paper>
        )}
      </div>

      {/* Right Column: Todo List */}
      <div className="h-full">
        <Paper className="h-full flex flex-col relative rotate-[0.5deg]">
          <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-slate-100 to-transparent z-10 rounded-t"></div>
          
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-slate-100 border-dashed">
            <Handwriting className="text-2xl">Yapılacaklar</Handwriting>
            <Calendar className="text-slate-400" size={20} />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {todaysTasks.length === 0 ? (
              <div className="text-center py-10 text-slate-400 italic">
                Bugün için bekleyen görev yok!
              </div>
            ) : (
              todaysTasks.map(task => (
                <div key={task.id} className="group flex items-start gap-3 p-3 hover:bg-yellow-50/50 rounded transition-colors cursor-default">
                   <button className="mt-0.5 text-slate-400 hover:text-green-600 transition-colors">
                      {task.completed ? <CheckCircle2 size={20} className="text-green-600" /> : <Circle size={20} />}
                   </button>
                   <div className="flex-1">
                      <p className={clsx("text-slate-700 leading-snug font-medium", task.completed && "line-through text-slate-400")}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200 uppercase tracking-wide">
                          {task.assignedBy === currentUser ? 'Ben' : (task.assignedBy === 'furkan' ? 'Furkan' : 'Şeyda')}
                        </span>
                      </div>
                   </div>
                </div>
              ))
            )}
            
            {pendingTasks.length > 5 && (
               <div className="text-center pt-4">
                  <span className="text-xs text-slate-400 italic">ve {pendingTasks.length - 5} görev daha...</span>
               </div>
            )}
          </div>
        </Paper>
      </div>
    </div>
  );
};
