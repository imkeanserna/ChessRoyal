/*
  Warnings:

  - You are about to drop the column `chessGameId` on the `Player` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_chessGameId_fkey";

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "chessGameId";

-- CreateTable
CREATE TABLE "PlayerChessGame" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "chessGameId" TEXT NOT NULL,

    CONSTRAINT "PlayerChessGame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerChessGame_playerId_chessGameId_key" ON "PlayerChessGame"("playerId", "chessGameId");

-- AddForeignKey
ALTER TABLE "PlayerChessGame" ADD CONSTRAINT "PlayerChessGame_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerChessGame" ADD CONSTRAINT "PlayerChessGame_chessGameId_fkey" FOREIGN KEY ("chessGameId") REFERENCES "ChessGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;
