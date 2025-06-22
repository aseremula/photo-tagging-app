/*
  Warnings:

  - You are about to alter the column `coordinateX` on the `Answer` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `coordinateY` on the `Answer` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Answer" ALTER COLUMN "coordinateX" SET DATA TYPE INTEGER,
ALTER COLUMN "coordinateY" SET DATA TYPE INTEGER;
