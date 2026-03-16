import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const sources = await prisma.dailyStudy.findMany({
      where: {
        userId,
        source: { not: null },
      },
      select: { source: true },
      distinct: ["source"],
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    const uniqueSources = sources
      .map((s) => s.source)
      .filter((s): s is string => s !== null && s.trim() !== "");

    return NextResponse.json(uniqueSources);
  } catch (error) {
    logApiError("daily-study/sources", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
