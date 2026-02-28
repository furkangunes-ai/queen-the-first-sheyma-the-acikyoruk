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
    const topicId = searchParams.get("topicId");
    const topicIds = searchParams.get("topicIds");
    const keyOnly = searchParams.get("keyOnly");

    if (!topicId && !topicIds) {
      return NextResponse.json(
        { error: "topicId or topicIds is required" },
        { status: 400 }
      );
    }

    const where: any = topicIds
      ? { topicId: { in: topicIds.split(",").filter(Boolean) } }
      : { topicId: topicId! };

    if (keyOnly === "true") {
      where.isKeyKazanim = true;
    }

    const kazanimlar = await prisma.topicKazanim.findMany({
      where,
      include: {
        progress: {
          where: { userId },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    const result = kazanimlar.map((k) => ({
      id: k.id,
      topicId: k.topicId,
      code: k.code,
      subTopicName: k.subTopicName,
      description: k.description,
      details: k.details,
      isKeyKazanim: k.isKeyKazanim,
      sortOrder: k.sortOrder,
      progress: k.progress.length > 0
        ? { checked: k.progress[0].checked, notes: k.progress[0].notes }
        : null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching topic kazanims:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
