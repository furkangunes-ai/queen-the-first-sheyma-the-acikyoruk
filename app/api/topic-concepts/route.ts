import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topicId");
    const topicIds = searchParams.get("topicIds");

    if (!topicId && !topicIds) {
      return NextResponse.json(
        { error: "topicId or topicIds is required" },
        { status: 400 }
      );
    }

    const where = topicIds
      ? { topicId: { in: topicIds.split(",").filter(Boolean) } }
      : { topicId: topicId! };

    const concepts = await prisma.topicConcept.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(concepts);
  } catch (error) {
    console.error("Error fetching topic concepts:", error);
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

    if ((session.user as any).role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { topicId, name, description, formula, sortOrder } = body;

    if (!topicId || !name) {
      return NextResponse.json(
        { error: "topicId and name are required" },
        { status: 400 }
      );
    }

    const concept = await prisma.topicConcept.create({
      data: {
        topicId,
        name,
        ...(description !== undefined && { description }),
        ...(formula !== undefined && { formula }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json(concept, { status: 201 });
  } catch (error) {
    console.error("Error creating topic concept:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
