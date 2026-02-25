"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  Legend,
} from 'recharts';
import { TrendingUp, Target, Award, BookOpen, AlertTriangle, Loader2, Crosshair, Sparkles, PieChart as PieChartIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { RegressionChart, type RegressionData } from '@/components/analytics/regression-chart';

const COLORS = ['#ff2a85', '#ff7eb3', '#00f0ff', '#bb66ff', '#ffb84d', '#ff3366', '#00e5ff', '#ff99cc'];

type Tab = 'trends' | 'topics' | 'errors' | 'regression';

interface TrendData {
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

interface TopicData {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  count: number;
}

interface ErrorData {
  errorReasonId: string;
  errorReasonName: string;
  count: number;
  subjectBreakdown: Array<{
    subjectId: string;
    subjectName: string;
    count: number;
  }>;
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('trends');
  const [filterType, setFilterType] = useState<string>('all');
  const [examTypes, setExamTypes] = useState<Array<{ id: string; name: string }>>([]);

  const [trends, setTrends] = useState<TrendData[]>([]);
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [errors, setErrors] = useState<{ totalWrongQuestions: number; errorReasons: ErrorData[] }>({
    totalWrongQuestions: 0,
    errorReasons: [],
  });
  const [regression, setRegression] = useState<RegressionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExamTypes = async () => {
      try {
        const res = await fetch('/api/exam-types');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (Array.isArray(data)) setExamTypes(data);
      } catch {
        setExamTypes([]);
      }
    };
    fetchExamTypes();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const typeParam = filterType !== 'all' ? `examTypeId=${filterType}` : '';

    try {
      if (activeTab === 'trends') {
        const res = await fetch(`/api/analytics/trends?${typeParam}&limit=50`);
        if (!res.ok) throw new Error();
        setTrends(await res.json());
      } else if (activeTab === 'topics') {
        const res = await fetch(`/api/analytics/topics?${typeParam}`);
        if (!res.ok) throw new Error();
        setTopics(await res.json());
      } else if (activeTab === 'errors') {
        const res = await fetch(`/api/analytics/errors?${typeParam}`);
        if (!res.ok) throw new Error();
        setErrors(await res.json());
      } else if (activeTab === 'regression') {
        const res = await fetch(`/api/analytics/regression?${typeParam}&targets=70,80,90,100`);
        if (!res.ok) throw new Error();
        setRegression(await res.json());
      }
    } catch (err) {
      console.error('Analytics veriler yüklenirken hata:', err);
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [activeTab, filterType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => {
    if (trends.length === 0) return { max: 0, avg: 0, count: 0, latest: 0 };
    const nets = trends.map(t => t.totalNet);
    return {
      max: Math.max(...nets),
      avg: nets.reduce((a, b) => a + b, 0) / nets.length,
      count: trends.length,
      latest: nets[nets.length - 1] || 0,
    };
  }, [trends]);

  const subjects = useMemo(() => {
    const subjectMap = new Map<string, string>();
    trends.forEach(t => {
      t.subjectNets.forEach(sn => {
        subjectMap.set(sn.subjectId, sn.subjectName);
      });
    });
    return Array.from(subjectMap.entries()).map(([id, name]) => ({ id, name }));
  }, [trends]);

  const trendChartData = useMemo(() => {
    return trends.map(t => {
      const row: Record<string, any> = {
        name: t.examTitle,
        date: new Date(t.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
        total: Number(t.totalNet.toFixed(1)),
      };
      t.subjectNets.forEach(sn => {
        row[sn.subjectName] = Number(sn.netScore.toFixed(1));
      });
      return row;
    });
  }, [trends]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'trends', label: 'Deneme Gidişatı', icon: <TrendingUp size={16} /> },
    { key: 'topics', label: 'Konu Analizi', icon: <BookOpen size={16} /> },
    { key: 'errors', label: 'Hata Analizi', icon: <AlertTriangle size={16} /> },
    { key: 'regression', label: 'Projeksiyon', icon: <Crosshair size={16} /> },
  ];

  const tooltipStyle = {
    borderRadius: '16px',
    border: '1px solid rgba(255,42,133,0.2)',
    backgroundColor: 'rgba(17,9,21,0.95)',
    boxShadow: '0 8px 32px rgba(255,42,133,0.15)',
    color: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(12px)',
  };

  return (
    <div className="h-full flex flex-col gap-6 lg:gap-8">
      <div className="flex items-center gap-3">
        <Sparkles className="text-pink-400 w-8 h-8" />
        <h1 className="text-3xl font-bold tracking-tight text-white group-hover:text-gradient-candy transition-all duration-500">
          Performans Analizi
        </h1>
      </div>

      {/* Tab Navigation & Filter Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-4">
        <div className="flex gap-1 bg-white/[0.04] rounded-[calc(var(--radius)*1.2)] p-1 border border-pink-500/10 w-full md:w-auto overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.key
                  ? 'bg-gradient-to-r from-pink-500/80 to-pink-600/80 text-white shadow-[0_4px_12px_rgba(255,42,133,0.3)] border border-pink-400/30'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.05]'
                }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filterType === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                : 'bg-white/[0.02] text-white/40 border border-white/5 hover:bg-white/[0.05]'
              }`}
          >
            Tümü
          </button>
          {examTypes.map(et => (
            <button
              key={et.id}
              onClick={() => setFilterType(et.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filterType === et.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                  : 'bg-white/[0.02] text-white/40 border border-white/5 hover:bg-white/[0.05]'
                }`}
            >
              {et.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-pink-500" size={40} />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* TRENDS TAB */}
          {activeTab === 'trends' && (
            <motion.div
              key="trends"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              className="flex flex-col gap-6"
            >
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass hover-lift p-5 flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-[30px] group-hover:bg-cyan-500/20 transition-all opacity-50" />
                  <TrendingUp className="text-cyan-400 mb-2" size={24} />
                  <span className="text-3xl font-bold text-white tracking-tighter">{stats.max.toFixed(1)}</span>
                  <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-1">En Yüksek</span>
                </div>
                <div className="glass hover-lift p-5 flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-[30px] group-hover:bg-pink-500/20 transition-all opacity-50" />
                  <Target className="text-pink-400 mb-2" size={24} />
                  <span className="text-3xl font-bold text-white tracking-tighter">{stats.avg.toFixed(1)}</span>
                  <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-1">Ortalama</span>
                </div>
                <div className="glass hover-lift p-5 flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-[30px] group-hover:bg-purple-500/20 transition-all opacity-50" />
                  <Award className="text-purple-400 mb-2" size={24} />
                  <span className="text-3xl font-bold text-white tracking-tighter">{stats.count}</span>
                  <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-1">Deneme</span>
                </div>
                <div className="glass hover-lift p-5 flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-[30px] group-hover:bg-orange-500/20 transition-all opacity-50" />
                  <TrendingUp className="text-orange-400 mb-2" size={24} />
                  <span className="text-3xl font-bold text-white tracking-tighter">{stats.latest.toFixed(1)}</span>
                  <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-1">Son Deneme</span>
                </div>
              </div>

              {trends.length === 0 ? (
                <div className="glass-panel text-center py-20 flex flex-col items-center justify-center">
                  <TrendingUp className="text-pink-400/30 mb-4" size={56} />
                  <h2 className="text-xl font-bold text-white/60">Henüz deneme verisi yok</h2>
                </div>
              ) : (
                <>
                  <div className="glass-panel p-6 sm:p-8">
                    <h3 className="text-white font-bold tracking-tight text-lg mb-6 flex items-center gap-2">
                      <TrendingUp className="text-pink-400" size={20} />
                      Toplam Net Trendi
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={trendChartData}>
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff2a85" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#ff2a85" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,42,133,0.1)" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.6)' }} tickLine={false} axisLine={false} dy={10} />
                        <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.6)' }} tickLine={false} axisLine={false} dx={-10} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area type="monotone" dataKey="total" stroke="#ff2a85" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" name="Toplam Net" activeDot={{ r: 6, fill: '#ff2a85', stroke: '#fff', strokeWidth: 2 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="glass-panel p-6 sm:p-8">
                    <h3 className="text-white font-bold tracking-tight text-lg mb-6 flex items-center gap-2">
                      <BookOpen className="text-cyan-400" size={20} />
                      Ders Bazlı Net Trendi
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={trendChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,240,255,0.1)" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.6)' }} tickLine={false} axisLine={false} dy={10} />
                        <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.6)' }} tickLine={false} axisLine={false} dx={-10} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginTop: '20px' }} iconType="circle" />
                        {subjects.map((s, i) => (
                          <Line
                            key={s.id}
                            type="monotone"
                            dataKey={s.name}
                            stroke={COLORS[i % COLORS.length]}
                            strokeWidth={3}
                            dot={{ r: 4, fill: COLORS[i % COLORS.length], strokeWidth: 0 }}
                            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                            name={s.name}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* TOPICS TAB */}
          {activeTab === 'topics' && (
            <motion.div
              key="topics"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              className="flex flex-col gap-6"
            >
              {topics.length === 0 ? (
                <div className="glass-panel text-center py-20 flex flex-col items-center justify-center">
                  <BookOpen className="text-pink-400/30 mb-4" size={56} />
                  <h2 className="text-xl font-bold text-white/60">Konu verisi bulunamadı</h2>
                  <p className="text-sm text-white/40 mt-2">Deneme yanlışlarını girdikten sonra konu analizi burada görünecek.</p>
                </div>
              ) : (
                <>
                  <div className="glass-panel p-6 sm:p-8">
                    <h3 className="text-white font-bold tracking-tight text-lg mb-6 flex items-center gap-2">
                      <Target className="text-pink-400" size={20} />
                      En Çok Yanlış Yapılan Konular
                    </h3>
                    <ResponsiveContainer width="100%" height={Math.max(350, topics.slice(0, 15).length * 45)}>
                      <BarChart data={topics.slice(0, 15)} layout="vertical" margin={{ left: 140 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,42,133,0.1)" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.6)' }} tickLine={false} axisLine={false} />
                        <YAxis
                          type="category"
                          dataKey="topicName"
                          tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.8)', fontWeight: 500 }}
                          tickLine={false}
                          axisLine={false}
                          width={130}
                        />
                        <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} yanlış`, 'Sayı']} cursor={{ fill: 'rgba(255,42,133,0.05)' }} />
                        <Bar dataKey="count" name="Yanlış Sayısı" radius={[0, 6, 6, 0]} barSize={24}>
                          {topics.slice(0, 15).map((t, i) => (
                            <Cell key={t.topicId} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="glass-panel p-6 sm:p-8">
                    <h3 className="text-white font-bold tracking-tight text-lg mb-6 flex items-center gap-2">
                      <AlertTriangle className="text-cyan-400" size={20} />
                      Ders Bazlı Zayıf Konular
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array.from(
                        topics.reduce((map, t) => {
                          if (!map.has(t.subjectName)) map.set(t.subjectName, []);
                          map.get(t.subjectName)!.push(t);
                          return map;
                        }, new Map<string, TopicData[]>())
                      ).map(([subjectName, subjectTopics], idx) => (
                        <div key={subjectName} className="glass bg-white/[0.02] rounded-2xl border border-white/5 p-5 hover:border-pink-500/30 transition-colors group">
                          <h4 className="font-bold text-white text-[15px] mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                            {subjectName}
                          </h4>
                          <div className="space-y-3">
                            {subjectTopics.map(t => (
                              <div key={t.topicId} className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-white/70 text-[13px] font-medium truncate pr-2">{t.topicName}</span>
                                  <span className="text-pink-400 font-bold text-xs bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">{t.count}</span>
                                </div>
                                <div className="w-full bg-white/[0.05] rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                      width: `${Math.min(100, (t.count / (topics[0]?.count || 1)) * 100)}%`,
                                      backgroundColor: COLORS[idx % COLORS.length]
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ERRORS TAB */}
          {activeTab === 'errors' && (
            <motion.div
              key="errors"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              className="flex flex-col gap-6"
            >
              {errors.errorReasons.length === 0 ? (
                <div className="glass-panel text-center py-20 flex flex-col items-center justify-center">
                  <AlertTriangle className="text-pink-400/30 mb-4" size={56} />
                  <h2 className="text-xl font-bold text-white/60">Hata nedeni verisi bulunamadı</h2>
                  <p className="text-sm text-white/40 mt-2">Deneme yanlışlarına hata nedeni ekledikten sonra analiz burada görünecek.</p>
                </div>
              ) : (
                <>
                  <div className="glass-panel p-8 text-center relative overflow-hidden group">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-pink-500/20 transition-all duration-700" />
                    <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-pink-400 to-pink-600 tracking-tighter block mb-2 relative z-10">{errors.totalWrongQuestions}</span>
                    <span className="text-sm font-semibold text-white/50 uppercase tracking-widest relative z-10">Toplam Yanlış Soru (Açıklamalı)</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    <div className="glass-panel p-6 sm:p-8 flex flex-col items-center justify-center min-h-[400px]">
                      <h3 className="text-white font-bold tracking-tight text-lg mb-2 flex items-center gap-2 w-full">
                        <PieChartIcon className="text-pink-400" size={20} />
                        Hata Nedeni Dağılımı
                      </h3>
                      <div className="w-full flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={errors.errorReasons}
                              cx="50%"
                              cy="50%"
                              innerRadius={80}
                              outerRadius={120}
                              paddingAngle={5}
                              dataKey="count"
                              nameKey="errorReasonName"
                              stroke="none"
                            >
                              {errors.errorReasons.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', paddingTop: '20px' }} iconType="circle" />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="glass-panel p-6 sm:p-8">
                      <h3 className="text-white font-bold tracking-tight text-lg mb-6 flex items-center gap-2">
                        <BookOpen className="text-cyan-400" size={20} />
                        Hata Nedeni × Ders Detayı
                      </h3>
                      <div className="space-y-4">
                        {errors.errorReasons.map((er, i) => (
                          <div key={er.errorReasonId} className="glass bg-white/[0.02] rounded-2xl border border-white/5 p-5 hover:border-pink-500/20 transition-all">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ backgroundColor: COLORS[i % COLORS.length], boxShadow: `0 0 10px ${COLORS[i % COLORS.length]}` }} />
                                <h4 className="font-bold text-white text-[15px]">{er.errorReasonName}</h4>
                              </div>
                              <span className="text-[11px] bg-pink-500/10 px-2.5 py-1 rounded-full font-bold text-pink-400 border border-pink-500/20">
                                {er.count} Soru
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                              {er.subjectBreakdown.map(sb => (
                                <span
                                  key={sb.subjectId}
                                  className="text-[12px] glass bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-lg text-white/70 font-medium"
                                >
                                  {sb.subjectName}: <span className="font-bold" style={{ color: COLORS[i % COLORS.length] }}>{sb.count}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* REGRESSION TAB */}
          {activeTab === 'regression' && (
            <motion.div
              key="regression"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              className="flex flex-col gap-6"
            >
              {!regression || regression.n === 0 ? (
                <div className="glass-panel text-center py-20 flex flex-col items-center justify-center">
                  <Crosshair className="text-cyan-400/30 mb-4" size={56} />
                  <h2 className="text-xl font-bold text-white/60">Projeksiyon için veri yetersiz</h2>
                  <p className="text-sm text-white/40 mt-2">En az 2 deneme sonucu girildikten sonra net projeksiyon grafiği burada görünecek.</p>
                </div>
              ) : (
                <div className="glass-panel p-2 sm:p-4">
                  <RegressionChart data={regression} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
