import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;

    const plan = await prisma.weeklyPlan.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            subject: { include: { examType: true } },
            topic: true,
          },
          orderBy: [{ dayOfWeek: "asc" }, { sortOrder: "asc" }],
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    logApiError("weekly-plans/:id", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;

    const existing = await prisma.weeklyPlan.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }

    const { title, notes, items } = await request.json();

    const plan = await prisma.$transaction(async (tx) => {
      await tx.weeklyPlanItem.deleteMany({ where: { weeklyPlanId: id } });

      return tx.weeklyPlan.update({
        where: { id },
        data: {
          title: title || existing.title,
          notes: notes !== undefined ? notes : existing.notes,
          items: {
            create: (items || []).map((item: any, index: number) => ({
              dayOfWeek: item.dayOfWeek,
              subjectId: item.subjectId,
              topicId: item.topicId || null,
              duration: item.duration || null,
              questionCount: item.questionCount || null,
              completed: item.completed || false,
              notes: item.notes || null,
              sortOrder: index,
            })),
          },
        },
        include: {
          items: {
            include: {
              subject: { include: { examType: true } },
              topic: true,
            },
            orderBy: [{ dayOfWeek: "asc" }, { sortOrder: "asc" }],
          },
        },
      });
    });

    return NextResponse.json(plan);
  } catch (error) {
    logApiError("weekly-plans/:id", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;

    const existing = await prisma.weeklyPlan.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }

    await prisma.weeklyPlan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError("weekly-plans/:id", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
