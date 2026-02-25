"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Image as ImageIcon, Film, Loader2, Trash2, Upload, X, Eye, FolderHeart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

interface UserFile {
  id: string;
  name: string;
  url: string;
  r2Key: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export default function GalleryPage() {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<UserFile | null>(null);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/files');
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setFiles(data);
    } catch {
      toast.error('Dosyalar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    let successCount = 0;

    for (const file of acceptedFiles) {
      try {
        const presignRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
          }),
        });

        if (!presignRes.ok) throw new Error('Presign failed');
        const { uploadUrl, publicUrl, r2Key } = await presignRes.json();

        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadRes.ok) throw new Error('Upload failed');

        const saveRes = await fetch('/api/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name,
            url: publicUrl,
            r2Key,
            mimeType: file.type,
            sizeBytes: file.size,
          }),
        });

        if (!saveRes.ok) throw new Error('Save failed');
        successCount++;
      } catch {
        toast.error(`"${file.name}" yüklenirken hata oluştu`);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} dosya yüklendi`);
      fetchFiles();
    }
    setUploading(false);
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!confirm(`"${fileName}" dosyasını silmek istediğinden emin misin?`)) return;

    try {
      const res = await fetch(`/api/files/${fileId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      setFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success('Dosya silindi');
    } catch {
      toast.error('Dosya silinemedi');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    disabled: uploading,
  });

  const getIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="text-pink-400 drop-shadow-[0_0_8px_rgba(255,42,133,0.5)]" size={32} />;
    if (mimeType.startsWith('video/')) return <Film className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" size={32} />;
    if (mimeType === 'application/pdf') return <FileText className="text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]" size={32} />;
    return <FileText className="text-white/40" size={32} />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderHeart size={32} className="text-pink-400 drop-shadow-[0_0_15px_rgba(255,42,133,0.4)]" />
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
            Dosyalar ve Kaynaklar
          </h1>
        </div>
        <span className="text-sm font-bold bg-white/[0.05] border border-white/10 px-3 py-1.5 rounded-lg text-pink-300 shadow-[0_0_10px_rgba(255,42,133,0.1)]">
          {files.length} dosya
        </span>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${isDragActive
            ? 'border-pink-400 bg-pink-500/10 shadow-[0_0_30px_rgba(255,42,133,0.2)]'
            : 'border-pink-500/20 bg-white/[0.02] hover:bg-white/[0.04] hover:border-pink-500/40 hover:shadow-[0_0_20px_rgba(255,42,133,0.1)]'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center justify-center gap-3 text-pink-400">
            <Loader2 size={36} className="animate-spin drop-shadow-[0_0_10px_rgba(255,42,133,0.5)]" />
            <span className="text-sm font-bold tracking-wide">Dosyalar Yükleniyor...</span>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center gap-3 text-pink-400">
            <Upload size={48} className="drop-shadow-[0_0_15px_rgba(255,42,133,0.5)] animate-bounce" />
            <span className="text-lg font-bold tracking-wide">Dosyaları buraya bırak</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-white/60">
            <Upload size={40} className="text-pink-400/50 group-hover:text-pink-400 transition-colors" />
            <span className="text-lg font-bold text-white/80">Dosya yüklemek için tıkla veya sürükle</span>
            <span className="text-sm text-white/40 tracking-wide">PDF, resim, video ve diğer dosyalar</span>
          </div>
        )}
      </div>

      {/* Files Grid */}
      <div className="glass-panel flex-1 overflow-hidden flex flex-col relative z-10 border border-white/10 rounded-3xl p-4 sm:p-6 shadow-[0_8px_32px_rgba(255,42,133,0.05)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none" />

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Loader2 className="animate-spin text-pink-400" size={40} />
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-white/40 relative z-10">
            <FolderHeart size={64} className="mb-6 opacity-20 text-pink-300 drop-shadow-[0_0_20px_rgba(255,42,133,0.3)] saturate-200" />
            <span className="text-2xl font-bold text-white/60 drop-shadow-sm mb-2">Henüz dosya yüklenmemiş</span>
            <p className="text-sm font-medium tracking-wide">Yukarıdaki alana dosya sürükleyerek başlayabilirsin</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto p-2 relative z-10 custom-scrollbar">
            <AnimatePresence>
              {files.map((file, idx) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.03 }}
                  className="group relative flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-pink-500/30 hover:shadow-[0_8px_20px_rgba(255,42,133,0.1)] transition-all cursor-pointer overflow-hidden"
                  onClick={() => {
                    if (file.mimeType.startsWith('image/')) {
                      setPreviewFile(file);
                    } else {
                      window.open(file.url, '_blank');
                    }
                  }}
                >
                  {/* Background Glow on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  {/* Preview / Icon */}
                  <div className="w-full aspect-square mb-4 bg-black/20 rounded-xl flex items-center justify-center relative overflow-hidden border border-white/5 group-hover:border-pink-500/20 transition-colors shadow-inner">
                    {file.mimeType.startsWith('image/') ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <>
                        <div className="absolute top-0 right-0 w-8 h-8 bg-white/[0.03] transform translate-x-1/2 -translate-y-1/2 rotate-45 z-10"></div>
                        <motion.div
                          whileHover={{ rotate: [-5, 5, -5, 0], transition: { duration: 0.5 } }}
                        >
                          {getIcon(file.mimeType)}
                        </motion.div>
                      </>
                    )}
                  </div>

                  {/* File name */}
                  <span className="text-xs font-bold text-white/80 text-center line-clamp-2 leading-tight w-full mb-1.5 group-hover:text-pink-300 transition-colors" title={file.name}>
                    {file.name}
                  </span>

                  <div className="flex items-center justify-between w-full mt-auto">
                    <span className="text-[10px] font-bold text-white/40 tracking-wider mix-blend-plus-lighter">{formatDate(file.createdAt)}</span>
                    <span className="text-[10px] font-bold text-white/40 tracking-wider mix-blend-plus-lighter bg-white/5 px-1.5 py-0.5 rounded">{formatSize(file.sizeBytes)}</span>
                  </div>

                  {/* Hover actions */}
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity translate-y-[-10px] group-hover:translate-y-0 transform duration-300">
                    {file.mimeType.startsWith('image/') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewFile(file);
                        }}
                        className="p-1.5 bg-black/60 backdrop-blur-md rounded-lg hover:bg-pink-500/80 text-white hover:text-white transition-all shadow-lg"
                        title="Önizle"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.id, file.name);
                      }}
                      className="p-1.5 bg-black/60 backdrop-blur-md rounded-lg hover:bg-rose-500/80 text-white hover:text-white transition-all shadow-lg"
                      title="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-5xl w-full max-h-[90vh] glass-panel border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(255,42,133,0.2)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewFile(null)}
                className="absolute top-4 right-4 z-20 p-2.5 bg-black/50 backdrop-blur-md rounded-full text-white/70 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all border border-white/10"
              >
                <X size={20} />
              </button>

              <div className="w-full h-full max-h-[90vh] flex items-center justify-center p-2">
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-w-full max-h-[85vh] object-contain rounded-2xl"
                />
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pt-12">
                <p className="text-white font-bold text-lg mb-1 drop-shadow-md">{previewFile.name}</p>
                <p className="text-pink-300 font-medium text-sm drop-shadow-sm">{formatSize(previewFile.sizeBytes)}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
