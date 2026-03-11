"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GraduationCap,
  BookOpenCheck,
  BrainCircuit,
  ChevronRight,
  X,
  Sparkles,
  Hand,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const TOUR_STEPS = [
  {
    icon: Hand,
    title: "Hoş geldin!",
    description:
      "Seyda senin kişisel çalışma asistanın. Sınavlara hazırlık sürecinde sana rehberlik edecek.",
    action: null, // bilgilendirme adımı — yönlendirme yok
    color: "from-amber-500 to-orange-500",
    borderColor: "border-amber-500/30",
    shadowColor: "shadow-amber-500/20",
  },
  {
    icon: GraduationCap,
    title: "İlk deneme sınavını gir",
    description:
      "Deneme sonuçlarını girerek performansını takip etmeye başla.",
    action: "/exams",
    color: "from-pink-500 to-rose-500",
    borderColor: "border-pink-500/30",
    shadowColor: "shadow-pink-500/20",
  },
  {
    icon: BookOpenCheck,
    title: "Günlük çalışma planını oluştur",
    description:
      "Her gün çözdüğün soruları ve tekrar ettiğin konuları kaydet.",
    action: "/study",
    color: "from-cyan-500 to-blue-500",
    borderColor: "border-cyan-500/30",
    shadowColor: "shadow-cyan-500/20",
  },
  {
    icon: BrainCircuit,
    title: "AI asistanınla tanış",
    description:
      "Strateji sayfasında AI destekli kişisel çalışma planı oluşturabilirsin.",
    action: "/strategy",
    color: "from-purple-500 to-violet-500",
    borderColor: "border-purple-500/30",
    shadowColor: "shadow-purple-500/20",
  },
];

export default function FeatureTour() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [visible, setVisible] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [completing, setCompleting] = useState(false);

  const onboardingCompleted = (session?.user as any)?.onboardingCompleted;

  const completeOnboarding = useCallback(async () => {
    if (completing) return;
    setCompleting(true);
    setVisible(false);
    try {
      await fetch("/api/users/onboarding", { method: "POST" });
      await updateSession({ onboardingCompleted: true });
    } catch {
      // Sessizce başarısız — kullanıcı deneyimini bozmamak için
    } finally {
      setCompleting(false);
    }
  }, [completing, updateSession]);

  const handleDismiss = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleStepAction = (path: string) => {
    completeOnboarding();
    router.push(path);
  };

  // Gösterme koşulları
  if (!session?.user) return null;
  if (onboardingCompleted !== false) return null;
  if (!visible) return null;

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[55] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={handleDismiss}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-sm bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Kapat butonu */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
          >
            <X size={14} />
          </button>

          {/* Adım göstergesi */}
          <div className="flex items-center gap-2 mb-6">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  idx <= currentStep ? "bg-pink-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>

          {/* Üst başlık */}
          <div className="flex items-center gap-2 mb-5">
            <Sparkles size={14} className="text-pink-400" />
            <span className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-bold">
              Başlangıç Rehberi • {currentStep + 1}/{TOUR_STEPS.length}
            </span>
          </div>

          {/* İçerik */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg ${step.shadowColor}`}
              >
                <Icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed mb-6">
                {step.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Butonlar */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleDismiss}
              className="text-xs text-white/30 hover:text-white/50 font-medium transition-colors"
            >
              Atla
            </button>

            <div className="flex gap-2">
              {step.action && (
                <button
                  onClick={() => handleStepAction(step.action!)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border ${step.borderColor} bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all`}
                >
                  Şimdi Yap
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-pink-500 to-pink-600 text-white flex items-center gap-1 shadow-lg shadow-pink-500/20 hover:from-pink-400 hover:to-pink-500 transition-all"
              >
                {currentStep < TOUR_STEPS.length - 1 ? (
                  <>
                    İleri <ChevronRight size={14} />
                  </>
                ) : (
                  "Başla!"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
