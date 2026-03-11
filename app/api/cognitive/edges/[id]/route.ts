import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH /api/cognitive/edges/:id — Kenar ağırlığını güncelle (admin only)
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
  const { dependencyWeight, isAdaptive } = body;

  try {
    const edge = await prisma.dependencyEdge.update({
      where: { id },
      data: {
        ...(dependencyWeight !== undefined && { dependencyWeight }),
        ...(isAdaptive !== undefined && { isAdaptive }),
      },
      include: {
        parentNode: { select: { id: true, name: true } },
        childNode: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(edge);
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Kenar bulunamadı" }, { status: 404 });
    }
    throw err;
  }
}

// DELETE /api/cognitive/edges/:id — Kenarı sil (admin only)
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
    await prisma.dependencyEdge.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Kenar bulunamadı" }, { status: 404 });
    }
    throw err;
  }
}
