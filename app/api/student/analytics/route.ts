import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";
import {
  detectTrends,
  findRootCauses,
  findStaleBeliefs,
  analyzeErrorProfile,
  predictNet,
  type ExamErrorSnapshot,
  type DAGNode,
  type DAGEdge,
  type NodeMastery,
  type SubjectInfo,
  type TopicBeliefForPrediction,
} from "@/lib/analytics-engine";

/**
 * GET /api/student/analytics
 *
 * Tüm analitik modülleri tek endpoint'ten döndürür:
 * 1. trends: Deneme-arası konu trendleri
 * 2. rootCauses: DAG kök neden kümeleri
 * 3. staleBeliefs: Zamanla bayatlayan konular
 * 4. errorProfile: Öğrenci hata profili
 * 5. netPredictions: Tahmini sınav netleri
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;

    // Kullanıcı profili (examTrack)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { examTrack: true },
    });
    const examTrack = user?.examTrack;

    // Batch query — tüm veriler tek seferde
    const [
      voids,
      beliefs,
      conceptNodes,
      edges,
      cognitiveStates,
      subjects,
      topics,
      examResults,
    ] = await Promise.all([
      // Son tüm void'lar (hata verileri)
      prisma.cognitiveVoid.findMany({
        where: { exam: { userId } },
        include: {
          topic: { select: { id: true, name: true } },
          subject: { select: { id: true, name: true } },
          exam: { select: { id: true, date: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      // Tüm belief'ler
      prisma.topicBelief.findMany({
        where: { userId },
        include: { topic: { select: { name: true, subjectId: true } } },
      }),
      // DAG node'ları
      prisma.conceptNode.findMany({
        select: {
          id: true,
          name: true,
          parentTopicId: true,
          parentTopic: { select: { name: true } },
        },
      }),
      // DAG edge'leri
      prisma.dependencyEdge.findMany({
        select: { parentNodeId: true, childNodeId: true, dependencyWeight: true },
      }),
      // Cognitive state'ler
      prisma.userCognitiveState.findMany({
        where: { userId },
        select: { nodeId: true, masteryLevel: true },
      }),
      // Dersler
      prisma.subject.findMany({
        include: {
          examType: { select: { name: true, slug: true } },
          _count: { select: { topics: true } },
        },
      }),
      // Topic'ler (subject bilgisi için)
      prisma.topic.findMany({
        select: {
          id: true,
          subjectId: true,
          subject: { select: { examType: { select: { slug: true, name: true } }, name: true } },
        },
      }),
      // Ders bazında deneme sonuçları (trend için)
      prisma.examSubjectResult.findMany({
        where: { exam: { userId } },
        include: {
          subject: { select: { id: true, name: true } },
          exam: { select: { id: true, date: true } },
        },
        orderBy: { exam: { date: "asc" } },
      }),
    ]);

    // ==================== 1. Trend Algılama ====================
    // Her konu için deneme bazında hata snapshot'ları
    const snapshots: ExamErrorSnapshot[] = [];
    for (const v of voids) {
      if (!v.topicId || !v.topic) continue;
      snapshots.push({
        examId: v.exam.id,
        examDate: v.exam.date,
        topicId: v.topicId,
        topicName: v.topic.name,
        subjectName: v.subject.name,
        wrongCount: v.source === "WRONG" ? v.magnitude : 0,
        emptyCount: v.source === "EMPTY" ? v.magnitude : 0,
      });
    }
    // Aynı exam+topic için birleştir
    const snapshotMap = new Map<string, ExamErrorSnapshot>();
    for (const s of snapshots) {
      const key = `${s.examId}_${s.topicId}`;
      const existing = snapshotMap.get(key);
      if (existing) {
        existing.wrongCount += s.wrongCount;
        existing.emptyCount += s.emptyCount;
      } else {
        snapshotMap.set(key, { ...s });
      }
    }
    const trends = detectTrends(Array.from(snapshotMap.values()));

    // ==================== 2. Kök Neden Tespiti ====================
    const dagNodes: DAGNode[] = conceptNodes.map(n => ({
      id: n.id,
      name: n.name,
      parentTopicId: n.parentTopicId,
      parentTopicName: n.parentTopic?.name ?? null,
    }));
    const dagEdges: DAGEdge[] = edges;
    const masteryStates: NodeMastery[] = cognitiveStates.map(s => ({
      nodeId: s.nodeId,
      masteryLevel: s.masteryLevel,
    }));
    const rootCauses = findRootCauses(dagNodes, dagEdges, masteryStates);

    // ==================== 3. Stale Beliefs ====================
    const beliefData = beliefs.map(b => ({
      topicId: b.topicId,
      alpha: b.alpha,
      beta: b.beta,
      updatedAt: b.updatedAt,
    }));
    const staleBeliefs = findStaleBeliefs(beliefData);
    // Topic isimlerini ekle
    const topicNameMap = new Map(beliefs.map(b => [b.topicId, b.topic.name]));
    const staleBeliefsWithNames = staleBeliefs.map(sb => ({
      ...sb,
      topicName: topicNameMap.get(sb.topicId) ?? 'Bilinmeyen',
    }));

    // ==================== 4. Öğrenci Hata Profili ====================
    const errorReasonCounts = new Map<string, number>();
    for (const v of voids) {
      const key = v.errorReason ?? 'SINIFLANDIRILMAMIS';
      errorReasonCounts.set(key, (errorReasonCounts.get(key) ?? 0) + v.magnitude);
    }
    const errorReasons = Array.from(errorReasonCounts.entries()).map(([reason, count]) => ({
      errorReason: reason === 'SINIFLANDIRILMAMIS' ? null : reason,
      count,
    }));
    const errorProfile = analyzeErrorProfile(errorReasons);

    // ==================== 5. Net Tahmin ====================
    // Exam track filtresi
    const filteredSubjects = subjects.filter(s => {
      if (!examTrack) return true;
      const isAYT = s.examType.slug === "ayt" || s.examType.name === "AYT";
      if (!isAYT) return true;
      const excluded: Record<string, string[]> = {
        sayisal: ["Edebiyat", "Tarih", "Coğrafya"],
        ea: ["Fizik", "Kimya", "Biyoloji"],
        sozel: ["Fizik", "Kimya", "Biyoloji", "Matematik"],
      };
      return !(excluded[examTrack] || []).includes(s.name);
    });

    const subjectInfos: SubjectInfo[] = filteredSubjects.map(s => ({
      id: s.id,
      name: s.name,
      questionCount: s.questionCount,
      examTypeName: s.examType.name,
      topicCount: s._count.topics,
    }));

    const beliefInputs: TopicBeliefForPrediction[] = beliefs.map(b => ({
      topicId: b.topicId,
      subjectId: b.topic.subjectId,
      alpha: b.alpha,
      beta: b.beta,
    }));

    const netPredictions = predictNet(subjectInfos, beliefInputs);

    // ==================== Response ====================
    return NextResponse.json({
      trends: trends.slice(0, 15), // En önemli 15 trend
      rootCauses: rootCauses.slice(0, 10),
      staleBeliefs: staleBeliefsWithNames.slice(0, 10),
      errorProfile,
      netPredictions,
    });
  } catch (error) {
    logApiError("student/analytics", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
