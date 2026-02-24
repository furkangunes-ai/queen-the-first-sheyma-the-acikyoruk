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

    // Get all wrong questions for the user's exams, grouped by error reason
    const wrongQuestions = await prisma.examWrongQuestion.findMany({
      where: {
        exam: {
          userId,
          ...(examTypeId && { examTypeId }),
        },
        ...(subjectId && { subjectId }),
        errorReasonId: { not: null },
      },
      include: {
        errorReason: true,
        subject: true,
      },
    });

    // Group by error reason
    const reasonMap = new Map<
      string,
      {
        errorReasonId: string;
        errorReasonName: string;
        count: number;
        subjectBreakdown: Map<string, { subjectId: string; subjectName: string; count: number }>;
      }
    >();

    for (const wq of wrongQuestions) {
      if (!wq.errorReasonId || !wq.errorReason) continue;

      const key = wq.errorReasonId;
      const existing = reasonMap.get(key);

      if (existing) {
        existing.count += 1;
        const subjectEntry = existing.subjectBreakdown.get(wq.subjectId);
        if (subjectEntry) {
          subjectEntry.count += 1;
        } else {
          existing.subjectBreakdown.set(wq.subjectId, {
            subjectId: wq.subjectId,
            subjectName: wq.subject.name,
            count: 1,
          });
        }
      } else {
        const subjectBreakdown = new Map<string, { subjectId: string; subjectName: string; count: number }>();
        subjectBreakdown.set(wq.subjectId, {
          subjectId: wq.subjectId,
          subjectName: wq.subject.name,
          count: 1,
        });

        reasonMap.set(key, {
          errorReasonId: wq.errorReasonId,
          errorReasonName: wq.errorReason?.label ?? "Belirtilmemiş",
          count: 1,
          subjectBreakdown,
        });
      }
    }

    // Sort by count descending and convert maps to arrays
    const errorAnalysis = Array.from(reasonMap.values())
      .sort((a, b) => b.count - a.count)
      .map(({ subjectBreakdown, ...rest }) => ({
        ...rest,
        subjectBreakdown: Array.from(subjectBreakdown.values()).sort(
          (a, b) => b.count - a.count
        ),
      }));

    const totalWrongQuestions = wrongQuestions.length;

    return NextResponse.json({
      totalWrongQuestions,
      errorReasons: errorAnalysis,
    });
  } catch (error) {
    console.error("Error fetching error analysis:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
