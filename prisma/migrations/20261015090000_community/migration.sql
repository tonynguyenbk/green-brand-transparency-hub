-- CreateEnum
CREATE TYPE "EsgPillar" AS ENUM ('E', 'S', 'G');

-- CreateEnum
CREATE TYPE "NewsSentiment" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "EsgSource" ADD COLUMN     "pillar" "EsgPillar",
ADD COLUMN     "sentiment" "NewsSentiment",
ADD COLUMN     "submissionId" TEXT;

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityRating" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "environmental" DOUBLE PRECISION NOT NULL,
    "social" DOUBLE PRECISION NOT NULL,
    "governance" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceVote" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "reliable" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleSubmission" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pillar" "EsgPillar" NOT NULL,
    "sentiment" "NewsSentiment" NOT NULL,
    "summary" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_provider_subject_key" ON "Member"("provider", "subject");

-- CreateIndex
CREATE INDEX "CommunityRating_brandId_hidden_idx" ON "CommunityRating"("brandId", "hidden");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityRating_brandId_memberId_key" ON "CommunityRating"("brandId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "SourceVote_sourceId_memberId_key" ON "SourceVote"("sourceId", "memberId");

-- CreateIndex
CREATE INDEX "ArticleSubmission_status_createdAt_idx" ON "ArticleSubmission"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleSubmission_brandId_memberId_url_key" ON "ArticleSubmission"("brandId", "memberId", "url");

-- CreateIndex
CREATE UNIQUE INDEX "EsgSource_submissionId_key" ON "EsgSource"("submissionId");

-- AddForeignKey
ALTER TABLE "EsgSource" ADD CONSTRAINT "EsgSource_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ArticleSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityRating" ADD CONSTRAINT "CommunityRating_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityRating" ADD CONSTRAINT "CommunityRating_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceVote" ADD CONSTRAINT "SourceVote_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "EsgSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceVote" ADD CONSTRAINT "SourceVote_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleSubmission" ADD CONSTRAINT "ArticleSubmission_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleSubmission" ADD CONSTRAINT "ArticleSubmission_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

