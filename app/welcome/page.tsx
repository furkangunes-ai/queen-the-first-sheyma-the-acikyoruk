"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Sparkles,
  BookOpenCheck,
  BrainCircuit,
  GraduationCap,
  BarChart3,
  Zap,
  Target,
  CalendarDays,
  MessageSquare,
  Crown,
  Check,
  ArrowRight,
  X,
} from "lucide-react";

const FEATURES = [
  {
    icon: GraduationCap,
    title: "Deneme Takibi",
    desc: "TYT/AYT denemelerini kaydedin, net analizinizi takip edin.",
    color: "from-pink-500/20 to-pink-600/20",
  },
  {
    icon: BookOpenCheck,
    title: "Günlük Çalışma",
    desc: "Her gün ne kadar soru çözdüğünüzü ve hangi konuları çalıştığınızı kaydedin.",
    color: "from-cyan-500/20 to-blue-600/20",
  },
  {
    icon: BrainCircuit,
    title: "Bilişsel Motor",
    desc: "Hangi konuları unuttuğunuzu ve hangi sırayla çalışmanız gerektiğini hesaplar.",
    color: "from-purple-500/20 to-violet-600/20",
  },
  {
    icon: Target,
    title: "Kişisel Hedefler",
    desc: "Hedef net ve sıralama belirleyin, ilerlemenizi gözlemleyin.",
    color: "from-amber-500/20 to-orange-600/20",
  },
  {
    icon: CalendarDays,
    title: "Haftalık Plan",
    desc: "AI destekli haftalık çalışma planı oluşturun ve takip edin.",
    color: "from-green-500/20 to-emerald-600/20",
  },
  {
    icon: BarChart3,
    title: "Detaylı Analitik",
    desc: "Konu bazlı ilerleme, güçlü/zayıf yönler ve trend grafikleri.",
    color: "from-indigo-500/20 to-blue-600/20",
  },
];

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  excluded?: string[];
  highlighted: boolean;
  badge?: string;
  color: string;
  borderColor: string;
  glowColor: string;
}

const PRICING: PricingTier[] = [
  {
    name: "Temel",
    price: "Ücretsiz",
    period: "",
    description: "YKS hazırlığına hemen başla",
    features: [
      "Deneme kayıt ve analizi",
      "Günlük çalışma takibi",
      "Haftalık plan oluşturma",
      "Konu bilgi haritası",
      "Bilişsel motor (temel)",
      "5 AI mesaj / gün",
    ],
    excluded: [
      "AI sınav analizi",
      "AI dashboard insight",
      "Sınırsız AI mesaj",
    ],
    highlighted: false,
    color: "from-white/5 to-white/[0.02]",
    borderColor: "border-white/10",
    glowColor: "",
  },
  {
    name: "Premium",
    price: "İletişime Geçin",
    period: "",
    description: "Tüm özelliklerin kilidini açın",
    features: [
      "Temel'deki her şey",
      "AI sınav analizi",
      "AI dashboard insight",
      "AI haftalık değerlendirme",
      "Sınırsız AI mesaj",
      "Öncelikli destek",
    ],
    highlighted: true,
    badge: "Önerilen",
    color: "from-amber-500/10 to-orange-500/5",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-[0_0_30px_rgba(245,158,11,0.15)]",
  },
];

export default function WelcomePage() {
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-pink-400" />
          <span className="font-bold text-xl text-white tracking-tight">Şeyda</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-all"
          >
            Giriş Yap
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-[0_0_15px_rgba(255,42,133,0.3)] hover:shadow-[0_0_25px_rgba(255,42,133,0.5)] transition-all border border-pink-400/20"
          >
            Kayıt Ol
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-16 pb-20 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 mb-6">
            <Zap size={14} className="text-pink-400" />
            <span className="text-xs font-bold text-pink-300 uppercase tracking-widest">
              YKS Hazırlık Asistanı
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
            Sınavına{" "}
            <span className="bg-gradient-to-r from-pink-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
              Akıllıca
            </span>{" "}
            Hazırlan
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Bilişsel motor, AI destekli analiz ve kişiselleştirilmiş çalışma planıyla
            YKS hedeflerine daha verimli ulaş.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold text-base shadow-[0_0_25px_rgba(255,42,133,0.4)] hover:shadow-[0_0_40px_rgba(255,42,133,0.6)] transition-all border border-pink-400/20"
            >
              Ücretsiz Başla
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#fiyatlandirma"
              className="px-8 py-4 rounded-2xl text-white/60 hover:text-white font-semibold text-base hover:bg-white/5 transition-all border border-white/5 hover:border-white/10"
            >
              Planları Gör
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Her Şey Tek Yerde
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Denemelerden günlük çalışmaya, AI analizden haftalık plana — ihtiyacın olan her araç.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-6 group hover:border-white/20 transition-all"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon size={22} className="text-white/80" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="fiyatlandirma" className="relative z-10 px-6 py-20 max-w-5xl mx-auto scroll-mt-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Fiyatlandırma
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Temel planla ücretsiz başla, ihtiyacın olursa Premium'a geç.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PRICING.map((tier) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`relative glass-panel p-8 ${tier.borderColor} ${tier.glowColor} transition-all`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-bold text-white uppercase tracking-wider">
                  <Crown size={12} className="inline mr-1 -mt-0.5" />
                  {tier.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                <p className="text-white/40 text-sm">{tier.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-black text-white">{tier.price}</span>
                {tier.period && <span className="text-white/40 text-sm ml-1">{tier.period}</span>}
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check size={16} className="text-green-400 mt-0.5 shrink-0" />
                    <span className="text-white/70">{f}</span>
                  </li>
                ))}
                {tier.excluded?.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <X size={16} className="text-white/20 mt-0.5 shrink-0" />
                    <span className="text-white/30 line-through">{f}</span>
                  </li>
                ))}
              </ul>

              {tier.highlighted ? (
                <button
                  onClick={() => setShowContact(true)}
                  className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all border border-amber-400/20"
                >
                  Premium'a Geç
                </button>
              ) : (
                <Link
                  href="/signup"
                  className="block w-full py-3.5 rounded-xl font-bold text-sm text-center bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all border border-white/10"
                >
                  Ücretsiz Başla
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 max-w-md w-full relative"
          >
            <button
              onClick={() => setShowContact(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={24} className="text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Premium'a Geçin</h3>
              <p className="text-white/50 text-sm mb-6">
                Premium abonelik için bizimle iletişime geçin.
                Hesabınız admin tarafından aktifleştirilecektir.
              </p>

              <div className="glass-panel p-4 mb-4 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest w-16">E-posta</span>
                  <span className="text-sm text-white/80 font-medium">destek@seyda.app</span>
                </div>
              </div>

              <button
                onClick={() => setShowContact(false)}
                className="w-full py-3 rounded-xl font-semibold text-sm bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/10"
              >
                Kapat
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-10">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400/60" />
            <span className="text-sm text-white/30 font-medium">Şeyda</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/kvkk" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              KVKK & Gizlilik
            </Link>
            <Link href="/terms" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Kullanım Koşulları
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
