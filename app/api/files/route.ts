import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const files = await prisma.userFile.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    console.error("Error creating file record:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
