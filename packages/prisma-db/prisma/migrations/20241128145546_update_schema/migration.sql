/*
  Warnings:

  - You are about to drop the `ChessGamePlayer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChessGamePlayer" DROP CONSTRAINT "ChessGamePlayer_gameId_fkey";

-- DropForeignKey
ALTER TABLE "ChessGamePlayer" DROP CONSTRAINT "ChessGamePlayer_playerId_fkey";

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "chessGameId" TEXT;

-- DropTable
DROP TABLE "ChessGamePlayer";

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_chessGameId_fkey" FOREIGN KEY ("chessGameId") REFERENCES "ChessGame"("id") ON DELETE SET NULL ON UPDATE CASCADE;
