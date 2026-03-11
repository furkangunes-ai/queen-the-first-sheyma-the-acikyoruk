import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";

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

    const { completed } = await request.json();

    const item = await prisma.weeklyPlanItem.update({
      where: { id: itemId },
      data: { completed },
      include: {
        subject: { include: { examType: true } },
        topic: true,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    logApiError("weekly-plans/:id/items/:itemId/toggle", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
