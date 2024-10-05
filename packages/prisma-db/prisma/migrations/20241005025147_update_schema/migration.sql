/*
  Warnings:

  - You are about to drop the `Game` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "GameResultType" AS ENUM ('WIN', 'DRAW', 'RESIGNATION', 'TIMEOUT');

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "chessGameId" TEXT,
ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "Game";

-- CreateTable
CREATE TABLE "ChessGame" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "GameStatus" NOT NULL,
    "currentBoard" TEXT NOT NULL,
    "turn" TEXT NOT NULL,
    "whitePlayerRemainingTime" INTEGER NOT NULL,
    "blackPlayerRemainingTime" INTEGER NOT NULL,

    CONSTRAINT "ChessGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChessMove" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "move" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChessMove_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChessResult" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "winnerId" TEXT NOT NULL,
    "resultType" "GameResultType" NOT NULL,
    "finishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChessResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChessGame_id_key" ON "ChessGame"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ChessResult_gameId_key" ON "ChessResult"("gameId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_chessGameId_fkey" FOREIGN KEY ("chessGameId") REFERENCES "ChessGame"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChessMove" ADD CONSTRAINT "ChessMove_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ChessGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChessMove" ADD CONSTRAINT "ChessMove_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChessResult" ADD CONSTRAINT "ChessResult_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ChessGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChessResult" ADD CONSTRAINT "ChessResult_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
