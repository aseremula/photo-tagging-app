-- CreateTable
CREATE TABLE "Level" (
    "id" SERIAL NOT NULL,
    "image" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "leaderboardId" INTEGER NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "imageNumber" INTEGER NOT NULL,
    "imageDesc" VARCHAR(255) NOT NULL,
    "coordinateX" DOUBLE PRECISION NOT NULL,
    "coordinateY" DOUBLE PRECISION NOT NULL,
    "levelId" INTEGER NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" SERIAL NOT NULL,
    "levelId" INTEGER NOT NULL,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "time" TEXT NOT NULL,
    "leaderboardId" INTEGER NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Level_leaderboardId_key" ON "Level"("leaderboardId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_levelId_key" ON "Answer"("levelId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_coordinateX_coordinateY_key" ON "Answer"("coordinateX", "coordinateY");

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_levelId_key" ON "Leaderboard"("levelId");

-- CreateIndex
CREATE UNIQUE INDEX "Score_leaderboardId_key" ON "Score"("leaderboardId");

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_leaderboardId_fkey" FOREIGN KEY ("leaderboardId") REFERENCES "Leaderboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
