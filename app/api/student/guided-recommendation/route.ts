import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";
import {
  calculateTopicROI,
  calculateKnowledgeModifier,
  type TopicInput,
  type BeliefInput,
  type DAGContext,
  type StudyGoal,
} from "@/lib/roi-engine";
import { betaMean, evidenceCount as getEvidenceCount, detectInconsistency } from "@/lib/bayesian-engine";
import type { CognitiveStateData } from "@/lib/cognitive-engine/types";

/**
 * GET /api/student/guided-recommendation
 *
 * Öğrencinin tercihlerine göre filtrelenmiş + açıklamalı öneri sistemi.
 *
 * Query params:
 *   examType: 'tyt' | 'ayt' | 'both'
 *   subjects: 'subjectId1,subjectId2,...'
 *   duration: totalMinutes (number)
 *   recentSubjects: 'subjectId1,...' (opsiyonel — son günlerde çalışılan dersler)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;

    const params = request.nextUrl.searchParams;
    const selectedSubjectIds = (params.get("subjects") || "").split(",").filter(Boolean);
    const totalDuration = parseInt(params.get("duration") || "120") || 120;
    const recentSubjectIds = (params.get("recentSubjects") || "").split(",").filter(Boolean);
    const studyGoal = (params.get("studyGoal") || "auto") as StudyGoal;

    if (selectedSubjectIds.length === 0) {
      return NextResponse.json({
        recommendations: [],
        summary: null,
      });
    }

    // Batch query — tüm veriler tek seferde
    const [
      topics,
      beliefs,
      topicKnowledgeList,
      conceptNodes,
      edges,
      cognitiveStates,
      spacedRepItems,
      recentExamResults,
      recentVoids,
    ] = await Promise.all([
      // Seçilen derslerin konuları
      prisma.topic.findMany({
        where: { subjectId: { in: selectedSubjectIds } },
        include: {
          subject: { include: { examType: true } },
        },
      }),
      // Bayesian belief'ler
      prisma.topicBelief.findMany({ where: { userId } }),
      // Müfredat bilgi seviyeleri
      prisma.topicKnowledge.findMany({ where: { userId }, select: { topicId: true, level: true } }),
      // ConceptNode'lar
      prisma.conceptNode.findMany({
        select: { id: true, parentTopicId: true },
      }),
      // DAG kenarları
      prisma.dependencyEdge.findMany({
        select: { parentNodeId: true, childNodeId: true, dependencyWeight: true },
      }),
      // Cognitive state'ler
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
      // Spaced rep bekleyen
      prisma.spacedRepetitionItem.findMany({
        where: {
          userId,
          status: "pending",
          nextReviewDate: { lte: new Date() },
        },
        select: { topicId: true },
      }),
      // Son 5 denemeden ders sonuçları (insight için)
      prisma.examSubjectResult.findMany({
        where: {
          exam: { userId },
          subjectId: { in: selectedSubjectIds },
        },
        include: {
          subject: { select: { name: true } },
          exam: { select: { createdAt: true } },
        },
        orderBy: { exam: { createdAt: "desc" } },
        take: 100, // son denemelerden yeterli veri
      }),
      // Son voidlar (konu bazında hata verisi)
      prisma.cognitiveVoid.findMany({
        where: {
          exam: { userId },
          subjectId: { in: selectedSubjectIds },
          topicId: { not: null },
        },
        include: {
          topic: { select: { id: true, name: true } },
          subject: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
    ]);

    // Subject soru sayısı toplamı (normalizasyon)
    const subjectsSeen = new Set<string>();
    let totalQuestions = 0;
    for (const t of topics) {
      if (!subjectsSeen.has(t.subjectId)) {
        subjectsSeen.add(t.subjectId);
        totalQuestions += t.subject.questionCount;
      }
    }

    // Map'ler
    const beliefMap = new Map<string, BeliefInput>(
      beliefs.map((b) => [b.topicId, { alpha: b.alpha, beta: b.beta }])
    );

    const knowledgeMap = new Map<string, number>(
      topicKnowledgeList.map((k) => [k.topicId, k.level])
    );

    const topicNodeMap = new Map<string, string[]>();
    for (const node of conceptNodes) {
      if (node.parentTopicId) {
        const existing = topicNodeMap.get(node.parentTopicId) ?? [];
        existing.push(node.id);
        topicNodeMap.set(node.parentTopicId, existing);
      }
    }

    const stateMap = new Map<string, CognitiveStateData>(
      cognitiveStates.map((s) => [s.nodeId, s])
    );

    const childCountMap = new Map<string, number>();
    for (const edge of edges) {
      childCountMap.set(edge.parentNodeId, (childCountMap.get(edge.parentNodeId) ?? 0) + 1);
    }

    const spacedRepTopicSet = new Set(
      spacedRepItems.filter((s) => s.topicId).map((s) => s.topicId!)
    );

    // ==================== Insight verisi hazırla ====================

    // Konu bazında hata istatistikleri
    const topicErrorStats = new Map<string, { wrongCount: number; emptyCount: number; totalVoids: number }>();
    for (const v of recentVoids) {
      if (!v.topicId) continue;
      const existing = topicErrorStats.get(v.topicId) || { wrongCount: 0, emptyCount: 0, totalVoids: 0 };
      if (v.source === "WRONG") existing.wrongCount += v.magnitude;
      else existing.emptyCount += v.magnitude;
      existing.totalVoids += v.magnitude;
      topicErrorStats.set(v.topicId, existing);
    }

    // Ders bazında deneme ortalamaları (son 5 deneme)
    const subjectExamStats = new Map<string, { exams: number; avgWrong: number; avgEmpty: number; avgCorrectRate: number }>();
    const subjectExamGroups = new Map<string, { wrongCount: number; emptyCount: number; correctCount: number; total: number }[]>();
    for (const result of recentExamResults) {
      const group = subjectExamGroups.get(result.subjectId) || [];
      const total = result.correctCount + result.wrongCount + result.emptyCount;
      group.push({
        wrongCount: result.wrongCount,
        emptyCount: result.emptyCount,
        correctCount: result.correctCount,
        total,
      });
      subjectExamGroups.set(result.subjectId, group);
    }
    for (const [subjectId, exams] of subjectExamGroups) {
      const last5 = exams.slice(0, 5);
      const avgWrong = last5.reduce((s, e) => s + e.wrongCount, 0) / last5.length;
      const avgEmpty = last5.reduce((s, e) => s + e.emptyCount, 0) / last5.length;
      const avgTotal = last5.reduce((s, e) => s + e.total, 0) / last5.length;
      const avgCorrect = last5.reduce((s, e) => s + e.correctCount, 0) / last5.length;
      subjectExamStats.set(subjectId, {
        exams: last5.length,
        avgWrong: Math.round(avgWrong * 10) / 10,
        avgEmpty: Math.round(avgEmpty * 10) / 10,
        avgCorrectRate: avgTotal > 0 ? Math.round((avgCorrect / avgTotal) * 100) : 0,
      });
    }

    // Son çalışılan dersler penaltisi (çeşitlilik)
    const recentSubjectSet = new Set(recentSubjectIds);

    // ==================== ROI hesapla (filtrelenmiş) ====================

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

      const nodeIds = topicNodeMap.get(topic.id) ?? [];
      let totalChildCount = 0;
      let maxCeilingPenalty = 0;

      for (const nodeId of nodeIds) {
        totalChildCount += childCountMap.get(nodeId) ?? 0;
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

      let worstState: CognitiveStateData | null = null;
      for (const nodeId of nodeIds) {
        const state = stateMap.get(nodeId);
        if (state && (!worstState || state.strength < worstState.strength)) {
          worstState = state;
        }
      }

      // Knowledge modifier: müfredat bilgi seviyesi + studyGoal entegrasyonu
      const topicKnowledgeLevel = knowledgeMap.get(topic.id) ?? null;
      const bMean = betaMean(belief.alpha, belief.beta);
      const bEvidence = getEvidenceCount(belief.alpha, belief.beta);
      const knowledgeMod = calculateKnowledgeModifier(topicKnowledgeLevel, bMean, bEvidence, studyGoal);

      const roi = calculateTopicROI(
        topicInput,
        belief,
        dagContext,
        worstState,
        spacedRepTopicSet.has(topic.id),
        totalQuestions,
        knowledgeMod
      );

      // Son çalışılan derslere penalti uygula (çeşitlilik)
      let adjustedROI = roi.roi;
      if (recentSubjectSet.has(topic.subjectId)) {
        adjustedROI *= 0.7; // %30 penalti
      }

      return { ...roi, roi: adjustedROI, subjectId: topic.subjectId };
    });

    // ROI > 0 filtre + sırala
    const activeROIs = roiList
      .filter((r) => r.roi > 0.001)
      .sort((a, b) => b.roi - a.roi);

    // Süreye göre konu sayısı belirle
    const topicsToRecommend = Math.min(
      Math.max(1, Math.ceil(totalDuration / 40)),
      activeROIs.length,
      6
    );

    // Çeşitlilik: aynı dersten max 2 konu
    const selected: typeof activeROIs = [];
    const subjectCounts = new Map<string, number>();
    for (const item of activeROIs) {
      const count = subjectCounts.get(item.subjectName) ?? 0;
      if (count < 2) {
        selected.push(item);
        subjectCounts.set(item.subjectName, count + 1);
      }
      if (selected.length >= topicsToRecommend) break;
    }

    // Süre dağılımı (ROI ağırlığına göre)
    const totalROI = selected.reduce((s, r) => s + r.roi, 0);
    const recommendations = selected.map((r) => {
      const share = totalROI > 0 ? r.roi / totalROI : 1 / selected.length;
      const suggestedDuration = Math.max(15, Math.round(totalDuration * share / 5) * 5); // 5dk yuvarlama

      // Insight oluştur (tutarsızlık tespiti dahil)
      const errorStats = topicErrorStats.get(r.topicId);
      const subjectStats = subjectExamStats.get(r.subjectId);
      const topicKnowledgeLevel = knowledgeMap.get(r.topicId) ?? null;

      // Tutarsızlık kontrolü: öğrenci 4/5 demiş ama veriler 2/5 gösteriyorsa
      let inconsistencyInsight: string | null = null;
      if (topicKnowledgeLevel !== null) {
        const inc = detectInconsistency(topicKnowledgeLevel, r.belief.alpha, r.belief.beta, r.topicName);
        if (inc.isInconsistent) {
          inconsistencyInsight = inc.message;
        }
      }

      const { insight, insightType } = inconsistencyInsight
        ? { insight: inconsistencyInsight, insightType: 'inconsistency' }
        : generateInsight(r, errorStats, subjectStats);

      return {
        topicId: r.topicId,
        topicName: r.topicName,
        subjectId: r.subjectId,
        subjectName: r.subjectName,
        examTypeName: r.examTypeName,
        actionType: r.actionType,
        actionLabel: r.actionLabel,
        suggestedDuration,
        belief: r.belief,
        insight,
        insightType,
        roi: r.roi,
      };
    });

    // Summary
    const subjectBreakdown = new Map<string, { minutes: number; topicCount: number }>();
    for (const rec of recommendations) {
      const existing = subjectBreakdown.get(rec.subjectName) || { minutes: 0, topicCount: 0 };
      existing.minutes += rec.suggestedDuration;
      existing.topicCount += 1;
      subjectBreakdown.set(rec.subjectName, existing);
    }

    // Net artış tahmini (basit heuristik)
    const estimatedNetGain = estimateNetGain(recommendations);

    return NextResponse.json({
      recommendations,
      summary: {
        totalDuration: recommendations.reduce((s, r) => s + r.suggestedDuration, 0),
        estimatedNetGain,
        subjectBreakdown: Array.from(subjectBreakdown.entries()).map(([name, data]) => ({
          subjectName: name,
          minutes: data.minutes,
          topicCount: data.topicCount,
        })),
      },
    });
  } catch (error) {
    logApiError("student/guided-recommendation", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// ==================== Insight oluşturucu ====================

function generateInsight(
  topic: { topicName: string; subjectName: string; reason: string; belief: { mean: number; evidenceCount: number; category: string } },
  errorStats: { wrongCount: number; emptyCount: number; totalVoids: number } | undefined,
  subjectStats: { exams: number; avgWrong: number; avgEmpty: number; avgCorrectRate: number } | undefined
): { insight: string; insightType: string } {
  // En çok hata yapılan konu
  if (errorStats && errorStats.wrongCount >= 3) {
    return {
      insight: `Bu konuda ${errorStats.wrongCount} yanlış kaydedildi. Denemelerden elde edilen veriye göre en çok hata yaptığın konulardan biri.`,
      insightType: "most_errors",
    };
  }

  // Boş bırakma
  if (errorStats && errorStats.emptyCount >= 2) {
    return {
      insight: `Bu konuda ${errorStats.emptyCount} boş bırakma var. Boşları azaltmak net artışının en hızlı yolu.`,
      insightType: "most_blanks",
    };
  }

  // Ders bazında düşük doğru oranı
  if (subjectStats && subjectStats.avgCorrectRate < 50) {
    return {
      insight: `${topic.subjectName} dersinde son ${subjectStats.exams} denemede ortalama %${subjectStats.avgCorrectRate} doğru oranın var. Bu konu çalışılırsa net artışı yüksek.`,
      insightType: "best_net_gain",
    };
  }

  // Retention düşüşü
  if (topic.reason === "retention_critical") {
    return {
      insight: `Bu konuyu son çalışmandan bu yana zaman geçti. Unutma eşiğine yaklaşıyorsun — tekrar şart.`,
      insightType: "retention_drop",
    };
  }

  // DAG darboğazı
  if (topic.reason === "dag_bottleneck") {
    return {
      insight: `Bu konu birçok ileri konunun temelini oluşturuyor. Güçlendirmek bağlı konulardaki performansını da artırır.`,
      insightType: "best_net_gain",
    };
  }

  // Quick win
  if (topic.reason === "quick_win") {
    return {
      insight: `Gelişmekte olan seviyedesin — az bir çabayla güçlü seviyeye çıkabilirsin.`,
      insightType: "quick_win",
    };
  }

  // Keşfedilmemiş
  if (topic.belief.evidenceCount < 3) {
    return {
      insight: `Bu konuda henüz yeterli veri yok. Kısa bir keşif çalışması seviyeni belirlemene yardımcı olur.`,
      insightType: "new_topic",
    };
  }

  // Genel
  if (subjectStats) {
    return {
      insight: `${topic.subjectName} dersinde son ${subjectStats.exams} denemede ort. ${subjectStats.avgWrong} yanlış, ${subjectStats.avgEmpty} boş. Bu konuya odaklanmak genel performansı artırır.`,
      insightType: "best_net_gain",
    };
  }

  return {
    insight: `Sınav ağırlığı ve mevcut seviyene göre en verimli konulardan biri.`,
    insightType: "default",
  };
}

// ==================== Net artış tahmini ====================

function estimateNetGain(
  recommendations: { belief: { mean: number }; subjectName: string; suggestedDuration: number }[]
): string {
  // Basit heuristik: her 30dk çalışma = 0.5-1.5 net artış potansiyeli (mastery'ye bağlı)
  let totalGain = 0;
  for (const rec of recommendations) {
    const sessions = rec.suggestedDuration / 30;
    // Düşük mastery = yüksek kazanım potansiyeli
    const gainPerSession = rec.belief.mean < 0.3 ? 1.2 : rec.belief.mean < 0.6 ? 0.8 : 0.4;
    totalGain += sessions * gainPerSession;
  }
  const rounded = Math.round(totalGain * 10) / 10;
  if (rounded <= 0) return "";
  return `Bu planla tahmini +${rounded} net artışı sağlayabilirsin`;
}
