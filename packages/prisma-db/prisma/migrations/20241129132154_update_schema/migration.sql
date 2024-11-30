/*
  Warnings:

  - Added the required column `blackPlayerId` to the `ChessResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `blackPlayerName` to the `ChessResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whitePlayerId` to the `ChessResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whitePlayerName` to the `ChessResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChessResult" ADD COLUMN     "blackPlayerId" TEXT NOT NULL,
ADD COLUMN     "blackPlayerName" TEXT NOT NULL,
ADD COLUMN     "whitePlayerId" TEXT NOT NULL,
ADD COLUMN     "whitePlayerName" TEXT NOT NULL;
