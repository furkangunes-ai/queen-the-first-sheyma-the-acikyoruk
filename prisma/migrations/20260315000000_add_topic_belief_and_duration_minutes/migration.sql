-- AlterTable: ExamSubjectResult'a durationMinutes eklenir (Aksiyom 2: Hız ağırlığı)
ALTER TABLE "ExamSubjectResult" ADD COLUMN "durationMinutes" INTEGER;

-- CreateTable: TopicBelief — Bayesyen Biliş Motoru (Beta dağılımı)
CREATE TABLE "TopicBelief" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "alpha" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "beta" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicBelief_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TopicBelief_userId_idx" ON "TopicBelief"("userId");
CREATE INDEX "TopicBelief_topicId_idx" ON "TopicBelief"("topicId");
CREATE UNIQUE INDEX "TopicBelief_userId_topicId_key" ON "TopicBelief"("userId", "topicId");

-- AddForeignKey
ALTER TABLE "TopicBelief" ADD CONSTRAINT "TopicBelief_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TopicBelief" ADD CONSTRAINT "TopicBelief_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
