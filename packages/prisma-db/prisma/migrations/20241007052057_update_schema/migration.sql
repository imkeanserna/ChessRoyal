-- DropForeignKey
ALTER TABLE "ChessResult" DROP CONSTRAINT "ChessResult_winnerId_fkey";

-- AlterTable
ALTER TABLE "ChessResult" ALTER COLUMN "winnerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ChessResult" ADD CONSTRAINT "ChessResult_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
