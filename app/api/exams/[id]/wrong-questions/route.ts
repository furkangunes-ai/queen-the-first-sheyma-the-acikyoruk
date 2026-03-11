import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { recordStudyForTopic } from "@/lib/cognitive-engine";

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
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Sınav bulunamadı" },
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
      { error: "Sunucu hatası" },
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
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;

    const exam = await prisma.exam.findFirst({
      where: { id, userId },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Sınav bulunamadı" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { questionNumber, subjectId, topicId, errorReasonId, notes, photoUrl, photoR2Key, difficulty } = body;

    if (!subjectId) {
      return NextResponse.json(
        { error: "Ders seçimi gerekli" },
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
        difficulty,
      },
      include: {
        subject: true,
        topic: true,
        errorReason: true,
      },
    });

    // Bilişsel çizge güncelleme: yanlış soru → ilgili kavram mastery düşür
    if (topicId) {
      recordStudyForTopic(userId, topicId, 0.0).catch((err) =>
        console.error("Cognitive engine update error:", err)
      );
    }

    return NextResponse.json(wrongQuestion, { status: 201 });
  } catch (error) {
    console.error("Error creating wrong question:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
