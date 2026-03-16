import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";
import { logNextActionFetch } from "@/lib/telemetry";
import { getTurkeyDateString } from "@/lib/utils";
import {
  calculateTopicROI,
  calculateKnowledgeModifier,
  selectNextAction,
  type TopicInput,
  type BeliefInput,
  type DAGContext,
} from "@/lib/roi-engine";
import { betaMean, evidenceCount as getEvidenceCount } from "@/lib/bayesian-engine";
import type { CognitiveStateData } from "@/lib/cognitive-engine/types";

/**
 * GET /api/student/next-action
 *
 * KnapsackPlanner + Bayesyen belief + Ebbinghaus + DAG ceiling penalty'yi
 * birleştirerek en yüksek ROI'li tek aksiyonu döndürür.
 *
 * Aksiyom 3: Öğrenciye "ne yapması gerektiğini söylemiyor",
 * en verimli aksiyonu doğrudan önüne koyuyor.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;
    const startTime = Date.now();

    // Kullanıcı profili
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        examTrack: true,
        studentProfile: {
          select: { dailyStudyHours: true, availableDays: true },
        },
      },
    });
    const examTrack = user?.examTrack;
    const dailyStudyHours = user?.studentProfile?.dailyStudyHours ?? 3;

    // Batch query — tüm veriler tek seferde
    const [
      allTopics,
      beliefs,
      topicKnowledgeList,
      conceptNodes,
      edges,
      cognitiveStates,
      spacedRepItems,
      todayStudies,
    ] = await Promise.all([
      prisma.topic.findMany({
        include: {
          subject: { include: { examType: true } },
        },
      }),
      prisma.topicBelief.findMany({ where: { userId } }),
      prisma.topicKnowledge.findMany({ where: { userId }, select: { topicId: true, level: true } }),
      prisma.conceptNode.findMany({
        select: { id: true, parentTopicId: true },
      }),
      prisma.dependencyEdge.findMany({
        select: { parentNodeId: true, childNodeId: true, dependencyWeight: true },
      }),
      prisma.userCognitiveState.findMany({
        where: { userId },
        select: {
          nodeId: true,
          masteryLevel: true,
          strength: true,
          successCount: true,
          lastTestedAt: true,
        },
      }),
      prisma.spacedRepetitionItem.findMany({
        where: {
          userId,
          status: "pending",
          nextReviewDate: { lte: new Date() },
        },
        select: { topicId: true },
      }),
      prisma.dailyStudy.findMany({
        where: {
          userId,
          date: {
            gte: new Date(getTurkeyDateString() + "T00:00:00+03:00"),
          },
        },
        select: { duration: true },
      }),
    ]);

    // Exam track filtresi
    const topics = examTrack
      ? allTopics.filter((t) => {
          const isAYT = t.subject.examType.slug === "ayt" || t.subject.examType.name === "AYT";
          if (!isAYT) return true;
          const excluded: Record<string, string[]> = {
            sayisal: ["Edebiyat", "Tarih", "Coğrafya"],
            ea: ["Fizik", "Kimya", "Biyoloji"],
            sozel: ["Fizik", "Kimya", "Biyoloji", "Matematik"],
          };
          return !(excluded[examTrack] || []).includes(t.subject.name);
        })
      : allTopics;

    // Toplam soru sayısı (normalizasyon için)
    const subjectsSeen = new Set<string>();
    let totalQuestions = 0;
    for (const t of topics) {
      if (!subjectsSeen.has(t.subjectId)) {
        subjectsSeen.add(t.subjectId);
        totalQuestions += t.subject.questionCount;
      }
    }

    // Map'ler oluştur
    const beliefMap = new Map<string, BeliefInput>(
      beliefs.map((b) => [b.topicId, { alpha: b.alpha, beta: b.beta }])
    );

    // TopicKnowledge map (müfredat bilgi seviyeleri)
    const knowledgeMap = new Map<string, number>(
      topicKnowledgeList.map((k) => [k.topicId, k.level])
    );

    // Topic → ConceptNode eşlemesi
    const topicNodeMap = new Map<string, string[]>();
    for (const node of conceptNodes) {
      if (node.parentTopicId) {
        const existing = topicNodeMap.get(node.parentTopicId) ?? [];
        existing.push(node.id);
        topicNodeMap.set(node.parentTopicId, existing);
      }
    }

    // CognitiveState map (nodeId → state)
    const stateMap = new Map<string, CognitiveStateData>(
      cognitiveStates.map((s) => [s.nodeId, s])
    );

    // Edge map — her node'un child sayısı ve parent'lardan gelen ağırlık
    const childCountMap = new Map<string, number>();
    const parentEdgeMap = new Map<string, { parentNodeId: string; weight: number }[]>();
    for (const edge of edges) {
      childCountMap.set(edge.parentNodeId, (childCountMap.get(edge.parentNodeId) ?? 0) + 1);
      const existing = parentEdgeMap.get(edge.childNodeId) ?? [];
      existing.push({ parentNodeId: edge.parentNodeId, weight: edge.dependencyWeight });
      parentEdgeMap.set(edge.childNodeId, existing);
    }

    // Spaced rep topic set
    const spacedRepTopicSet = new Set(
      spacedRepItems.filter((s) => s.topicId).map((s) => s.topicId!)
    );

    // Bugün tamamlanan çalışma
    const todayCompletedMinutes = todayStudies.reduce((sum, s) => sum + (s.duration ?? 0), 0);
    const todayCompletedSessions = todayStudies.length;

    // Her topic için ROI hesapla
    const roiList = topics.map((topic) => {
      const topicInput: TopicInput = {
        id: topic.id,
        name: topic.name,
        difficulty: topic.difficulty,
        subjectId: topic.subjectId,
        subjectName: topic.subject.name,
        subjectQuestionCount: topic.subject.questionCount,
        examTypeName: topic.subject.examType.name,
      };

      const belief = beliefMap.get(topic.id) ?? { alpha: 1.0, beta: 1.0 };

      // DAG context: bu topic'e bağlı ConceptNode'ların DAG durumu
      const nodeIds = topicNodeMap.get(topic.id) ?? [];
      let totalChildCount = 0;
      let maxCeilingPenalty = 0;

      for (const nodeId of nodeIds) {
        totalChildCount += childCountMap.get(nodeId) ?? 0;

        // Bu node parent olarak ne kadar ceza veriyor?
        const state = stateMap.get(nodeId);
        const mastery = state?.masteryLevel ?? 0;
        const children = edges.filter((e) => e.parentNodeId === nodeId);
        for (const child of children) {
          const penalty = child.dependencyWeight * (1 - mastery);
          if (penalty > maxCeilingPenalty) maxCeilingPenalty = penalty;
        }
      }

      const dagContext: DAGContext = {
        childCount: totalChildCount,
        ceilingPenalty: maxCeilingPenalty,
      };

      // CognitiveState: ilk bağlı node'un state'ini kullan (en düşük retention)
      let worstState: CognitiveStateData | null = null;
      for (const nodeId of nodeIds) {
        const state = stateMap.get(nodeId);
        if (state && (!worstState || state.strength < worstState.strength)) {
          worstState = state;
        }
      }

      // Knowledge modifier: müfredat bilgi seviyesi + Bayesyen veri entegrasyonu
      const topicKnowledgeLevel = knowledgeMap.get(topic.id) ?? null;
      const bMean = betaMean(belief.alpha, belief.beta);
      const bEvidence = getEvidenceCount(belief.alpha, belief.beta);
      const knowledgeMod = calculateKnowledgeModifier(topicKnowledgeLevel, bMean, bEvidence, 'auto');

      return calculateTopicROI(
        topicInput,
        belief,
        dagContext,
        worstState,
        spacedRepTopicSet.has(topic.id),
        totalQuestions,
        knowledgeMod
      );
    });

    // ROI > 0 olan konuları filtrele (tamamen uzmanlaşılmış konuları çıkar)
    const activeROIs = roiList.filter((r) => r.roi > 0.001);

    if (activeROIs.length === 0) {
      logNextActionFetch(userId, topics.length, null, 0, dailyStudyHours * 60 - todayCompletedMinutes, Date.now() - startTime);
      return NextResponse.json({
        primary: null,
        alternatives: [],
        sessionDuration: 0,
        dailyBudgetRemaining: dailyStudyHours * 60 - todayCompletedMinutes,
        todayCompleted: {
          sessions: todayCompletedSessions,
          totalMinutes: todayCompletedMinutes,
        },
        empty: true,
        emptyReason: "Tüm konularda yeterli veri yok veya zaten uzmanlaştın.",
      });
    }

    const nextAction = selectNextAction(
      activeROIs,
      dailyStudyHours,
      todayCompletedMinutes,
      todayCompletedSessions
    );

    // Kara Kutu: ROI motor sonucunu logla
    logNextActionFetch(
      userId,
      topics.length,
      nextAction.primary?.topicId ?? null,
      nextAction.primary?.roi ?? 0,
      nextAction.dailyBudgetRemaining ?? (dailyStudyHours * 60 - todayCompletedMinutes),
      Date.now() - startTime
    );

    return NextResponse.json(nextAction);
  } catch (error) {
    logApiError("student/next-action", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
