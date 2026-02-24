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

    // Return system-level error reasons plus user's custom ones
    const errorReasons = await prisma.errorReason.findMany({
      where: {
        OR: [
          { isDefault: true },
          { userId },
        ],
      },
      orderBy: { label: "asc" },
    });

    return NextResponse.json(errorReasons);
  } catch (error) {
    console.error("Error fetching error reasons:", error);
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
    const { label } = body;

    if (!label) {
      return NextResponse.json(
        { error: "Error reason label is required" },
        { status: 400 }
      );
    }

    const errorReason = await prisma.errorReason.create({
      data: {
        label,
        isDefault: false,
        userId,
      },
    });

    return NextResponse.json(errorReason, { status: 201 });
  } catch (error) {
    console.error("Error creating error reason:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
