"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Handwriting } from '@/components/skeuomorphic';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  Activity, Plus, TrendingUp, Loader2, X, ChevronRight,
  Ruler, Droplets, Weight, Flame, Moon, Footprints,
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

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

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
  const MiniSparkline = ({ values }: { values?: number[] }) => {
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
          stroke="#6366f1"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
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
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Handwriting as="h1" className="text-3xl">Metrik Takibi</Handwriting>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowNewMetricForm(!showNewMetricForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2"
        >
          {showNewMetricForm ? <X size={16} /> : <Plus size={16} />}
          {showNewMetricForm ? 'Vazgec' : 'Yeni Metrik'}
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
            <Paper className="rotate-[0.3deg]">
              <Handwriting as="h3" className="text-lg mb-4">Yeni Metrik Tanımla</Handwriting>
              <form onSubmit={handleCreateMetric} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Metrik Adı
                    </label>
                    <input
                      type="text"
                      value={newMetricName}
                      onChange={(e) => setNewMetricName(e.target.value)}
                      placeholder="Örn: Kilo, Su, Adım"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Birim
                    </label>
                    <input
                      type="text"
                      value={newMetricUnit}
                      onChange={(e) => setNewMetricUnit(e.target.value)}
                      placeholder="Örn: kg, lt, adım"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Tür
                    </label>
                    <select
                      value={newMetricType}
                      onChange={(e) => setNewMetricType(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="number">Sayı</option>
                      <option value="decimal">Ondalık</option>
                      <option value="duration">Süre</option>
                      <option value="boolean">Evet/Hayır</option>
                    </select>
                  </div>
                </div>
                <motion.button
                  type="submit"
                  disabled={creatingMetric}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {creatingMetric ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Metrik Oluştur
                    </>
                  )}
                </motion.button>
              </form>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metric Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      ) : definitions.length === 0 ? (
        <Paper className="text-center py-16">
          <Activity className="mx-auto text-slate-300 mb-4" size={48} />
          <Handwriting className="text-xl text-slate-400">Henüz metrik tanımlanmamış</Handwriting>
          <p className="text-sm text-slate-400 mt-2">
            &quot;Yeni Metrik&quot; butonuyla takip etmek istediğin değerleri ekleyebilirsin
          </p>
        </Paper>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {definitions.map((metric, idx) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <button
                onClick={() => handleSelectMetric(metric.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 bg-white shadow-sm hover:shadow-md ${
                  selectedMetricId === metric.id
                    ? 'border-blue-400 bg-blue-50/50 shadow-md'
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedMetricId === metric.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {getMetricIcon(metric.name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-700 text-sm">{metric.name}</h3>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{metric.unit}</span>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`text-slate-300 transition-transform duration-200 ${
                      selectedMetricId === metric.id ? 'rotate-90 text-blue-400' : ''
                    }`}
                  />
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    {metric.latestValue != null ? (
                      <>
                        <span className="text-2xl font-bold text-slate-800">
                          {metric.latestValue}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">{metric.unit}</span>
                        {metric.latestDate && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {format(new Date(metric.latestDate), 'd MMM', { locale: tr })}
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-slate-300 italic">Veri yok</span>
                    )}
                  </div>
                  <MiniSparkline values={metric.recentValues} />
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Selected Metric Detail */}
      <AnimatePresence>
        {selectedMetricId && selectedMetric && (
          <motion.div
            key={selectedMetricId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col gap-6"
          >
            {/* Entry Form */}
            <Paper className="rotate-[-0.3deg]">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-blue-500" />
                <Handwriting as="h3" className="text-lg">
                  {selectedMetric.name} - Yeni Değer Ekle
                </Handwriting>
              </div>

              <form onSubmit={handleSubmitEntry} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Değer ({selectedMetric.unit})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={entryValue}
                      onChange={(e) => setEntryValue(e.target.value)}
                      placeholder="Örn: 72.5"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Tarih
                    </label>
                    <input
                      type="date"
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Not (isteğe bağlı)
                    </label>
                    <input
                      type="text"
                      value={entryNote}
                      onChange={(e) => setEntryNote(e.target.value)}
                      placeholder="Kısa bir not..."
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={submittingEntry}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {submittingEntry ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    'Kaydet'
                  )}
                </motion.button>
              </form>
            </Paper>

            {/* Trend Chart */}
            {loadingEntries ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-slate-400" size={28} />
              </div>
            ) : chartData.length === 0 ? (
              <Paper className="text-center py-12">
                <TrendingUp className="mx-auto text-slate-300 mb-3" size={36} />
                <Handwriting className="text-lg text-slate-400">Henüz veri girilmemiş</Handwriting>
                <p className="text-sm text-slate-400 mt-1">
                  Yukarıdaki formu kullanarak değer eklemeye başlayabilirsin
                </p>
              </Paper>
            ) : (
              <Paper className="p-2 sm:p-4 rotate-[0.2deg]">
                <div className="bg-white/90 rounded-lg p-4 border border-slate-200">
                  <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-4">
                    {selectedMetric.name} Trendi
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        tickLine={false}
                        unit={` ${selectedMetric.unit}`}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        formatter={(value: number) => [`${value} ${selectedMetric.unit}`, selectedMetric.name]}
                        labelFormatter={(label) => label}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                        name={selectedMetric.name}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Paper>
            )}

            {/* Recent Entries Table */}
            {entries.length > 0 && (
              <Paper>
                <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-4">
                  Son Girilen Değerler
                </h3>
                <div className="space-y-2">
                  {entries
                    .slice()
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10)
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 w-20">
                            {format(new Date(entry.date), 'd MMM yyyy', { locale: tr })}
                          </span>
                          <span className="font-bold text-slate-700">
                            {entry.value} <span className="text-xs text-slate-400 font-normal">{selectedMetric.unit}</span>
                          </span>
                        </div>
                        {entry.note && (
                          <span className="text-xs text-slate-400 truncate max-w-[200px]">
                            {entry.note}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </Paper>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
