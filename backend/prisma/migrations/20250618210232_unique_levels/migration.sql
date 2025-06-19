/*
  Warnings:

  - A unique constraint covering the columns `[coordinateX,coordinateY,levelId]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[imageNumber,levelId]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[levelNumber]` on the table `Level` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `levelNumber` to the `Level` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_levelId_fkey";

-- DropForeignKey
ALTER TABLE "Leaderboard" DROP CONSTRAINT "Leaderboard_levelId_fkey";

-- DropIndex
DROP INDEX "Answer_coordinateX_coordinateY_key";

-- AlterTable
ALTER TABLE "Level" ADD COLUMN     "levelNumber" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Answer_coordinateX_coordinateY_levelId_key" ON "Answer"("coordinateX", "coordinateY", "levelId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_imageNumber_levelId_key" ON "Answer"("imageNumber", "levelId");

-- CreateIndex
CREATE UNIQUE INDEX "Level_levelNumber_key" ON "Level"("levelNumber");

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;
