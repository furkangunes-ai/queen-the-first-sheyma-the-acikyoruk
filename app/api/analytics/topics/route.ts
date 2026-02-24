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

    // Get all wrong questions for the user's exams, grouped by topic
    const wrongQuestions = await prisma.examWrongQuestion.findMany({
      where: {
        exam: {
          userId,
          ...(examTypeId && { examTypeId }),
        },
        ...(subjectId && { subjectId }),
      },
      include: {
        subject: true,
        topic: true,
        exam: {
          select: { date: true },
        },
      },
    });

    // Group by topic
    const topicMap = new Map<
      string,
      {
        topicId: string;
        topicName: string;
        subjectId: string;
        subjectName: string;
        count: number;
        questions: typeof wrongQuestions;
      }
    >();

    for (const wq of wrongQuestions) {
      const key = wq.topicId || "unknown";
      const existing = topicMap.get(key);

      if (existing) {
        existing.count += 1;
        existing.questions.push(wq);
      } else {
        topicMap.set(key, {
          topicId: wq.topicId || "unknown",
          topicName: wq.topic?.name || "Belirtilmemiş",
          subjectId: wq.subjectId,
          subjectName: wq.subject.name,
          count: 1,
          questions: [wq],
        });
      }
    }

    // Sort by count descending
    const topicAnalysis = Array.from(topicMap.values())
      .sort((a, b) => b.count - a.count)
      .map(({ questions, ...rest }) => rest);

    return NextResponse.json(topicAnalysis);
  } catch (error) {
    console.error("Error fetching topic analysis:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
