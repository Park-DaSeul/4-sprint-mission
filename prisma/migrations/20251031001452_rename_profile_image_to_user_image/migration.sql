/*
  Warnings:

  - You are about to drop the `ProfileImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ProfileImage" DROP CONSTRAINT "ProfileImage_userId_fkey";

-- DropTable
DROP TABLE "public"."ProfileImage";

-- CreateTable
CREATE TABLE "public"."UserImage" (
    "id" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "UserImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserImage_userId_key" ON "public"."UserImage"("userId");

-- AddForeignKey
ALTER TABLE "public"."UserImage" ADD CONSTRAINT "UserImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
