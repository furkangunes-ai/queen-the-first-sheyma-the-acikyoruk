-- CreateTable
CREATE TABLE "DataBackup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "backupType" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "sizeBytes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataBackup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DataBackup_userId_idx" ON "DataBackup"("userId");

-- CreateIndex
CREATE INDEX "DataBackup_backupType_idx" ON "DataBackup"("backupType");

-- CreateIndex
CREATE INDEX "DataBackup_createdAt_idx" ON "DataBackup"("createdAt");

-- CreateIndex
CREATE INDEX "DataBackup_expiresAt_idx" ON "DataBackup"("expiresAt");

-- AddForeignKey
ALTER TABLE "DataBackup" ADD CONSTRAINT "DataBackup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
