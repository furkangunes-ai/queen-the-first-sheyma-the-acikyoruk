import { prisma } from "@/lib/prisma";
import { getTurkeyDateString } from "@/lib/utils";

// ─── Badge Definitions ─────────────────────────────

export interface BadgeDefinition {
  type: string;
  name: string;
  description: string;
  emoji: string;
  condition: (context: BadgeContext) => boolean;
}

interface BadgeContext {
  dailyStudyStreak: number;
  longestDailyStudyStreak: number;
  totalExams: number;
  totalStudySessions: number;
  totalQuestions: number;
  totalReviews: number;
  totalSpeedReadingSessions: number;
  totalMentalMathSessions: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Streak badges
  {
    type: "streak_3",
    name: "İlk Adım",
    description: "3 gün üst üste çalıştın",
    emoji: "🔥",
    condition: (ctx) => ctx.dailyStudyStreak >= 3,
  },
  {
    type: "streak_7",
    name: "Hafta Savaşçısı",
    description: "7 gün üst üste çalıştın",
    emoji: "⚡",
    condition: (ctx) => ctx.dailyStudyStreak >= 7,
  },
  {
    type: "streak_14",
    name: "Kararlı",
    description: "14 gün üst üste çalıştın",
    emoji: "💪",
    condition: (ctx) => ctx.dailyStudyStreak >= 14,
  },
  {
    type: "streak_30",
    name: "Efsane",
    description: "30 gün üst üste çalıştın",
    emoji: "👑",
    condition: (ctx) => ctx.dailyStudyStreak >= 30,
  },
  // Exam badges
  {
    type: "exam_first",
    name: "İlk Deneme",
    description: "İlk deneme sınavını girdin",
    emoji: "📝",
    condition: (ctx) => ctx.totalExams >= 1,
  },
  {
    type: "exam_10",
    name: "Deneme Ustası",
    description: "10 deneme sınavı girdin",
    emoji: "🎯",
    condition: (ctx) => ctx.totalExams >= 10,
  },
  // Study badges
  {
    type: "study_100",
    name: "Yüz Soru",
    description: "Toplam 100 soru çözdün",
    emoji: "💯",
    condition: (ctx) => ctx.totalQuestions >= 100,
  },
  {
    type: "study_500",
    name: "Beş Yüz",
    description: "Toplam 500 soru çözdün",
    emoji: "🌟",
    condition: (ctx) => ctx.totalQuestions >= 500,
  },
  {
    type: "study_1000",
    name: "Bin Soru Efsanesi",
    description: "Toplam 1000 soru çözdün",
    emoji: "🏆",
    condition: (ctx) => ctx.totalQuestions >= 1000,
  },
  // Training badges
  {
    type: "speed_first",
    name: "Hızlı Göz",
    description: "İlk hızlı okuma antrenmanını yaptın",
    emoji: "👁️",
    condition: (ctx) => ctx.totalSpeedReadingSessions >= 1,
  },
  {
    type: "mental_first",
    name: "Zeki Beyin",
    description: "İlk işlem hızı antrenmanını yaptın",
    emoji: "🧠",
    condition: (ctx) => ctx.totalMentalMathSessions >= 1,
  },
  // Review badges
  {
    type: "review_10",
    name: "Tekrar Meraklısı",
    description: "10 konu tekrarı yaptın",
    emoji: "🔄",
    condition: (ctx) => ctx.totalReviews >= 10,
  },
];

// ─── Streak Update ─────────────────────────────────

/**
 * Update daily study streak for a user.
 * Call this after saving a DailyStudy or TopicReview.
 */
export async function updateDailyStudyStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  newBadges: string[];
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = getTurkeyDateString(today);

  // Get or create streak
  let streak = await prisma.userStreak.findUnique({
    where: { userId_type: { userId, type: "daily_study" } },
  });

  if (!streak) {
    streak = await prisma.userStreak.create({
      data: {
        userId,
        type: "daily_study",
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
      },
    });
    const newBadges = await checkAndAwardBadges(userId);
    return { currentStreak: 1, longestStreak: 1, newBadges };
  }

  const lastActive = streak.lastActiveDate
    ? new Date(streak.lastActiveDate)
    : null;

  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
    const lastActiveStr = getTurkeyDateString(lastActive);

    if (lastActiveStr === todayStr) {
      // Already active today — no change
      return {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        newBadges: [],
      };
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getTurkeyDateString(yesterday);

    if (lastActiveStr === yesterdayStr) {
      // Consecutive day — increment streak
      const newCurrent = streak.currentStreak + 1;
      const newLongest = Math.max(streak.longestStreak, newCurrent);

      await prisma.userStreak.update({
        where: { id: streak.id },
        data: {
          currentStreak: newCurrent,
          longestStreak: newLongest,
          lastActiveDate: today,
        },
      });

      const newBadges = await checkAndAwardBadges(userId);
      return { currentStreak: newCurrent, longestStreak: newLongest, newBadges };
    }
  }

  // Streak broken — reset to 1
  await prisma.userStreak.update({
    where: { id: streak.id },
    data: {
      currentStreak: 1,
      lastActiveDate: today,
    },
  });

  const newBadges = await checkAndAwardBadges(userId);
  return {
    currentStreak: 1,
    longestStreak: streak.longestStreak,
    newBadges,
  };
}

// ─── Badge Check & Award ───────────────────────────

/**
 * Check all badge conditions and award new badges.
 * Returns array of newly awarded badge types.
 */
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  // Get existing badges
  const existingBadges = await prisma.userBadge.findMany({
    where: { userId },
    select: { badgeType: true },
  });
  const existingTypes = new Set(existingBadges.map((b) => b.badgeType));

  // Build context
  const [
    streak,
    totalExams,
    totalStudySessions,
    totalQuestions,
    totalReviews,
    totalSpeedReading,
    totalMentalMath,
  ] = await Promise.all([
    prisma.userStreak.findUnique({
      where: { userId_type: { userId, type: "daily_study" } },
    }),
    prisma.exam.count({ where: { userId } }),
    prisma.dailyStudy.count({ where: { userId } }),
    prisma.dailyStudy.aggregate({
      where: { userId },
      _sum: { questionCount: true },
    }),
    prisma.topicReview.count({ where: { userId } }),
    prisma.speedReadingSession.count({ where: { userId } }),
    prisma.speedReadingExercise.count({
      where: { userId, exerciseType: "mental-math" },
    }),
  ]);

  const context: BadgeContext = {
    dailyStudyStreak: streak?.currentStreak ?? 0,
    longestDailyStudyStreak: streak?.longestStreak ?? 0,
    totalExams,
    totalStudySessions,
    totalQuestions: totalQuestions._sum.questionCount ?? 0,
    totalReviews,
    totalSpeedReadingSessions: totalSpeedReading,
    totalMentalMathSessions: totalMentalMath,
  };

  // Check each badge
  const newBadges: string[] = [];
  for (const badge of BADGE_DEFINITIONS) {
    if (existingTypes.has(badge.type)) continue;
    if (badge.condition(context)) {
      try {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeType: badge.type,
          },
        });
        newBadges.push(badge.type);
      } catch {
        // Unique constraint violation — already exists, skip
      }
    }
  }

  return newBadges;
}

/**
 * Get user's streak and badges data.
 */
export async function getUserGamificationData(userId: string) {
  const [streak, badges] = await Promise.all([
    prisma.userStreak.findUnique({
      where: { userId_type: { userId, type: "daily_study" } },
    }),
    prisma.userBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: "desc" },
    }),
  ]);

  const badgeData = badges.map((b) => {
    const def = BADGE_DEFINITIONS.find((d) => d.type === b.badgeType);
    return {
      type: b.badgeType,
      name: def?.name ?? b.badgeType,
      description: def?.description ?? "",
      emoji: def?.emoji ?? "🏅",
      earnedAt: b.earnedAt,
    };
  });

  return {
    streak: streak
      ? {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          lastActiveDate: streak.lastActiveDate,
        }
      : { currentStreak: 0, longestStreak: 0, lastActiveDate: null },
    badges: badgeData,
    totalBadges: badgeData.length,
    possibleBadges: BADGE_DEFINITIONS.length,
  };
}
