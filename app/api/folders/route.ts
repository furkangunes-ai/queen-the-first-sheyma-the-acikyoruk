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

    const folders = await prisma.folder.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(folders);
  } catch (error) {
    logApiError("folders", error);
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
    const { name, color } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
      return NextResponse.json(
        { error: "Klasör adı 1-100 karakter olmalı" },
        { status: 400 }
      );
    }
    if (color && !/^#[0-9a-fA-F]{6}$/.test(color)) {
      return NextResponse.json(
        { error: "Geçersiz renk formatı" },
        { status: 400 }
      );
    }

    const folder = await prisma.folder.create({
      data: {
        name: name.trim(),
        color: color || "#6366f1",
        userId,
      },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    logApiError("folders", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
