"use client";

import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NextActionWidget from '@/components/home/next-action-widget';

/**
 * Planlama Sayfası — Sıradaki hamle seçimi.
 *
 * "Kendim Planlayayım" veya "Sistem Önersin" modlarını
 * tam sayfa olarak gösterir. İşlem bitince ana sayfaya döner.
 */
export default function PlanPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Geri butonu */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft size={16} />
          Ana Sayfaya Dön
        </button>
      </motion.div>

      {/* Planlama Widget'ı */}
      <NextActionWidget onReturnHome={() => router.push('/')} />
    </div>
  );
}
