import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getTurkeyDateString } from "@/lib/utils";

/**
 * GET /api/analytics/topic-progress
 *
 * Konu bazlı çalışma geçmişi & değişim takibi.
 * Her konu için:
 * - Toplam çalışma oturumu, soru, doğru, yanlış, boş
 * - Yanlış oranı trendi (iyileşiyor / stabil / kötüleşiyor)
 * - Çalışma geçmişi (tarih bazlı soru çözme verileri)
 * - Deneme yanlışları
 * - Konu tekrar sayısı
 * - Bilgi seviyesi (TopicKnowledge)
 *
 * Query params:
 * - examTypeId: opsiyonel, belirli sınav tipi filtresi
 * - subjectId: opsiyonel, belirli ders filtresi
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;

    const { searchParams } = new URL(request.url);
    const examTypeId = searchParams.get("examTypeId");
    const subjectId = searchParams.get("subjectId");

    // Build subject filter
    const subjectFilter: any = {};
    if (subjectId) {
      subjectFilter.subjectId = subjectId;
    }
    if (examTypeId) {
      subjectFilter.subject = { examTypeId };
    }

    // Fetch all data in parallel
    const [dailyStudies, topicReviews, examWrongs, topicKnowledges] =
      await Promise.all([
        // All daily study records with topic (last 90 days)
        prisma.dailyStudy.findMany({
          where: {
            userId,
            topicId: { not: null },
            date: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            },
            ...subjectFilter,
          },
          include: {
            subject: { include: { examType: true } },
            topic: true,
          },
          orderBy: { date: "asc" },
        }),

        // Topic reviews
        prisma.topicReview.findMany({
          where: {
            userId,
            date: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            },
            ...subjectFilter,
          },
          include: {
            subject: { include: { examType: true } },
            topic: true,
          },
          orderBy: { date: "asc" },
        }),

        // Exam wrong questions (all time)
        prisma.examWrongQuestion.findMany({
          where: {
            exam: {
              userId,
              ...(examTypeId && { examTypeId }),
            },
            topicId: { not: null },
            ...(subjectId && { subjectId }),
          },
          include: {
            subject: { include: { examType: true } },
            topic: true,
            exam: { select: { date: true, title: true } },
          },
          orderBy: { exam: { date: "asc" } },
        }),

        // Topic knowledge levels
        prisma.topicKnowledge.findMany({
          where: {
            userId,
            topic: {
              subject: {
                ...(examTypeId && { examTypeId }),
                ...(subjectId && { id: subjectId }),
              },
            },
          },
          include: {
            topic: { include: { subject: { include: { examType: true } } } },
          },
        }),
      ]);

    // Build per-topic aggregation
    interface TopicStudyDay {
      date: string;
      questionCount: number;
      correctCount: number;
      wrongCount: number;
      emptyCount: number;
      wrongRate: number;
      duration: number;
    }

    interface TopicExamWrong {
      date: string;
      examTitle: string;
      count: number;
    }

    interface TopicProgressData {
      topicId: string;
      topicName: string;
      subjectId: string;
      subjectName: string;
      examTypeName: string;
      // Study stats
      totalStudySessions: number;
      totalQuestions: number;
      totalCorrect: number;
      totalWrong: number;
      totalEmpty: number;
      totalDuration: number;
      wrongRate: number;
      lastStudied: string | null;
      // Review stats
      totalReviews: number;
      lastReview: string | null;
      // Exam wrong stats
      totalExamWrongs: number;
      // Knowledge level
      knowledgeLevel: number | null;
      // Trend
      trend: "improving" | "stable" | "declining" | "insufficient";
      trendDetail: string;
      // History for charting
      studyHistory: TopicStudyDay[];
      examWrongHistory: TopicExamWrong[];
    }

    const topicMap = new Map<string, TopicProgressData>();

    // Helper to get or create topic entry
    function getOrCreate(
      topicId: string,
      topicName: string,
      subjectId: string,
      subjectName: string,
      examTypeName: string
    ): TopicProgressData {
      let entry = topicMap.get(topicId);
      if (!entry) {
        entry = {
          topicId,
          topicName,
          subjectId,
          subjectName,
          examTypeName,
          totalStudySessions: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          totalWrong: 0,
          totalEmpty: 0,
          totalDuration: 0,
          wrongRate: 0,
          lastStudied: null,
          totalReviews: 0,
          lastReview: null,
          totalExamWrongs: 0,
          knowledgeLevel: null,
          trend: "insufficient",
          trendDetail: "",
          studyHistory: [],
          examWrongHistory: [],
        };
        topicMap.set(topicId, entry);
      }
      return entry;
    }

    // Process daily studies
    for (const ds of dailyStudies) {
      if (!ds.topicId || !ds.topic) continue;
      const entry = getOrCreate(
        ds.topicId,
        ds.topic.name,
        ds.subjectId,
        ds.subject.name,
        ds.subject.examType.name
      );
      entry.totalStudySessions++;
      entry.totalQuestions += ds.questionCount;
      entry.totalCorrect += ds.correctCount;
      entry.totalWrong += ds.wrongCount;
      entry.totalEmpty += ds.emptyCount;
      entry.totalDuration += ds.duration || 0;

      const dateStr = getTurkeyDateString(new Date(ds.date));
      entry.lastStudied = dateStr;

      // Add to history
      const totalForDay = ds.questionCount || 1;
      entry.studyHistory.push({
        date: dateStr,
        questionCount: ds.questionCount,
        correctCount: ds.correctCount,
        wrongCount: ds.wrongCount,
        emptyCount: ds.emptyCount,
        wrongRate: Math.round((ds.wrongCount / totalForDay) * 100),
        duration: ds.duration || 0,
      });
    }

    // Process topic reviews
    for (const tr of topicReviews) {
      const entry = getOrCreate(
        tr.topicId,
        tr.topic.name,
        tr.subjectId,
        tr.subject.name,
        tr.subject.examType.name
      );
      entry.totalReviews++;
      const dateStr = getTurkeyDateString(new Date(tr.date));
      entry.lastReview = dateStr;
    }

    // Process exam wrongs (group by exam for timeline)
    const examWrongsByTopicAndExam = new Map<string, Map<string, { date: string; examTitle: string; count: number }>>();
    for (const ew of examWrongs) {
      if (!ew.topicId || !ew.topic) continue;
      const entry = getOrCreate(
        ew.topicId,
        ew.topic.name,
        ew.subjectId,
        ew.subject.name,
        ew.subject.examType.name
      );
      entry.totalExamWrongs++;

      // Group by exam for chart
      const examKey = ew.examId;
      if (!examWrongsByTopicAndExam.has(ew.topicId)) {
        examWrongsByTopicAndExam.set(ew.topicId, new Map());
      }
      const examMap = examWrongsByTopicAndExam.get(ew.topicId)!;
      if (!examMap.has(examKey)) {
        examMap.set(examKey, {
          date: getTurkeyDateString(new Date(ew.exam.date)),
          examTitle: ew.exam.title || "Deneme",
          count: 0,
        });
      }
      examMap.get(examKey)!.count++;
    }

    // Assign exam wrong history
    for (const [topicId, examMap] of examWrongsByTopicAndExam) {
      const entry = topicMap.get(topicId);
      if (entry) {
        entry.examWrongHistory = Array.from(examMap.values()).sort(
          (a, b) => a.date.localeCompare(b.date)
        );
      }
    }

    // Process topic knowledge
    for (const tk of topicKnowledges) {
      const entry = topicMap.get(tk.topicId);
      if (entry) {
        entry.knowledgeLevel = tk.level;
      } else {
        // Topic exists in knowledge but no study data yet
        const newEntry = getOrCreate(
          tk.topicId,
          tk.topic.name,
          tk.topic.subject.id,
          tk.topic.subject.name,
          tk.topic.subject.examType.name
        );
        newEntry.knowledgeLevel = tk.level;
      }
    }

    // Calculate wrong rates and trends
    for (const entry of topicMap.values()) {
      // Overall wrong rate
      if (entry.totalQuestions > 0) {
        entry.wrongRate = Math.round(
          (entry.totalWrong / entry.totalQuestions) * 100
        );
      }

      // Trend calculation: compare first half vs second half wrong rate
      const history = entry.studyHistory;
      if (history.length < 3) {
        entry.trend = "insufficient";
        entry.trendDetail = "Trend hesaplamak için en az 3 çalışma gerekli";
        continue;
      }

      const midpoint = Math.floor(history.length / 2);
      const firstHalf = history.slice(0, midpoint);
      const secondHalf = history.slice(midpoint);

      const firstHalfTotal = firstHalf.reduce((s, h) => s + h.questionCount, 0);
      const firstHalfWrong = firstHalf.reduce((s, h) => s + h.wrongCount, 0);
      const secondHalfTotal = secondHalf.reduce((s, h) => s + h.questionCount, 0);
      const secondHalfWrong = secondHalf.reduce((s, h) => s + h.wrongCount, 0);

      const firstRate =
        firstHalfTotal > 0 ? (firstHalfWrong / firstHalfTotal) * 100 : 0;
      const secondRate =
        secondHalfTotal > 0 ? (secondHalfWrong / secondHalfTotal) * 100 : 0;

      const diff = secondRate - firstRate;

      if (diff < -5) {
        entry.trend = "improving";
        entry.trendDetail = `Yanlış oranı %${Math.abs(Math.round(diff))} azaldı`;
      } else if (diff > 5) {
        entry.trend = "declining";
        entry.trendDetail = `Yanlış oranı %${Math.round(diff)} arttı — çalışma yöntemi gözden geçirilmeli`;
      } else {
        entry.trend = "stable";
        entry.trendDetail = `Yanlış oranı sabit (±%5 aralığında)`;
      }
    }

    // Convert to sorted array
    const result = Array.from(topicMap.values())
      .filter((t) => t.totalStudySessions > 0 || t.totalExamWrongs > 0 || t.totalReviews > 0)
      .sort((a, b) => {
        // Sort by: declining first, then by total sessions desc
        const trendOrder = { declining: 0, stable: 1, improving: 2, insufficient: 3 };
        const trendDiff = trendOrder[a.trend] - trendOrder[b.trend];
        if (trendDiff !== 0) return trendDiff;
        return b.totalStudySessions - a.totalStudySessions;
      });

    // Summary stats
    const summary = {
      totalTopics: result.length,
      improvingCount: result.filter((t) => t.trend === "improving").length,
      decliningCount: result.filter((t) => t.trend === "declining").length,
      stableCount: result.filter((t) => t.trend === "stable").length,
      insufficientCount: result.filter((t) => t.trend === "insufficient").length,
    };

    return NextResponse.json({ summary, topics: result });
  } catch (error) {
    console.error("Error fetching topic progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
