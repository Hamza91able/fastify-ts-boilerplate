/*
  Warnings:

  - You are about to drop the column `username` on the `Note` table. All the data in the column will be lost.
  - Added the required column `owner` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Note" DROP COLUMN "username",
ADD COLUMN     "owner" TEXT NOT NULL;
