import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error fetching weekly plan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;

    const existing = await prisma.weeklyPlan.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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
    console.error("Error updating weekly plan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;

    const existing = await prisma.weeklyPlan.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.weeklyPlan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting weekly plan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
