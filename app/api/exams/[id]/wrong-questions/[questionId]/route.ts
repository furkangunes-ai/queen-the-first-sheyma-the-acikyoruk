import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id, questionId } = await params;

    // Verify exam belongs to user
    const exam = await prisma.exam.findFirst({
      where: { id, userId },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Verify question belongs to this exam
    const existingQuestion = await prisma.examWrongQuestion.findFirst({
      where: { id: questionId, examId: id },
    });

    if (!existingQuestion) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      questionNumber,
      subjectId,
      topicId,
      errorReasonId,
      notes,
      photoUrl,
      photoR2Key,
      difficulty,
      understandingStatus,
    } = body;

    const updateData: Record<string, any> = {};

    if (questionNumber !== undefined) updateData.questionNumber = questionNumber;
    if (subjectId !== undefined) updateData.subjectId = subjectId;
    if (topicId !== undefined) updateData.topicId = topicId || null;
    if (errorReasonId !== undefined) updateData.errorReasonId = errorReasonId || null;
    if (notes !== undefined) updateData.notes = notes || null;
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl || null;
    if (photoR2Key !== undefined) updateData.photoR2Key = photoR2Key || null;
    if (difficulty !== undefined) updateData.difficulty = difficulty || null;
    if (understandingStatus !== undefined) updateData.understandingStatus = understandingStatus || null;

    const updated = await prisma.examWrongQuestion.update({
      where: { id: questionId },
      data: updateData,
      include: {
        subject: true,
        topic: true,
        errorReason: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating wrong question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id, questionId } = await params;

    // Verify exam belongs to user
    const exam = await prisma.exam.findFirst({
      where: { id, userId },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    await prisma.examWrongQuestion.delete({
      where: { id: questionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting wrong question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
