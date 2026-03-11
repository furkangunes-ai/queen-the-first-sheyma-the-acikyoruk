"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Sparkles, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center relative z-10">
        <h1 className="font-bold text-2xl text-white mb-3">Geçersiz Bağlantı</h1>
        <p className="text-sm text-white/50 mb-6">
          Şifre sıfırlama bağlantısı geçersiz veya eksik. Lütfen yeni bir tane talep edin.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm font-semibold transition-all border border-white/10"
        >
          <ArrowLeft size={16} />
          Şifremi Unuttum Sayfası
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Şifreler eşleşmiyor");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password-with-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(true);
      toast.success("Şifre başarıyla değiştirildi!");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
          <Check size={32} className="text-green-400" />
        </div>
        <h1 className="font-bold text-2xl text-white mb-3">Şifre Değiştirildi</h1>
        <p className="text-sm text-white/50">Giriş sayfasına yönlendiriliyorsunuz...</p>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8 mt-2 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-6 h-6 text-pink-400 animate-pulse" />
          <h1 className="font-bold text-3xl tracking-tight text-white">Yeni Şifre</h1>
        </div>
        <p className="text-[15px] font-medium text-white/50 tracking-wide">
          Yeni şifrenizi belirleyin
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest px-1">
            Yeni Şifre
          </label>
          <div className="relative group/input">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within/input:text-pink-400 transition-colors"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-500/30 focus:bg-white/[0.05] text-white placeholder:text-white/20 transition-all font-medium text-[15px] tracking-widest hover:border-white/10"
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest px-1">
            Şifre Tekrar
          </label>
          <div className="relative group/input">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within/input:text-pink-400 transition-colors"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-500/30 focus:bg-white/[0.05] text-white placeholder:text-white/20 transition-all font-medium text-[15px] tracking-widest hover:border-white/10"
              autoComplete="new-password"
            />
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-[11px] text-red-400 px-1">Şifreler eşleşmiyor</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
          className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold tracking-wide py-4 rounded-2xl hover:from-pink-400 hover:to-pink-500 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,42,133,0.3)] border border-pink-400/20"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Lock size={18} />
              ŞİFREYİ DEĞİŞTİR
            </>
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="rounded-[calc(var(--radius)*2)] glass-panel p-8 sm:p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-1/3 bg-gradient-to-r from-transparent via-pink-400 to-transparent blur-[1px]" />
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-white/20 border-t-pink-400 rounded-full animate-spin" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </motion.div>
    </div>
  );
}
