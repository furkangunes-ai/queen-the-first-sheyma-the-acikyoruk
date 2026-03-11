import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateWeeklyPlan } from "@/lib/cognitive-engine";
import type { ConceptNodeData, DependencyEdgeData, CognitiveStateData } from "@/lib/cognitive-engine";

// POST /api/cognitive/plan — Haftalık çalışma planı oluştur (Knapsack motoru)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await req.json();
  const {
    examType,
    availableDays = [0, 1, 2, 3, 4, 5, 6],
    dailyStudyMinutes = 120,
    domain,
  } = body;

  const userId = session.user.id!;

  // 1) Node'ları çek (isteğe bağlı domain filtresi)
  const nodeWhere: any = {};
  if (domain) nodeWhere.domain = domain;
  if (examType && examType !== "both") {
    nodeWhere.examType = { in: [examType, "both"] };
  }

  const rawNodes = await prisma.conceptNode.findMany({
    where: nodeWhere,
    select: {
      id: true,
      name: true,
      domain: true,
      examType: true,
      complexityScore: true,
    },
  });

  // 2) Edge'leri çek
  const nodeIds = rawNodes.map((n) => n.id);
  const rawEdges = await prisma.dependencyEdge.findMany({
    where: {
      OR: [
        { parentNodeId: { in: nodeIds } },
        { childNodeId: { in: nodeIds } },
      ],
    },
    select: {
      id: true,
      parentNodeId: true,
      childNodeId: true,
      dependencyWeight: true,
    },
  });

  // 3) Kullanıcının state'lerini çek
  const rawStates = await prisma.userCognitiveState.findMany({
    where: { userId, nodeId: { in: nodeIds } },
    select: {
      nodeId: true,
      masteryLevel: true,
      strength: true,
      successCount: true,
      lastTestedAt: true,
    },
  });

  // 4) Motor tipleriyle eşleştir
  const nodes: ConceptNodeData[] = rawNodes.map((n) => ({
    id: n.id,
    name: n.name,
    domain: n.domain,
    examType: n.examType,
    complexityScore: n.complexityScore,
  }));

  const edges: DependencyEdgeData[] = rawEdges.map((e) => ({
    parentNodeId: e.parentNodeId,
    childNodeId: e.childNodeId,
    dependencyWeight: e.dependencyWeight,
  }));

  const states: CognitiveStateData[] = rawStates.map((s) => ({
    nodeId: s.nodeId,
    masteryLevel: s.masteryLevel,
    strength: s.strength,
    successCount: s.successCount,
    lastTestedAt: s.lastTestedAt,
  }));

  // 5) Knapsack motoru çalıştır
  const plan = generateWeeklyPlan({
    nodes,
    edges,
    states,
    availableDays,
    dailyStudyMinutes,
    examType,
  });

  return NextResponse.json(plan);
}
