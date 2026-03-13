-- Phase 1: Quantum Void Model Reform
-- VoidStatus: RAW ekleme, CognitiveVoid: nullable errorReason + questionNumber + relapseCount
-- Exam: coldPhaseCompleted ve coldPhaseCompletedAt kaldırma

-- 1. VoidStatus enum'a RAW ekle
ALTER TYPE "VoidStatus" ADD VALUE IF NOT EXISTS 'RAW' BEFORE 'UNRESOLVED';

-- 2. CognitiveVoid: errorReason nullable yap
ALTER TABLE "CognitiveVoid" ALTER COLUMN "errorReason" DROP NOT NULL;
ALTER TABLE "CognitiveVoid" ALTER COLUMN "errorReason" DROP DEFAULT;

-- 3. CognitiveVoid: status default'u RAW yap
ALTER TABLE "CognitiveVoid" ALTER COLUMN "status" SET DEFAULT 'RAW';

-- 4. CognitiveVoid: severity default'u 0.1 yap (RAW default)
ALTER TABLE "CognitiveVoid" ALTER COLUMN "severity" SET DEFAULT 0.1;

-- 5. CognitiveVoid: questionNumber alanı ekle
ALTER TABLE "CognitiveVoid" ADD COLUMN IF NOT EXISTS "questionNumber" INTEGER;

-- 6. CognitiveVoid: relapseCount alanı ekle
ALTER TABLE "CognitiveVoid" ADD COLUMN IF NOT EXISTS "relapseCount" INTEGER NOT NULL DEFAULT 0;

-- 7. Eski unique constraint'i kaldır
ALTER TABLE "CognitiveVoid" DROP CONSTRAINT IF EXISTS "CognitiveVoid_examId_subjectId_topicId_errorReason_source_key";

-- 8. Yeni unique constraint: questionNumber bazlı
CREATE UNIQUE INDEX IF NOT EXISTS "CognitiveVoid_examId_subjectId_questionNumber_source_key"
ON "CognitiveVoid"("examId", "subjectId", "questionNumber", "source");

-- 9. Exam: coldPhaseCompleted ve coldPhaseCompletedAt kaldır
ALTER TABLE "Exam" DROP COLUMN IF EXISTS "coldPhaseCompleted";
ALTER TABLE "Exam" DROP COLUMN IF EXISTS "coldPhaseCompletedAt";

-- 10. Eski index'i kaldır (userId, coldPhaseCompleted)
DROP INDEX IF EXISTS "Exam_userId_coldPhaseCompleted_idx";

-- 11. Mevcut UNRESOLVED void'ları: topicId veya errorReason null olanları RAW'a çevir
UPDATE "CognitiveVoid" SET "status" = 'RAW' WHERE "topicId" IS NULL OR "errorReason" IS NULL;
