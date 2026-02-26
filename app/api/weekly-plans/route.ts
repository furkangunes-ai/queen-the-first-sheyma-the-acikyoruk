import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(request.url);
    const current = searchParams.get("current");
    const startDate = searchParams.get("startDate");

    const where: any = { userId };

    if (current === "true") {
      const now = new Date();
      where.startDate = { lte: now };
      where.endDate = { gte: now };
    } else if (startDate) {
      where.startDate = new Date(startDate);
    }

    const plans = await prisma.weeklyPlan.findMany({
      where,
      include: {
        items: {
          include: {
            subject: { include: { examType: true } },
            topic: true,
          },
          orderBy: [{ dayOfWeek: "asc" }, { sortOrder: "asc" }],
        },
      },
      orderBy: { startDate: "desc" },
      take: current === "true" ? 1 : 10,
    });

    if (current === "true") {
      return NextResponse.json(plans[0] || null);
    }

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching weekly plans:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { title, startDate, endDate, notes, items } = await request.json();

    if (!title || !startDate || !endDate) {
      return NextResponse.json({ error: "title, startDate, endDate required" }, { status: 400 });
    }

    const plan = await prisma.weeklyPlan.create({
      data: {
        userId,
        title,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        notes: notes || null,
        items: {
          create: (items || []).map((item: any, index: number) => ({
            dayOfWeek: item.dayOfWeek,
            subjectId: item.subjectId,
            topicId: item.topicId || null,
            duration: item.duration || null,
            questionCount: item.questionCount || null,
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

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("Error creating weekly plan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
