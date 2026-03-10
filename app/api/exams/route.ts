import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
      },
      orderBy: { date: "desc" },
      ...(limit && { take: parseInt(limit, 10) }),
    });

    return NextResponse.json(exams);
  } catch (error) {
    console.error("Error fetching exams:", error);
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
    const { title, examTypeId, date, notes, examCategory } = body;

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
      },
      include: {
        examType: true,
      },
    });

    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    console.error("Error creating exam:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
