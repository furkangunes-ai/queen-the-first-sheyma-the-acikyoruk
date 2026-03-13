import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(request.url);
    const examTypeId = searchParams.get("examTypeId");
    const limit = searchParams.get("limit");

    const exams = await prisma.exam.findMany({
      where: {
        userId,
        ...(examTypeId && { examTypeId }),
      },
      include: {
        examType: true,
        subjectResults: {
          include: {
            subject: true,
          },
        },
        cognitiveVoids: {
          select: { status: true },
        },
      },
      orderBy: { date: "desc" },
      take: limit ? Math.min(Math.max(1, parseInt(limit, 10) || 50), 100) : 50,
    });

    return NextResponse.json(exams);
  } catch (error) {
    logApiError("exams", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await request.json();
    const { title, examTypeId, date, notes, examCategory,
            timeOfDay, environment, perceivedDifficulty, biologicalState } = body;

    if (!title || !examTypeId) {
      return NextResponse.json(
        { error: "Başlık ve sınav türü gerekli" },
        { status: 400 }
      );
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        examTypeId,
        date: date ? new Date(date) : new Date(),
        notes,
        userId,
        ...(examCategory && { examCategory }),
        ...(timeOfDay && { timeOfDay }),
        ...(environment && { environment }),
        ...(perceivedDifficulty && { perceivedDifficulty }),
        ...(biologicalState && { biologicalState }),
      },
      include: {
        examType: true,
      },
    });

    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    logApiError("exams", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
