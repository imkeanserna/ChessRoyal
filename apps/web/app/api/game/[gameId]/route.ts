import { NextRequest, NextResponse } from "next/server";
import db from "@repo/db/client";

export async function GET(req: NextRequest, { params }: {
  params: { gameId: string }
}) {
  const gameId: string = params.gameId;
  const game = await db.chessGame.findUnique({
    where: {
      id: gameId
    },
    select: {
      id: true,
      status: true,
      moves: true,
      currentBoard: true,
      turn: true,
      whitePlayerRemainingTime: true,
      blackPlayerRemainingTime: true,
      players: {
        select: {
          id: true,
          name: true,
          isGuest: true,
        }
      }
    }
  });

  if (!game) {
    return NextResponse.json({ error: "Game not found or unauthorized" }, { status: 403 });
  }

  return NextResponse.json({
    game
  })
}
