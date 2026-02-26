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
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const subjectId = searchParams.get("subjectId");

    const where: any = { userId };
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lt: new Date(endDate) };
    } else if (date) {
      const d = new Date(date);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = { gte: d, lt: nextDay };
    }
    if (subjectId) where.subjectId = subjectId;

    const reviews = await prisma.topicReview.findMany({
      where,
      include: {
        subject: { include: { examType: true } },
        topic: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching topic reviews:", error);
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

    const body = await request.json();
    const {
      date, subjectId, topicId, duration, confidence,
      method, photoUrl, photoR2Key, notes,
    } = body;

    if (!subjectId || !topicId) {
      return NextResponse.json({ error: "Subject and topic required" }, { status: 400 });
    }

    const review = await prisma.topicReview.create({
      data: {
        date: new Date(date || new Date()),
        userId,
        subjectId,
        topicId,
        duration: duration || null,
        confidence: confidence || null,
        method: method || null,
        photoUrl: photoUrl || null,
        photoR2Key: photoR2Key || null,
        notes: notes || null,
      },
      include: {
        subject: { include: { examType: true } },
        topic: true,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating topic review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const existing = await prisma.topicReview.findFirst({ where: { id, userId } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.topicReview.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting topic review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
