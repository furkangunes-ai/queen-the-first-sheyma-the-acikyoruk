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
        <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
        <Handwriting as="h2" className="text-2xl mb-3">
          Bir şeyler ters gitti
        </Handwriting>
        <p className="text-sm text-slate-500 mb-6">
          Bu sayfada beklenmeyen bir hata oluştu. Tekrar denemek için aşağıdaki butonu kullanabilirsin.
        </p>
        {error?.message && (
          <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded mb-4 font-mono break-all">
            {error.message}
          </p>
        )}
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow"
        >
          <RefreshCw size={16} />
          Tekrar Dene
        </button>
      </Paper>
    </div>
  );
}
