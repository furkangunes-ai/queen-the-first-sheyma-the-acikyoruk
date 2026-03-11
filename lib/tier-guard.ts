// ==================== Tier/Abonelik Kontrolü ====================
//
// Temel (basic) — 500 TL/ay:
//   - Tam bilişsel motor (DAG, mastery, planlama) — sıfır ek maliyet
//   - NLP kavram eşleştirme
//   - Haftalık plan (motor + LLM sunumu)
//   - AI chat: 5 mesaj/gün
//
// Premium — 2000 TL/ay:
//   - Tüm basic özellikleri +
//   - Sınırsız AI chat
//   - AI sınav analizi
//   - AI dashboard insight
//   - Bayes güven katmanı (gelecek)

import { prisma } from "@/lib/prisma";

export type TierLevel = "basic" | "premium";

export interface TierInfo {
  tier: TierLevel;
  isActive: boolean;
  endDate: Date | null;
}

/**
 * Kullanıcının abonelik tier'ini al.
 * Abonelik yoksa "basic" varsayılan.
 */
export async function getUserTier(userId: string): Promise<TierInfo> {
  const sub = await prisma.userSubscription.findUnique({
    where: { userId },
  });

  if (!sub) {
    return { tier: "basic", isActive: true, endDate: null };
  }

  const isActive = !sub.endDate || sub.endDate > new Date();

  return {
    tier: (sub.tier as TierLevel) || "basic",
    isActive,
    endDate: sub.endDate,
  };
}

/**
 * Kullanıcının premium olup olmadığını kontrol et.
 */
export async function isPremium(userId: string): Promise<boolean> {
  const info = await getUserTier(userId);
  return info.tier === "premium" && info.isActive;
}

/**
 * Premium özelliğe erişim kontrolü.
 * Premium değilse false döner.
 */
export async function checkPremiumAccess(userId: string): Promise<boolean> {
  return isPremium(userId);
}

/**
 * AI chat günlük limit kontrolü (basic: 5/gün, premium: sınırsız).
 * Limit aşılmışsa false döner.
 */
export async function checkChatLimit(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
}> {
  const premium = await isPremium(userId);
  if (premium) {
    return { allowed: true, remaining: Infinity, limit: Infinity };
  }

  // Basic: günlük 5 mesaj
  const DAILY_LIMIT = 5;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const count = await prisma.aIInsight.count({
    where: {
      userId,
      type: "chat_message",
      createdAt: { gte: todayStart },
    },
  });

  const remaining = Math.max(0, DAILY_LIMIT - count);
  return {
    allowed: remaining > 0,
    remaining,
    limit: DAILY_LIMIT,
  };
}
