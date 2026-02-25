"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Lock, LogIn, Sparkles } from "lucide-react";
import { toast } from "sonner";

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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0a0a1a] relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/[0.07] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-amber-500/[0.04] rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Glass Card */}
        <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-pink-500/[0.12] shadow-lg shadow-pink-500/[0.03] p-8 sm:p-10">
          {/* Gold accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent mb-8" />

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h1 className="font-display text-2xl text-gradient-gold tracking-wide">
                Hoş Geldin
              </h1>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-sm text-white/40">Giriş yaparak devam et</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-2">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400/50"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="kullanıcı adı"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-pink-500/[0.12] focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent text-white/90 placeholder:text-white/20 transition-all"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wide mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400/50"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-pink-500/[0.12] focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent text-white/90 placeholder:text-white/20 transition-all"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-500 text-white py-3 rounded-xl hover:bg-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2 glow-pink"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Giriş Yap
                </>
              )}
            </button>
          </form>

          {/* Bottom accent */}
          <div className="mt-8 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
          <p className="mt-4 text-center text-xs text-white/20">
            Queen Sheyda
          </p>
        </div>
      </div>
    </div>
  );
}
