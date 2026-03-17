"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";
import {
  Database,
  Download,
  RefreshCw,
  Trash2,
  Eye,
  Shield,
  Clock,
  HardDrive,
  Users,
  Loader2,
  ChevronDown,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

interface BackupSummary {
  totalBackups: number;
  totalSizeBytes: number;
  byType: Array<{
    backupType: string;
    _count: number;
    _sum: { sizeBytes: number | null };
  }>;
  recentBackups: Array<{
    id: string;
    backupType: string;
    dataType: string;
    recordCount: number;
    sizeBytes: number;
    createdAt: string;
    expiresAt: string;
    user: { displayName: string; username: string };
  }>;
}

interface BackupPreview {
  id: string;
  backupType: string;
  dataType: string;
  recordCount: number;
  sizeBytes: number;
  createdAt: string;
  preview: any[];
  totalRecords: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TYPE_LABELS: Record<string, string> = {
  daily: "Günlük",
  weekly: "Haftalık",
  monthly: "Aylık",
};

const DATA_TYPE_LABELS: Record<string, string> = {
  exams: "Denemeler",
  topic_reviews: "Konu Tekrarları",
  daily_studies: "Günlük Çalışmalar",
  topic_knowledge: "Bilgi Seviyeleri",
  full: "Tam Yedek",
};

const TYPE_COLORS: Record<string, string> = {
  daily: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  weekly: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  monthly: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

export default function BackupManager() {
  const [summary, setSummary] = useState<BackupSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [backingUp, setBackingUp] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [previewData, setPreviewData] = useState<BackupPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [expandedBackup, setExpandedBackup] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [restoreConfirm, setRestoreConfirm] = useState<{ backupId: string; userId: string; dataType: string } | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/backups?mode=summary");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSummary(data);
    } catch {
      toast.error("Yedek bilgileri alınamadı");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const triggerBackup = async (backupType: string) => {
    setBackingUp(true);
    try {
      const res = await fetch("/api/admin/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "backup_all", backupType }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(
        `${data.userCount} kullanıcı için ${data.totalSnapshots} yedek oluşturuldu`
      );
      fetchSummary();
    } catch {
      toast.error("Yedekleme başarısız");
    } finally {
      setBackingUp(false);
    }
  };

  const cleanupExpired = async () => {
    setCleaning(true);
    try {
      const res = await fetch("/api/admin/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cleanup" }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(`${data.cleanedCount} süresi dolmuş yedek temizlendi`);
      fetchSummary();
    } catch {
      toast.error("Temizlik başarısız");
    } finally {
      setCleaning(false);
    }
  };

  const restoreBackup = async (backupId: string, userId: string) => {
    setRestoring(backupId);
    try {
      const res = await fetch("/api/admin/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", backupId, userId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const r = data.result;
      toast.success(
        `Geri yükleme tamamlandı: ${r.restored} kayıt yüklendi, ${r.skipped} zaten vardı${r.errors.length > 0 ? `, ${r.errors.length} hata` : ""}`
      );
      setRestoreConfirm(null);
      fetchSummary();
    } catch {
      toast.error("Geri yükleme başarısız");
    } finally {
      setRestoring(null);
    }
  };

  const previewBackup = async (backupId: string, userId: string) => {
    if (expandedBackup === backupId) {
      setExpandedBackup(null);
      setPreviewData(null);
      return;
    }

    setPreviewLoading(true);
    setExpandedBackup(backupId);
    try {
      const res = await fetch("/api/admin/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore_preview", backupId, userId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPreviewData(data);
    } catch {
      toast.error("Önizleme yüklenemedi");
      setExpandedBackup(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const downloadBackup = async (backupId: string, userId: string, dataType: string) => {
    try {
      const res = await fetch("/api/admin/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore_preview", backupId, userId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${dataType}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Yedek indirildi");
    } catch {
      toast.error("İndirme başarısız");
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-8 rounded-3xl flex items-center justify-center gap-3">
        <Loader2 className="animate-spin text-cyan-400" size={24} />
        <span className="text-white/50">Yedek bilgileri yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header + Stats */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-[60px] pointer-events-none" />

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <Shield className="text-cyan-400" size={24} />
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 tracking-tight">
              Veri Yedekleme Sistemi
            </h2>
          </div>
          <button
            onClick={fetchSummary}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 p-4 rounded-2xl border border-cyan-500/20"
          >
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Database size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">Toplam Yedek</span>
            </div>
            <span className="text-2xl font-black text-white/90">
              {summary?.totalBackups ?? 0}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 p-4 rounded-2xl border border-violet-500/20"
          >
            <div className="flex items-center gap-2 text-violet-400 mb-1">
              <HardDrive size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">Toplam Boyut</span>
            </div>
            <span className="text-2xl font-black text-white/90">
              {formatBytes(summary?.totalSizeBytes ?? 0)}
            </span>
          </motion.div>

          {(summary?.byType ?? []).slice(0, 2).map((bt, i) => (
            <motion.div
              key={bt.backupType}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className={`p-4 rounded-2xl border ${TYPE_COLORS[bt.backupType] || "border-white/10"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {TYPE_LABELS[bt.backupType] ?? bt.backupType}
                </span>
              </div>
              <span className="text-2xl font-black text-white/90">{bt._count}</span>
              <span className="text-xs text-white/30 ml-2">
                ({formatBytes(bt._sum.sizeBytes ?? 0)})
              </span>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-6 relative z-10">
          <button
            onClick={() => triggerBackup("daily")}
            disabled={backingUp}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/20 font-bold text-sm transition-all disabled:opacity-50"
          >
            {backingUp ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
            Günlük Yedek Al
          </button>
          <button
            onClick={() => triggerBackup("weekly")}
            disabled={backingUp}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/20 font-bold text-sm transition-all disabled:opacity-50"
          >
            {backingUp ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
            Haftalık Yedek Al
          </button>
          <button
            onClick={() => triggerBackup("monthly")}
            disabled={backingUp}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/20 font-bold text-sm transition-all disabled:opacity-50"
          >
            {backingUp ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
            Aylık Yedek Al
          </button>
          <button
            onClick={cleanupExpired}
            disabled={cleaning}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/20 font-bold text-sm transition-all disabled:opacity-50 ml-auto"
          >
            {cleaning ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Süresi Dolmuşları Temizle
          </button>
        </div>
      </div>

      {/* Recent Backups Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-white/10">
        <h3 className="text-lg font-black text-white/80 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-cyan-400" />
          Son Yedekler
        </h3>

        {(summary?.recentBackups?.length ?? 0) === 0 ? (
          <p className="text-white/30 text-sm">Henüz yedek alınmamış.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {summary?.recentBackups.map((backup) => (
              <div key={backup.id}>
                <div
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all cursor-pointer"
                  onClick={() =>
                    previewBackup(backup.id, (backup.user as any)?.id || backup.id)
                  }
                >
                  {expandedBackup === backup.id ? (
                    <ChevronDown size={14} className="text-white/30" />
                  ) : (
                    <ChevronRight size={14} className="text-white/30" />
                  )}

                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-bold border ${
                      TYPE_COLORS[backup.backupType] || "border-white/10"
                    }`}
                  >
                    {TYPE_LABELS[backup.backupType] ?? backup.backupType}
                  </span>

                  <span className="text-sm text-white/70 font-medium">
                    {DATA_TYPE_LABELS[backup.dataType] ?? backup.dataType}
                  </span>

                  <span className="text-xs text-white/30 flex items-center gap-1">
                    <Users size={12} />
                    {backup.user.displayName}
                  </span>

                  <span className="text-xs text-white/30 ml-auto">
                    {backup.recordCount} kayıt · {formatBytes(backup.sizeBytes)}
                  </span>

                  <span className="text-xs text-white/20">{formatDate(backup.createdAt)}</span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRestoreConfirm({
                        backupId: backup.id,
                        userId: (backup.user as any)?.id || "",
                        dataType: backup.dataType,
                      });
                    }}
                    className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-white/30 hover:text-emerald-400 transition-all"
                    title="Bu yedekten geri yükle"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadBackup(backup.id, (backup.user as any)?.id || "", backup.dataType);
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/30 hover:text-cyan-400 transition-all"
                    title="JSON olarak indir"
                  >
                    <Download size={14} />
                  </button>
                </div>

                {/* Preview Panel */}
                {expandedBackup === backup.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-8 mt-1 p-4 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    {previewLoading ? (
                      <div className="flex items-center gap-2 text-white/30 text-sm">
                        <Loader2 size={14} className="animate-spin" />
                        Yükleniyor...
                      </div>
                    ) : previewData ? (
                      <div>
                        <p className="text-xs text-white/30 mb-2">
                          İlk 5 kayıt gösteriliyor ({previewData.totalRecords} toplam)
                        </p>
                        <pre className="text-xs text-white/50 overflow-auto max-h-48 bg-black/20 rounded-lg p-3">
                          {JSON.stringify(previewData.preview, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <p className="text-xs text-white/30">Önizleme yüklenemedi</p>
                    )}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Retention Policy Info */}
        <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <h4 className="text-sm font-bold text-white/50 mb-2 flex items-center gap-2">
            <Shield size={14} />
            Saklama Politikası
          </h4>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="text-center">
              <span className="text-blue-400 font-bold">Günlük</span>
              <br />
              <span className="text-white/30">7 gün saklanır</span>
            </div>
            <div className="text-center">
              <span className="text-emerald-400 font-bold">Haftalık</span>
              <br />
              <span className="text-white/30">4 hafta saklanır</span>
            </div>
            <div className="text-center">
              <span className="text-amber-400 font-bold">Aylık</span>
              <br />
              <span className="text-white/30">6 ay saklanır</span>
            </div>
          </div>
        </div>
      </div>

      {/* Restore Confirm Dialog */}
      {restoreConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/20">
                <RotateCcw size={20} className="text-emerald-400" />
              </div>
              <h3 className="text-lg font-black text-white">Geri Yükle</h3>
            </div>

            <p className="text-sm text-white/60 mb-2">
              <strong className="text-white/80">{DATA_TYPE_LABELS[restoreConfirm.dataType] ?? restoreConfirm.dataType}</strong> verisi yedekten geri yüklenecek.
            </p>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
              <p className="text-xs text-amber-300 font-medium">
                Mevcut veriler silinmez — sadece yedekte olup şu an olmayan kayıtlar geri eklenir.
                Güvenlik için işlemden önce otomatik yedek alınır.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRestoreConfirm(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-white/50 hover:bg-white/10 text-sm font-bold transition-all"
              >
                İptal
              </button>
              <button
                onClick={() => restoreBackup(restoreConfirm.backupId, restoreConfirm.userId)}
                disabled={restoring !== null}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/20 text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {restoring ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RotateCcw size={14} />
                )}
                Geri Yükle
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
