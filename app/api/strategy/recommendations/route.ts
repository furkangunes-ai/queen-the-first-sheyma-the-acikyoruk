import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(request.url);
    const examTypeId = searchParams.get("examTypeId");
    const limit = parseInt(searchParams.get("limit") || "20");

    // 1. Get all topics with subject info
    const topics = await prisma.topic.findMany({
      where: examTypeId ? { subject: { examTypeId } } : {},
      include: {
        subject: { include: { examType: true } },
      },
    });

    // 2. Get knowledge levels
    const knowledge = await prisma.topicKnowledge.findMany({
      where: { userId },
    });
    const knowledgeMap = new Map(knowledge.map((k) => [k.topicId, k.level]));

    // 3. Get last studied dates
    const dailyStudies = await prisma.dailyStudy.groupBy({
      by: ["topicId"],
      where: { userId, topicId: { not: null } },
      _max: { date: true },
    });
    const reviews = await prisma.topicReview.groupBy({
      by: ["topicId"],
      where: { userId },
      _max: { date: true },
    });

    const lastStudiedMap = new Map<string, Date>();
    for (const ds of dailyStudies) {
      if (ds.topicId && ds._max.date) lastStudiedMap.set(ds.topicId, ds._max.date);
    }
    for (const r of reviews) {
      const existing = lastStudiedMap.get(r.topicId);
      if (r._max.date && (!existing || r._max.date > existing)) {
        lastStudiedMap.set(r.topicId, r._max.date);
      }
    }

    // 4. Get wrong question counts per topic
    const wrongCounts = await prisma.examWrongQuestion.groupBy({
      by: ["topicId"],
      where: { topicId: { not: null }, exam: { userId } },
      _count: true,
    });
    const wrongMap = new Map(wrongCounts.map((w) => [w.topicId!, w._count]));

    // 5. Calculate total questions across subjects for weight normalization
    const subjectWeights = new Map<string, number>();
    const totalQuestions = topics.reduce((sum, t) => {
      if (!subjectWeights.has(t.subjectId)) {
        subjectWeights.set(t.subjectId, t.subject.questionCount);
        return sum + t.subject.questionCount;
      }
      return sum;
    }, 0);

    // 6. Calculate priority scores
    const now = new Date();
    const scored = topics.map((topic) => {
      const knowledgeLevel = knowledgeMap.get(topic.id) ?? 0;
      const lastStudied = lastStudiedMap.get(topic.id);
      const daysSince = lastStudied
        ? Math.floor((now.getTime() - lastStudied.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      const wrongCount = wrongMap.get(topic.id) ?? 0;
      const subjectWeight = (topic.subject.questionCount / Math.max(totalQuestions, 1));

      // Priority formula:
      // Higher priority = lower knowledge, more days since study, more wrong answers, higher exam weight
      const knowledgeGap = 5 - knowledgeLevel; // 0-5, higher = less knowledge
      const timeFactor = daysSince !== null ? Math.log(daysSince + 2) : 3; // never studied = high
      const wrongFactor = Math.log(wrongCount + 1); // more wrongs = higher priority
      const priorityScore =
        subjectWeight * knowledgeGap * timeFactor + wrongFactor * 0.5;

      return {
        topicId: topic.id,
        topicName: topic.name,
        subjectId: topic.subjectId,
        subjectName: topic.subject.name,
        examTypeName: topic.subject.examType.name,
        knowledgeLevel,
        daysSinceLastStudy: daysSince,
        wrongCount,
        priorityScore: Math.round(priorityScore * 100) / 100,
      };
    });

    // 7. Sort by priority (descending) and return top N
    scored.sort((a, b) => b.priorityScore - a.priorityScore);

    return NextResponse.json(scored.slice(0, limit));
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
