import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-slate-400" size={36} />
        <p className="text-sm text-slate-400 font-medium">Yükleniyor...</p>
      </div>
    </div>
  );
}
