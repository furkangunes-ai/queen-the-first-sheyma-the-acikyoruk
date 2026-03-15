import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";
import { getTurkeyDateString } from "@/lib/utils";

/**
 * POST — Bugünün planına yeni item ekle.
 * Aktif haftalık plan yoksa otomatik oluşturur.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { subjectId, topicId, duration, notes } = await request.json();

    if (!subjectId) {
      return NextResponse.json({ error: "Ders seçimi gerekli" }, { status: 400 });
    }

    // Bugünün gün numarası (0=Pazartesi..6=Pazar)
    const turkeyDate = getTurkeyDateString();
    const turkeyNow = new Date(turkeyDate + "T12:00:00+03:00");
    const todayDayOfWeek = (turkeyNow.getDay() + 6) % 7;

    // Aktif haftalık planı bul veya oluştur
    let plan = await prisma.weeklyPlan.findFirst({
      where: {
        userId,
        startDate: { lte: turkeyNow },
        endDate: { gte: turkeyNow },
      },
      include: {
        items: {
          orderBy: { sortOrder: "desc" },
          take: 1,
        },
      },
    });

    if (!plan) {
      // Pazartesi-Pazar arası yeni plan oluştur
      const monday = new Date(turkeyNow);
      monday.setDate(turkeyNow.getDate() - todayDayOfWeek);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      plan = await prisma.weeklyPlan.create({
        data: {
          userId,
          title: "Haftalık Plan",
          startDate: monday,
          endDate: sunday,
        },
        include: {
          items: {
            orderBy: { sortOrder: "desc" },
            take: 1,
          },
        },
      });
    }

    const nextSortOrder = (plan.items[0]?.sortOrder ?? -1) + 1;

    const item = await prisma.weeklyPlanItem.create({
      data: {
        weeklyPlanId: plan.id,
        dayOfWeek: todayDayOfWeek,
        subjectId,
        topicId: topicId || null,
        duration: duration || null,
        notes: notes || null,
        sortOrder: nextSortOrder,
      },
      include: {
        subject: { include: { examType: true } },
        topic: true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    logApiError("weekly-plans/add-item", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
