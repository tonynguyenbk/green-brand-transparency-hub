/*
  Warnings:

  - You are about to drop the column `submittedAt` on the `ResearchResponse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ResearchResponse" DROP COLUMN "submittedAt",
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
