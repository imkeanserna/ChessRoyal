-- DropIndex
DROP INDEX "ChessGame_id_key";

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
