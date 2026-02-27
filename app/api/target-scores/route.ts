import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/target-scores
 * Kullanıcının tüm hedef netlerini döner + gerçek en son deneme netleriyle karşılaştırır.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;

    // Fetch target scores with subject info
    const targets = await prisma.targetScore.findMany({
      where: { userId },
      include: {
        subject: { include: { examType: true } },
      },
      orderBy: { subject: { name: "asc" } },
    });

    // Fetch latest exam results per subject for comparison
    const latestExams = await prisma.exam.findMany({
      where: { userId },
      include: {
        subjectResults: { include: { subject: true } },
        examType: true,
      },
      orderBy: { date: "desc" },
      take: 10,
    });

    // Build latest net per subject (from the most recent exam that includes each subject)
    const latestNetMap = new Map<string, { net: number; examDate: string; examTitle: string }>();
    for (const exam of latestExams) {
      for (const sr of exam.subjectResults) {
        if (!latestNetMap.has(sr.subjectId)) {
          latestNetMap.set(sr.subjectId, {
            net: sr.netScore,
            examDate: exam.date.toISOString(),
            examTitle: exam.title || "Deneme",
          });
        }
      }
    }

    // Combine targets with actual scores
    const result = targets.map((t) => {
      const actual = latestNetMap.get(t.subjectId);
      const gap = actual ? t.targetNet - actual.net : null;
      const progress = actual ? Math.min(100, Math.round((actual.net / t.targetNet) * 100)) : 0;

      return {
        id: t.id,
        subjectId: t.subjectId,
        subjectName: t.subject.name,
        examTypeName: t.subject.examType.name,
        targetNet: t.targetNet,
        actualNet: actual?.net ?? null,
        actualExamDate: actual?.examDate ?? null,
        actualExamTitle: actual?.examTitle ?? null,
        gap,
        progress,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching target scores:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/target-scores
 * Hedef net oluştur veya güncelle (upsert).
 * Body: { subjectId, targetNet } veya { targets: [{ subjectId, targetNet }] }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;

    const body = await request.json();

    // Support bulk upsert
    const targets: { subjectId: string; targetNet: number }[] = body.targets
      ? body.targets
      : [{ subjectId: body.subjectId, targetNet: body.targetNet }];

    if (!targets.length || targets.some((t) => !t.subjectId || t.targetNet === undefined)) {
      return NextResponse.json(
        { error: "subjectId and targetNet are required" },
        { status: 400 }
      );
    }

    // Validate targetNet values
    for (const t of targets) {
      if (typeof t.targetNet !== "number" || t.targetNet < 0) {
        return NextResponse.json(
          { error: "targetNet must be a non-negative number" },
          { status: 400 }
        );
      }
    }

    // Upsert all targets
    const results = await prisma.$transaction(
      targets.map((t) =>
        prisma.targetScore.upsert({
          where: {
            userId_subjectId: {
              userId,
              subjectId: t.subjectId,
            },
          },
          update: { targetNet: t.targetNet },
          create: {
            userId,
            subjectId: t.subjectId,
            targetNet: t.targetNet,
          },
          include: {
            subject: { include: { examType: true } },
          },
        })
      )
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error saving target scores:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/target-scores?id=xxx
 * Hedef net kaydını sil.
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Verify ownership
    const target = await prisma.targetScore.findFirst({
      where: { id, userId },
    });

    if (!target) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.targetScore.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting target score:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
