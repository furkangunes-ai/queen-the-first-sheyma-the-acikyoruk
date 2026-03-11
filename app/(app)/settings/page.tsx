"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "motion/react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Settings,
  User,
  Lock,
  Crown,
  Loader2,
  Save,
  Eye,
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface ProfileData {
  id: string;
  username: string;
  displayName: string;
  email: string | null;
  examTrack: string | null;
  role: string;
  createdAt: string;
  aiEnabled: boolean;
  subscription: {
    tier: string;
    startDate: string;
    endDate: string | null;
  };
  chat: {
    todayCount: number;
    limit: number | null;
    remaining: number | null;
  };
}

const EXAM_TRACKS = [
  { value: "sayisal", label: "Sayısal (MF)" },
  { value: "ea", label: "Eşit Ağırlık (TM)" },
  { value: "sozel", label: "Sözel (TS)" },
];

export default function SettingsPage() {
  const { update: updateSession } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Profil form
  const [displayName, setDisplayName] = useState("");
  const [examTrack, setExamTrack] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Şifre form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/profile");
      if (!res.ok) throw new Error();
      const data: ProfileData = await res.json();
      setProfile(data);
      setDisplayName(data.displayName);
      setExamTrack(data.examTrack || "");
    } catch {
      toast.error("Profil yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Görünen ad boş olamaz");
      return;
    }

    setProfileSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          examTrack: examTrack || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      // Session'ı güncelle
      await updateSession({ examTrack: examTrack || null });
      toast.success("Profil güncellendi");
      fetchProfile();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata oluştu");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("Yeni şifre en az 6 karakter olmalı");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Şifreler eşleşmiyor");
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Şifre başarıyla değiştirildi");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Şifre değiştirilemedi");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="animate-spin text-pink-400 mb-4" size={48} />
        <p className="text-white/60 font-bold tracking-wide">Yükleniyor...</p>
      </div>
    );
  }

  if (!profile) return null;

  const isPremium = profile.subscription.tier === "premium";

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-3xl mx-auto relative z-10">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/8 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
          <Settings className="text-pink-400" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Ayarlar</h1>
          <p className="text-sm text-white/40 font-medium">Profil, abonelik ve güvenlik</p>
        </div>
      </div>

      {/* === Profil Bilgileri === */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <User size={20} className="text-cyan-400" />
          <h2 className="text-xl font-black text-white tracking-tight">Profil Bilgileri</h2>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-5">
          {/* Username (readonly) */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest">
              Kullanıcı Adı
            </label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-sm text-white/40">@{profile.username}</span>
              <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest ml-auto">Değiştirilemez</span>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest">
              Görünen Ad
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.03] rounded-xl border border-white/10 text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-400/30 transition-all [color-scheme:dark]"
            />
          </div>

          {/* E-posta (readonly) */}
          {profile.email && (
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest">
                E-posta
              </label>
              <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-sm text-white/40">{profile.email}</span>
              </div>
            </div>
          )}

          {/* Exam Track */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest">
              Alan Seçimi
            </label>
            <select
              value={examTrack}
              onChange={(e) => setExamTrack(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.03] rounded-xl border border-white/10 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-400/30 transition-all [color-scheme:dark]"
            >
              <option value="">Henüz seçilmedi</option>
              {EXAM_TRACKS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={profileSaving}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold tracking-wide px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(255,42,133,0.3)] disabled:opacity-50 transition-all text-sm"
          >
            {profileSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Kaydet
          </motion.button>
        </form>
      </motion.div>

      {/* === Abonelik Durumu === */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`glass-panel p-6 sm:p-8 ${isPremium ? "border-amber-500/20" : ""}`}
      >
        <div className="flex items-center gap-3 mb-6">
          <Crown size={20} className={isPremium ? "text-amber-400" : "text-white/40"} />
          <h2 className="text-xl font-black text-white tracking-tight">Abonelik</h2>
          <span
            className={`ml-auto px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
              isPremium
                ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30"
                : "bg-white/5 text-white/50 border border-white/10"
            }`}
          >
            {isPremium ? "Premium" : "Temel"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-white/40 mb-1">
              <Calendar size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Başlangıç</span>
            </div>
            <span className="text-sm font-bold text-white/80">
              {new Date(profile.subscription.startDate).toLocaleDateString("tr-TR")}
            </span>
          </div>

          <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-white/40 mb-1">
              <Eye size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Plan</span>
            </div>
            <span className="text-sm font-bold text-white/80">
              {isPremium ? "Premium" : "Temel (Ücretsiz)"}
            </span>
          </div>

          <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-white/40 mb-1">
              <MessageSquare size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">AI Mesaj</span>
            </div>
            <span className="text-sm font-bold text-white/80">
              {profile.chat.limit
                ? `${profile.chat.remaining}/${profile.chat.limit} kaldı`
                : "Sınırsız"}
            </span>
          </div>
        </div>

        {!isPremium && (
          <Link
            href="/welcome#fiyatlandirma"
            className="group flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 transition-all border border-amber-500/20"
          >
            <Crown size={16} />
            Premium'a Geç
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </motion.div>

      {/* === Şifre Değiştir === */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-6 sm:p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Lock size={20} className="text-pink-400" />
          <h2 className="text-xl font-black text-white tracking-tight">Şifre Değiştir</h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest">
              Mevcut Şifre
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.03] rounded-xl border border-white/10 text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-400/30 transition-all tracking-widest [color-scheme:dark]"
              autoComplete="current-password"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest">
              Yeni Şifre
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.03] rounded-xl border border-white/10 text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-400/30 transition-all tracking-widest [color-scheme:dark]"
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest">
              Yeni Şifre (Tekrar)
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.03] rounded-xl border border-white/10 text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-400/30 transition-all tracking-widest [color-scheme:dark]"
              autoComplete="new-password"
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[11px] text-red-400 px-1">Şifreler eşleşmiyor</p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={passwordSaving || !currentPassword || newPassword.length < 6 || newPassword !== confirmPassword}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold tracking-wide px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(255,42,133,0.3)] disabled:opacity-50 transition-all text-sm"
          >
            {passwordSaving ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
            Şifreyi Değiştir
          </motion.button>
        </form>
      </motion.div>

      {/* === Hesap Bilgileri === */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel p-6 sm:p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Sparkles size={20} className="text-cyan-400" />
          <h2 className="text-xl font-black text-white tracking-tight">Hesap Bilgileri</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Hesap ID</span>
            <span className="text-xs text-white/50 font-mono">{profile.id}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Kayıt Tarihi</span>
            <span className="text-sm text-white/60 font-medium">
              {new Date(profile.createdAt).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Rol</span>
            <span className="text-sm text-white/60 font-medium capitalize">{profile.role}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
