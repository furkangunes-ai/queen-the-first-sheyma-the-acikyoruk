"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  Activity, Plus, TrendingUp, Loader2, X, ChevronRight,
  Ruler, Droplets, Weight, Flame, Moon, Footprints, Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MetricDefinition {
  id: string;
  name: string;
  unit: string;
  type: string;
  latestValue?: number | null;
  latestDate?: string | null;
  recentValues?: number[];
}

interface MetricEntry {
  id: string;
  metricId: string;
  value: number;
  date: string;
  note: string | null;
}

const METRIC_ICONS: Record<string, React.ReactNode> = {
  weight: <Weight size={18} />,
  water: <Droplets size={18} />,
  steps: <Footprints size={18} />,
  calories: <Flame size={18} />,
  sleep: <Moon size={18} />,
  height: <Ruler size={18} />,
};

const CHART_COLORS = ['#ec4899', '#f472b6', '#22d3ee', '#818cf8', '#a78bfa', '#fbcfe8'];

export default function MetricsPage() {
  const [definitions, setDefinitions] = useState<MetricDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  // New metric form
  const [showNewMetricForm, setShowNewMetricForm] = useState(false);
  const [newMetricName, setNewMetricName] = useState('');
  const [newMetricUnit, setNewMetricUnit] = useState('');
  const [newMetricType, setNewMetricType] = useState('number');
  const [creatingMetric, setCreatingMetric] = useState(false);

  // Selected metric for detail view
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);
  const [entries, setEntries] = useState<MetricEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  // Entry form
  const [entryValue, setEntryValue] = useState('');
  const [entryDate, setEntryDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [entryNote, setEntryNote] = useState('');
  const [submittingEntry, setSubmittingEntry] = useState(false);

  const fetchDefinitions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/metrics/definitions');
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setDefinitions(data);
    } catch {
      toast.error('Metrikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDefinitions();
  }, [fetchDefinitions]);

  const fetchEntries = useCallback(async (metricId: string) => {
    try {
      setLoadingEntries(true);
      const res = await fetch(`/api/metrics/entries?metricId=${metricId}`);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setEntries(data);
    } catch {
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoadingEntries(false);
    }
  }, []);

  const handleSelectMetric = (metricId: string) => {
    if (selectedMetricId === metricId) {
      setSelectedMetricId(null);
      setEntries([]);
    } else {
      setSelectedMetricId(metricId);
      fetchEntries(metricId);
      setEntryValue('');
      setEntryDate(format(new Date(), 'yyyy-MM-dd'));
      setEntryNote('');
    }
  };

  const handleCreateMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMetricName.trim()) {
      toast.error('Metrik adı boş olamaz');
      return;
    }

    setCreatingMetric(true);
    try {
      const res = await fetch('/api/metrics/definitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMetricName.trim(),
          unit: newMetricUnit.trim(),
          type: newMetricType,
        }),
      });

      if (!res.ok) throw new Error('Create failed');

      toast.success('Yeni metrik oluşturuldu!');
      setNewMetricName('');
      setNewMetricUnit('');
      setNewMetricType('number');
      setShowNewMetricForm(false);
      fetchDefinitions();
    } catch {
      toast.error('Metrik oluşturulurken hata oluştu');
    } finally {
      setCreatingMetric(false);
    }
  };

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMetricId || !entryValue) {
      toast.error('Değer girilmesi gerekli');
      return;
    }

    setSubmittingEntry(true);
    try {
      const res = await fetch('/api/metrics/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metricId: selectedMetricId,
          value: parseFloat(entryValue),
          date: entryDate,
          note: entryNote.trim() || null,
        }),
      });

      if (!res.ok) throw new Error('Submit failed');

      toast.success('Değer kaydedildi!');
      setEntryValue('');
      setEntryNote('');
      setEntryDate(format(new Date(), 'yyyy-MM-dd'));
      fetchEntries(selectedMetricId);
      fetchDefinitions();
    } catch {
      toast.error('Değer kaydedilirken hata oluştu');
    } finally {
      setSubmittingEntry(false);
    }
  };

  const selectedMetric = definitions.find(d => d.id === selectedMetricId);

  const getMetricIcon = (name: string) => {
    const key = name.toLowerCase();
    for (const [iconKey, icon] of Object.entries(METRIC_ICONS)) {
      if (key.includes(iconKey)) return icon;
    }
    return <Activity size={18} />;
  };

  // Mini sparkline SVG for metric cards
  const MiniSparkline = ({ values, isActive }: { values?: number[], isActive: boolean }) => {
    if (!values || values.length < 2) return null;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const width = 60;
    const height = 24;

    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={isActive ? "#ff2a85" : "rgba(255, 255, 255, 0.2)"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-colors duration-300"
        />
      </svg>
    );
  };

  // Chart data for the selected metric
  const chartData = entries
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry) => ({
      date: format(new Date(entry.date), 'd MMM', { locale: tr }),
      value: entry.value,
      fullDate: format(new Date(entry.date), 'd MMMM yyyy', { locale: tr }),
    }));

  return (
    <div className="h-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="text-pink-400 w-8 h-8" />
          <h1 className="text-3xl font-bold tracking-tight text-white group-hover:text-gradient-candy transition-all duration-500">
            Metrik Takibi
          </h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowNewMetricForm(!showNewMetricForm)}
          className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(255,42,133,0.3)] hover:shadow-[0_0_25px_rgba(255,42,133,0.5)] border border-pink-400/20 transition-all font-bold tracking-wide text-sm flex items-center justify-center gap-2"
        >
          {showNewMetricForm ? <X size={16} /> : <Plus size={16} />}
          {showNewMetricForm ? 'Vazgeç' : 'YENİ METRİK'}
        </motion.button>
      </div>

      {/* New Metric Form */}
      <AnimatePresence>
        {showNewMetricForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-panel p-6 sm:p-8 mt-2">
              <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                <Activity size={20} className="text-cyan-400" />
                <h3 className="text-xl font-bold text-white tracking-tight">Yeni Metrik Tanımla</h3>
              </div>
              <form onSubmit={handleCreateMetric} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-2">
                      Metrik Adı
                    </label>
                    <input
                      type="text"
                      value={newMetricName}
                      onChange={(e) => setNewMetricName(e.target.value)}
                      placeholder="Örn: Kilo, Su, Adım"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-[15px] font-medium text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 focus:border-cyan-400/30 transition-all hover:border-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-2">
                      Birim
                    </label>
                    <input
                      type="text"
                      value={newMetricUnit}
                      onChange={(e) => setNewMetricUnit(e.target.value)}
                      placeholder="Örn: kg, lt, adım"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-[15px] font-medium text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-400/30 transition-all hover:border-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-2">
                      Tür
                    </label>
                    <select
                      value={newMetricType}
                      onChange={(e) => setNewMetricType(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-[15px] font-medium text-white focus:outline-none focus:ring-1 focus:ring-purple-400/50 focus:border-purple-400/30 transition-all hover:border-white/20 [color-scheme:dark]"
                    >
                      <option value="number">Sayı</option>
                      <option value="decimal">Ondalık</option>
                      <option value="duration">Süre</option>
                      <option value="boolean">Evet/Hayır</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    disabled={creatingMetric}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-6 py-2.5 rounded-xl font-bold tracking-wider text-sm hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center gap-2"
                  >
                    {creatingMetric ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        OLUŞTURULUYOR...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        METRİK OLUŞTUR
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metric Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-pink-400" size={32} />
        </div>
      ) : definitions.length === 0 ? (
        <div className="glass-panel text-center py-20">
          <Activity className="mx-auto text-pink-400/30 mb-4" size={56} />
          <h2 className="text-xl font-bold text-white/60 tracking-tight mb-2">Henüz metrik tanımlanmamış</h2>
          <p className="text-[14px] text-white/40 max-w-md mx-auto">
            "YENİ METRİK" butonuyla takip etmek istediğin değerleri (Örn: Su içme, Kilo, Uyku vs.) ekleyebilirsin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {definitions.map((metric, idx) => {
            const isSelected = selectedMetricId === metric.id;
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <button
                  onClick={() => handleSelectMetric(metric.id)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${isSelected
                      ? 'bg-gradient-to-br from-pink-500/10 to-transparent border-pink-400/50 shadow-[0_0_20px_rgba(255,42,133,0.15)]'
                      : 'glass border-white/5 hover:border-pink-500/30 hover:bg-white/[0.04]'
                    }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-[40px] pointer-events-none" />
                  )}

                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${isSelected ? 'bg-pink-500/20 text-pink-400 shadow-inner border border-pink-400/30' : 'bg-white/[0.06] text-white/60 border border-white/5 group-hover:bg-white/[0.08] group-hover:text-white/80'
                        }`}>
                        {getMetricIcon(metric.name)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white tracking-tight">{metric.name}</h3>
                        <span className="text-[10px] text-white/40 font-semibold uppercase tracking-widest">{metric.unit}</span>
                      </div>
                    </div>
                    <ChevronRight
                      size={18}
                      className={`transition-all duration-300 ${isSelected ? 'rotate-90 text-pink-400 scale-110' : 'text-white/20 group-hover:text-white/40 group-hover:translate-x-1'
                        }`}
                    />
                  </div>

                  <div className="flex items-end justify-between relative z-10">
                    <div>
                      {metric.latestValue != null ? (
                        <>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black text-white tracking-tighter">
                              {metric.latestValue}
                            </span>
                            <span className="text-sm font-bold text-white/30 uppercase">{metric.unit}</span>
                          </div>
                          {metric.latestDate && (
                            <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider font-semibold">
                              {format(new Date(metric.latestDate), 'd MMM', { locale: tr })}
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-sm font-medium text-white/20 italic">Henüz veri yok</span>
                      )}
                    </div>
                    <MiniSparkline values={metric.recentValues} isActive={isSelected} />
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Selected Metric Detail */}
      <AnimatePresence>
        {selectedMetricId && selectedMetric && (
          <motion.div
            key={selectedMetricId}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="flex flex-col gap-6 lg:gap-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Entry Form */}
              <div className="lg:col-span-5">
                <div className="glass-panel p-6 sm:p-8 h-full">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                    <TrendingUp size={20} className="text-pink-400" />
                    <h3 className="text-xl font-bold tracking-tight text-white">
                      {selectedMetric.name} Değeri Ekle
                    </h3>
                  </div>

                  <form onSubmit={handleSubmitEntry} className="space-y-6">
                    <div>
                      <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-2">
                        Değer ({selectedMetric.unit})
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={entryValue}
                        onChange={(e) => setEntryValue(e.target.value)}
                        placeholder="Örn: 72.5"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3.5 text-lg font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-400/30 transition-all hover:border-white/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-2">
                        Kayıt Tarihi
                      </label>
                      <input
                        type="date"
                        value={entryDate}
                        onChange={(e) => setEntryDate(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3.5 text-[15px] font-medium text-white focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-400/30 transition-all hover:border-white/20 [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-2">
                        Not (isteğe bağlı)
                      </label>
                      <input
                        type="text"
                        value={entryNote}
                        onChange={(e) => setEntryNote(e.target.value)}
                        placeholder="Değerle ilgili kısa bir not..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 text-[15px] text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-400/30 transition-all hover:border-white/20"
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={submittingEntry}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold tracking-widest text-sm py-4 rounded-2xl hover:from-pink-400 hover:to-pink-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(255,42,133,0.2)] hover:shadow-[0_0_30px_rgba(255,42,133,0.4)] border border-pink-400/20 flex items-center justify-center gap-2"
                    >
                      {submittingEntry ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          KAYDEDİLİYOR...
                        </>
                      ) : (
                        <>
                          <Plus size={18} />
                          SONUCU KAYDET
                        </>
                      )}
                    </motion.button>
                  </form>
                </div>
              </div>

              {/* Right Column: Chart + Table */}
              <div className="lg:col-span-7 flex flex-col gap-6 lg:gap-8">
                {/* Trend Chart */}
                <div className="glass-panel p-6 sm:p-8 flex-grow">
                  {loadingEntries ? (
                    <div className="flex items-center justify-center h-full min-h-[300px]">
                      <Loader2 className="animate-spin text-pink-400" size={32} />
                    </div>
                  ) : chartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                      <TrendingUp className="mx-auto text-pink-400/30 mb-4" size={48} />
                      <h3 className="text-lg font-bold text-white/60 mb-2">Veri Bulunamadı</h3>
                      <p className="text-[13px] text-white/40">
                        Sol taraftaki formu kullanarak değer eklemeye başlayabilirsin.
                      </p>
                    </div>
                  ) : (
                    <>
                      <h3 className="flex items-center gap-2 text-[11px] font-bold text-pink-400 uppercase tracking-widest px-1 mb-6">
                        <Activity size={14} />
                        {selectedMetric.name} Gelişim Grafiği
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontWeight: 600 }}
                            tickLine={false}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            dy={10}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontWeight: 600 }}
                            tickLine={false}
                            axisLine={false}
                            dx={-10}
                            tickFormatter={(val) => `${val}`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(10, 10, 26, 0.9)',
                              backdropFilter: 'blur(10px)',
                              borderRadius: '12px',
                              border: '1px solid rgba(255,42,133,0.2)',
                              boxShadow: '0 8px 32px rgba(255,42,133,0.15)',
                              color: '#fff',
                              fontWeight: 600
                            }}
                            itemStyle={{ color: '#ec4899' }}
                            labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                            formatter={(value: number) => [`${value} ${selectedMetric.unit}`, selectedMetric.name]}
                            labelFormatter={(label) => label}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#ec4899"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#0a0a1a', strokeWidth: 2, stroke: '#ec4899' }}
                            activeDot={{ r: 6, fill: '#ec4899', stroke: '#fff', strokeWidth: 2 }}
                            name={selectedMetric.name}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </>
                  )}
                </div>

                {/* Recent Entries Table */}
                {entries.length > 0 && (
                  <div className="glass-panel p-6 sm:p-8">
                    <h3 className="flex items-center gap-2 text-[11px] font-bold text-cyan-400 uppercase tracking-widest px-1 mb-6">
                      <Footprints size={14} />
                      Geçmiş Kayıtlar
                    </h3>
                    <div className="space-y-3">
                      {entries
                        .slice()
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 10)
                        .map((entry) => (
                          <div
                            key={entry.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between py-3 px-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-colors gap-2"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-white/40 min-w-[80px]">
                                {format(new Date(entry.date), 'd MMM yyyy', { locale: tr })}
                              </span>
                              <span className="font-bold text-white text-[15px]">
                                {entry.value} <span className="text-[10px] text-white/30 tracking-widest">{selectedMetric.unit}</span>
                              </span>
                            </div>
                            {entry.note && (
                              <span className="text-[13px] text-white/50 truncate max-w-full sm:max-w-[200px] italic">
                                "{entry.note}"
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
