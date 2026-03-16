import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";

// ---------------------------------------------------------------------------
// GET — DAG Coverage: per-subject, per-topic ConceptNode test coverage
//
// Returns which ConceptNodes have UserCognitiveState data vs untested.
// This powers the Fog of War overlay on the cognitive heatmap.
//
// Query params:
//   examTypeId?: string — filter by exam type
//
// Response: {
//   subjects: [{ subjectId, subjectName, totalNodes, testedNodes, untestedNodes,
//     topics: [{ topicId, topicName, totalNodes, testedNodes, untestedNodes,
//       untestedNodeNames: string[] }]
//   }],
//   meta: { totalNodes, testedNodes, untestedNodes, coverageScore }
// }
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatasi" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(request.url);
    const examTypeId = searchParams.get("examTypeId");

    // Fetch all ConceptNodes with their parentTopic → subject chain
    const nodeWhere: any = { parentTopicId: { not: null } };
    if (examTypeId && examTypeId !== "all") {
      nodeWhere.parentTopic = { subject: { examTypeId } };
    }

    const nodes = await prisma.conceptNode.findMany({
      where: nodeWhere,
      select: {
        id: true,
        name: true,
        parentTopicId: true,
        parentTopic: {
          select: {
            id: true,
            name: true,
            subjectId: true,
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Fetch user's tested node IDs
    const nodeIds = nodes.map(n => n.id);
    const testedStates = await prisma.userCognitiveState.findMany({
      where: { userId, nodeId: { in: nodeIds } },
      select: { nodeId: true },
    });
    const testedSet = new Set(testedStates.map(s => s.nodeId));

    // Build per-topic, per-subject coverage
    const topicMap = new Map<string, {
      topicId: string;
      topicName: string;
      subjectId: string;
      subjectName: string;
      totalNodes: number;
      testedNodes: number;
      untestedNodes: number;
      untestedNodeNames: string[];
    }>();

    for (const node of nodes) {
      if (!node.parentTopic) continue;
      const topic = node.parentTopic;
      const key = topic.id;

      if (!topicMap.has(key)) {
        topicMap.set(key, {
          topicId: topic.id,
          topicName: topic.name,
          subjectId: topic.subject.id,
          subjectName: topic.subject.name,
          totalNodes: 0,
          testedNodes: 0,
          untestedNodes: 0,
          untestedNodeNames: [],
        });
      }

      const entry = topicMap.get(key)!;
      entry.totalNodes++;
      if (testedSet.has(node.id)) {
        entry.testedNodes++;
      } else {
        entry.untestedNodes++;
        entry.untestedNodeNames.push(node.name);
      }
    }

    // Group by subject
    const subjectMap = new Map<string, {
      subjectId: string;
      subjectName: string;
      totalNodes: number;
      testedNodes: number;
      untestedNodes: number;
      topics: typeof topicMap extends Map<string, infer V> ? V[] : never;
    }>();

    for (const topic of topicMap.values()) {
      if (!subjectMap.has(topic.subjectId)) {
        subjectMap.set(topic.subjectId, {
          subjectId: topic.subjectId,
          subjectName: topic.subjectName,
          totalNodes: 0,
          testedNodes: 0,
          untestedNodes: 0,
          topics: [],
        });
      }
      const subject = subjectMap.get(topic.subjectId)!;
      subject.totalNodes += topic.totalNodes;
      subject.testedNodes += topic.testedNodes;
      subject.untestedNodes += topic.untestedNodes;
      subject.topics.push(topic);
    }

    const subjects = Array.from(subjectMap.values());
    const totalNodes = subjects.reduce((s, sub) => s + sub.totalNodes, 0);
    const testedNodes = subjects.reduce((s, sub) => s + sub.testedNodes, 0);
    const untestedNodes = totalNodes - testedNodes;

    const response = NextResponse.json({
      subjects,
      meta: {
        totalNodes,
        testedNodes,
        untestedNodes,
        coverageScore: totalNodes > 0 ? testedNodes / totalNodes : 0,
      },
    });
    // 60s cache — DAG coverage değişimi yavaş, her request'te DB'ye gitmeye gerek yok
    response.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=120');
    return response;
  } catch (error) {
    logApiError("analytics/dag-coverage", error);
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 });
  }
}
