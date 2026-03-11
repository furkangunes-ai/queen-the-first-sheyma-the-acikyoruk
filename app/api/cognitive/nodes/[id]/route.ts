import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/cognitive/nodes/:id — Tek kavram düğümü getir
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;

  const node = await prisma.conceptNode.findUnique({
    where: { id },
    include: {
      parentTopic: { select: { id: true, name: true } },
      parentEdges: {
        include: {
          parentNode: { select: { id: true, name: true, domain: true } },
        },
      },
      childEdges: {
        include: {
          childNode: { select: { id: true, name: true, domain: true } },
        },
      },
      _count: { select: { cognitiveStates: true } },
    },
  });

  if (!node) {
    return NextResponse.json({ error: "Düğüm bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(node);
}

// PATCH /api/cognitive/nodes/:id — Düğüm güncelle (admin only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  if ((session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Sadece admin" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, slug, domain, examType, complexityScore, parentTopicId, sortOrder } = body;

  try {
    const node = await prisma.conceptNode.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(domain !== undefined && { domain }),
        ...(examType !== undefined && { examType }),
        ...(complexityScore !== undefined && { complexityScore }),
        ...(parentTopicId !== undefined && { parentTopicId: parentTopicId || null }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });
    return NextResponse.json(node);
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Bu slug zaten kullanılıyor" },
        { status: 409 }
      );
    }
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Düğüm bulunamadı" }, { status: 404 });
    }
    throw err;
  }
}

// DELETE /api/cognitive/nodes/:id — Düğüm sil (admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  if ((session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Sadece admin" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await prisma.conceptNode.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Düğüm bulunamadı" }, { status: 404 });
    }
    throw err;
  }
}
