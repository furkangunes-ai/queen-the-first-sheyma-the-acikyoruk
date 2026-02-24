"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Handwriting } from '@/components/skeuomorphic';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Calendar, Clock, Sun, Heart, StickyNote, Loader2, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface CheckIn {
  id: string;
  mood: number;
  energy: number;
  sleep: number;
  gratitude: string;
  notes: string;
  date: string;
  createdAt: string;
}

const MOODS = [
  { value: 1, emoji: '\u{1F61E}', label: 'Kötü' },
  { value: 2, emoji: '\u{1F615}', label: 'Durgun' },
  { value: 3, emoji: '\u{1F610}', label: 'Normal' },
  { value: 4, emoji: '\u{1F642}', label: 'İyi' },
  { value: 5, emoji: '\u{1F60A}', label: 'Harika' },
];

const ENERGY_LEVELS = [
  { value: 1, label: 'Çok Düşük' },
  { value: 2, label: 'Düşük' },
  { value: 3, label: 'Orta' },
  { value: 4, label: 'Yüksek' },
  { value: 5, label: 'Çok Yüksek' },
];

export default function CheckInPage() {
  const [mood, setMood] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(0);
  const [sleep, setSleep] = useState<string>('');
  const [gratitude, setGratitude] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [submitting, setSubmitting] = useState(false);

  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchRecentCheckIns = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch('/api/check-ins?limit=7');
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setRecentCheckIns(data);
    } catch {
      // Silently fail on initial load
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentCheckIns();
  }, [fetchRecentCheckIns]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mood === 0) {
      toast.error('Lütfen ruh halini seç');
      return;
    }
    if (energy === 0) {
      toast.error('Lütfen enerji seviyeni seç');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/check-ins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood,
          energy,
          sleep: sleep ? parseFloat(sleep) : null,
          gratitude: gratitude.trim() || null,
          notes: notes.trim() || null,
          date,
        }),
      });

      if (!res.ok) throw new Error('Submit failed');

      toast.success('Check-in kaydedildi!');
      setMood(0);
      setEnergy(0);
      setSleep('');
      setGratitude('');
      setNotes('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      fetchRecentCheckIns();
    } catch {
      toast.error('Kaydederken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const getMoodEmoji = (value: number) => {
    return MOODS.find(m => m.value === value)?.emoji || '-';
  };

  const getEnergyLabel = (value: number) => {
    return ENERGY_LEVELS.find(e => e.value === value)?.label || '-';
  };

  return (
    <div className="h-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Handwriting as="h1" className="text-3xl">Günlük Check-in</Handwriting>
        <span className="text-sm text-slate-400">
          {format(new Date(), 'd MMMM EEEE', { locale: tr })}
        </span>
      </div>

      {/* Form */}
      <Paper className="rotate-[-0.5deg]">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Ruh Hali */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">
              <Heart size={16} className="text-pink-400" />
              Ruh Hali
            </label>
            <div className="flex gap-3 justify-center">
              {MOODS.map((m) => (
                <motion.button
                  key={m.value}
                  type="button"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMood(m.value)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 transition-all duration-200 ${
                    mood === m.value
                      ? 'border-blue-500 bg-blue-50 shadow-md scale-110'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  title={m.label}
                >
                  {m.emoji}
                </motion.button>
              ))}
            </div>
            {mood > 0 && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-xs text-slate-400 mt-2"
              >
                {MOODS.find(m => m.value === mood)?.label}
              </motion.p>
            )}
          </div>

          {/* Enerji Seviyesi */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">
              <Sun size={16} className="text-yellow-500" />
              Enerji Seviyesi
            </label>
            <div className="flex gap-2 justify-center">
              {ENERGY_LEVELS.map((e) => (
                <motion.button
                  key={e.value}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEnergy(e.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                    energy === e.value
                      ? 'border-yellow-400 bg-yellow-50 text-yellow-700 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span className="block text-lg font-bold">{e.value}</span>
                  <span className="text-[10px] uppercase tracking-wide">{e.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Uyku Suresi */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">
              <Clock size={16} className="text-indigo-400" />
              Uyku Süresi (saat)
            </label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={sleep}
              onChange={(e) => setSleep(e.target.value)}
              placeholder="Örn: 7.5"
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-shadow"
            />
          </div>

          {/* Minnettarlik */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">
              <Heart size={16} className="text-rose-400" />
              Minnettarlık
            </label>
            <textarea
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              placeholder="Bugün neler için minnettarsın?"
              rows={3}
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-shadow resize-none"
            />
          </div>

          {/* Notlar */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">
              <StickyNote size={16} className="text-amber-500" />
              Notlar
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Günle ilgili notların..."
              rows={3}
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-shadow resize-none"
            />
          </div>

          {/* Tarih */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">
              <Calendar size={16} className="text-blue-400" />
              Tarih
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-shadow"
            />
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              'Kaydet'
            )}
          </motion.button>
        </form>
      </Paper>

      {/* Recent Check-ins Timeline */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Handwriting as="h2" className="text-2xl">Son Check-inler</Handwriting>
          <ChevronDown size={18} className="text-slate-400" />
        </div>

        {loadingHistory ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-slate-400" size={28} />
          </div>
        ) : recentCheckIns.length === 0 ? (
          <Paper className="text-center py-12">
            <Calendar className="mx-auto text-slate-300 mb-4" size={40} />
            <Handwriting className="text-lg text-slate-400">Henüz check-in yok</Handwriting>
            <p className="text-sm text-slate-400 mt-2">
              İlk check-inini yukarıdaki formu doldurarak yapabilirsin
            </p>
          </Paper>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-200" />

            <div className="space-y-4">
              <AnimatePresence>
                {recentCheckIns.map((checkIn, idx) => (
                  <motion.div
                    key={checkIn.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-3.5 top-6 w-3 h-3 rounded-full bg-blue-400 border-2 border-white shadow-sm z-10" />

                    <Paper className="ml-12" style={{ padding: '16px 20px' }}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getMoodEmoji(checkIn.mood)}</span>
                          <div>
                            <p className="font-bold text-slate-700 text-sm">
                              {format(new Date(checkIn.date), 'd MMMM EEEE', { locale: tr })}
                            </p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[10px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-200 uppercase tracking-wide font-bold">
                                Enerji: {checkIn.energy}/5
                              </span>
                              {checkIn.sleep != null && (
                                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200 uppercase tracking-wide font-bold">
                                  Uyku: {checkIn.sleep} saat
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">
                          {getEnergyLabel(checkIn.energy)}
                        </span>
                      </div>

                      {checkIn.gratitude && (
                        <div className="mt-2 bg-rose-50 rounded p-2 border border-rose-100">
                          <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block mb-0.5">Minnettarlık</span>
                          <p className="text-sm text-slate-600 leading-relaxed">{checkIn.gratitude}</p>
                        </div>
                      )}

                      {checkIn.notes && (
                        <div className="mt-2 bg-slate-50 rounded p-2 border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Notlar</span>
                          <p className="text-sm text-slate-600 leading-relaxed">{checkIn.notes}</p>
                        </div>
                      )}
                    </Paper>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
