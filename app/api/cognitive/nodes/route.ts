import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/cognitive/nodes — Kavram düğümlerini listele
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");
  const examType = searchParams.get("examType");
  const search = searchParams.get("search");
  const parentTopicId = searchParams.get("parentTopicId");

  const where: any = {};
  if (domain) where.domain = domain;
  if (examType && examType !== "both") {
    where.examType = { in: [examType, "both"] };
  }
  if (parentTopicId) where.parentTopicId = parentTopicId;
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const nodes = await prisma.conceptNode.findMany({
    where,
    orderBy: [{ domain: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    include: {
      parentTopic: { select: { id: true, name: true } },
      _count: {
        select: {
          parentEdges: true,
          childEdges: true,
          cognitiveStates: true,
        },
      },
    },
    take: 1000,
  });

  return NextResponse.json(nodes);
}

// POST /api/cognitive/nodes — Yeni kavram düğümü oluştur (admin only)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  if ((session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Sadece admin" }, { status: 403 });
  }

  const body = await req.json();
  const { name, slug, domain, examType, complexityScore, parentTopicId, sortOrder } = body;

  if (!name || !slug || !domain) {
    return NextResponse.json(
      { error: "name, slug ve domain zorunludur" },
      { status: 400 }
    );
  }

  try {
    const node = await prisma.conceptNode.create({
      data: {
        name,
        slug,
        domain,
        examType: examType || "both",
        complexityScore: complexityScore ?? 5,
        parentTopicId: parentTopicId || null,
        sortOrder: sortOrder ?? 0,
      },
    });
    return NextResponse.json(node, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Bu slug zaten kullanılıyor" },
        { status: 409 }
      );
    }
    throw err;
  }
}
