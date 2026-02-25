"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Paper, Handwriting } from '@/components/skeuomorphic';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  Legend,
} from 'recharts';
import { TrendingUp, Target, Award, BookOpen, AlertTriangle, Loader2, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { RegressionChart, type RegressionData } from '@/components/analytics/regression-chart';

const COLORS = ['#f472b6', '#fbbf24', '#34d399', '#a78bfa', '#fb7185', '#38bdf8', '#14b8a6', '#f97316'];

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
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#1e1e2e',
    boxShadow: '0 4px 20px rgba(244,114,182,0.1)',
    color: 'rgba(255,255,255,0.8)',
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <Handwriting className="text-3xl">Performans Analizi</Handwriting>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1 border border-pink-500/10">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-pink-500/15 text-pink-300 shadow-sm'
                : 'text-white/40 active:text-white/60'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-pink-500 text-white'
              : 'bg-white/[0.04] text-white/50 border border-pink-500/15 active:bg-white/[0.08]'
          }`}
        >
          Tümü
        </button>
        {examTypes.map(et => (
          <button
            key={et.id}
            onClick={() => setFilterType(et.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === et.id
                ? 'bg-pink-500 text-white'
                : 'bg-white/[0.04] text-white/50 border border-pink-500/15 active:bg-white/[0.08]'
            }`}
          >
            {et.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-pink-400/50" size={32} />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* TRENDS TAB */}
          {activeTab === 'trends' && (
            <motion.div
              key="trends"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/[0.04] p-4 rounded-xl border border-pink-500/[0.12] flex flex-col items-center justify-center py-5">
                  <TrendingUp className="text-emerald-400 mb-1" size={20} />
                  <span className="text-2xl font-bold text-white">{stats.max.toFixed(1)}</span>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">En Yüksek</span>
                </div>
                <div className="bg-white/[0.04] p-4 rounded-xl border border-pink-500/[0.12] flex flex-col items-center justify-center py-5">
                  <Target className="text-pink-400 mb-1" size={20} />
                  <span className="text-2xl font-bold text-white">{stats.avg.toFixed(1)}</span>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">Ortalama</span>
                </div>
                <div className="bg-white/[0.04] p-4 rounded-xl border border-pink-500/[0.12] flex flex-col items-center justify-center py-5">
                  <Award className="text-amber-400 mb-1" size={20} />
                  <span className="text-2xl font-bold text-white">{stats.count}</span>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">Deneme</span>
                </div>
                <div className="bg-white/[0.04] p-4 rounded-xl border border-pink-500/[0.12] flex flex-col items-center justify-center py-5">
                  <TrendingUp className="text-purple-400 mb-1" size={20} />
                  <span className="text-2xl font-bold text-white">{stats.latest.toFixed(1)}</span>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">Son Deneme</span>
                </div>
              </div>

              {trends.length === 0 ? (
                <Paper className="text-center py-16">
                  <Handwriting className="text-lg text-white/40">Henüz deneme verisi yok</Handwriting>
                </Paper>
              ) : (
                <>
                  <Paper className="p-4 sm:p-6">
                    <h3 className="text-white/50 font-bold uppercase tracking-wider text-xs mb-4">Toplam Net Trendi</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={trendChartData}>
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area type="monotone" dataKey="total" stroke="#f472b6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" name="Toplam Net" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Paper>

                  <Paper className="p-4 sm:p-6">
                    <h3 className="text-white/50 font-bold uppercase tracking-wider text-xs mb-4">Ders Bazlı Net Trendi</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trendChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.6)' }} />
                        {subjects.map((s, i) => (
                          <Line
                            key={s.id}
                            type="monotone"
                            dataKey={s.name}
                            stroke={COLORS[i % COLORS.length]}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            name={s.name}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </>
              )}
            </motion.div>
          )}

          {/* TOPICS TAB */}
          {activeTab === 'topics' && (
            <motion.div
              key="topics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              {topics.length === 0 ? (
                <Paper className="text-center py-16">
                  <BookOpen className="mx-auto text-white/20 mb-4" size={48} />
                  <Handwriting className="text-lg text-white/40">Konu verisi bulunamadı</Handwriting>
                  <p className="text-sm text-white/30 mt-2">Deneme yanlışlarını girdikten sonra konu analizi burada görünecek</p>
                </Paper>
              ) : (
                <>
                  <Paper className="p-4 sm:p-6">
                    <h3 className="text-white/50 font-bold uppercase tracking-wider text-xs mb-4">
                      En Çok Yanlış Yapılan Konular
                    </h3>
                    <ResponsiveContainer width="100%" height={Math.max(300, topics.slice(0, 15).length * 35)}>
                      <BarChart data={topics.slice(0, 15)} layout="vertical" margin={{ left: 120 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis type="number" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} />
                        <YAxis
                          type="category"
                          dataKey="topicName"
                          tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.6)' }}
                          width={110}
                        />
                        <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} yanlış`, 'Sayı']} />
                        <Bar dataKey="count" name="Yanlış Sayısı" radius={[0, 4, 4, 0]}>
                          {topics.slice(0, 15).map((t, i) => (
                            <Cell key={t.topicId} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>

                  <Paper className="p-4 sm:p-6">
                    <h3 className="text-white/50 font-bold uppercase tracking-wider text-xs mb-4">
                      Ders Bazlı Zayıf Konular
                    </h3>
                    <div className="space-y-4">
                      {Array.from(
                        topics.reduce((map, t) => {
                          if (!map.has(t.subjectName)) map.set(t.subjectName, []);
                          map.get(t.subjectName)!.push(t);
                          return map;
                        }, new Map<string, TopicData[]>())
                      ).map(([subjectName, subjectTopics]) => (
                        <div key={subjectName} className="bg-white/[0.04] rounded-xl border border-pink-500/10 p-4">
                          <h4 className="font-bold text-white/80 text-sm mb-2">{subjectName}</h4>
                          <div className="space-y-1">
                            {subjectTopics.map(t => (
                              <div key={t.topicId} className="flex items-center justify-between text-sm">
                                <span className="text-white/60">{t.topicName}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-24 bg-white/[0.06] rounded-full h-2">
                                    <div
                                      className="bg-rose-400 h-2 rounded-full"
                                      style={{ width: `${Math.min(100, (t.count / (topics[0]?.count || 1)) * 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-rose-400 font-bold text-xs w-6 text-right">{t.count}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Paper>
                </>
              )}
            </motion.div>
          )}

          {/* ERRORS TAB */}
          {activeTab === 'errors' && (
            <motion.div
              key="errors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              {errors.errorReasons.length === 0 ? (
                <Paper className="text-center py-16">
                  <AlertTriangle className="mx-auto text-white/20 mb-4" size={48} />
                  <Handwriting className="text-lg text-white/40">Hata nedeni verisi bulunamadı</Handwriting>
                  <p className="text-sm text-white/30 mt-2">Deneme yanlışlarına hata nedeni ekledikten sonra analiz burada görünecek</p>
                </Paper>
              ) : (
                <>
                  <div className="bg-white/[0.04] p-4 rounded-xl border border-pink-500/[0.12] text-center">
                    <span className="text-3xl font-bold text-white">{errors.totalWrongQuestions}</span>
                    <span className="text-sm text-white/40 block mt-1">Toplam Yanlış Soru (Hata Nedeni Belirlenmiş)</span>
                  </div>

                  <Paper className="p-4 sm:p-6">
                    <h3 className="text-white/50 font-bold uppercase tracking-wider text-xs mb-4">
                      Hata Nedeni Dağılımı
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={errors.errorReasons}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={40}
                          dataKey="count"
                          nameKey="errorReasonName"
                          label={({ errorReasonName, count }) => `${errorReasonName} (${count})`}
                          labelLine
                        >
                          {errors.errorReasons.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.6)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>

                  <Paper className="p-4 sm:p-6">
                    <h3 className="text-white/50 font-bold uppercase tracking-wider text-xs mb-4">
                      Hata Nedeni × Ders Detayı
                    </h3>
                    <div className="space-y-4">
                      {errors.errorReasons.map((er, i) => (
                        <div key={er.errorReasonId} className="bg-white/[0.04] rounded-xl border border-pink-500/10 p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <h4 className="font-bold text-white/80 text-sm">{er.errorReasonName}</h4>
                            <span className="text-xs bg-white/[0.06] px-2 py-0.5 rounded font-medium text-white/50">
                              {er.count} soru
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {er.subjectBreakdown.map(sb => (
                              <span
                                key={sb.subjectId}
                                className="text-xs bg-white/[0.04] border border-pink-500/10 px-2 py-1 rounded text-white/60"
                              >
                                {sb.subjectName}: <span className="font-bold text-rose-400">{sb.count}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Paper>
                </>
              )}
            </motion.div>
          )}

          {/* REGRESSION TAB */}
          {activeTab === 'regression' && (
            <motion.div
              key="regression"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              {!regression || regression.n === 0 ? (
                <Paper className="text-center py-16">
                  <Crosshair className="mx-auto text-white/20 mb-4" size={48} />
                  <Handwriting className="text-lg text-white/40">Projeksiyon için veri yetersiz</Handwriting>
                  <p className="text-sm text-white/30 mt-2">
                    En az 2 deneme sonucu girildikten sonra net projeksiyon grafiği burada görünecek
                  </p>
                </Paper>
              ) : (
                <RegressionChart data={regression} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
