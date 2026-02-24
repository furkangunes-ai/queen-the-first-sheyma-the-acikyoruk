import Link from 'next/link';
import { Paper, Handwriting } from '@/components/skeuomorphic';
import { Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <Paper className="max-w-md text-center">
        <Search className="mx-auto text-slate-300 mb-4" size={48} />
        <Handwriting as="h2" className="text-4xl mb-2">
          404
        </Handwriting>
        <Handwriting className="text-xl text-slate-400 mb-6">
          Sayfa bulunamadı
        </Handwriting>
        <p className="text-sm text-slate-500 mb-6">
          Aradığın sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow"
        >
          Ana Sayfaya Dön
        </Link>
      </Paper>
    </div>
  );
}
