-- Migration: Cognitive Void system + Exam context fields
-- Converts ExamWrongQuestion/ExamEmptyQuestion data → CognitiveVoid
-- Old tables are kept as backup (not dropped)

-- ============================================
-- STEP 1: Create enum types
-- ============================================

CREATE TYPE "ErrorReasonType" AS ENUM ('BILGI_EKSIKLIGI', 'ISLEM_HATASI', 'DIKKATSIZLIK', 'SURE_YETISMEDI', 'KAVRAM_YANILGISI', 'SORU_KOKUNU_YANLIS_OKUMA');

CREATE TYPE "VoidStatus" AS ENUM ('UNRESOLVED', 'REVIEW', 'RESOLVED');

CREATE TYPE "VoidSource" AS ENUM ('WRONG', 'EMPTY');

-- ============================================
-- STEP 2: Add missing columns to Exam table
-- ============================================

-- Sıcak Faz bağlam alanları
ALTER TABLE "Exam" ADD COLUMN "timeOfDay" TEXT;
ALTER TABLE "Exam" ADD COLUMN "environment" TEXT;
ALTER TABLE "Exam" ADD COLUMN "perceivedDifficulty" INTEGER;
ALTER TABLE "Exam" ADD COLUMN "biologicalState" TEXT;

-- Soğuk Faz durumu
ALTER TABLE "Exam" ADD COLUMN "coldPhaseCompleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Exam" ADD COLUMN "coldPhaseCompletedAt" TIMESTAMP(3);

-- Yeni index
CREATE INDEX "Exam_userId_coldPhaseCompleted_idx" ON "Exam"("userId", "coldPhaseCompleted");

-- ============================================
-- STEP 3: Create CognitiveVoid table
-- ============================================

CREATE TABLE "CognitiveVoid" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT,
    "source" "VoidSource" NOT NULL DEFAULT 'WRONG',
    "errorReason" "ErrorReasonType" NOT NULL DEFAULT 'BILGI_EKSIKLIGI',
    "magnitude" INTEGER NOT NULL DEFAULT 1,
    "status" "VoidStatus" NOT NULL DEFAULT 'UNRESOLVED',
    "severity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CognitiveVoid_pkey" PRIMARY KEY ("id")
);

-- Unique constraint (gruplama anahtarı)
CREATE UNIQUE INDEX "CognitiveVoid_examId_subjectId_topicId_errorReason_source_key"
  ON "CognitiveVoid"("examId", "subjectId", "topicId", "errorReason", "source");

-- Indexes
CREATE INDEX "CognitiveVoid_examId_idx" ON "CognitiveVoid"("examId");
CREATE INDEX "CognitiveVoid_subjectId_idx" ON "CognitiveVoid"("subjectId");
CREATE INDEX "CognitiveVoid_topicId_idx" ON "CognitiveVoid"("topicId");
CREATE INDEX "CognitiveVoid_status_idx" ON "CognitiveVoid"("status");
CREATE INDEX "CognitiveVoid_examId_subjectId_idx" ON "CognitiveVoid"("examId", "subjectId");
CREATE INDEX "CognitiveVoid_examId_status_idx" ON "CognitiveVoid"("examId", "status");

-- Foreign keys
ALTER TABLE "CognitiveVoid" ADD CONSTRAINT "CognitiveVoid_examId_fkey"
  FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CognitiveVoid" ADD CONSTRAINT "CognitiveVoid_subjectId_fkey"
  FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CognitiveVoid" ADD CONSTRAINT "CognitiveVoid_topicId_fkey"
  FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- STEP 4: Migrate ExamWrongQuestion → CognitiveVoid
-- ============================================
-- Her (examId, subjectId, topicId, errorReason) grubu tek bir CognitiveVoid kaydı olur
-- magnitude = gruptaki soru sayısı

INSERT INTO "CognitiveVoid" ("id", "examId", "subjectId", "topicId", "source", "errorReason", "magnitude", "status", "severity", "notes", "createdAt", "updatedAt")
SELECT
  'cvw' || substr(md5(ewq."examId" || ewq."subjectId" || COALESCE(ewq."topicId", '_') || COALESCE(mapped_reason.val, 'BILGI_EKSIKLIGI')), 1, 22),
  ewq."examId",
  ewq."subjectId",
  ewq."topicId",
  'WRONG'::"VoidSource",
  COALESCE(mapped_reason.val, 'BILGI_EKSIKLIGI')::"ErrorReasonType",
  COUNT(*)::INTEGER,
  'UNRESOLVED'::"VoidStatus",
  1.0,
  STRING_AGG(ewq."notes", '; ' ORDER BY ewq."questionNumber") FILTER (WHERE ewq."notes" IS NOT NULL),
  MIN(ewq."createdAt"),
  MIN(ewq."createdAt")
FROM "ExamWrongQuestion" ewq
LEFT JOIN "ErrorReason" er ON ewq."errorReasonId" = er."id"
LEFT JOIN LATERAL (
  SELECT CASE
    WHEN er."label" ILIKE '%bilgi%eksik%' THEN 'BILGI_EKSIKLIGI'
    WHEN er."label" ILIKE '%islem%hata%' OR er."label" ILIKE '%işlem%hata%' THEN 'ISLEM_HATASI'
    WHEN er."label" ILIKE '%dikkat%' OR er."label" ILIKE '%odak%' THEN 'DIKKATSIZLIK'
    WHEN er."label" ILIKE '%süre%' OR er."label" ILIKE '%sure%' THEN 'SURE_YETISMEDI'
    WHEN er."label" ILIKE '%kavram%' THEN 'KAVRAM_YANILGISI'
    WHEN er."label" ILIKE '%soru%kök%' OR er."label" ILIKE '%soru%kok%' THEN 'SORU_KOKUNU_YANLIS_OKUMA'
    ELSE 'BILGI_EKSIKLIGI'
  END AS val
) mapped_reason ON true
GROUP BY ewq."examId", ewq."subjectId", ewq."topicId", mapped_reason.val;

-- ============================================
-- STEP 5: Migrate ExamEmptyQuestion → CognitiveVoid
-- ============================================

INSERT INTO "CognitiveVoid" ("id", "examId", "subjectId", "topicId", "source", "errorReason", "magnitude", "status", "severity", "notes", "createdAt", "updatedAt")
SELECT
  'cve' || substr(md5(eeq."examId" || eeq."subjectId" || COALESCE(eeq."topicId", '_')), 1, 22),
  eeq."examId",
  eeq."subjectId",
  eeq."topicId",
  'EMPTY'::"VoidSource",
  'BILGI_EKSIKLIGI'::"ErrorReasonType",
  COUNT(*)::INTEGER,
  'UNRESOLVED'::"VoidStatus",
  0.5,
  STRING_AGG(eeq."notes", '; ' ORDER BY eeq."questionNumber") FILTER (WHERE eeq."notes" IS NOT NULL),
  MIN(eeq."createdAt"),
  MIN(eeq."createdAt")
FROM "ExamEmptyQuestion" eeq
GROUP BY eeq."examId", eeq."subjectId", eeq."topicId"
ON CONFLICT ("examId", "subjectId", "topicId", "errorReason", "source") DO NOTHING;

-- ============================================
-- STEP 6: Update SpacedRepetitionItem
-- ============================================
-- wrongQuestionId → cognitiveVoidId dönüşümü

-- Yeni kolon ekle
ALTER TABLE "SpacedRepetitionItem" ADD COLUMN "cognitiveVoidId" TEXT;

-- Eski wrongQuestion → yeni CognitiveVoid eşleştirmesi
UPDATE "SpacedRepetitionItem" sri
SET "cognitiveVoidId" = (
  SELECT cv."id"
  FROM "ExamWrongQuestion" ewq
  JOIN "CognitiveVoid" cv ON cv."examId" = ewq."examId"
    AND cv."subjectId" = ewq."subjectId"
    AND cv."source" = 'WRONG'
    AND (cv."topicId" = ewq."topicId" OR (cv."topicId" IS NULL AND ewq."topicId" IS NULL))
  WHERE ewq."id" = sri."wrongQuestionId"
  LIMIT 1
)
WHERE sri."wrongQuestionId" IS NOT NULL;

-- Eşleşemeyen kayıtları temizle (orphan records)
DELETE FROM "SpacedRepetitionItem" WHERE "cognitiveVoidId" IS NULL;

-- Eski FK ve kolonu kaldır
ALTER TABLE "SpacedRepetitionItem" DROP CONSTRAINT IF EXISTS "SpacedRepetitionItem_wrongQuestionId_fkey";
ALTER TABLE "SpacedRepetitionItem" DROP COLUMN IF EXISTS "wrongQuestionId";

-- Yeni kolonu zorunlu yap
ALTER TABLE "SpacedRepetitionItem" ALTER COLUMN "cognitiveVoidId" SET NOT NULL;

-- Yeni FK ekle
ALTER TABLE "SpacedRepetitionItem" ADD CONSTRAINT "SpacedRepetitionItem_cognitiveVoidId_fkey"
  FOREIGN KEY ("cognitiveVoidId") REFERENCES "CognitiveVoid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- STEP 7: Mark exams with migrated data as cold-phase completed
-- ============================================

UPDATE "Exam" e
SET "coldPhaseCompleted" = true,
    "coldPhaseCompletedAt" = NOW()
WHERE EXISTS (SELECT 1 FROM "CognitiveVoid" cv WHERE cv."examId" = e."id");

-- ============================================
-- STEP 8: Remove DailyStudy/TopicReview photo columns (removed from schema)
-- ============================================

ALTER TABLE "DailyStudy" DROP COLUMN IF EXISTS "photoUrl";
ALTER TABLE "DailyStudy" DROP COLUMN IF EXISTS "photoR2Key";
ALTER TABLE "TopicReview" DROP COLUMN IF EXISTS "photoUrl";
ALTER TABLE "TopicReview" DROP COLUMN IF EXISTS "photoR2Key";

-- NOT: ExamWrongQuestion, ExamEmptyQuestion ve ErrorReason tabloları
-- backup olarak korunuyor, silinmiyor.
