-- AlterTable
ALTER TABLE "ResearchResponse" ADD COLUMN     "durationSeconds" INTEGER;

-- AlterTable
ALTER TABLE "ResearchStudy" ADD COLUMN     "debriefText" TEXT,
ADD COLUMN     "stimulusJson" JSONB;
