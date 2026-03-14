"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpenCheck,
  BrainCircuit,
  BookOpen,
  GraduationCap,
  Map,
  BarChart3,
  CalendarDays,
  TrendingUp,
  ChevronLeft,
} from 'lucide-react';

interface ActionHubProps {
  onNavigate: (path: string) => void;
}

const STUDY_OPTIONS = [
  {
    label: 'Ders Çalıştım',
    description: 'Konu tekrarı ve soru çözümü kaydet',
    icon: BookOpen,
    path: '/study',
    color: 'from-pink-500 to-rose-500',
    border: 'border-pink-500/30',
    glow: 'group-hover:shadow-pink-500/20',
  },
  {
    label: 'Deneme Çözdüm',
    description: 'Deneme sınavı sonucunu kaydet',
    icon: GraduationCap,
    path: '/exams',
    color: 'from-amber-500 to-pink-500',
    border: 'border-amber-500/30',
    glow: 'group-hover:shadow-amber-500/20',
  },
];

const ANALYZE_OPTIONS = [
  {
    label: 'Konu Haritam',
    description: 'Konulardaki hakimiyetini gör',
    icon: Map,
    path: '/strategy',
    color: 'from-cyan-500 to-blue-500',
    border: 'border-cyan-500/30',
    glow: 'group-hover:shadow-cyan-500/20',
  },
  {
    label: 'Deneme Analizlerim',
    description: 'Deneme sonuçlarını detaylı incele',
    icon: BarChart3,
    path: '/exams?tab=analiz',
    color: 'from-blue-500 to-purple-500',
    border: 'border-blue-500/30',
    glow: 'group-hover:shadow-blue-500/20',
  },
  {
    label: 'Haftalık Planım',
    description: 'Çalışma planını düzenle ve takip et',
    icon: CalendarDays,
    path: '/strategy?tab=plan',
    color: 'from-emerald-500 to-cyan-500',
    border: 'border-emerald-500/30',
    glow: 'group-hover:shadow-emerald-500/20',
  },
  {
    label: 'Genel İstatistikler',
    description: 'Tüm verilerini analiz et',
    icon: TrendingUp,
    path: '/analytics',
    color: 'from-amber-500 to-orange-500',
    border: 'border-amber-500/30',
    glow: 'group-hover:shadow-amber-500/20',
  },
];

export default function ActionHub({ onNavigate }: ActionHubProps) {
  const [expandedCard, setExpandedCard] = useState<'study' | 'analyze' | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
      {/* Çalışma Bilgisi Gir */}
      <motion.div layout className="relative">
        <AnimatePresence mode="wait">
          {expandedCard !== 'study' ? (
            <motion.button
              key="study-card"
              layoutId="study-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => setExpandedCard('study')}
              className="w-full glass-panel p-6 lg:p-8 text-left group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-pink-500/20 transition-colors duration-500" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-5 shadow-lg shadow-pink-500/30 group-hover:shadow-pink-500/50 transition-shadow duration-300">
                  <BookOpenCheck className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-white mb-2 group-hover:text-gradient-pink transition-colors">
                  Çalışma Bilgisi Gir
                </h2>
                <p className="text-sm text-white/50 group-hover:text-white/60 transition-colors">
                  Bugün ne yaptığını kaydet
                </p>
              </div>
            </motion.button>
          ) : (
            <motion.div
              key="study-expanded"
              layoutId="study-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-panel p-5 lg:p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/10 rounded-full blur-[60px] pointer-events-none" />
              <div className="relative z-10">
                <button
                  onClick={() => setExpandedCard(null)}
                  className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors mb-4"
                >
                  <ChevronLeft size={16} />
                  <span>Geri</span>
                </button>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpenCheck size={20} className="text-pink-400" />
                  Ne yaptın?
                </h3>
                <div className="space-y-2.5">
                  {STUDY_OPTIONS.map((option) => (
                    <button
                      key={option.path}
                      onClick={() => onNavigate(option.path)}
                      className={`group w-full flex items-center gap-4 p-4 rounded-2xl border ${option.border} bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-300 shadow-lg shadow-transparent ${option.glow}`}
                    >
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                        <option.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">
                          {option.label}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">{option.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Verilerimi Analiz Et */}
      <motion.div layout className="relative">
        <AnimatePresence mode="wait">
          {expandedCard !== 'analyze' ? (
            <motion.button
              key="analyze-card"
              layoutId="analyze-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: 0.05 }}
              onClick={() => setExpandedCard('analyze')}
              className="w-full glass-panel p-6 lg:p-8 text-left group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-cyan-500/20 transition-colors duration-500" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-5 shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-shadow duration-300">
                  <BrainCircuit className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-white mb-2 group-hover:text-cyan-100 transition-colors">
                  Verilerimi Analiz Et
                </h2>
                <p className="text-sm text-white/50 group-hover:text-white/60 transition-colors">
                  Performansını incele ve strateji belirle
                </p>
              </div>
            </motion.button>
          ) : (
            <motion.div
              key="analyze-expanded"
              layoutId="analyze-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-panel p-5 lg:p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none" />
              <div className="relative z-10">
                <button
                  onClick={() => setExpandedCard(null)}
                  className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors mb-4"
                >
                  <ChevronLeft size={16} />
                  <span>Geri</span>
                </button>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BrainCircuit size={20} className="text-cyan-400" />
                  Ne incelemek istiyorsun?
                </h3>
                <div className="space-y-2.5">
                  {ANALYZE_OPTIONS.map((option) => (
                    <button
                      key={option.path}
                      onClick={() => onNavigate(option.path)}
                      className={`group w-full flex items-center gap-4 p-4 rounded-2xl border ${option.border} bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-300 shadow-lg shadow-transparent ${option.glow}`}
                    >
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                        <option.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">
                          {option.label}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">{option.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
