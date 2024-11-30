/*
  Warnings:

  - You are about to drop the column `chessGameId` on the `Player` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_chessGameId_fkey";

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "chessGameId";

-- CreateTable
CREATE TABLE "ChessGamePlayer" (
    "playerId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,

    CONSTRAINT "ChessGamePlayer_pkey" PRIMARY KEY ("playerId","gameId")
);

-- AddForeignKey
ALTER TABLE "ChessGamePlayer" ADD CONSTRAINT "ChessGamePlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChessGamePlayer" ADD CONSTRAINT "ChessGamePlayer_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "ChessGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
