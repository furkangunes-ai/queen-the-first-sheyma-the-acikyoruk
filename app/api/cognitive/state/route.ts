import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { recordSuccess, recordFailure, recordStudySession } from "@/lib/cognitive-engine";

// GET /api/cognitive/state — Kullanıcının bilişsel durumlarını getir
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");
  const nodeId = searchParams.get("nodeId");

  const where: any = { userId: session.user.id };
  if (nodeId) where.nodeId = nodeId;
  if (domain) {
    where.node = { domain };
  }

  const states = await prisma.userCognitiveState.findMany({
    where,
    include: {
      node: {
        select: {
          id: true,
          name: true,
          domain: true,
          examType: true,
          complexityScore: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(states);
}

// POST /api/cognitive/state — Mastery güncelle (olay tabanlı)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await req.json();
  const { nodeId, type, correctRatio, masteryChange } = body;

  if (!nodeId || !type) {
    return NextResponse.json(
      { error: "nodeId ve type zorunludur" },
      { status: 400 }
    );
  }

  const userId = session.user.id!;

  switch (type) {
    case "success":
      await recordSuccess(userId, nodeId, masteryChange ?? 0.1);
      break;
    case "failure":
      await recordFailure(userId, nodeId, masteryChange ?? 0.15);
      break;
    case "study":
      if (correctRatio === undefined) {
        return NextResponse.json(
          { error: "study tipi için correctRatio zorunludur" },
          { status: 400 }
        );
      }
      await recordStudySession(userId, nodeId, correctRatio);
      break;
    default:
      return NextResponse.json(
        { error: "Geçersiz type. Kullanılabilir: success, failure, study" },
        { status: 400 }
      );
  }

  // Güncel state'i döndür
  const updated = await prisma.userCognitiveState.findUnique({
    where: { userId_nodeId: { userId, nodeId } },
    include: {
      node: { select: { id: true, name: true, domain: true } },
    },
  });

  return NextResponse.json(updated);
}
