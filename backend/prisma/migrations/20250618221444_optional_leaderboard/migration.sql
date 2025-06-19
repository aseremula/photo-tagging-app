/*
  Warnings:

  - You are about to drop the column `leaderboardId` on the `Level` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Level" DROP CONSTRAINT "Level_leaderboardId_fkey";

-- DropIndex
DROP INDEX "Level_leaderboardId_key";

-- AlterTable
ALTER TABLE "Level" DROP COLUMN "leaderboardId";

-- AddForeignKey
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
