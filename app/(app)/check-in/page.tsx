"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Calendar, Clock, Sun, Heart, StickyNote, Loader2, ChevronDown, Sparkles } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="text-pink-400 w-8 h-8" />
          <h1 className="text-3xl font-bold tracking-tight text-white group-hover:text-gradient-candy transition-all duration-500">
            Günlük Check-in
          </h1>
        </div>
        <div className="glass px-4 py-2 rounded-xl text-sm font-semibold text-white/70 border border-white/5 flex items-center gap-2">
          <Calendar className="text-pink-400" size={16} />
          {format(new Date(), 'd MMMM EEEE', { locale: tr })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-7">
          <div className="glass-panel p-6 sm:p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-pink-500/10 transition-colors duration-500" />
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              {/* Ruh Hali */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-widest px-1 mb-4">
                  <Heart size={16} className="text-pink-400" />
                  Bugün Nasıl Hissediyorsun?
                </label>
                <div className="flex flex-wrap gap-3 sm:gap-4 justify-center sm:justify-start">
                  {MOODS.map((m) => (
                    <motion.button
                      key={m.value}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMood(m.value)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[calc(var(--radius)*1.2)] flex items-center justify-center text-2xl sm:text-3xl border-2 transition-all duration-300 ${mood === m.value
                          ? 'border-pink-400 bg-gradient-to-br from-pink-500/20 to-pink-600/10 shadow-[0_0_20px_rgba(255,42,133,0.3)] scale-110'
                          : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-pink-500/20'
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
                    className="text-pink-400 font-medium text-sm mt-3 ml-2 text-center sm:text-left"
                  >
                    {MOODS.find(m => m.value === mood)?.label}
                  </motion.p>
                )}
              </div>

              {/* Enerji Seviyesi */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-widest px-1 mb-4">
                  <Sun size={16} className="text-amber-400" />
                  Enerji Seviyen
                </label>
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
                  {ENERGY_LEVELS.map((e) => (
                    <motion.button
                      key={e.value}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEnergy(e.value)}
                      className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] ${energy === e.value
                          ? 'border-amber-400/60 bg-gradient-to-br from-amber-500/20 to-orange-600/10 shadow-[0_0_20px_rgba(251,191,36,0.2)] text-amber-300'
                          : 'border-white/5 bg-white/[0.02] text-white/40 hover:bg-white/[0.05] hover:border-amber-500/20 hover:text-white/70'
                        }`}
                    >
                      <span className="block text-lg sm:text-xl font-bold mb-1">{e.value}</span>
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-wide font-semibold text-center leading-tight">{e.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Uyku Suresi */}
                <div>
                  <label className="flex items-center gap-2 text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-2">
                    <Clock size={16} className="text-cyan-400" />
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
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3.5 text-[15px] font-medium text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 focus:border-cyan-400/30 transition-all hover:border-white/20"
                  />
                </div>

                {/* Tarih */}
                <div>
                  <label className="flex items-center gap-2 text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-2">
                    <Calendar size={16} className="text-pink-400" />
                    Kayıt Tarihi
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3.5 text-[15px] font-medium text-white focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-400/30 transition-all hover:border-white/20 [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Minnettarlik */}
              <div>
                <label className="flex items-center gap-2 text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-2">
                  <Heart size={16} className="text-rose-400" />
                  Bugün Ne İçin Minnettarsın?
                </label>
                <textarea
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  placeholder="Küçük ya da büyük, bugün seni mutlu eden bir şey..."
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-[15px] text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-rose-400/50 focus:border-rose-400/30 transition-all hover:border-white/20 resize-none leading-relaxed"
                />
              </div>

              {/* Notlar */}
              <div>
                <label className="flex items-center gap-2 text-[11px] font-bold text-white/50 uppercase tracking-widest px-1 mb-2">
                  <StickyNote size={16} className="text-purple-400" />
                  Günün Notları
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Günün nasıl geçti? Neler öğrendin?"
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-[15px] text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-purple-400/50 focus:border-purple-400/30 transition-all hover:border-white/20 resize-none leading-relaxed"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold tracking-wide py-4 rounded-2xl hover:from-pink-400 hover:to-pink-500 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,42,133,0.3)] hover:shadow-[0_0_30px_rgba(255,42,133,0.5)] border border-pink-400/20 group/btn"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    KAYDEDİLİYOR...
                  </>
                ) : (
                  <>
                    <Heart size={18} className="transition-transform group-hover/btn:scale-110" />
                    CHECK-IN KAYDET
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar: Recent Check-ins Timeline */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 text-cyan-400">
              <Clock size={16} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Geçmiş Kayıtlar</h2>
            <ChevronDown size={18} className="text-white/30 ml-auto" />
          </div>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-20 glass-panel">
              <Loader2 className="animate-spin text-cyan-400" size={32} />
            </div>
          ) : recentCheckIns.length === 0 ? (
            <div className="glass-panel text-center py-16 flex flex-col items-center justify-center">
              <Calendar className="mx-auto text-cyan-400/30 mb-4" size={48} />
              <h3 className="text-lg font-bold text-white/60 mb-2">Henüz check-in yok</h3>
              <p className="text-[13px] text-white/40 max-w-[200px]">
                İlk check-inini soldaki formu doldurarak yapabilirsin.
              </p>
            </div>
          ) : (
            <div className="relative pl-4 mt-2">
              {/* Glowing Timeline line */}
              <div className="absolute left-[21px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-pink-500/50 via-cyan-500/30 to-transparent rounded-full" />

              <div className="space-y-6">
                <AnimatePresence>
                  {recentCheckIns.map((checkIn, idx) => (
                    <motion.div
                      key={checkIn.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative pl-10"
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-1 top-6 w-3.5 h-3.5 rounded-full bg-background border-2 border-pink-400 shadow-[0_0_10px_rgba(255,42,133,0.5)] z-10" />

                      <div className="glass bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:border-pink-500/20 transition-all group">
                        <div className="flex items-start justify-between mb-3 border-b border-white/5 pb-3">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner">
                              {getMoodEmoji(checkIn.mood)}
                            </div>
                            <div>
                              <p className="font-bold text-white/90 text-[15px]">
                                {format(new Date(checkIn.date), 'd MMMM EEEE', { locale: tr })}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20 uppercase tracking-wider font-bold">
                                  Enerji: {checkIn.energy}/5
                                </span>
                                {checkIn.sleep != null && (
                                  <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-md border border-cyan-500/20 uppercase tracking-wider font-bold flex items-center gap-1">
                                    <Clock size={10} />
                                    {checkIn.sleep}s
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {checkIn.gratitude && (
                            <div className="bg-gradient-to-br from-rose-500/10 to-transparent rounded-xl p-3 border border-rose-500/10">
                              <span className="flex items-center gap-1.5 text-[10px] text-rose-400 font-bold uppercase tracking-widest mb-1.5">
                                <Heart size={12} />
                                Minnettarlık
                              </span>
                              <p className="text-[13px] text-white/70 leading-relaxed font-medium">{checkIn.gratitude}</p>
                            </div>
                          )}

                          {checkIn.notes && (
                            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                              <span className="flex items-center gap-1.5 text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-1.5">
                                <StickyNote size={12} />
                                Notlar
                              </span>
                              <p className="text-[13px] text-white/70 leading-relaxed font-medium">{checkIn.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
