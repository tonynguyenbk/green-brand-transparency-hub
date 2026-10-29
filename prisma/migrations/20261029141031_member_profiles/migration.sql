-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "interests" "EsgPillar"[] DEFAULT ARRAY[]::"EsgPillar"[],
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "profileCompletedAt" TIMESTAMP(3),
ADD COLUMN     "showActivity" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "MemberPhoto" (
    "memberId" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberPhoto_pkey" PRIMARY KEY ("memberId")
);

-- AddForeignKey
ALTER TABLE "MemberPhoto" ADD CONSTRAINT "MemberPhoto_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
