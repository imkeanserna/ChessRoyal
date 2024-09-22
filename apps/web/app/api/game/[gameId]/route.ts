import { NextRequest, NextResponse } from "next/server";
import db from "@repo/db/client";

export async function GET(req: NextRequest, { params }: {
  params: { gameId: string }
}) {
  const gameId: string = params.gameId;
  // Do authentication here
  // Get the data through database
  const game = await db.game.findUnique({
    where: {
      id: gameId
    }
  });

  console.log(game);

  return NextResponse.json({
    game
  })
}
