/*
  Warnings:

  - You are about to drop the column `publicId` on the `ArticleImage` table. All the data in the column will be lost.
  - You are about to drop the column `publicId` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `publicId` on the `UserImage` table. All the data in the column will be lost.
  - Added the required column `key` to the `ArticleImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `ProductImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `UserImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ArticleImage" DROP COLUMN "publicId",
ADD COLUMN     "key" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "publicId",
ADD COLUMN     "key" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserImage" DROP COLUMN "publicId",
ADD COLUMN     "key" TEXT NOT NULL;
