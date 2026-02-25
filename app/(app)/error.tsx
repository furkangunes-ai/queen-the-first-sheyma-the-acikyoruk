"use client";

import React from 'react';
import { Paper, Handwriting } from '@/components/skeuomorphic';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <Paper className="max-w-md text-center">
        <AlertTriangle className="mx-auto text-amber-400 mb-4" size={48} />
        <Handwriting as="h2" className="text-2xl mb-3">
          Bir şeyler ters gitti
        </Handwriting>
        <p className="text-sm text-white/50 mb-6">
          Bu sayfada beklenmeyen bir hata oluştu. Tekrar denemek için aşağıdaki butonu kullanabilirsin.
        </p>
        {error?.message && (
          <p className="text-xs text-white/40 bg-white/[0.04] p-3 rounded mb-4 font-mono break-all">
            {error.message}
          </p>
        )}
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-pink-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm active:bg-pink-400 transition-colors shadow-md shadow-pink-500/20"
        >
          <RefreshCw size={16} />
          Tekrar Dene
        </button>
      </Paper>
    </div>
  );
}
