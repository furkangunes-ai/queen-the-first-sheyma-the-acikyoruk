import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";

function adminGuard(session: any) {
  if (!session?.user) return { error: "Unauthorized", status: 401 };
  if ((session.user as any).role !== "admin")
    return { error: "Forbidden", status: 403 };
  return null;
}

// ---------------------------------------------------------------------------
// GET — Kullanıcı detay: müfredat, çalışma, test bilgileri
// Query: ?userId=xxx
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const guard = adminGuard(session);
    if (guard)
      return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // List all non-admin users if no userId
    if (!userId) {
      const users = await prisma.user.findMany({
        where: { role: { not: "admin" } },
        select: {
          id: true,
          displayName: true,
          username: true,
          role: true,
          examTrack: true,
          createdAt: true,
          _count: {
            select: {
              topicKnowledge: true,
              dailyStudies: true,
              exams: true,
              kazanimProgress: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json(users);
    }

    // Fetch detailed data for specific user
    const [
      user,
      topicKnowledge,
      recentStudies,
      recentExams,
      kazanimProgress,
      cognitiveStates,
      streaks,
    ] = await Promise.all([
      // User info
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          displayName: true,
          username: true,
          role: true,
          examTrack: true,
          createdAt: true,
        },
      }),

      // Topic knowledge levels
      prisma.topicKnowledge.findMany({
        where: { userId },
        select: {
          level: true,
          updatedAt: true,
          topic: {
            select: {
              name: true,
              subject: {
                select: { name: true, examType: { select: { name: true } } },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),

      // Recent daily studies (last 30)
      prisma.dailyStudy.findMany({
        where: { userId },
        select: {
          date: true,
          questionCount: true,
          correctCount: true,
          wrongCount: true,
          emptyCount: true,
          duration: true,
          source: true,
          subject: { select: { name: true } },
          topic: { select: { name: true } },
        },
        orderBy: { date: "desc" },
        take: 30,
      }),

      // Recent exams (last 10)
      prisma.exam.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          date: true,
          examType: { select: { name: true } },
          subjectResults: {
            select: {
              correctCount: true,
              wrongCount: true,
              emptyCount: true,
              netScore: true,
              subject: { select: { name: true } },
            },
          },
        },
        orderBy: { date: "desc" },
        take: 10,
      }),

      // Kazanım progress
      prisma.kazanimProgress.findMany({
        where: { userId },
        select: {
          checked: true,
          notes: true,
          updatedAt: true,
          kazanim: {
            select: {
              code: true,
              description: true,
              topic: {
                select: {
                  name: true,
                  subject: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),

      // Cognitive states (top 50 by mastery)
      prisma.userCognitiveState.findMany({
        where: { userId },
        select: {
          masteryLevel: true,
          strength: true,
          successCount: true,
          lastTestedAt: true,
          node: { select: { name: true, domain: true, examType: true } },
        },
        orderBy: { masteryLevel: "desc" },
        take: 50,
      }),

      // Streaks
      prisma.streak.findMany({
        where: { userId },
        select: {
          currentStreak: true,
          longestStreak: true,
          lastStudyDate: true,
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    // Compute summary stats
    const totalKnowledge = topicKnowledge.length;
    const avgKnowledge = totalKnowledge > 0
      ? topicKnowledge.reduce((s, tk) => s + tk.level, 0) / totalKnowledge
      : 0;

    const knowledgeByLevel = [0, 0, 0, 0, 0, 0]; // 0-5
    topicKnowledge.forEach((tk) => {
      if (tk.level >= 0 && tk.level <= 5) knowledgeByLevel[tk.level]++;
    });

    const totalStudySessions = recentStudies.length;
    const totalQuestions = recentStudies.reduce((s, ds) => s + (ds.questionCount || 0), 0);
    const totalCorrect = recentStudies.reduce((s, ds) => s + (ds.correctCount || 0), 0);
    const totalWrong = recentStudies.reduce((s, ds) => s + (ds.wrongCount || 0), 0);

    const examCount = recentExams.length;
    const avgNet = examCount > 0
      ? recentExams.reduce((s, e) =>
          s + e.subjectResults.reduce((s2, sr) => s2 + (sr.netScore || 0), 0), 0
        ) / examCount
      : 0;

    const checkedKazanim = kazanimProgress.filter((kp) => kp.checked).length;
    const totalKazanim = kazanimProgress.length;

    return NextResponse.json({
      user,
      summary: {
        avgKnowledge: Math.round(avgKnowledge * 10) / 10,
        knowledgeByLevel,
        totalKnowledge,
        totalStudySessions,
        totalQuestions,
        totalCorrect,
        totalWrong,
        correctRate: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
        examCount,
        avgNet: Math.round(avgNet * 10) / 10,
        checkedKazanim,
        totalKazanim,
        streak: streaks[0] || null,
      },
      topicKnowledge: topicKnowledge.map((tk) => ({
        topicName: tk.topic.name,
        subject: tk.topic.subject.name,
        exam: tk.topic.subject.examType.name,
        level: tk.level,
        updatedAt: tk.updatedAt,
      })),
      recentStudies: recentStudies.map((ds) => ({
        date: ds.date,
        subject: ds.subject?.name || "-",
        topic: ds.topic?.name || "-",
        questionCount: ds.questionCount,
        correctCount: ds.correctCount,
        wrongCount: ds.wrongCount,
        emptyCount: ds.emptyCount,
        duration: ds.duration,
        source: ds.source,
      })),
      recentExams: recentExams.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        examType: e.examType.name,
        totalNet: e.subjectResults.reduce((s, sr) => s + (sr.netScore || 0), 0),
        subjects: e.subjectResults.map((sr) => ({
          name: sr.subject.name,
          correct: sr.correctCount,
          wrong: sr.wrongCount,
          empty: sr.emptyCount,
          net: sr.netScore,
        })),
      })),
      kazanimProgress: {
        checked: checkedKazanim,
        total: totalKazanim,
        recent: kazanimProgress.slice(0, 20).map((kp) => ({
          code: kp.kazanim.code,
          description: kp.kazanim.description,
          topic: kp.kazanim.topic.name,
          subject: kp.kazanim.topic.subject.name,
          checked: kp.checked,
          notes: kp.notes,
          updatedAt: kp.updatedAt,
        })),
      },
      cognitiveStates: cognitiveStates.map((cs) => ({
        concept: cs.node.name,
        domain: cs.node.domain,
        mastery: cs.masteryLevel,
        strength: cs.strength,
        successCount: cs.successCount,
        lastTested: cs.lastTestedAt,
      })),
    });
  } catch (error) {
    logApiError("admin/user-overview", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
