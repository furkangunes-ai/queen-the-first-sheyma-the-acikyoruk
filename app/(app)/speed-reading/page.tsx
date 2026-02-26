"use client";

import React, { useState } from "react";
import { BookOpen, History } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import SpeedReader from "@/components/speed-reading/speed-reader";
import ReadingHistory from "@/components/speed-reading/reading-history";

type SpeedReadingTab = "reader" | "history";

const tabs: { key: SpeedReadingTab; label: string; icon: React.ReactNode }[] = [
  { key: "reader", label: "Okuma", icon: <BookOpen size={16} /> },
  { key: "history", label: "Geçmiş", icon: <History size={16} /> },
];

export default function SpeedReadingPage() {
  const [activeTab, setActiveTab] = useState<SpeedReadingTab>("reader");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient-candy font-display tracking-tight">
          Hızlı Okuma
        </h1>
        <p className="text-white/50 mt-1">
          RSVP yöntemiyle okuma hızını artır, ilerlemeyi takip et
        </p>
      </div>

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

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "reader" && <SpeedReader />}
          {activeTab === "history" && <ReadingHistory />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
