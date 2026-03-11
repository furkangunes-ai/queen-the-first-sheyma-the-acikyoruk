import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/cognitive/edges — Bağımlılık kenarlarını listele
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const parentNodeId = searchParams.get("parentNodeId");
  const childNodeId = searchParams.get("childNodeId");
  const domain = searchParams.get("domain");

  const where: any = {};
  if (parentNodeId) where.parentNodeId = parentNodeId;
  if (childNodeId) where.childNodeId = childNodeId;
  if (domain) {
    where.parentNode = { domain };
  }

  const edges = await prisma.dependencyEdge.findMany({
    where,
    include: {
      parentNode: { select: { id: true, name: true, domain: true } },
      childNode: { select: { id: true, name: true, domain: true } },
    },
    orderBy: { dependencyWeight: "desc" },
  });

  return NextResponse.json(edges);
}

// POST /api/cognitive/edges — Yeni bağımlılık oluştur (admin only)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  if ((session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Sadece admin" }, { status: 403 });
  }

  const body = await req.json();
  const { parentNodeId, childNodeId, dependencyWeight } = body;

  if (!parentNodeId || !childNodeId) {
    return NextResponse.json(
      { error: "parentNodeId ve childNodeId zorunludur" },
      { status: 400 }
    );
  }

  // Döngü kontrolü: child, parent'ın atası olmamalı
  if (parentNodeId === childNodeId) {
    return NextResponse.json(
      { error: "Bir düğüm kendisine bağlanamaz" },
      { status: 400 }
    );
  }

  try {
    const edge = await prisma.dependencyEdge.create({
      data: {
        parentNodeId,
        childNodeId,
        dependencyWeight: dependencyWeight ?? 0.7,
      },
      include: {
        parentNode: { select: { id: true, name: true } },
        childNode: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(edge, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Bu bağlantı zaten mevcut" },
        { status: 409 }
      );
    }
    if (err.code === "P2003") {
      return NextResponse.json(
        { error: "Geçersiz node ID" },
        { status: 400 }
      );
    }
    throw err;
  }
}
