-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "examTrack" TEXT,
    "aiEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "parentId" TEXT,
    "userId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "dueDate" TIMESTAMP(3),
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrence" TEXT,
    "folderId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskCompletion" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isEncouragement" BOOLEAN NOT NULL DEFAULT false,
    "taskId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "ExamType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "questionCount" INTEGER NOT NULL DEFAULT 40,
    "examTypeId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 3,
    "estimatedHours" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "gradeLevel" INTEGER,
    "learningArea" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorReason" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "examTypeId" TEXT NOT NULL,
    "examCategory" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamSubjectResult" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "wrongCount" INTEGER NOT NULL,
    "emptyCount" INTEGER NOT NULL,
    "netScore" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ExamSubjectResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamWrongQuestion" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT,
    "questionNumber" INTEGER NOT NULL,
    "errorReasonId" TEXT,
    "notes" TEXT,
    "photoUrl" TEXT,
    "photoR2Key" TEXT,
    "difficulty" TEXT,
    "understandingStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ExamWrongQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamEmptyQuestion" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT,
    "questionNumber" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamEmptyQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "type" TEXT NOT NULL DEFAULT 'number',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MetricDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricEntry" (
    "id" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "metricId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MetricEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyCheckIn" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mood" INTEGER,
    "energy" INTEGER,
    "sleep" DOUBLE PRECISION,
    "gratitude" TEXT,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "recipientId" TEXT NOT NULL,
    "senderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyStudy" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT,
    "questionCount" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "emptyCount" INTEGER NOT NULL DEFAULT 0,
    "difficulty" TEXT,
    "source" TEXT,
    "duration" INTEGER,
    "photoUrl" TEXT,
    "photoR2Key" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyStudy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicReview" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "duration" INTEGER,
    "confidence" TEXT,
    "method" TEXT,
    "photoUrl" TEXT,
    "photoR2Key" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "r2Key" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "folderId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicKnowledge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicKnowledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyPlanItem" (
    "id" TEXT NOT NULL,
    "weeklyPlanId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT,
    "duration" INTEGER,
    "questionCount" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WeeklyPlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "weekEndDate" TIMESTAMP(3) NOT NULL,
    "plannedItems" INTEGER NOT NULL DEFAULT 0,
    "completedItems" INTEGER NOT NULL DEFAULT 0,
    "totalStudyMinutes" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "netScoreChanges" JSONB,
    "aiSummary" TEXT,
    "aiRecommendations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIChatMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeedReadingSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "wordCount" INTEGER NOT NULL,
    "wordsRead" INTEGER NOT NULL,
    "initialWpm" INTEGER NOT NULL,
    "finalWpm" INTEGER NOT NULL,
    "chunkSize" INTEGER NOT NULL DEFAULT 1,
    "autoSpeed" BOOLEAN NOT NULL DEFAULT false,
    "duration" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "comprehension" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeedReadingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeedReadingExercise" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseType" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "score" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeedReadingExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpacedRepetitionItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wrongQuestionId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT,
    "nextReviewDate" TIMESTAMP(3) NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "repetitionCount" INTEGER NOT NULL DEFAULT 0,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpacedRepetitionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TargetScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "targetNet" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TargetScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStreak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeType" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionBank" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 3,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionBank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionBankItem" (
    "id" TEXT NOT NULL,
    "questionBankId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctAnswer" INTEGER NOT NULL,
    "explanation" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuestionBankItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "context" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyStudyHours" DOUBLE PRECISION,
    "availableDays" JSONB,
    "studyRegularity" TEXT,
    "breakPreference" TEXT,
    "examDate" TIMESTAMP(3),
    "targetRank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicPrerequisite" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "prerequisiteId" TEXT NOT NULL,
    "strength" TEXT NOT NULL DEFAULT 'hard',

    CONSTRAINT "TopicPrerequisite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicKazanim" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "subTopicName" TEXT,
    "description" TEXT NOT NULL,
    "details" TEXT,
    "isKeyKazanim" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicKazanim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KazanimProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kazanimId" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KazanimProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicConcept" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "formula" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicConcept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConceptNode" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "examType" TEXT NOT NULL DEFAULT 'both',
    "complexityScore" INTEGER NOT NULL DEFAULT 5,
    "parentTopicId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConceptNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DependencyEdge" (
    "id" TEXT NOT NULL,
    "parentNodeId" TEXT NOT NULL,
    "childNodeId" TEXT NOT NULL,
    "dependencyWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "isAdaptive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DependencyEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCognitiveState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "masteryLevel" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "strength" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "lastTestedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCognitiveState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'basic',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Folder_userId_idx" ON "Folder"("userId");

-- CreateIndex
CREATE INDEX "Folder_parentId_idx" ON "Folder"("parentId");

-- CreateIndex
CREATE INDEX "Task_folderId_idx" ON "Task"("folderId");

-- CreateIndex
CREATE INDEX "Task_assignedById_idx" ON "Task"("assignedById");

-- CreateIndex
CREATE INDEX "TaskCompletion_taskId_idx" ON "TaskCompletion"("taskId");

-- CreateIndex
CREATE INDEX "TaskComment_taskId_idx" ON "TaskComment"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamType_slug_key" ON "ExamType"("slug");

-- CreateIndex
CREATE INDEX "ExamType_slug_idx" ON "ExamType"("slug");

-- CreateIndex
CREATE INDEX "Subject_examTypeId_idx" ON "Subject"("examTypeId");

-- CreateIndex
CREATE INDEX "Topic_subjectId_idx" ON "Topic"("subjectId");

-- CreateIndex
CREATE INDEX "Exam_userId_idx" ON "Exam"("userId");

-- CreateIndex
CREATE INDEX "Exam_examTypeId_idx" ON "Exam"("examTypeId");

-- CreateIndex
CREATE INDEX "Exam_date_idx" ON "Exam"("date");

-- CreateIndex
CREATE INDEX "Exam_userId_date_idx" ON "Exam"("userId", "date");

-- CreateIndex
CREATE INDEX "ExamSubjectResult_examId_idx" ON "ExamSubjectResult"("examId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamSubjectResult_examId_subjectId_key" ON "ExamSubjectResult"("examId", "subjectId");

-- CreateIndex
CREATE INDEX "ExamWrongQuestion_examId_idx" ON "ExamWrongQuestion"("examId");

-- CreateIndex
CREATE INDEX "ExamWrongQuestion_subjectId_idx" ON "ExamWrongQuestion"("subjectId");

-- CreateIndex
CREATE INDEX "ExamWrongQuestion_topicId_idx" ON "ExamWrongQuestion"("topicId");

-- CreateIndex
CREATE INDEX "ExamWrongQuestion_errorReasonId_idx" ON "ExamWrongQuestion"("errorReasonId");

-- CreateIndex
CREATE INDEX "ExamWrongQuestion_examId_topicId_idx" ON "ExamWrongQuestion"("examId", "topicId");

-- CreateIndex
CREATE INDEX "ExamEmptyQuestion_examId_idx" ON "ExamEmptyQuestion"("examId");

-- CreateIndex
CREATE INDEX "ExamEmptyQuestion_subjectId_idx" ON "ExamEmptyQuestion"("subjectId");

-- CreateIndex
CREATE INDEX "MetricDefinition_userId_idx" ON "MetricDefinition"("userId");

-- CreateIndex
CREATE INDEX "MetricEntry_date_idx" ON "MetricEntry"("date");

-- CreateIndex
CREATE UNIQUE INDEX "MetricEntry_metricId_userId_date_key" ON "MetricEntry"("metricId", "userId", "date");

-- CreateIndex
CREATE INDEX "DailyCheckIn_userId_idx" ON "DailyCheckIn"("userId");

-- CreateIndex
CREATE INDEX "DailyCheckIn_date_idx" ON "DailyCheckIn"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyCheckIn_userId_date_key" ON "DailyCheckIn"("userId", "date");

-- CreateIndex
CREATE INDEX "Notification_recipientId_idx" ON "Notification"("recipientId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "DailyStudy_userId_idx" ON "DailyStudy"("userId");

-- CreateIndex
CREATE INDEX "DailyStudy_date_idx" ON "DailyStudy"("date");

-- CreateIndex
CREATE INDEX "DailyStudy_subjectId_idx" ON "DailyStudy"("subjectId");

-- CreateIndex
CREATE INDEX "DailyStudy_userId_date_idx" ON "DailyStudy"("userId", "date");

-- CreateIndex
CREATE INDEX "TopicReview_userId_idx" ON "TopicReview"("userId");

-- CreateIndex
CREATE INDEX "TopicReview_date_idx" ON "TopicReview"("date");

-- CreateIndex
CREATE INDEX "TopicReview_subjectId_idx" ON "TopicReview"("subjectId");

-- CreateIndex
CREATE INDEX "TopicReview_topicId_idx" ON "TopicReview"("topicId");

-- CreateIndex
CREATE INDEX "TopicReview_userId_date_idx" ON "TopicReview"("userId", "date");

-- CreateIndex
CREATE INDEX "UserFile_userId_idx" ON "UserFile"("userId");

-- CreateIndex
CREATE INDEX "TopicKnowledge_userId_idx" ON "TopicKnowledge"("userId");

-- CreateIndex
CREATE INDEX "TopicKnowledge_topicId_idx" ON "TopicKnowledge"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "TopicKnowledge_userId_topicId_key" ON "TopicKnowledge"("userId", "topicId");

-- CreateIndex
CREATE INDEX "WeeklyPlan_userId_idx" ON "WeeklyPlan"("userId");

-- CreateIndex
CREATE INDEX "WeeklyPlan_startDate_idx" ON "WeeklyPlan"("startDate");

-- CreateIndex
CREATE INDEX "WeeklyPlan_userId_startDate_idx" ON "WeeklyPlan"("userId", "startDate");

-- CreateIndex
CREATE INDEX "WeeklyPlanItem_weeklyPlanId_idx" ON "WeeklyPlanItem"("weeklyPlanId");

-- CreateIndex
CREATE INDEX "WeeklyPlanItem_dayOfWeek_idx" ON "WeeklyPlanItem"("dayOfWeek");

-- CreateIndex
CREATE INDEX "WeeklyAnalysis_userId_idx" ON "WeeklyAnalysis"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyAnalysis_userId_weekStartDate_key" ON "WeeklyAnalysis"("userId", "weekStartDate");

-- CreateIndex
CREATE INDEX "AIChatMessage_userId_role_createdAt_idx" ON "AIChatMessage"("userId", "role", "createdAt");

-- CreateIndex
CREATE INDEX "AIChatMessage_userId_idx" ON "AIChatMessage"("userId");

-- CreateIndex
CREATE INDEX "AIChatMessage_createdAt_idx" ON "AIChatMessage"("createdAt");

-- CreateIndex
CREATE INDEX "SpeedReadingSession_userId_idx" ON "SpeedReadingSession"("userId");

-- CreateIndex
CREATE INDEX "SpeedReadingSession_createdAt_idx" ON "SpeedReadingSession"("createdAt");

-- CreateIndex
CREATE INDEX "SpeedReadingExercise_userId_idx" ON "SpeedReadingExercise"("userId");

-- CreateIndex
CREATE INDEX "SpeedReadingExercise_exerciseType_idx" ON "SpeedReadingExercise"("exerciseType");

-- CreateIndex
CREATE INDEX "SpeedReadingExercise_createdAt_idx" ON "SpeedReadingExercise"("createdAt");

-- CreateIndex
CREATE INDEX "SpacedRepetitionItem_userId_nextReviewDate_idx" ON "SpacedRepetitionItem"("userId", "nextReviewDate");

-- CreateIndex
CREATE INDEX "SpacedRepetitionItem_userId_subjectId_topicId_idx" ON "SpacedRepetitionItem"("userId", "subjectId", "topicId");

-- CreateIndex
CREATE INDEX "SpacedRepetitionItem_userId_status_idx" ON "SpacedRepetitionItem"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TargetScore_userId_subjectId_key" ON "TargetScore"("userId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "UserStreak_userId_type_key" ON "UserStreak"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeType_key" ON "UserBadge"("userId", "badgeType");

-- CreateIndex
CREATE INDEX "QuestionBank_type_difficulty_idx" ON "QuestionBank"("type", "difficulty");

-- CreateIndex
CREATE INDEX "QuestionBank_createdBy_idx" ON "QuestionBank"("createdBy");

-- CreateIndex
CREATE INDEX "AIInsight_userId_idx" ON "AIInsight"("userId");

-- CreateIndex
CREATE INDEX "AIInsight_type_idx" ON "AIInsight"("type");

-- CreateIndex
CREATE INDEX "AIInsight_createdAt_idx" ON "AIInsight"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE INDEX "TopicPrerequisite_topicId_idx" ON "TopicPrerequisite"("topicId");

-- CreateIndex
CREATE INDEX "TopicPrerequisite_prerequisiteId_idx" ON "TopicPrerequisite"("prerequisiteId");

-- CreateIndex
CREATE UNIQUE INDEX "TopicPrerequisite_topicId_prerequisiteId_key" ON "TopicPrerequisite"("topicId", "prerequisiteId");

-- CreateIndex
CREATE INDEX "TopicKazanim_topicId_idx" ON "TopicKazanim"("topicId");

-- CreateIndex
CREATE INDEX "KazanimProgress_userId_idx" ON "KazanimProgress"("userId");

-- CreateIndex
CREATE INDEX "KazanimProgress_kazanimId_idx" ON "KazanimProgress"("kazanimId");

-- CreateIndex
CREATE UNIQUE INDEX "KazanimProgress_userId_kazanimId_key" ON "KazanimProgress"("userId", "kazanimId");

-- CreateIndex
CREATE INDEX "TopicConcept_topicId_idx" ON "TopicConcept"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "ConceptNode_slug_key" ON "ConceptNode"("slug");

-- CreateIndex
CREATE INDEX "ConceptNode_domain_idx" ON "ConceptNode"("domain");

-- CreateIndex
CREATE INDEX "ConceptNode_parentTopicId_idx" ON "ConceptNode"("parentTopicId");

-- CreateIndex
CREATE INDEX "DependencyEdge_childNodeId_idx" ON "DependencyEdge"("childNodeId");

-- CreateIndex
CREATE UNIQUE INDEX "DependencyEdge_parentNodeId_childNodeId_key" ON "DependencyEdge"("parentNodeId", "childNodeId");

-- CreateIndex
CREATE INDEX "UserCognitiveState_userId_idx" ON "UserCognitiveState"("userId");

-- CreateIndex
CREATE INDEX "UserCognitiveState_nodeId_idx" ON "UserCognitiveState"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCognitiveState_userId_nodeId_key" ON "UserCognitiveState"("userId", "nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_userId_key" ON "UserSubscription"("userId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_adminId_idx" ON "AdminAuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_action_idx" ON "AdminAuditLog"("action");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskCompletion" ADD CONSTRAINT "TaskCompletion_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskCompletion" ADD CONSTRAINT "TaskCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_examTypeId_fkey" FOREIGN KEY ("examTypeId") REFERENCES "ExamType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorReason" ADD CONSTRAINT "ErrorReason_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_examTypeId_fkey" FOREIGN KEY ("examTypeId") REFERENCES "ExamType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubjectResult" ADD CONSTRAINT "ExamSubjectResult_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubjectResult" ADD CONSTRAINT "ExamSubjectResult_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamWrongQuestion" ADD CONSTRAINT "ExamWrongQuestion_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamWrongQuestion" ADD CONSTRAINT "ExamWrongQuestion_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamWrongQuestion" ADD CONSTRAINT "ExamWrongQuestion_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamWrongQuestion" ADD CONSTRAINT "ExamWrongQuestion_errorReasonId_fkey" FOREIGN KEY ("errorReasonId") REFERENCES "ErrorReason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamEmptyQuestion" ADD CONSTRAINT "ExamEmptyQuestion_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamEmptyQuestion" ADD CONSTRAINT "ExamEmptyQuestion_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamEmptyQuestion" ADD CONSTRAINT "ExamEmptyQuestion_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricDefinition" ADD CONSTRAINT "MetricDefinition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricEntry" ADD CONSTRAINT "MetricEntry_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "MetricDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricEntry" ADD CONSTRAINT "MetricEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCheckIn" ADD CONSTRAINT "DailyCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyStudy" ADD CONSTRAINT "DailyStudy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyStudy" ADD CONSTRAINT "DailyStudy_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyStudy" ADD CONSTRAINT "DailyStudy_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicReview" ADD CONSTRAINT "TopicReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicReview" ADD CONSTRAINT "TopicReview_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicReview" ADD CONSTRAINT "TopicReview_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFile" ADD CONSTRAINT "UserFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicKnowledge" ADD CONSTRAINT "TopicKnowledge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicKnowledge" ADD CONSTRAINT "TopicKnowledge_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyPlan" ADD CONSTRAINT "WeeklyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyPlanItem" ADD CONSTRAINT "WeeklyPlanItem_weeklyPlanId_fkey" FOREIGN KEY ("weeklyPlanId") REFERENCES "WeeklyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyPlanItem" ADD CONSTRAINT "WeeklyPlanItem_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyPlanItem" ADD CONSTRAINT "WeeklyPlanItem_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyAnalysis" ADD CONSTRAINT "WeeklyAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIChatMessage" ADD CONSTRAINT "AIChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeedReadingSession" ADD CONSTRAINT "SpeedReadingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeedReadingExercise" ADD CONSTRAINT "SpeedReadingExercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpacedRepetitionItem" ADD CONSTRAINT "SpacedRepetitionItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpacedRepetitionItem" ADD CONSTRAINT "SpacedRepetitionItem_wrongQuestionId_fkey" FOREIGN KEY ("wrongQuestionId") REFERENCES "ExamWrongQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpacedRepetitionItem" ADD CONSTRAINT "SpacedRepetitionItem_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpacedRepetitionItem" ADD CONSTRAINT "SpacedRepetitionItem_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetScore" ADD CONSTRAINT "TargetScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetScore" ADD CONSTRAINT "TargetScore_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStreak" ADD CONSTRAINT "UserStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionBank" ADD CONSTRAINT "QuestionBank_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionBankItem" ADD CONSTRAINT "QuestionBankItem_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES "QuestionBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInsight" ADD CONSTRAINT "AIInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicPrerequisite" ADD CONSTRAINT "TopicPrerequisite_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicPrerequisite" ADD CONSTRAINT "TopicPrerequisite_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicKazanim" ADD CONSTRAINT "TopicKazanim_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KazanimProgress" ADD CONSTRAINT "KazanimProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KazanimProgress" ADD CONSTRAINT "KazanimProgress_kazanimId_fkey" FOREIGN KEY ("kazanimId") REFERENCES "TopicKazanim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicConcept" ADD CONSTRAINT "TopicConcept_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConceptNode" ADD CONSTRAINT "ConceptNode_parentTopicId_fkey" FOREIGN KEY ("parentTopicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DependencyEdge" ADD CONSTRAINT "DependencyEdge_parentNodeId_fkey" FOREIGN KEY ("parentNodeId") REFERENCES "ConceptNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DependencyEdge" ADD CONSTRAINT "DependencyEdge_childNodeId_fkey" FOREIGN KEY ("childNodeId") REFERENCES "ConceptNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCognitiveState" ADD CONSTRAINT "UserCognitiveState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCognitiveState" ADD CONSTRAINT "UserCognitiveState_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "ConceptNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

