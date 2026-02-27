"use client";

import React, { useState } from "react";
import { Map, CalendarDays, TrendingUp, Bot, RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import TopicMap from "@/components/strategy/topic-map";
import WeeklyPlan from "@/components/strategy/weekly-plan";
import WeeklyAnalysisView from "@/components/strategy/weekly-analysis";
import AIAssistant from "@/components/strategy/ai-assistant";
import SpacedRepetition from "@/components/strategy/spaced-repetition";

type StrategyTab = "topic-map" | "weekly-plan" | "weekly-analysis" | "ai-assistant" | "spaced-repetition";

const tabs: { key: StrategyTab; label: string; icon: React.ReactNode }[] = [
  { key: "topic-map", label: "Konu Haritasi", icon: <Map size={16} /> },
  { key: "weekly-plan", label: "Haftalik Plan", icon: <CalendarDays size={16} /> },
  { key: "spaced-repetition", label: "Hata Tekrar", icon: <RotateCw size={16} /> },
  { key: "weekly-analysis", label: "Haftalik Analiz", icon: <TrendingUp size={16} /> },
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
          Konu hakimiyetini degerlendir, haftalik plan olustur ve AI destekli analiz al
        </p>
      </div>

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
          {activeTab === "weekly-analysis" && <WeeklyAnalysisView />}
          {activeTab === "ai-assistant" && <AIAssistant />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
