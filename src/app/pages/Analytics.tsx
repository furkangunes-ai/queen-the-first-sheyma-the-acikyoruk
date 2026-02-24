import React from 'react';
import { useApp } from '../store/AppContext';
import { Paper, Handwriting, TEXTURES } from '../components/ui/Skeuomorphic';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Target, Award } from 'lucide-react';

export const Analytics = () => {
  const { exams } = useApp();

  // Prepare Data for Charts
  const chartData = exams.map(e => ({
    name: e.date,
    net: e.score,
    title: e.title
  }));

  const maxScore = Math.max(...exams.map(e => e.score), 0);
  const minScore = Math.min(...exams.map(e => e.score), 0);
  const average = exams.length > 0 ? (exams.reduce((a, b) => a + b.score, 0) / exams.length).toFixed(1) : 0;

  return (
    <div className="h-full flex flex-col gap-6">
      <Handwriting className="text-3xl">Performans Analizi</Handwriting>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center justify-center py-6">
          <TrendingUp className="text-green-500 mb-2" size={24} />
          <span className="text-3xl font-bold text-slate-800">{maxScore}</span>
          <span className="text-xs text-slate-500 uppercase tracking-widest mt-1">En Yüksek</span>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center justify-center py-6">
          <Target className="text-blue-500 mb-2" size={24} />
          <span className="text-3xl font-bold text-slate-800">{average}</span>
          <span className="text-xs text-slate-500 uppercase tracking-widest mt-1">Ortalama</span>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center justify-center py-6">
          <Award className="text-yellow-500 mb-2" size={24} />
          <span className="text-3xl font-bold text-slate-800">{exams.length}</span>
          <span className="text-xs text-slate-500 uppercase tracking-widest mt-1">Deneme</span>
        </div>
      </div>

      <div className="flex-1 min-h-[400px]">
        <Paper className="h-full p-2 sm:p-4" style={{
            backgroundImage: `url(${TEXTURES.graph})`,
            backgroundSize: '300px', // Bigger grid for visibility
        }}>
           <div className="h-full w-full bg-white/80 backdrop-blur-[2px] rounded-lg p-4 border border-slate-300">
             <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-6">Net Değişim Grafiği</h3>
             <ResponsiveContainer width="100%" height="90%">
               <AreaChart data={chartData}>
                 <defs>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                 <XAxis 
                    dataKey="title" 
                    tick={{fontSize: 10, fill: '#64748b'}} 
                    tickLine={false}
                    axisLine={{stroke: '#cbd5e1'}}
                 />
                 <YAxis 
                    domain={[minScore - 10, maxScore + 10]} 
                    tick={{fontSize: 10, fill: '#64748b'}}
                    tickLine={false}
                    axisLine={{stroke: '#cbd5e1'}}
                 />
                 <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 />
                 <Area 
                    type="monotone" 
                    dataKey="net" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorNet)" 
                 />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </Paper>
      </div>
    </div>
  );
};
