import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { findWeakestRoot, findAllWeakRoots } from "@/lib/cognitive-engine";
import type { ConceptNodeData, DependencyEdgeData, CognitiveStateData } from "@/lib/cognitive-engine";

// POST /api/cognitive/root-cause — Bir kavramın kök neden analizi
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await req.json();
  const { nodeId, findAll = false } = body;

  if (!nodeId) {
    return NextResponse.json(
      { error: "nodeId zorunludur" },
      { status: 400 }
    );
  }

  const userId = session.user.id!;

  // İlgili domain'deki tüm node'ları çek
  const targetNode = await prisma.conceptNode.findUnique({
    where: { id: nodeId },
    select: { domain: true },
  });

  if (!targetNode) {
    return NextResponse.json({ error: "Düğüm bulunamadı" }, { status: 404 });
  }

  const rawNodes = await prisma.conceptNode.findMany({
    where: { domain: targetNode.domain },
    select: {
      id: true,
      name: true,
      domain: true,
      examType: true,
      complexityScore: true,
    },
  });

  const nodeIds = rawNodes.map((n) => n.id);

  const rawEdges = await prisma.dependencyEdge.findMany({
    where: {
      OR: [
        { parentNodeId: { in: nodeIds } },
        { childNodeId: { in: nodeIds } },
      ],
    },
    select: {
      parentNodeId: true,
      childNodeId: true,
      dependencyWeight: true,
    },
  });

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

  if (findAll) {
    const results = findAllWeakRoots(nodeId, nodes, edges, states);
    return NextResponse.json({ results });
  }

  const result = findWeakestRoot(nodeId, nodes, edges, states);
  return NextResponse.json({ result });
}
