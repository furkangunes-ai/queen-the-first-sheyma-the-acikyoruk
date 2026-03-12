import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";

/**
 * GET /api/subjects/topics?subjectIds=id1,id2,...
 * Returns topics grouped by subject for the given subject IDs.
 * Used by ColdPhaseForm to populate topic selection.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectIdsParam = searchParams.get("subjectIds");

    if (!subjectIdsParam) {
      return NextResponse.json({ error: "subjectIds parametresi gerekli" }, { status: 400 });
    }

    const subjectIds = subjectIdsParam.split(",").filter(Boolean);

    const subjects = await prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      include: {
        topics: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, sortOrder: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // Return as { subjectId: { subjectName, topics: [...] } }
    const result: Record<string, { subjectName: string; topics: Array<{ id: string; name: string }> }> = {};
    for (const subject of subjects) {
      result[subject.id] = {
        subjectName: subject.name,
        topics: subject.topics.map((t) => ({ id: t.id, name: t.name })),
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    logApiError("subjects/topics", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
