import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/cognitive/search — Kavram arama (fuzzy/contains)
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const domain = searchParams.get("domain");
  const examType = searchParams.get("examType");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  if (!q || q.length < 2) {
    return NextResponse.json(
      { error: "Arama terimi en az 2 karakter olmalıdır" },
      { status: 400 }
    );
  }

  const where: any = {
    name: { contains: q, mode: "insensitive" },
  };
  if (domain) where.domain = domain;
  if (examType && examType !== "both") {
    where.examType = { in: [examType, "both"] };
  }

  const nodes = await prisma.conceptNode.findMany({
    where,
    take: limit,
    orderBy: [{ domain: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      domain: true,
      examType: true,
      complexityScore: true,
      parentTopic: { select: { id: true, name: true } },
    },
  });

  // Kullanıcının bu node'lardaki state'leri
  const userId = session.user.id!;
  const nodeIds = nodes.map((n) => n.id);
  const states = await prisma.userCognitiveState.findMany({
    where: { userId, nodeId: { in: nodeIds } },
    select: { nodeId: true, masteryLevel: true },
  });

  const stateMap = new Map<string, number>();
  for (const s of states) {
    stateMap.set(s.nodeId, s.masteryLevel);
  }

  // Node'lara mastery bilgisi ekle
  const results = nodes.map((n) => ({
    ...n,
    userMastery: stateMap.get(n.id) ?? null,
  }));

  return NextResponse.json(results);
}
