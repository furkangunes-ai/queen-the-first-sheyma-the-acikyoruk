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

    const { searchParams } = new URL(request.url);
    const examTypeId = searchParams.get("examTypeId");

    const where: any = { userId };
    if (examTypeId) {
      where.topic = { subject: { examTypeId } };
    }

    const knowledge = await prisma.topicKnowledge.findMany({
      where,
      include: {
        topic: {
          include: {
            subject: {
              include: { examType: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(knowledge);
  } catch (error) {
    console.error("Error fetching topic knowledge:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { topicId, level } = await request.json();
    if (!topicId || level === undefined) {
      return NextResponse.json({ error: "topicId and level required" }, { status: 400 });
    }

    const knowledge = await prisma.topicKnowledge.upsert({
      where: { userId_topicId: { userId, topicId } },
      update: { level },
      create: { userId, topicId, level },
      include: {
        topic: {
          include: {
            subject: { include: { examType: true } },
          },
        },
      },
    });

    return NextResponse.json(knowledge);
  } catch (error) {
    console.error("Error updating topic knowledge:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
