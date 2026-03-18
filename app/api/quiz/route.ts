import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";

// ---------------------------------------------------------------------------
// GET — Fetch quiz questions for a student
// Query: ?topicId=xxx&count=10  OR  ?subjectId=xxx&count=10
// Returns shuffled questions without correct answers (sent separately after submit)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topicId");
    const subjectId = searchParams.get("subjectId");
    const count = Math.min(Math.max(1, parseInt(searchParams.get("count") || "10")), 50);

    if (!topicId && !subjectId) {
      return NextResponse.json({ error: "topicId veya subjectId gerekli" }, { status: 400 });
    }

    // Find question bank items matching the filter
    const where: any = { questionBank: {} };
    if (topicId) where.questionBank.topicId = topicId;
    else if (subjectId) where.questionBank.subjectId = subjectId;

    const totalCount = await prisma.questionBankItem.count({ where });
    if (totalCount === 0) {
      return NextResponse.json({ questions: [], total: 0 });
    }

    // Random offset for variety
    const skip = totalCount > count ? Math.floor(Math.random() * (totalCount - count)) : 0;

    const items = await prisma.questionBankItem.findMany({
      where,
      select: {
        id: true,
        question: true,
        options: true,
        sortOrder: true,
        questionBank: {
          select: {
            difficulty: true,
            subject: { select: { id: true, name: true } },
            topic: { select: { id: true, name: true } },
          },
        },
      },
      skip,
      take: count,
    });

    // Shuffle
    const shuffled = items.sort(() => Math.random() - 0.5);

    return NextResponse.json({
      questions: shuffled.map((item) => ({
        id: item.id,
        question: item.question,
        options: item.options,
        difficulty: item.questionBank.difficulty,
        subject: item.questionBank.subject,
        topic: item.questionBank.topic,
      })),
      total: totalCount,
    });
  } catch (error) {
    logApiError("quiz GET", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — Submit quiz answers & get results
// Body: { answers: [{ questionId, selectedAnswer }], topicId?, subjectId? }
// Returns scored results + triggers DailyStudy recording
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await request.json();
    const { answers, topicId, subjectId, durationSeconds } = body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: "answers dizisi boş olamaz" }, { status: 400 });
    }

    // Fetch correct answers for all submitted questions
    const questionIds = answers.map((a: any) => a.questionId);
    const items = await prisma.questionBankItem.findMany({
      where: { id: { in: questionIds } },
      select: {
        id: true,
        correctAnswer: true,
        explanation: true,
        question: true,
        options: true,
      },
    });

    const itemMap = new Map(items.map((item) => [item.id, item]));

    // Score each answer
    let correctCount = 0;
    let wrongCount = 0;
    let emptyCount = 0;

    const results = answers.map((a: any) => {
      const item = itemMap.get(a.questionId);
      if (!item) return { questionId: a.questionId, status: "not_found" as const };

      if (a.selectedAnswer === null || a.selectedAnswer === undefined || a.selectedAnswer === -1) {
        emptyCount++;
        return {
          questionId: a.questionId,
          question: item.question,
          options: item.options,
          selectedAnswer: a.selectedAnswer,
          correctAnswer: item.correctAnswer,
          explanation: item.explanation,
          status: "empty" as const,
        };
      }

      const isCorrect = a.selectedAnswer === item.correctAnswer;
      if (isCorrect) correctCount++;
      else wrongCount++;

      return {
        questionId: a.questionId,
        question: item.question,
        options: item.options,
        selectedAnswer: a.selectedAnswer,
        correctAnswer: item.correctAnswer,
        explanation: item.explanation,
        status: isCorrect ? ("correct" as const) : ("wrong" as const),
      };
    });

    // Auto-record as DailyStudy if we have subject info
    const resolvedSubjectId = subjectId || (topicId ? (await prisma.topic.findUnique({ where: { id: topicId }, select: { subjectId: true } }))?.subjectId : null);

    if (resolvedSubjectId) {
      // Fire POST to daily-study internally
      const durationMinutes = durationSeconds ? Math.round(durationSeconds / 60) : null;
      try {
        await prisma.dailyStudy.create({
          data: {
            date: new Date(),
            userId,
            subjectId: resolvedSubjectId,
            topicId: topicId || null,
            questionCount: answers.length,
            correctCount,
            wrongCount,
            emptyCount,
            source: "quiz",
            duration: durationMinutes,
          },
        });
      } catch (err) {
        logApiError("quiz/daily-study-record", err);
      }
    }

    return NextResponse.json({
      results,
      summary: {
        total: answers.length,
        correct: correctCount,
        wrong: wrongCount,
        empty: emptyCount,
        net: correctCount - wrongCount * 0.25,
        successRate: answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0,
      },
    });
  } catch (error) {
    logApiError("quiz POST", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
