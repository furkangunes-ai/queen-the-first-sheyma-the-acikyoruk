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

    const exam = await prisma.exam.findFirst({
      where: { id, userId },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Exam not found" },
        { status: 404 }
      );
    }

    const emptyQuestions = await prisma.examEmptyQuestion.findMany({
      where: { examId: id },
      include: {
        subject: true,
        topic: true,
      },
      orderBy: { questionNumber: "asc" },
    });

    return NextResponse.json(emptyQuestions);
  } catch (error) {
    console.error("Error fetching empty questions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const exam = await prisma.exam.findFirst({
      where: { id, userId },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Exam not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { questionNumber, subjectId, topicId, notes } = body;

    if (!subjectId) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    const emptyQuestion = await prisma.examEmptyQuestion.create({
      data: {
        questionNumber,
        examId: id,
        subjectId,
        topicId,
        notes,
      },
      include: {
        subject: true,
        topic: true,
      },
    });

    return NextResponse.json(emptyQuestion, { status: 201 });
  } catch (error) {
    console.error("Error creating empty question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
