"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Brain, Dumbbell, BookOpen } from "lucide-react";
import MentalMath from "@/components/training/mental-math";
import ParagraphComprehension from "@/components/training/paragraph-comprehension";

const TABS = [
  { key: "mental-math", label: "Islem Hizi", icon: Brain, color: "cyan" },
  { key: "paragraph", label: "Paragraf Anlama", icon: BookOpen, color: "purple" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("mental-math");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/20 flex items-center justify-center">
          <Dumbbell size={20} className="text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Antrenman</h1>
          <p className="text-sm text-white/40">Zihinsel yeteneklerini gelistir</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? `bg-${tab.color}-500/15 text-${tab.color}-300 border border-${tab.color}-500/30`
                  : "bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-white/60 hover:bg-white/[0.05]"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "mental-math" && <MentalMath />}
        {activeTab === "paragraph" && <ParagraphComprehension />}
      </motion.div>
    </div>
  );
}
