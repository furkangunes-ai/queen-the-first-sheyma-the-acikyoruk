import Link from 'next/link';
import { Paper, Handwriting } from '@/components/skeuomorphic';
import { Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <Paper className="max-w-md text-center">
        <Search className="mx-auto text-white/20 mb-4" size={48} />
        <Handwriting as="h2" className="text-4xl mb-2">
          404
        </Handwriting>
        <Handwriting className="text-xl text-white/40 mb-6">
          Sayfa bulunamadı
        </Handwriting>
        <p className="text-sm text-white/50 mb-6">
          Aradığın sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-pink-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm active:bg-pink-400 transition-colors shadow-md shadow-pink-500/20"
        >
          Ana Sayfaya Dön
        </Link>
      </Paper>
    </div>
  );
}
