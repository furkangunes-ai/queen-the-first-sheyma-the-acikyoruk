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

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topicId");

    if (!topicId) {
      return NextResponse.json(
        { error: "topicId is required" },
        { status: 400 }
      );
    }

    // Get all kazanım IDs for this topic
    const kazanimlar = await prisma.topicKazanim.findMany({
      where: { topicId },
      select: { id: true },
    });

    const kazanimIds = kazanimlar.map((k) => k.id);

    // Get user's progress for those kazanımlar
    const progressList = await prisma.kazanimProgress.findMany({
      where: {
        userId,
        kazanimId: { in: kazanimIds },
      },
    });

    const result = progressList.map((p) => ({
      kazanimId: p.kazanimId,
      checked: p.checked,
      notes: p.notes,
    }));

    return NextResponse.json(result);
  } catch (error) {
    logApiError("kazanim-progress", error);
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
    const { kazanimId, checked, notes } = body;

    if (!kazanimId) {
      return NextResponse.json(
        { error: "kazanimId is required" },
        { status: 400 }
      );
    }

    // Build update/create data
    const updateData: any = {};
    if (checked !== undefined) updateData.checked = checked;
    if (notes !== undefined) updateData.notes = notes;

    const progress = await prisma.kazanimProgress.upsert({
      where: { userId_kazanimId: { userId, kazanimId } },
      update: updateData,
      create: {
        userId,
        kazanimId,
        checked: checked ?? false,
        notes: notes ?? null,
      },
    });

    // --- Auto-level calculation ---
    // 1. Find the TopicKazanim to get topicId
    const kazanim = await prisma.topicKazanim.findUnique({
      where: { id: kazanimId },
      select: { topicId: true },
    });

    if (!kazanim) {
      return NextResponse.json(
        { error: "Kazanım bulunamadı" },
        { status: 404 }
      );
    }

    const topicId = kazanim.topicId;

    // 2. Count total kazanımlar for that topic
    const totalCount = await prisma.topicKazanim.count({
      where: { topicId },
    });

    // 3. Count checked kazanımlar for that user on that topic
    const checkedCount = await prisma.kazanimProgress.count({
      where: {
        userId,
        checked: true,
        kazanim: { topicId },
      },
    });

    // 4. Calculate autoLevel
    const autoLevel = Math.round((checkedCount / totalCount) * 5);

    // 5. Upsert TopicKnowledge with that level
    await prisma.topicKnowledge.upsert({
      where: { userId_topicId: { userId, topicId } },
      update: { level: autoLevel },
      create: { userId, topicId, level: autoLevel },
    });

    return NextResponse.json({
      progress,
      autoLevel,
      checkedCount,
      totalCount,
    });
  } catch (error) {
    logApiError("kazanim-progress", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
