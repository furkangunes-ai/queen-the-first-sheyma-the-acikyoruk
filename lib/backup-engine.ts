/**
 * Otomatik Veri Yedekleme Motoru
 *
 * Kullanıcı verilerinin periyodik anlık görüntülerini (snapshot) oluşturur.
 * Saklama politikası:
 *   - Günlük: 7 gün sakla
 *   - Haftalık: 4 hafta sakla
 *   - Aylık: 6 ay sakla
 */

import { prisma } from "@/lib/prisma";

// Saklama süreleri (gün cinsinden)
const RETENTION_DAYS = {
  daily: 7,
  weekly: 28,
  monthly: 180,
} as const;

type BackupType = keyof typeof RETENTION_DAYS;

function getExpiresAt(backupType: BackupType): Date {
  const d = new Date();
  d.setDate(d.getDate() + RETENTION_DAYS[backupType]);
  return d;
}

// ---- Per-user snapshot creators ----

async function snapshotExams(userId: string) {
  const exams = await prisma.exam.findMany({
    where: { userId },
    include: {
      subjectResults: {
        include: { subject: { select: { name: true } } },
      },
      cognitiveVoids: {
        select: {
          id: true,
          source: true,
          status: true,
          severity: true,
          magnitude: true,
          subjectId: true,
          topicId: true,
          errorReason: true,
        },
      },
      examType: { select: { name: true, slug: true } },
    },
  });
  return exams;
}

async function snapshotTopicReviews(userId: string) {
  const reviews = await prisma.topicReview.findMany({
    where: { userId },
    include: {
      topic: { select: { name: true } },
      subject: { select: { name: true } },
    },
  });
  return reviews;
}

async function snapshotDailyStudies(userId: string) {
  const studies = await prisma.dailyStudy.findMany({
    where: { userId },
    include: {
      subject: { select: { name: true } },
      topic: { select: { name: true } },
    },
  });
  return studies;
}

async function snapshotTopicKnowledge(userId: string) {
  const knowledge = await prisma.topicKnowledge.findMany({
    where: { userId },
    include: {
      topic: { select: { name: true } },
    },
  });
  return knowledge;
}

// ---- Main backup function ----

export interface BackupResult {
  userId: string;
  backupType: BackupType;
  snapshots: Array<{ dataType: string; recordCount: number; backupId: string }>;
  errors: string[];
}

export async function createUserBackup(
  userId: string,
  backupType: BackupType
): Promise<BackupResult> {
  const result: BackupResult = {
    userId,
    backupType,
    snapshots: [],
    errors: [],
  };

  const expiresAt = getExpiresAt(backupType);

  const tasks: Array<{ dataType: string; fn: () => Promise<unknown> }> = [
    { dataType: "exams", fn: () => snapshotExams(userId) },
    { dataType: "topic_reviews", fn: () => snapshotTopicReviews(userId) },
    { dataType: "daily_studies", fn: () => snapshotDailyStudies(userId) },
    { dataType: "topic_knowledge", fn: () => snapshotTopicKnowledge(userId) },
  ];

  for (const task of tasks) {
    try {
      const data = await task.fn();
      const records = Array.isArray(data) ? data : [];
      if (records.length === 0) continue; // Boş veri yedekleme

      const jsonStr = JSON.stringify(data);
      const sizeBytes = Buffer.byteLength(jsonStr, "utf8");

      const backup = await prisma.dataBackup.create({
        data: {
          userId,
          backupType,
          dataType: task.dataType,
          data: data as any,
          recordCount: records.length,
          sizeBytes,
          expiresAt,
        },
      });

      result.snapshots.push({
        dataType: task.dataType,
        recordCount: records.length,
        backupId: backup.id,
      });
    } catch (err) {
      result.errors.push(
        `${task.dataType}: ${err instanceof Error ? err.message : "Bilinmeyen hata"}`
      );
    }
  }

  return result;
}

// ---- Full backup for all users ----

export async function createAllUsersBackup(backupType: BackupType) {
  const users = await prisma.user.findMany({ select: { id: true } });
  const results: BackupResult[] = [];

  for (const user of users) {
    const r = await createUserBackup(user.id, backupType);
    results.push(r);
  }

  return results;
}

// ---- Expired backup cleanup ----

export async function cleanupExpiredBackups(): Promise<number> {
  const { count } = await prisma.dataBackup.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return count;
}

// ---- Determine which backup types should run today ----

export function getBackupTypesForToday(): BackupType[] {
  const now = new Date();
  const types: BackupType[] = ["daily"];

  // Haftalık: Pazartesi günleri
  if (now.getDay() === 1) {
    types.push("weekly");
  }

  // Aylık: Ayın 1'i
  if (now.getDate() === 1) {
    types.push("monthly");
  }

  return types;
}

// ---- Restore helpers ----

export async function getAvailableBackups(userId: string) {
  return prisma.dataBackup.findMany({
    where: { userId, expiresAt: { gt: new Date() } },
    select: {
      id: true,
      backupType: true,
      dataType: true,
      recordCount: true,
      sizeBytes: true,
      createdAt: true,
      expiresAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBackupData(backupId: string, userId: string) {
  return prisma.dataBackup.findFirst({
    where: { id: backupId, userId },
  });
}

// ---- Restore functions ----

export interface RestoreResult {
  dataType: string;
  restored: number;
  skipped: number;
  errors: string[];
}

/**
 * Yedekten geri yükleme.
 * Strateji: "merge" — mevcut verileri silmeden, yedekteki eksik kayıtları geri ekler.
 * Zaten var olan kayıtlar (aynı ID) atlanır.
 */
export async function restoreFromBackup(
  backupId: string,
  userId: string
): Promise<RestoreResult> {
  const backup = await prisma.dataBackup.findFirst({
    where: { id: backupId, userId },
  });

  if (!backup) {
    return { dataType: "unknown", restored: 0, skipped: 0, errors: ["Yedek bulunamadı"] };
  }

  const records = backup.data as any[];
  if (!Array.isArray(records) || records.length === 0) {
    return { dataType: backup.dataType, restored: 0, skipped: 0, errors: ["Yedekte veri yok"] };
  }

  const result: RestoreResult = {
    dataType: backup.dataType,
    restored: 0,
    skipped: 0,
    errors: [],
  };

  switch (backup.dataType) {
    case "exams":
      await restoreExams(userId, records, result);
      break;
    case "topic_reviews":
      await restoreTopicReviews(userId, records, result);
      break;
    case "daily_studies":
      await restoreDailyStudies(userId, records, result);
      break;
    case "topic_knowledge":
      await restoreTopicKnowledge(userId, records, result);
      break;
    default:
      result.errors.push(`Bilinmeyen veri tipi: ${backup.dataType}`);
  }

  return result;
}

async function restoreExams(userId: string, records: any[], result: RestoreResult) {
  for (const exam of records) {
    try {
      // Zaten varsa atla
      const exists = await prisma.exam.findUnique({ where: { id: exam.id } });
      if (exists) {
        result.skipped++;
        continue;
      }

      // examType'ın hâlâ var olduğunu kontrol et
      const examType = await prisma.examType.findUnique({ where: { id: exam.examTypeId } });
      if (!examType) {
        result.errors.push(`Exam ${exam.id}: examType ${exam.examTypeId} bulunamadı`);
        continue;
      }

      // Exam'ı oluştur
      await prisma.exam.create({
        data: {
          id: exam.id,
          userId,
          examTypeId: exam.examTypeId,
          title: exam.title,
          date: new Date(exam.date),
          notes: exam.notes || null,
          examCategory: exam.examCategory || null,
          timeOfDay: exam.timeOfDay || null,
          environment: exam.environment || null,
          perceivedDifficulty: exam.perceivedDifficulty || null,
          biologicalState: exam.biologicalState || null,
        },
      });

      // SubjectResult'ları geri yükle
      if (exam.subjectResults?.length > 0) {
        for (const sr of exam.subjectResults) {
          const subjectExists = await prisma.subject.findUnique({ where: { id: sr.subjectId } });
          if (!subjectExists) continue;

          await prisma.examSubjectResult.create({
            data: {
              examId: exam.id,
              subjectId: sr.subjectId,
              correctCount: sr.correctCount,
              wrongCount: sr.wrongCount,
              emptyCount: sr.emptyCount,
              netScore: sr.netScore,
              durationMinutes: sr.durationMinutes || null,
            },
          }).catch(() => {}); // Duplicate varsa sessizce geç
        }
      }

      result.restored++;
    } catch (err) {
      result.errors.push(`Exam ${exam.id}: ${err instanceof Error ? err.message : "Hata"}`);
    }
  }
}

async function restoreTopicReviews(userId: string, records: any[], result: RestoreResult) {
  for (const review of records) {
    try {
      const exists = await prisma.topicReview.findUnique({ where: { id: review.id } });
      if (exists) {
        result.skipped++;
        continue;
      }

      // FK kontrolleri
      const subjectExists = await prisma.subject.findUnique({ where: { id: review.subjectId } });
      if (!subjectExists) {
        result.errors.push(`TopicReview ${review.id}: subject ${review.subjectId} bulunamadı`);
        continue;
      }

      await prisma.topicReview.create({
        data: {
          id: review.id,
          userId,
          subjectId: review.subjectId,
          topicId: review.topicId,
          date: new Date(review.date),
          duration: review.duration || null,
          confidence: review.confidence || null,
          notes: review.notes || null,
          method: review.method || null,
        },
      });
      result.restored++;
    } catch (err) {
      result.errors.push(`TopicReview ${review.id}: ${err instanceof Error ? err.message : "Hata"}`);
    }
  }
}

async function restoreDailyStudies(userId: string, records: any[], result: RestoreResult) {
  for (const study of records) {
    try {
      const exists = await prisma.dailyStudy.findUnique({ where: { id: study.id } });
      if (exists) {
        result.skipped++;
        continue;
      }

      const subjectExists = await prisma.subject.findUnique({ where: { id: study.subjectId } });
      if (!subjectExists) {
        result.errors.push(`DailyStudy ${study.id}: subject ${study.subjectId} bulunamadı`);
        continue;
      }

      await prisma.dailyStudy.create({
        data: {
          id: study.id,
          userId,
          date: new Date(study.date),
          subjectId: study.subjectId,
          topicId: study.topicId || null,
          questionCount: study.questionCount || 0,
          correctCount: study.correctCount || 0,
          wrongCount: study.wrongCount || 0,
          emptyCount: study.emptyCount || 0,
          difficulty: study.difficulty || null,
          source: study.source || null,
          duration: study.duration || null,
          comprehension: study.comprehension || null,
          notes: study.notes || null,
        },
      });
      result.restored++;
    } catch (err) {
      result.errors.push(`DailyStudy ${study.id}: ${err instanceof Error ? err.message : "Hata"}`);
    }
  }
}

async function restoreTopicKnowledge(userId: string, records: any[], result: RestoreResult) {
  for (const knowledge of records) {
    try {
      // topicKnowledge unique constraint: userId + topicId
      const exists = await prisma.topicKnowledge.findUnique({
        where: { userId_topicId: { userId, topicId: knowledge.topicId } },
      });
      if (exists) {
        result.skipped++;
        continue;
      }

      const topicExists = await prisma.topic.findUnique({ where: { id: knowledge.topicId } });
      if (!topicExists) {
        result.errors.push(`TopicKnowledge: topic ${knowledge.topicId} bulunamadı`);
        continue;
      }

      await prisma.topicKnowledge.create({
        data: {
          userId,
          topicId: knowledge.topicId,
          level: knowledge.level,
          effectiveLevel: knowledge.effectiveLevel || null,
        },
      });
      result.restored++;
    } catch (err) {
      result.errors.push(`TopicKnowledge ${knowledge.topicId}: ${err instanceof Error ? err.message : "Hata"}`);
    }
  }
}
