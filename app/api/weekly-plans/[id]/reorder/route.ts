import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;
    const { id } = await params;

    // Verify the plan belongs to the authenticated user
    const plan = await prisma.weeklyPlan.findFirst({
      where: { id, userId },
    });

    if (!plan) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { itemId, newDayOfWeek, newSortOrder } = await request.json();

    // Validate required fields
    if (!itemId || newDayOfWeek === undefined || newSortOrder === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: itemId, newDayOfWeek, newSortOrder" },
        { status: 400 }
      );
    }

    // Validate dayOfWeek is 0-6
    if (
      typeof newDayOfWeek !== "number" ||
      !Number.isInteger(newDayOfWeek) ||
      newDayOfWeek < 0 ||
      newDayOfWeek > 6
    ) {
      return NextResponse.json(
        { error: "dayOfWeek must be an integer between 0 and 6" },
        { status: 400 }
      );
    }

    // Validate sortOrder is >= 0
    if (
      typeof newSortOrder !== "number" ||
      !Number.isInteger(newSortOrder) ||
      newSortOrder < 0
    ) {
      return NextResponse.json(
        { error: "sortOrder must be a non-negative integer" },
        { status: 400 }
      );
    }

    // Verify the item belongs to this plan
    const item = await prisma.weeklyPlanItem.findFirst({
      where: { id: itemId, weeklyPlanId: id },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item not found in this plan" },
        { status: 404 }
      );
    }

    // Update the item's dayOfWeek and sortOrder
    await prisma.weeklyPlanItem.update({
      where: { id: itemId },
      data: {
        dayOfWeek: newDayOfWeek,
        sortOrder: newSortOrder,
      },
    });

    // Return the full updated plan with all items and relations
    const updatedPlan = await prisma.weeklyPlan.findFirst({
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

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error("Error reordering weekly plan item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
