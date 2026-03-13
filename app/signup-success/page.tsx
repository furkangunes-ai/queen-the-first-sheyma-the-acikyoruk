"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MailCheck, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

function SignupSuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

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
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <MailCheck className="w-8 h-8 text-cyan-400" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">
            E-postanızı Kontrol Edin
          </h1>

          <p className="text-white/50 text-sm leading-relaxed mb-2">
            Hesabınız başarıyla oluşturuldu!
          </p>

          {email && (
            <p className="text-white/70 text-sm font-medium mb-4">
              <span className="text-cyan-400">{email}</span> adresine doğrulama bağlantısı gönderdik.
            </p>
          )}

          <p className="text-white/40 text-xs mb-8">
            Bağlantı 24 saat geçerlidir. E-posta gelmediyse spam klasörünüzü kontrol edin.
          </p>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold py-3 px-8 rounded-2xl hover:from-pink-400 hover:to-pink-500 transition-all shadow-[0_0_20px_rgba(255,42,133,0.3)]"
          >
            Giriş Yap
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignupSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    }>
      <SignupSuccessContent />
    </Suspense>
  );
}
