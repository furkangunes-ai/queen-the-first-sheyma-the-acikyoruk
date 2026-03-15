"use client";

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { CATEGORY_COLORS, type MasteryCategory } from '@/lib/bayesian-engine';

interface MasteryBadgeProps {
  category: MasteryCategory;
  categoryLabel: string;
  mean: number;
  ci95Lower: number;
  ci95Upper: number;
  evidenceCount: number;
}

/**
 * Fuzzy kategori rozeti + hover/tıklama ile CI detay.
 *
 * Yüzeyde psikolojik sadelik (kategori adı),
 * derinde matematiksel şeffaflık (güven aralığı).
 */
export default function MasteryBadge({
  category,
  categoryLabel,
  mean,
  ci95Lower,
  ci95Upper,
  evidenceCount,
}: MasteryBadgeProps) {
  const [showDetail, setShowDetail] = useState(false);
  const colors = CATEGORY_COLORS[category];

  return (
    <div className="relative">
      {/* Fuzzy kategori rozeti */}
      <button
        type="button"
        onClick={() => setShowDetail(!showDetail)}
        className={clsx(
          "px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all",
          colors.bg, colors.text, colors.border,
          "hover:brightness-125 cursor-pointer"
        )}
      >
        {categoryLabel}
      </button>

      {/* CI detay popover */}
      {showDetail && (
        <div className="absolute top-full mt-1.5 left-0 z-50 w-56 glass-panel p-3 shadow-xl border border-white/10 rounded-xl">
          {/* CI bar */}
          <div className="mb-2">
            <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
              {/* Güven aralığı gölgesi */}
              <div
                className={clsx("absolute h-full rounded-full opacity-40", colors.bg.replace('/20', '/40'))}
                style={{
                  left: `${ci95Lower * 100}%`,
                  width: `${(ci95Upper - ci95Lower) * 100}%`,
                }}
              />
              {/* Ortalama çizgisi */}
              <div
                className={clsx("absolute h-full w-0.5", colors.text)}
                style={{ left: `${mean * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-white/30">{(ci95Lower * 100).toFixed(0)}%</span>
              <span className={clsx("text-[9px] font-bold", colors.text)}>
                {(mean * 100).toFixed(0)}%
              </span>
              <span className="text-[9px] text-white/30">{(ci95Upper * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="text-[9px] text-white/40 leading-relaxed">
            <span className="text-white/60 font-medium">%95 güven aralığı</span>
            {' · '}
            {evidenceCount.toFixed(0)} kanıt noktası
          </div>

          {/* Kapatmak için tıkla ipucu */}
          <button
            type="button"
            onClick={() => setShowDetail(false)}
            className="mt-1.5 w-full text-center text-[8px] text-white/20 hover:text-white/40"
          >
            kapat
          </button>
        </div>
      )}
    </div>
  );
}
