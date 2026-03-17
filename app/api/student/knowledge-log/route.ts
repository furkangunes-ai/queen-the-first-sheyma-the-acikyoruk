import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";

/**
 * GET /api/student/knowledge-log
 *
 * Öğrencinin bilgi değişim geçmişini getirir.
 * Query params:
 *   - topicId: Belirli bir konu (opsiyonel)
 *   - limit: Sayfa başına kayıt (varsayılan: 50, max: 200)
 *   - offset: Sayfa offset'i
 *   - startDate / endDate: Tarih filtresi
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topicId");
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "50")), 200);
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0"));
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = { userId };
    if (topicId) where.topicId = topicId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.knowledgeLog.findMany({
        where,
        include: {
          topic: {
            select: { id: true, name: true, subject: { select: { id: true, name: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.knowledgeLog.count({ where }),
    ]);

    // Özet istatistikler
    const summary = {
      totalChanges: total,
      positiveChanges: logs.filter(l => l.delta > 0).length,
      negativeChanges: logs.filter(l => l.delta < 0).length,
    };

    return NextResponse.json({ logs, total, summary });
  } catch (error) {
    logApiError("student/knowledge-log", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
