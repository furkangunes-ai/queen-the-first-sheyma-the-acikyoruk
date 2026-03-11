import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";

/**
 * PATCH — Edit a single plan item (subject, topic, duration, dayOfWeek, notes)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id, itemId } = await params;

    // Verify plan belongs to user
    const plan = await prisma.weeklyPlan.findFirst({ where: { id, userId } });
    if (!plan) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }

    // Verify item belongs to this plan (IDOR koruması)
    const existingItem = await prisma.weeklyPlanItem.findFirst({
      where: { id: itemId, weeklyPlanId: id },
    });
    if (!existingItem) {
      return NextResponse.json({ error: "Plan öğesi bulunamadı" }, { status: 404 });
    }

    const body = await request.json();
    const updateData: Record<string, any> = {};

    if (body.subjectId !== undefined) updateData.subjectId = body.subjectId;
    if (body.topicId !== undefined) updateData.topicId = body.topicId || null;
    if (body.duration !== undefined) updateData.duration = body.duration || null;
    if (body.dayOfWeek !== undefined) updateData.dayOfWeek = body.dayOfWeek;
    if (body.notes !== undefined) updateData.notes = body.notes || null;

    const item = await prisma.weeklyPlanItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        subject: { include: { examType: true } },
        topic: true,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    logApiError("weekly-plans/:id/items/:itemId", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

/**
 * DELETE — Remove a single plan item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id, itemId } = await params;

    // Verify plan belongs to user
    const plan = await prisma.weeklyPlan.findFirst({ where: { id, userId } });
    if (!plan) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }

    // Verify item belongs to this plan (IDOR koruması)
    const existingItem = await prisma.weeklyPlanItem.findFirst({
      where: { id: itemId, weeklyPlanId: id },
    });
    if (!existingItem) {
      return NextResponse.json({ error: "Plan öğesi bulunamadı" }, { status: 404 });
    }

    await prisma.weeklyPlanItem.delete({ where: { id: itemId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError("weekly-plans/:id/items/:itemId", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
