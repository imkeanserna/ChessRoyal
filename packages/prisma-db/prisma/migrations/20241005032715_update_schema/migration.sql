/*
  Warnings:

  - Changed the type of `status` on the `ChessGame` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "ChessGame" DROP COLUMN "status",
ADD COLUMN     "status" "GameStatus" NOT NULL;

-- DropEnum
DROP TYPE "GameStatusType";
