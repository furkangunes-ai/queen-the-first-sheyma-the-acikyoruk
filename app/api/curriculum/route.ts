import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";

/**
 * GET /api/curriculum
 * Returns the full curriculum structure (exam types → subjects → topics → kazanımlar)
 * for authenticated users.
 * Optional query: ?subjectId=xxx to filter a single subject
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");

    const subjectWhere = subjectId ? { id: subjectId } : undefined;

    const examTypes = await prisma.examType.findMany({
      include: {
        subjects: {
          where: subjectWhere,
          include: {
            topics: {
              orderBy: { sortOrder: "asc" },
              include: {
                kazanimlar: {
                  orderBy: { sortOrder: "asc" },
                  select: {
                    id: true,
                    code: true,
                    description: true,
                    isKeyKazanim: true,
                    subTopicName: true,
                  },
                },
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    // Flatten to subjects array with exam type info
    const subjects = examTypes.flatMap((et) =>
      et.subjects.map((s) => ({
        id: s.id,
        name: s.name,
        examType: { id: et.id, name: et.name },
        topics: s.topics.map((t) => ({
          id: t.id,
          name: t.name,
          sortOrder: t.sortOrder,
          kazanimlar: t.kazanimlar,
        })),
      }))
    );

    return NextResponse.json({ subjects });
  } catch (error) {
    logApiError("curriculum", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
