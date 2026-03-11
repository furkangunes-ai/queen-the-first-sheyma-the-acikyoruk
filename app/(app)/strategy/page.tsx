"use client";

import React, { useState } from "react";
import { Map, CalendarDays, Bot, RotateCw, Mic } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import TopicMap from "@/components/strategy/topic-map";
import WeeklyPlan from "@/components/strategy/weekly-plan";
import AIAssistant from "@/components/strategy/ai-assistant";
import SpacedRepetition from "@/components/strategy/spaced-repetition";

type StrategyTab = "topic-map" | "weekly-plan" | "ai-assistant" | "spaced-repetition";

const tabs: { key: StrategyTab; label: string; icon: React.ReactNode }[] = [
  { key: "topic-map", label: "Konu Haritası", icon: <Map size={16} /> },
  { key: "weekly-plan", label: "Haftalık Plan", icon: <CalendarDays size={16} /> },
  { key: "spaced-repetition", label: "Hata Tekrar", icon: <RotateCw size={16} /> },
  { key: "ai-assistant", label: "AI Asistan", icon: <Bot size={16} /> },
];

export default function StrategyPage() {
  const [activeTab, setActiveTab] = useState<StrategyTab>("topic-map");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient-candy font-display tracking-tight">
          Strateji
        </h1>
        <p className="text-white/50 mt-1">
          Konu hakimiyetini değerlendir, haftalık plan oluştur ve AI destekli analiz al
        </p>
      </div>

      {/* Voice Assessment CTA */}
      <Link
        href="/voice-assessment"
        className="flex items-center gap-3 p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors group"
      >
        <div className="p-2 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors">
          <Mic className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="flex-1">
          <span className="text-sm font-medium text-white">Sesli Değerlendirme</span>
          <p className="text-xs text-zinc-400">
            Müfredat hakimiyetini sesli olarak anlat, AI değerlendirsin
          </p>
        </div>
        <span className="text-xs text-cyan-400/60 group-hover:text-cyan-400 transition-colors">
          Başla →
        </span>
      </Link>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-pink-500/20 to-pink-600/20 text-pink-300 border border-pink-500/30 shadow-lg shadow-pink-500/10"
                : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/70"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "topic-map" && <TopicMap />}
          {activeTab === "weekly-plan" && <WeeklyPlan />}
          {activeTab === "spaced-repetition" && <SpacedRepetition />}
          {activeTab === "ai-assistant" && <AIAssistant />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
