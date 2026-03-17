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
