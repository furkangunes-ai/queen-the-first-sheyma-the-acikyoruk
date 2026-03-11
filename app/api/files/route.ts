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

    const files = await prisma.userFile.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json(files);
  } catch (error) {
    logApiError("files", error);
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
    const { name, url, r2Key, mimeType, sizeBytes } = body;

    if (!name || !url || !r2Key || !mimeType) {
      return NextResponse.json(
        { error: "name, url, r2Key, and mimeType are required" },
        { status: 400 }
      );
    }

    const file = await prisma.userFile.create({
      data: {
        name,
        url,
        r2Key,
        mimeType,
        sizeBytes: sizeBytes || 0,
        userId,
      },
    });

    return NextResponse.json(file, { status: 201 });
  } catch (error) {
    logApiError("files", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
