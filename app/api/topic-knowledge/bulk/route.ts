import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { updates } = await request.json();
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: "updates array required" }, { status: 400 });
    }

    await prisma.$transaction(
      updates.map((u: { topicId: string; level: number }) =>
        prisma.topicKnowledge.upsert({
          where: { userId_topicId: { userId, topicId: u.topicId } },
          update: { level: u.level },
          create: { userId, topicId: u.topicId, level: u.level },
        })
      )
    );

    return NextResponse.json({ count: updates.length });
  } catch (error) {
    console.error("Error bulk updating topic knowledge:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
