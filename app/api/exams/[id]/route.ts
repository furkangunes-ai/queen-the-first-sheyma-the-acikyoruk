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

    const exam = await prisma.exam.findFirst({
      where: { id, userId },
      include: {
        examType: true,
        subjectResults: {
          include: {
            subject: true,
          },
        },
        wrongQuestions: {
          include: {
            subject: true,
            topic: true,
            errorReason: true,
          },
        },
        emptyQuestions: {
          include: {
            subject: true,
            topic: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Sınav bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(exam);
  } catch (error) {
    logApiError("exams/:id", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const existing = await prisma.exam.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Sınav bulunamadı" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, date, notes, examTypeId, examCategory } = body;

    const exam = await prisma.exam.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(notes !== undefined && { notes }),
        ...(examTypeId !== undefined && { examTypeId }),
        ...(examCategory !== undefined && { examCategory: examCategory || null }),
      },
      include: {
        examType: true,
      },
    });

    return NextResponse.json(exam);
  } catch (error) {
    logApiError("exams/:id", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
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

    const existing = await prisma.exam.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Sınav bulunamadı" },
        { status: 404 }
      );
    }

    await prisma.exam.delete({ where: { id } });

    return NextResponse.json({ message: "Exam deleted" });
  } catch (error) {
    logApiError("exams/:id", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
