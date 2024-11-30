/*
  Warnings:

  - Made the column `winnerId` on table `ChessResult` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ChessResult" DROP CONSTRAINT "ChessResult_winnerId_fkey";

-- AlterTable
ALTER TABLE "ChessResult" ADD COLUMN     "playerId" TEXT,
ALTER COLUMN "winnerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ChessResult" ADD CONSTRAINT "ChessResult_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
