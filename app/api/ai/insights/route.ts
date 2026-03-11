import { prisma } from "@/lib/prisma";
import { checkAIAccess, isAIGuardError } from "@/lib/ai-guard";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const guard = await checkAIAccess();
    if (isAIGuardError(guard)) return guard;
    const { userId } = guard;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "20")), 50);

    const insights = await prisma.aIInsight.findMany({
      where: {
        userId,
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(insights);
  } catch (error) {
    logApiError("ai/insights", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
