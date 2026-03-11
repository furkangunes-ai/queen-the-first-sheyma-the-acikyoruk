import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    if ((session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Sadece admin" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        role: true,
      },
      orderBy: { displayName: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    logApiError("users", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users — Kullanıcının kendi profil ayarlarını güncelle (examTrack vb.)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;

    const { examTrack } = await request.json();

    // Validate examTrack
    const validTracks = ["sayisal", "ea", "sozel"];
    if (examTrack !== null && examTrack !== undefined && !validTracks.includes(examTrack)) {
      return NextResponse.json(
        { error: "Geçersiz alan seçimi. sayisal, ea veya sozel olmalı." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { examTrack: examTrack || null },
      select: {
        id: true,
        examTrack: true,
        displayName: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    logApiError("users", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
