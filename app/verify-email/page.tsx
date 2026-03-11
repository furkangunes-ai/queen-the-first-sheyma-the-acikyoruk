"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Geçersiz doğrulama bağlantısı.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setStatus("success");
          setMessage(data.message || "E-posta başarıyla doğrulandı!");
        } else {
          setStatus("error");
          setMessage(data.error || "Doğrulama başarısız oldu.");
        }
      } catch {
        setStatus("error");
        setMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    }

    verify();
  }, [token]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="rounded-[calc(var(--radius)*2)] glass-panel p-8 sm:p-10 text-center">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Doğrulanıyor...</h1>
              <p className="text-white/40 text-sm">E-posta adresiniz doğrulanıyor, lütfen bekleyin.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">E-posta Doğrulandı!</h1>
              <p className="text-white/50 text-sm mb-8">{message}</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold py-3 px-8 rounded-2xl hover:from-pink-400 hover:to-pink-500 transition-all shadow-[0_0_20px_rgba(255,42,133,0.3)]"
              >
                Giriş Yap
                <ArrowRight size={16} />
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Doğrulama Başarısız</h1>
              <p className="text-white/50 text-sm mb-8">{message}</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 font-semibold transition-colors"
              >
                Giriş yaparak yeni bağlantı isteyebilirsiniz
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
