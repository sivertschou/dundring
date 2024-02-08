/*
  Warnings:

  - You are about to drop the column `mail` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_mail_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "mail";
