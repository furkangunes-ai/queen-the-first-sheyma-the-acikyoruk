import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getUserTier } from "@/lib/tier-guard";

// GET /api/subscription — Kullanıcının abonelik bilgisi
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const tierInfo = await getUserTier(userId);

  return NextResponse.json(tierInfo);
}

// POST /api/subscription — Abonelik oluştur/güncelle (admin only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  if ((session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Sadece admin" }, { status: 403 });
  }

  const body = await req.json();
  const { userId, tier, endDate } = body;

  if (!userId || !tier) {
    return NextResponse.json(
      { error: "userId ve tier zorunludur" },
      { status: 400 }
    );
  }

  if (!["basic", "premium"].includes(tier)) {
    return NextResponse.json(
      { error: "Geçersiz tier. Kullanılabilir: basic, premium" },
      { status: 400 }
    );
  }

  const subscription = await prisma.userSubscription.upsert({
    where: { userId },
    update: {
      tier,
      endDate: endDate ? new Date(endDate) : null,
    },
    create: {
      userId,
      tier,
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  return NextResponse.json(subscription);
}
