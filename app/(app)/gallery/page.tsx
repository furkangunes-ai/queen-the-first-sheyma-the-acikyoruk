"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Handwriting } from '@/components/skeuomorphic';
import { FileText, Image as ImageIcon, Film, Loader2, Trash2, Upload, X, Eye } from 'lucide-react';
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
        // Step 1: Get presigned URL
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

        // Step 2: Upload to R2
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadRes.ok) throw new Error('Upload failed');

        // Step 3: Save file record
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
    if (mimeType.startsWith('image/')) return <ImageIcon className="text-pink-400" size={32} />;
    if (mimeType.startsWith('video/')) return <Film className="text-purple-400" size={32} />;
    if (mimeType === 'application/pdf') return <FileText className="text-rose-400" size={32} />;
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
        <Handwriting as="h1" className="text-3xl">Dosyalar ve Kaynaklar</Handwriting>
        <span className="text-sm text-white/40">{files.length} dosya</span>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-pink-400 bg-pink-500/10'
            : 'border-pink-500/20 active:border-pink-400 active:bg-white/[0.03]'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex items-center justify-center gap-3 text-white/50">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-sm font-medium">Yükleniyor...</span>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center gap-2 text-pink-400">
            <Upload size={32} />
            <span className="text-sm font-medium">Dosyaları buraya bırak</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-white/40">
            <Upload size={32} />
            <span className="text-sm font-medium">Dosya yüklemek için tıkla veya sürükle</span>
            <span className="text-xs">PDF, resim, video ve diğer dosyalar</span>
          </div>
        )}
      </div>

      {/* Files Grid */}
      <Paper className="flex-1 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-pink-400/50" size={32} />
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/40">
            <FileText size={48} className="mb-4 opacity-50" />
            <Handwriting className="text-xl text-white/40">Henüz dosya yüklenmemiş</Handwriting>
            <p className="text-sm mt-2">Yukarıdaki alana dosya sürükleyerek başlayabilirsin</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto p-2">
            <AnimatePresence>
              {files.map((file, idx) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.03 }}
                  className="group relative flex flex-col items-center p-4 rounded-lg active:bg-white/[0.06] border border-transparent active:border-pink-500/15 transition-all"
                >
                  {/* Preview / Icon */}
                  <div
                    className="w-20 h-24 mb-3 bg-white/[0.06] rounded flex items-center justify-center relative overflow-hidden cursor-pointer"
                    onClick={() => {
                      if (file.mimeType.startsWith('image/')) {
                        setPreviewFile(file);
                      } else {
                        window.open(file.url, '_blank');
                      }
                    }}
                  >
                    {file.mimeType.startsWith('image/') ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <div className="absolute top-0 right-0 w-6 h-6 bg-white/[0.04] shadow-md transform translate-x-1/2 -translate-y-1/2 rotate-45 z-10"></div>
                        {getIcon(file.mimeType)}
                      </>
                    )}
                  </div>

                  {/* File name */}
                  <span className="text-xs font-medium text-white/70 text-center line-clamp-2 leading-tight">
                    {file.name}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-white/40">{formatDate(file.createdAt)}</span>
                    <span className="text-[10px] text-white/40">{formatSize(file.sizeBytes)}</span>
                  </div>

                  {/* Hover actions */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {file.mimeType.startsWith('image/') && (
                      <button
                        onClick={() => setPreviewFile(file)}
                        className="p-1 bg-white/[0.04] rounded active:bg-pink-500/10 text-white/40 active:text-pink-400 transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(file.id, file.name)}
                      className="p-1 bg-white/[0.04] rounded active:bg-rose-500/10 text-white/40 active:text-rose-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Paper>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[85vh] bg-[#0a0a1a] border border-pink-500/15 rounded-xl overflow-hidden shadow-2xl shadow-pink-500/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewFile(null)}
                className="absolute top-3 right-3 z-10 p-2 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
              >
                <X size={18} />
              </button>
              <img
                src={previewFile.url}
                alt={previewFile.name}
                className="max-w-full max-h-[85vh] object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <p className="text-white font-medium text-sm">{previewFile.name}</p>
                <p className="text-white/70 text-xs">{formatSize(previewFile.sizeBytes)}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
