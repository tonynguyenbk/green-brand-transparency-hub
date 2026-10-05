-- CreateEnum
CREATE TYPE "BrandStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('CANDIDATE', 'IN_REVIEW', 'VERIFIED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('CANDIDATE', 'IN_REVIEW', 'VERIFIED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('VERIFIED', 'PARTIALLY_VERIFIED', 'SELF_DECLARED', 'UNVERIFIED', 'EXPIRED', 'PENDING_REVIEW');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('SUSTAINABILITY_REPORT', 'ESG_REPORT', 'ANNUAL_REPORT', 'SUSTAINABILITY_WEBPAGE', 'PRODUCT_PAGE', 'REGULATORY_FILING', 'CLIMATE_REPORT', 'CERTIFICATION_DATABASE', 'ASSURANCE_STATEMENT', 'THIRD_PARTY_AUDIT', 'ACADEMIC_PUBLICATION', 'NGO_REPORT', 'GOVERNMENT_PUBLICATION', 'NEWS_ARTICLE', 'MARKETING_MATERIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "VerificationLevel" AS ENUM ('SELF_DECLARED', 'EXTERNAL_REFERENCE', 'RECOGNIZED_CERTIFICATION', 'INDEPENDENT_ASSURANCE');

-- CreateEnum
CREATE TYPE "EvidenceStrength" AS ENUM ('STRONG', 'MODERATE', 'LIMITED', 'NOT_FOUND');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "MissingDataState" AS ENUM ('AVAILABLE', 'NOT_AVAILABLE', 'NOT_FOUND', 'NOT_APPLICABLE', 'PENDING_REVIEW');

-- CreateEnum
CREATE TYPE "DisclosureLevel" AS ENUM ('ABSENT', 'PARTIAL', 'CLEAR');

-- CreateEnum
CREATE TYPE "DisclosureTopic" AS ENUM ('SUSTAINABILITY_REPORT', 'CARBON_EMISSIONS', 'MATERIAL_SOURCING', 'SUPPLY_CHAIN', 'WASTE_RECYCLING', 'WATER_RESOURCE_USE', 'METHODOLOGY');

-- CreateEnum
CREATE TYPE "SustainabilityCategory" AS ENUM ('MATERIALS', 'PACKAGING', 'CARBON_CLIMATE', 'ENERGY', 'WATER', 'WASTE_CIRCULARITY', 'SUPPLY_CHAIN', 'CHEMICALS_INGREDIENTS', 'BIODIVERSITY', 'GENERAL', 'OTHER');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "StudyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED');

-- CreateTable
CREATE TABLE "Industry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "country" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "description" TEXT,
    "isFictional" BOOLEAN NOT NULL DEFAULT false,
    "status" "BrandStatus" NOT NULL DEFAULT 'DRAFT',
    "targetsDataState" "MissingDataState" NOT NULL DEFAULT 'PENDING_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastReviewedAt" TIMESTAMP(3),

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "publisher" TEXT,
    "url" TEXT,
    "publicationDate" TIMESTAMP(3),
    "accessedAt" TIMESTAMP(3),
    "verificationLevel" "VerificationLevel" NOT NULL DEFAULT 'SELF_DECLARED',
    "archivedUrl" TEXT,
    "notes" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'CANDIDATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "claimText" TEXT NOT NULL,
    "claimCategory" "SustainabilityCategory" NOT NULL DEFAULT 'GENERAL',
    "claimDate" TIMESTAMP(3),
    "specificityScore" INTEGER,
    "evidenceScore" INTEGER,
    "measurabilityScore" INTEGER,
    "verificationScore" INTEGER,
    "contextScore" INTEGER,
    "riskScore" DOUBLE PRECISION,
    "riskLevel" "RiskLevel",
    "methodologyNote" TEXT,
    "verificationNote" TEXT,
    "reviewerNotes" TEXT,
    "origin" TEXT NOT NULL DEFAULT 'manual',
    "status" "ClaimStatus" NOT NULL DEFAULT 'CANDIDATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimSource" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "evidenceExcerpt" TEXT,
    "pageNumber" TEXT,
    "evidenceStrength" "EvidenceStrength" NOT NULL DEFAULT 'LIMITED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "certificationBody" TEXT,
    "scope" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "sourceId" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SustainabilityTarget" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "SustainabilityCategory" NOT NULL DEFAULT 'GENERAL',
    "metric" TEXT,
    "baselineValue" DOUBLE PRECISION,
    "baselineYear" INTEGER,
    "targetValue" DOUBLE PRECISION,
    "targetYear" INTEGER,
    "latestProgress" DOUBLE PRECISION,
    "progressYear" INTEGER,
    "isSpecific" BOOLEAN NOT NULL DEFAULT false,
    "hasHistoricalData" BOOLEAN NOT NULL DEFAULT false,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SustainabilityTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisclosureItem" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "topic" "DisclosureTopic" NOT NULL,
    "state" "MissingDataState" NOT NULL DEFAULT 'PENDING_REVIEW',
    "level" "DisclosureLevel",
    "sourceId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisclosureItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessibilityAudit" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "clickCount" INTEGER,
    "searchabilityScore" INTEGER,
    "readabilityScore" INTEGER,
    "evidenceLinkageScore" INTEGER,
    "notes" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessibilityAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandScore" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "disclosureScore" DOUBLE PRECISION NOT NULL,
    "evidenceScore" DOUBLE PRECISION NOT NULL,
    "verificationScore" DOUBLE PRECISION NOT NULL,
    "targetsScore" DOUBLE PRECISION NOT NULL,
    "accessibilityScore" DOUBLE PRECISION NOT NULL,
    "averageClaimRisk" DOUBLE PRECISION,
    "claimCount" INTEGER NOT NULL,
    "confidenceLevel" "ConfidenceLevel" NOT NULL,
    "sourceCount" INTEGER NOT NULL,
    "methodologyVersion" TEXT NOT NULL,
    "detailsJson" JSONB,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MethodologyVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weightsJson" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MethodologyVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "supabaseUserId" TEXT,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "role" "AdminRole" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchStudy" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "consentText" TEXT NOT NULL,
    "likertScale" INTEGER NOT NULL DEFAULT 5,
    "status" "StudyStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchStudy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchCondition" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "brandId" TEXT,

    CONSTRAINT "ResearchCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchResponse" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "conditionId" TEXT NOT NULL,
    "participantCode" TEXT NOT NULL,
    "consentGiven" BOOLEAN NOT NULL,
    "brandTrust" DOUBLE PRECISION,
    "purchaseIntention" DOUBLE PRECISION,
    "perceivedTransparency" DOUBLE PRECISION,
    "perceivedGreenwashing" DOUBLE PRECISION,
    "itemResponsesJson" JSONB,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Industry_name_key" ON "Industry"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Industry_slug_key" ON "Industry"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "Brand_industryId_idx" ON "Brand"("industryId");

-- CreateIndex
CREATE INDEX "Brand_status_idx" ON "Brand"("status");

-- CreateIndex
CREATE INDEX "Source_brandId_idx" ON "Source"("brandId");

-- CreateIndex
CREATE INDEX "Claim_brandId_idx" ON "Claim"("brandId");

-- CreateIndex
CREATE INDEX "Claim_status_idx" ON "Claim"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimSource_claimId_sourceId_key" ON "ClaimSource"("claimId", "sourceId");

-- CreateIndex
CREATE INDEX "Certification_brandId_idx" ON "Certification"("brandId");

-- CreateIndex
CREATE INDEX "SustainabilityTarget_brandId_idx" ON "SustainabilityTarget"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "DisclosureItem_brandId_topic_key" ON "DisclosureItem"("brandId", "topic");

-- CreateIndex
CREATE INDEX "AccessibilityAudit_brandId_reviewedAt_idx" ON "AccessibilityAudit"("brandId", "reviewedAt");

-- CreateIndex
CREATE INDEX "BrandScore_brandId_calculatedAt_idx" ON "BrandScore"("brandId", "calculatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MethodologyVersion_version_key" ON "MethodologyVersion"("version");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_supabaseUserId_key" ON "AdminUser"("supabaseUserId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchStudy_slug_key" ON "ResearchStudy"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchCondition_studyId_key_key" ON "ResearchCondition"("studyId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchResponse_studyId_participantCode_key" ON "ResearchResponse"("studyId", "participantCode");

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimSource" ADD CONSTRAINT "ClaimSource_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimSource" ADD CONSTRAINT "ClaimSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SustainabilityTarget" ADD CONSTRAINT "SustainabilityTarget_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SustainabilityTarget" ADD CONSTRAINT "SustainabilityTarget_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisclosureItem" ADD CONSTRAINT "DisclosureItem_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisclosureItem" ADD CONSTRAINT "DisclosureItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessibilityAudit" ADD CONSTRAINT "AccessibilityAudit_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandScore" ADD CONSTRAINT "BrandScore_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchCondition" ADD CONSTRAINT "ResearchCondition_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "ResearchStudy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchCondition" ADD CONSTRAINT "ResearchCondition_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchResponse" ADD CONSTRAINT "ResearchResponse_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "ResearchStudy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchResponse" ADD CONSTRAINT "ResearchResponse_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "ResearchCondition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
