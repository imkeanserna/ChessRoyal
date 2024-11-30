/*
  Warnings:

  - You are about to drop the `PlayerChessGame` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PlayerChessGame" DROP CONSTRAINT "PlayerChessGame_chessGameId_fkey";

-- DropForeignKey
ALTER TABLE "PlayerChessGame" DROP CONSTRAINT "PlayerChessGame_playerId_fkey";

-- DropTable
DROP TABLE "PlayerChessGame";

-- CreateTable
CREATE TABLE "_ChessGameToPlayer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ChessGameToPlayer_AB_unique" ON "_ChessGameToPlayer"("A", "B");

-- CreateIndex
CREATE INDEX "_ChessGameToPlayer_B_index" ON "_ChessGameToPlayer"("B");

-- AddForeignKey
ALTER TABLE "_ChessGameToPlayer" ADD CONSTRAINT "_ChessGameToPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "ChessGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChessGameToPlayer" ADD CONSTRAINT "_ChessGameToPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
