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
    const examTypeId = searchParams.get("examTypeId");
    const subjectId = searchParams.get("subjectId");
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const exams = await prisma.exam.findMany({
      where: {
        userId,
        ...(examTypeId && { examTypeId }),
        // If subjectId is provided, only fetch exams that have results for that subject
        ...(subjectId && {
          subjectResults: {
            some: { subjectId },
          },
        }),
      },
      include: {
        examType: true,
        subjectResults: {
          include: {
            subject: true,
          },
          ...(subjectId && {
            where: { subjectId },
          }),
        },
      },
      orderBy: { date: "asc" },
      take: limit,
    });

    // Build trends data: for each exam, show total net and per-subject nets
    const trends = exams.map((exam) => {
      const subjectNets = exam.subjectResults.map((sr) => ({
        subjectId: sr.subjectId,
        subjectName: sr.subject.name,
        correctCount: sr.correctCount,
        wrongCount: sr.wrongCount,
        emptyCount: sr.emptyCount,
        netScore: sr.netScore,
      }));

      const totalNet = subjectNets.reduce(
        (sum, s) => sum + (s.netScore ?? 0),
        0
      );

      return {
        examId: exam.id,
        examTitle: exam.title,
        date: exam.date,
        examTypeName: exam.examType.name,
        totalNet,
        subjectNets,
      };
    });

    return NextResponse.json(trends);
  } catch (error) {
    console.error("Error fetching exam trends:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
