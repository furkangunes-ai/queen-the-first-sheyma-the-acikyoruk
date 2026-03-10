import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
    const { results } = body;

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: "Sonuç dizisi gerekli" },
        { status: 400 }
      );
    }

    // Validate each result entry
    for (const result of results) {
      if (!result.subjectId || result.correctCount === undefined || result.wrongCount === undefined || result.emptyCount === undefined) {
        return NextResponse.json(
          { error: "Her sonuçta subjectId, correctCount, wrongCount ve emptyCount olmalı" },
          { status: 400 }
        );
      }
    }

    // Validate all subjectIds exist and belong to the exam's examType
    const subjectIds = results.map((r: any) => r.subjectId);
    const validSubjects = await prisma.subject.findMany({
      where: { id: { in: subjectIds }, examTypeId: exam.examTypeId },
      select: { id: true },
    });
    const validSubjectIds = new Set(validSubjects.map((s) => s.id));
    const invalidIds = subjectIds.filter((id: string) => !validSubjectIds.has(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: "Geçersiz ders seçimi: bazı dersler bu sınav türüne ait değil" },
        { status: 400 }
      );
    }

    // Delete existing results for this exam, then create new ones
    await prisma.examSubjectResult.deleteMany({
      where: { examId: id },
    });

    const subjectResults = await prisma.examSubjectResult.createMany({
      data: results.map((result: { subjectId: string; correctCount: number; wrongCount: number; emptyCount: number }) => ({
        examId: id,
        subjectId: result.subjectId,
        correctCount: result.correctCount,
        wrongCount: result.wrongCount,
        emptyCount: result.emptyCount,
        netScore: result.correctCount - (result.wrongCount / 4),
      })),
    });

    // Compute total net score locally for the response
    const totalNet = results.reduce(
      (sum: number, r: { correctCount: number; wrongCount: number }) =>
        sum + (r.correctCount - (r.wrongCount / 4)),
      0
    );


    // Fetch the created results with relations
    const createdResults = await prisma.examSubjectResult.findMany({
      where: { examId: id },
      include: { subject: true },
    });

    return NextResponse.json(
      { results: createdResults, totalNet },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving exam results:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
