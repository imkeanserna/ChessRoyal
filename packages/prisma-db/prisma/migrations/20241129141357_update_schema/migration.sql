/*
  Warnings:

  - Added the required column `blackScore` to the `ChessResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whiteScore` to the `ChessResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChessResult" ADD COLUMN     "blackScore" INTEGER NOT NULL,
ADD COLUMN     "whiteScore" INTEGER NOT NULL;
