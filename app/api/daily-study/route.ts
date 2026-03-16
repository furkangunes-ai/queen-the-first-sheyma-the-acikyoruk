import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { updateDailyStudyStreak } from "@/lib/streak-engine";
import { recordStudyForTopic } from "@/lib/cognitive-engine";
import { applyElasticProjectionForTopic } from "@/lib/cognitive-engine";
import { updateFromStudySession } from "@/lib/bayesian-engine";
import { logApiError } from "@/lib/logger";
import { logBeliefUpdate, logStudySessionStart } from "@/lib/telemetry";
import { betaMean } from "@/lib/bayesian-engine";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const subjectId = searchParams.get("subjectId");
    const limit = searchParams.get("limit");

    const where: any = { userId };
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lt: new Date(endDate) };
    } else if (date) {
      const d = new Date(date);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = { gte: d, lt: nextDay };
    }
    if (subjectId) where.subjectId = subjectId;

    const studies = await prisma.dailyStudy.findMany({
      where,
      include: {
        subject: { include: { examType: true } },
        topic: true,
      },
      orderBy: { date: "desc" },
      take: limit ? Math.min(Math.max(1, parseInt(limit)), 500) : 500,
    });

    return NextResponse.json(studies);
  } catch (error) {
    logApiError("daily-study", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await request.json();
    const {
      date, subjectId, topicId, questionCount, correctCount, wrongCount,
      emptyCount, difficulty, source, duration, notes,
    } = body;

    if (!subjectId || !questionCount) {
      return NextResponse.json({ error: "Ders ve soru sayısı gerekli" }, { status: 400 });
    }

    const study = await prisma.dailyStudy.create({
      data: {
        date: new Date(date || new Date()),
        userId,
        subjectId,
        topicId: topicId || null,
        questionCount,
        correctCount: correctCount || 0,
        wrongCount: wrongCount || 0,
        emptyCount: emptyCount || 0,
        difficulty: difficulty || null,
        source: source || null,
        duration: duration || null,
        notes: notes || null,
      },
      include: {
        subject: { include: { examType: true } },
        topic: true,
      },
    });

    // Kara Kutu: çalışma oturumu başlangıcını logla
    logStudySessionStart(userId, topicId || subjectId, source === 'system_recommendation' ? 'system_recommendation' : source === 'self_planned' ? 'self_planned' : 'manual');

    // Update streak & check badges (fire and forget)
    updateDailyStudyStreak(userId).catch((err) =>
      logApiError("daily-study", err)
    );

    // Bilişsel çizge güncelleme: çalışma başarı oranına göre mastery güncelle
    if (topicId && questionCount > 0) {
      const correctRatio = (correctCount || 0) / questionCount;

      // 1. DAG güncelleme (UserCognitiveState)
      recordStudyForTopic(userId, topicId, correctRatio).catch((err) =>
        logApiError("daily-study/dag", err)
      );

      // 2. Bayesyen güncelleme (TopicBelief) + Elastic Projection (Bayes → DAG sync)
      (async () => {
        try {
          // Mevcut belief'i getir (yoksa prior: Beta(1,1))
          const existing = await prisma.topicBelief.findUnique({
            where: { userId_topicId: { userId, topicId } },
          });
          const oldAlpha = existing?.alpha ?? 1.0;
          const oldBeta = existing?.beta ?? 1.0;

          // Bayesyen güncelleme
          const updated = updateFromStudySession(oldAlpha, oldBeta, correctRatio, questionCount);

          // Kara Kutu: Belief değişimini logla
          logBeliefUpdate({
            userId,
            topicId,
            alphaOld: oldAlpha,
            betaOld: oldBeta,
            alphaNew: updated.alpha,
            betaNew: updated.beta,
            meanOld: betaMean(oldAlpha, oldBeta),
            meanNew: betaMean(updated.alpha, updated.beta),
            source: 'study_session',
          });

          // TopicBelief upsert
          await prisma.topicBelief.upsert({
            where: { userId_topicId: { userId, topicId } },
            update: { alpha: updated.alpha, beta: updated.beta },
            create: { userId, topicId, alpha: updated.alpha, beta: updated.beta },
          });

          // Elastic Projection: Bayes → DAG sync
          await applyElasticProjectionForTopic(userId, topicId, updated.alpha, updated.beta);
        } catch (err) {
          logApiError("daily-study/belief-sync", err);
        }
      })();
    }

    return NextResponse.json(study, { status: 201 });
  } catch (error) {
    logApiError("daily-study", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 });

    const existing = await prisma.dailyStudy.findFirst({ where: { id, userId } });
    if (!existing) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

    await prisma.dailyStudy.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError("daily-study", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
