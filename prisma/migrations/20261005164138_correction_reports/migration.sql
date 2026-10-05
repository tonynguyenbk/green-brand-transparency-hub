-- CreateEnum
CREATE TYPE "CorrectionType" AS ENUM ('MISSING_SOURCE', 'INCORRECT_SOURCE', 'UPDATED_DATA', 'CLARIFICATION', 'OTHER');

-- CreateEnum
CREATE TYPE "CorrectionStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReporterRole" AS ENUM ('CONSUMER', 'BRAND_REPRESENTATIVE', 'RESEARCHER', 'OTHER');

-- CreateTable
CREATE TABLE "CorrectionReport" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "claimId" TEXT,
    "reportType" "CorrectionType" NOT NULL,
    "message" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "reporterRole" "ReporterRole" NOT NULL DEFAULT 'OTHER',
    "reporterEmail" TEXT,
    "status" "CorrectionStatus" NOT NULL DEFAULT 'OPEN',
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "CorrectionReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CorrectionReport_status_createdAt_idx" ON "CorrectionReport"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "CorrectionReport" ADD CONSTRAINT "CorrectionReport_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectionReport" ADD CONSTRAINT "CorrectionReport_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE SET NULL ON UPDATE CASCADE;
