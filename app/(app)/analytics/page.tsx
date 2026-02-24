"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Paper, Handwriting, TEXTURES } from '@/components/skeuomorphic';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  Legend,
} from 'recharts';
import { TrendingUp, Target, Award, BookOpen, AlertTriangle, Loader2, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { RegressionChart, type RegressionData } from '@/components/analytics/regression-chart';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

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

  // Data states
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [errors, setErrors] = useState<{ totalWrongQuestions: number; errorReasons: ErrorData[] }>({
    totalWrongQuestions: 0,
    errorReasons: [],
  });
  const [regression, setRegression] = useState<RegressionData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch exam types
  useEffect(() => {
    const fetchExamTypes = async () => {
      try {
        const res = await fetch('/api/exam-types');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (Array.isArray(data)) {
          setExamTypes(data);
        }
      } catch {
        setExamTypes([]);
      }
    };
    fetchExamTypes();
  }, []);

  // Fetch data based on active tab
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
    } catch {
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [activeTab, filterType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Stats
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

  // Get unique subjects from trends
  const subjects = useMemo(() => {
    const subjectMap = new Map<string, string>();
    trends.forEach(t => {
      t.subjectNets.forEach(sn => {
        subjectMap.set(sn.subjectId, sn.subjectName);
      });
    });
    return Array.from(subjectMap.entries()).map(([id, name]) => ({ id, name }));
  }, [trends]);

  // Chart data for trends
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

  return (
    <div className="h-full flex flex-col gap-6">
      <Handwriting className="text-3xl">Performans Analizi</Handwriting>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tümü
        </button>
        {examTypes.map(et => (
          <button
            key={et.id}
            onClick={() => setFilterType(et.id)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              filterType === et.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {et.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-slate-400" size={32} />
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
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center justify-center py-5">
                  <TrendingUp className="text-green-500 mb-1" size={20} />
                  <span className="text-2xl font-bold text-slate-800">{stats.max.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">En Yüksek</span>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center justify-center py-5">
                  <Target className="text-blue-500 mb-1" size={20} />
                  <span className="text-2xl font-bold text-slate-800">{stats.avg.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Ortalama</span>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center justify-center py-5">
                  <Award className="text-yellow-500 mb-1" size={20} />
                  <span className="text-2xl font-bold text-slate-800">{stats.count}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Deneme</span>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center justify-center py-5">
                  <TrendingUp className="text-indigo-500 mb-1" size={20} />
                  <span className="text-2xl font-bold text-slate-800">{stats.latest.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Son Deneme</span>
                </div>
              </div>

              {/* Total Net Trend Chart */}
              {trends.length === 0 ? (
                <Paper className="text-center py-16">
                  <Handwriting className="text-lg text-slate-400">Henüz deneme verisi yok</Handwriting>
                </Paper>
              ) : (
                <>
                  <Paper className="p-2 sm:p-4" style={{
                    backgroundImage: `url(${TEXTURES.graph})`,
                    backgroundSize: '300px',
                  }}>
                    <div className="bg-white/80 backdrop-blur-[2px] rounded-lg p-4 border border-slate-300">
                      <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-4">Toplam Net Trendi</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={trendChartData}>
                          <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" name="Toplam Net" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Paper>

                  {/* Per-Subject Trend */}
                  <Paper className="p-2 sm:p-4">
                    <div className="bg-white/90 rounded-lg p-4 border border-slate-200">
                      <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-4">Ders Bazlı Net Trendi</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Legend />
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
                    </div>
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
                  <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
                  <Handwriting className="text-lg text-slate-400">Konu verisi bulunamadı</Handwriting>
                  <p className="text-sm text-slate-400 mt-2">Deneme yanlışlarını girdikten sonra konu analizi burada görünecek</p>
                </Paper>
              ) : (
                <>
                  {/* Top 15 wrong topics bar chart */}
                  <Paper className="p-2 sm:p-4">
                    <div className="bg-white/90 rounded-lg p-4 border border-slate-200">
                      <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-4">
                        En Çok Yanlış Yapılan Konular
                      </h3>
                      <ResponsiveContainer width="100%" height={Math.max(300, topics.slice(0, 15).length * 35)}>
                        <BarChart data={topics.slice(0, 15)} layout="vertical" margin={{ left: 120 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                          <YAxis
                            type="category"
                            dataKey="topicName"
                            tick={{ fontSize: 11, fill: '#334155' }}
                            width={110}
                          />
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number, name: string) => [`${value} yanlış`, 'Sayı']}
                          />
                          <Bar dataKey="count" name="Yanlış Sayısı" radius={[0, 4, 4, 0]}>
                            {topics.slice(0, 15).map((t, i) => (
                              <Cell key={t.topicId} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Paper>

                  {/* Topic list by subject */}
                  <Paper className="p-4 sm:p-6">
                    <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-4">
                      Ders Bazlı Zayıf Konular
                    </h3>
                    <div className="space-y-4">
                      {/* Group topics by subject */}
                      {Array.from(
                        topics.reduce((map, t) => {
                          if (!map.has(t.subjectName)) map.set(t.subjectName, []);
                          map.get(t.subjectName)!.push(t);
                          return map;
                        }, new Map<string, TopicData[]>())
                      ).map(([subjectName, subjectTopics]) => (
                        <div key={subjectName} className="bg-white rounded-lg border border-slate-200 p-4">
                          <h4 className="font-bold text-slate-700 text-sm mb-2">{subjectName}</h4>
                          <div className="space-y-1">
                            {subjectTopics.map(t => (
                              <div key={t.topicId} className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">{t.topicName}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-24 bg-slate-100 rounded-full h-2">
                                    <div
                                      className="bg-red-400 h-2 rounded-full"
                                      style={{ width: `${Math.min(100, (t.count / (topics[0]?.count || 1)) * 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-red-500 font-bold text-xs w-6 text-right">{t.count}</span>
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
                  <AlertTriangle className="mx-auto text-slate-300 mb-4" size={48} />
                  <Handwriting className="text-lg text-slate-400">Hata nedeni verisi bulunamadı</Handwriting>
                  <p className="text-sm text-slate-400 mt-2">Deneme yanlışlarına hata nedeni ekledikten sonra analiz burada görünecek</p>
                </Paper>
              ) : (
                <>
                  {/* Summary */}
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-center">
                    <span className="text-3xl font-bold text-slate-800">{errors.totalWrongQuestions}</span>
                    <span className="text-sm text-slate-500 block mt-1">Toplam Yanlış Soru (Hata Nedeni Belirlenmiş)</span>
                  </div>

                  {/* Pie Chart */}
                  <Paper className="p-2 sm:p-4">
                    <div className="bg-white/90 rounded-lg p-4 border border-slate-200">
                      <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-4">
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
                            label={({ errorReasonName, count }) =>
                              `${errorReasonName} (${count})`
                            }
                            labelLine
                          >
                            {errors.errorReasons.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Paper>

                  {/* Error breakdown by subject */}
                  <Paper className="p-4 sm:p-6">
                    <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-4">
                      Hata Nedeni × Ders Detayı
                    </h3>
                    <div className="space-y-4">
                      {errors.errorReasons.map((er, i) => (
                        <div key={er.errorReasonId} className="bg-white rounded-lg border border-slate-200 p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <h4 className="font-bold text-slate-700 text-sm">{er.errorReasonName}</h4>
                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-600">
                              {er.count} soru
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {er.subjectBreakdown.map(sb => (
                              <span
                                key={sb.subjectId}
                                className="text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded"
                              >
                                {sb.subjectName}: <span className="font-bold text-red-500">{sb.count}</span>
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
                  <Crosshair className="mx-auto text-slate-300 mb-4" size={48} />
                  <Handwriting className="text-lg text-slate-400">Projeksiyon için veri yetersiz</Handwriting>
                  <p className="text-sm text-slate-400 mt-2">
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
