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
    const userId = (session.user as any).id;

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");

    const sessions = await prisma.speedReadingSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit ? Math.min(Math.max(1, parseInt(limit)), 100) : 50,
    });

    return NextResponse.json(sessions);
  } catch (error) {
    logApiError("speed-reading", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await request.json();
    const {
      title,
      wordCount,
      wordsRead,
      initialWpm,
      finalWpm,
      chunkSize,
      autoSpeed,
      duration,
      completed,
      comprehension,
    } = body;

    if (
      !wordCount ||
      !wordsRead ||
      !initialWpm ||
      !finalWpm ||
      duration === undefined
    ) {
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik" },
        { status: 400 }
      );
    }

    const created = await prisma.speedReadingSession.create({
      data: {
        userId,
        title: title || null,
        wordCount,
        wordsRead,
        initialWpm,
        finalWpm,
        chunkSize: chunkSize || 1,
        autoSpeed: autoSpeed || false,
        duration,
        completed: completed || false,
        comprehension: comprehension || null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    logApiError("speed-reading", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    const existing = await prisma.speedReadingSession.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }

    await prisma.speedReadingSession.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError("speed-reading", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
