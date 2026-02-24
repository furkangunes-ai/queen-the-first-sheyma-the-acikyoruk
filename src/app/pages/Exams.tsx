import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useApp } from '../store/AppContext';
import { Paper, Handwriting, Tape } from '../components/ui/Skeuomorphic';
import { UploadCloud, FileText, X } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const Exams = () => {
  const { exams, addExam } = useApp();
  const [isUploading, setIsUploading] = useState(false);
  
  // Form State
  const [examForm, setExamForm] = useState({
    title: '',
    score: '',
    totalQuestions: '120',
    date: new Date().toISOString().split('T')[0]
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // In a real app, we would upload to storage here.
    // For now, we'll just acknowledge the file.
    if (acceptedFiles.length > 0) {
      toast.success(`${acceptedFiles.length} dosya eklendi`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.title || !examForm.score) {
      toast.error('Lütfen başlık ve net sayısını giriniz.');
      return;
    }

    addExam({
      title: examForm.title,
      score: Number(examForm.score),
      totalQuestions: Number(examForm.totalQuestions),
      date: examForm.date,
      image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=300' // Mock image
    });

    setExamForm({ title: '', score: '', totalQuestions: '120', date: new Date().toISOString().split('T')[0] });
    setIsUploading(false);
    toast.success('Deneme başarıyla kaydedildi!');
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <Handwriting className="text-3xl">Deneme Takibi</Handwriting>
        <button 
          onClick={() => setIsUploading(!isUploading)}
          className="bg-yellow-600 text-white px-4 py-2 rounded shadow hover:bg-yellow-700 transition-colors font-medium text-sm flex items-center gap-2"
        >
          {isUploading ? <X size={16} /> : <UploadCloud size={16} />}
          {isUploading ? 'İptal' : 'Yeni Sonuç Ekle'}
        </button>
      </div>

      {/* Upload Area / Form */}
      {isUploading && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="overflow-hidden"
        >
          <Paper className="bg-blue-50/50 border-2 border-dashed border-blue-200">
             <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Deneme Adı</label>
                      <input 
                        type="text" 
                        placeholder="Örn: Özdebir TYT 1"
                        className="w-full p-2 rounded bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        value={examForm.title}
                        onChange={e => setExamForm({...examForm, title: e.target.value})}
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Net Sayısı</label>
                        <input 
                          type="number" 
                          step="0.25"
                          placeholder="0.0"
                          className="w-full p-2 rounded bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                          value={examForm.score}
                          onChange={e => setExamForm({...examForm, score: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Tarih</label>
                        <input 
                          type="date"
                          className="w-full p-2 rounded bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                          value={examForm.date}
                          onChange={e => setExamForm({...examForm, date: e.target.value})}
                        />
                      </div>
                   </div>
                </div>

                <div 
                   {...getRootProps()} 
                   className={`flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors
                     ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white/50 hover:bg-white'}
                   `}
                >
                   <input {...getInputProps()} />
                   <UploadCloud size={32} className="text-slate-400 mb-2" />
                   <p className="text-sm text-slate-600 font-medium">Fotoğraf Yükle</p>
                   <p className="text-xs text-slate-400 mt-1">Sürükleyip bırakın veya seçin</p>
                </div>

                <div className="flex items-end">
                   <button 
                     type="submit" 
                     className="bg-blue-600 text-white h-10 px-6 rounded shadow hover:bg-blue-700 transition-colors font-bold"
                   >
                     Kaydet
                   </button>
                </div>
             </form>
          </Paper>
        </motion.div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-10">
         {exams.map((exam, idx) => (
            <motion.div 
               key={exam.id}
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: idx * 0.1 }}
               className="relative group cursor-pointer"
            >
               {/* Polaroid Effect */}
               <div className="bg-white p-3 pb-12 shadow-md transform group-hover:rotate-1 transition-transform duration-300 relative">
                  <Tape className="-top-3 left-1/2 -translate-x-1/2 opacity-80" />
                  
                  <div className="aspect-[4/3] bg-slate-100 mb-3 overflow-hidden border border-slate-100">
                     {exam.image ? (
                        <img src={exam.image} alt={exam.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                           <FileText size={48} />
                        </div>
                     )}
                  </div>
                  
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                     <div>
                        <Handwriting className="text-lg leading-none">{exam.title}</Handwriting>
                        <span className="text-xs text-slate-400 font-sans">{exam.date}</span>
                     </div>
                     <div className="text-2xl font-bold text-slate-800 font-serif">
                        {exam.score}
                     </div>
                  </div>
               </div>
            </motion.div>
         ))}
      </div>
    </div>
  );
};
