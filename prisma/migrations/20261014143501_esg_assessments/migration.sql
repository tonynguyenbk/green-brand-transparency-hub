-- CreateTable
CREATE TABLE "EsgAssessment" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "environmental" DOUBLE PRECISION NOT NULL,
    "social" DOUBLE PRECISION NOT NULL,
    "governance" DOUBLE PRECISION NOT NULL,
    "overall" DOUBLE PRECISION NOT NULL,
    "whyVi" TEXT NOT NULL,
    "whyEn" TEXT NOT NULL,
    "envNoteVi" TEXT NOT NULL,
    "envNoteEn" TEXT NOT NULL,
    "socNoteVi" TEXT NOT NULL,
    "socNoteEn" TEXT NOT NULL,
    "govNoteVi" TEXT NOT NULL,
    "govNoteEn" TEXT NOT NULL,
    "methodologyVersion" TEXT NOT NULL DEFAULT 'esg-1.0',
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EsgAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EsgSource" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "needsReplacement" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EsgSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EsgAssessment_brandId_isCurrent_idx" ON "EsgAssessment"("brandId", "isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "EsgSource_brandId_url_key" ON "EsgSource"("brandId", "url");

-- AddForeignKey
ALTER TABLE "EsgAssessment" ADD CONSTRAINT "EsgAssessment_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EsgSource" ADD CONSTRAINT "EsgSource_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
