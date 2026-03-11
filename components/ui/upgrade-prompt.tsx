"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Crown, Sparkles, ArrowRight } from "lucide-react";

interface UpgradePromptProps {
  feature: string;
  onClose?: () => void;
}

/**
 * Premium'a yükseltme CTA bileşeni.
 * Bir özellik premium-only olduğunda gösterilir.
 */
export default function UpgradePrompt({ feature, onClose }: UpgradePromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-6"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none" />

      <div className="flex items-start gap-4 relative z-10">
        <div className="bg-amber-500/15 p-3 rounded-xl border border-amber-500/25">
          <Crown className="text-amber-400" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-black tracking-wide text-white/90 mb-1">
            Premium Gerekli
          </h3>
          <p className="text-xs text-white/60 leading-relaxed mb-4">
            <span className="font-bold text-amber-400">{feature}</span> Premium abonelik
            gerektiren bir özelliktir. Premium'a geçerek sınırsız AI erişimi, derinlemesine
            analiz ve daha fazlasına erişin.
          </p>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Sparkles size={12} className="text-amber-400" />
              <span>Sınırsız AI Chat</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Sparkles size={12} className="text-amber-400" />
              <span>Sınav Analizi</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Sparkles size={12} className="text-amber-400" />
              <span>Dashboard Insight</span>
            </div>
          </div>
          <Link
            href="/welcome#fiyatlandirma"
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all"
          >
            <Crown size={14} />
            Planları Gör
            <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/30 hover:text-white/60 transition-colors text-xs"
        >
          Kapat
        </button>
      )}
    </motion.div>
  );
}
