import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id, itemId } = await params;

    // Verify plan belongs to user
    const plan = await prisma.weeklyPlan.findFirst({ where: { id, userId } });
    if (!plan) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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
    console.error("Error toggling plan item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
