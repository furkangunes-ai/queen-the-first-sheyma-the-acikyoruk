import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await prisma.topicConcept.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Topic concept not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, formula, sortOrder } = body;

    const concept = await prisma.topicConcept.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(formula !== undefined && { formula }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json(concept);
  } catch (error) {
    console.error("Error updating topic concept:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await prisma.topicConcept.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Topic concept not found" },
        { status: 404 }
      );
    }

    await prisma.topicConcept.delete({ where: { id } });

    return NextResponse.json({ message: "Topic concept deleted" });
  } catch (error) {
    console.error("Error deleting topic concept:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
