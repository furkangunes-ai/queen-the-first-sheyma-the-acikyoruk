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

    const wrongQuestions = await prisma.examWrongQuestion.findMany({
      where: { examId: id },
      include: {
        subject: true,
        topic: true,
        errorReason: true,
      },
      orderBy: { questionNumber: "asc" },
    });

    return NextResponse.json(wrongQuestions);
  } catch (error) {
    console.error("Error fetching wrong questions:", error);
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
    const { questionNumber, subjectId, topicId, errorReasonId, notes, photoUrl, photoR2Key } = body;

    if (!subjectId) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    const wrongQuestion = await prisma.examWrongQuestion.create({
      data: {
        questionNumber,
        examId: id,
        subjectId,
        topicId,
        errorReasonId,
        notes,
        photoUrl,
        photoR2Key,
      },
      include: {
        subject: true,
        topic: true,
        errorReason: true,
      },
    });

    return NextResponse.json(wrongQuestion, { status: 201 });
  } catch (error) {
    console.error("Error creating wrong question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
