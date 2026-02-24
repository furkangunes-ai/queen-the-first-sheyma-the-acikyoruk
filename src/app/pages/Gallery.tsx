import React from 'react';
import { Paper, Handwriting } from '../components/ui/Skeuomorphic';
import { FileText, Image as ImageIcon, Film, Music } from 'lucide-react';
import { motion } from 'motion/react';

export const Gallery = () => {
  // Mock files
  const files = [
    { id: 1, name: 'Ders Programı.pdf', type: 'pdf', date: '24.02.2026' },
    { id: 2, name: 'Matematik Formülleri.jpg', type: 'image', date: '20.02.2026' },
    { id: 3, name: 'Motivasyon.mp4', type: 'video', date: '15.02.2026' },
    { id: 4, name: 'Tarih Notları.pdf', type: 'pdf', date: '10.02.2026' },
    { id: 5, name: 'Geometri Soruları.jpg', type: 'image', date: '05.02.2026' },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="text-red-500" size={32} />;
      case 'image': return <ImageIcon className="text-blue-500" size={32} />;
      case 'video': return <Film className="text-purple-500" size={32} />;
      default: return <FileText className="text-slate-400" size={32} />;
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <Handwriting className="text-3xl">Dosyalar ve Kaynaklar</Handwriting>

      <Paper className="flex-1 overflow-hidden flex flex-col">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto p-2">
          {files.map((file) => (
            <motion.div
              key={file.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center p-4 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
            >
              <div className="w-20 h-24 mb-3 bg-slate-100 rounded shadow-sm flex items-center justify-center relative overflow-hidden">
                 {/* Page corner fold effect */}
                 <div className="absolute top-0 right-0 w-6 h-6 bg-white shadow-md transform translate-x-1/2 -translate-y-1/2 rotate-45 z-10"></div>
                 {getIcon(file.type)}
              </div>
              <span className="text-xs font-medium text-slate-700 text-center line-clamp-2 leading-tight">
                {file.name}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">{file.date}</span>
            </motion.div>
          ))}
          
          {/* Add New File Placeholder */}
          <div className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer text-slate-400">
             <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
               <span className="text-2xl font-light">+</span>
             </div>
             <span className="text-xs font-medium">Dosya Yükle</span>
          </div>
        </div>
      </Paper>
    </div>
  );
};
