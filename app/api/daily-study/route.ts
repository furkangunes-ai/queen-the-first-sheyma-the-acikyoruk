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
    const limit = searchParams.get("limit");

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

    const studies = await prisma.dailyStudy.findMany({
      where,
      include: {
        subject: { include: { examType: true } },
        topic: true,
      },
      orderBy: { date: "desc" },
      ...(limit ? { take: parseInt(limit) } : {}),
    });

    return NextResponse.json(studies);
  } catch (error) {
    console.error("Error fetching daily studies:", error);
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
      date, subjectId, topicId, questionCount, correctCount, wrongCount,
      emptyCount, difficulty, source, duration, photoUrl, photoR2Key, notes,
    } = body;

    if (!subjectId || !questionCount) {
      return NextResponse.json({ error: "Subject and question count required" }, { status: 400 });
    }

    const study = await prisma.dailyStudy.create({
      data: {
        date: new Date(date || new Date()),
        userId,
        subjectId,
        topicId: topicId || null,
        questionCount,
        correctCount: correctCount || 0,
        wrongCount: wrongCount || 0,
        emptyCount: emptyCount || 0,
        difficulty: difficulty || null,
        source: source || null,
        duration: duration || null,
        photoUrl: photoUrl || null,
        photoR2Key: photoR2Key || null,
        notes: notes || null,
      },
      include: {
        subject: { include: { examType: true } },
        topic: true,
      },
    });

    return NextResponse.json(study, { status: 201 });
  } catch (error) {
    console.error("Error creating daily study:", error);
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

    const existing = await prisma.dailyStudy.findFirst({ where: { id, userId } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.dailyStudy.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting daily study:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
