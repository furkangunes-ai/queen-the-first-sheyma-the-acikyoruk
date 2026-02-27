import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
