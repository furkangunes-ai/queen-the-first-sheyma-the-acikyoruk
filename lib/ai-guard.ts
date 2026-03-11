import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserTier, checkChatLimit, checkPremiumAILimit, type TierLevel } from "@/lib/tier-guard";

export interface AIGuardResult {
  authorized: boolean;
  userId: string;
  tier: TierLevel;
}

/**
 * Per-user AI access control.
 * Checks if the current user is authenticated AND has aiEnabled = true.
 * Returns { authorized, userId, tier } on success.
 * Returns a NextResponse error on failure (401 or 403).
 */
export async function checkAIAccess(): Promise<
  AIGuardResult | NextResponse
> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiEnabled: true },
  });

  if (!user?.aiEnabled) {
    return NextResponse.json(
      { error: "AI erişiminiz aktif değil. Yöneticinize başvurun." },
      { status: 403 }
    );
  }

  const tierInfo = await getUserTier(userId);

  return { authorized: true, userId, tier: tierInfo.tier };
}

/**
 * Premium-only AI access control.
 * Basic kullanıcılar için 403 döner.
 */
export async function checkPremiumAIAccess(): Promise<
  AIGuardResult | NextResponse
> {
  const result = await checkAIAccess();
  if (isAIGuardError(result)) return result;

  if (result.tier !== "premium") {
    return NextResponse.json(
      { error: "Bu özellik Premium abonelik gerektirir.", tierRequired: "premium" },
      { status: 403 }
    );
  }

  // Premium kullanıcılar da günlük AI limit kontrolü (maliyet koruması)
  const aiLimit = await checkPremiumAILimit(result.userId);
  if (!aiLimit.allowed) {
    return NextResponse.json(
      { error: "Günlük AI kullanım limitine ulaştınız (20/gün). Yarın tekrar deneyin.", remaining: 0 },
      { status: 429 }
    );
  }

  return result;
}

/**
 * Chat-specific access control with daily message limit.
 * Basic: 5 mesaj/gün, Premium: sınırsız.
 */
export async function checkChatAccess(): Promise<
  (AIGuardResult & { remaining: number }) | NextResponse
> {
  const result = await checkAIAccess();
  if (isAIGuardError(result)) return result;

  const chatLimit = await checkChatLimit(result.userId);
  if (!chatLimit.allowed) {
    return NextResponse.json(
      {
        error: `Günlük AI mesaj limitinize ulaştınız (${chatLimit.limit} mesaj). Premium'a geçerek sınırsız erişim kazanın.`,
        tierRequired: "premium",
        limit: chatLimit.limit,
        remaining: 0,
      },
      { status: 429 }
    );
  }

  return { ...result, remaining: chatLimit.remaining };
}

/**
 * Type guard to check if the result is an error response.
 */
export function isAIGuardError(
  result: AIGuardResult | NextResponse | (AIGuardResult & { remaining: number })
): result is NextResponse {
  return result instanceof NextResponse;
}
