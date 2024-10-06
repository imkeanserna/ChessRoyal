import { NextRequest, NextResponse } from "next/server";
import db from "@repo/db/client";

export async function GET(req: NextRequest, { params }: {
  params: { gameId: string }
}) {
  const gameId: string = params.gameId;
  console.log(gameId)
  // Do authentication here
  // Get the data through database
  // make this have a type so that we know what we are getting back
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
          name: true
        }
      }
    }
  });

  return NextResponse.json({
    game
  })
}
