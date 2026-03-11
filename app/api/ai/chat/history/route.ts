import { prisma } from "@/lib/prisma";
import { checkAIAccess, isAIGuardError } from "@/lib/ai-guard";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const guard = await checkAIAccess();
    if (isAIGuardError(guard)) return guard;
    const { userId } = guard;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "50")), 100);
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0"));

    const messages = await prisma.aIChatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: limit,
      skip: offset,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const guard = await checkAIAccess();
    if (isAIGuardError(guard)) return guard;
    const { userId } = guard;

    await prisma.aIChatMessage.deleteMany({ where: { userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
