"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Lock, LogIn, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Kullanıcı adı ve şifre gerekli");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Geçersiz kullanıcı adı veya şifre");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("Giriş yapılırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glass Card */}
        <div className="rounded-[calc(var(--radius)*2)] glass-panel p-8 sm:p-10 relative overflow-hidden group">

          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-pink-500/10 transition-colors duration-500" />

          {/* Decorative Pink Glow Line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-1/3 bg-gradient-to-r from-transparent via-pink-400 to-transparent blur-[1px]" />

          <div className="text-center mb-10 mt-2 relative z-10">
            <div className="flex items-center justify-center gap-2 mb-3 cursor-default">
              <Sparkles className="w-6 h-6 text-pink-400 group-hover:text-pink-300 transition-colors animate-pulse" />
              <h1 className="font-bold text-3xl tracking-tight text-white group-hover:text-gradient-candy transition-all duration-500">
                Hoş Geldiniz
              </h1>
            </div>
            <p className="text-[15px] font-medium text-white/50 tracking-wide">
              Devam etmek için giriş yapın
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest px-1">
                Kullanıcı Adı
              </label>
              <div className="relative group/input">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within/input:text-pink-400 transition-colors"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Kullanıcı adınızı girin"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-500/30 focus:bg-white/[0.05] text-white placeholder:text-white/20 transition-all font-medium text-[15px] hover:border-white/10"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest px-1">
                Şifre
              </label>
              <div className="relative group/input">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within/input:text-pink-400 transition-colors"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 focus:outline-none focus:ring-1 focus:ring-pink-400/50 focus:border-pink-500/30 focus:bg-white/[0.05] text-white placeholder:text-white/20 transition-all font-medium text-[15px] tracking-widest hover:border-white/10"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold tracking-wide py-4 rounded-2xl hover:from-pink-400 hover:to-pink-500 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,42,133,0.3)] hover:shadow-[0_0_30px_rgba(255,42,133,0.5)] border border-pink-400/20 group/btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} className="transition-transform group-hover/btn:-translate-x-1" />
                  GİRİŞ YAP
                </>
              )}
            </button>
          </form>

        </div>
      </motion.div>
    </div>
  );
}
