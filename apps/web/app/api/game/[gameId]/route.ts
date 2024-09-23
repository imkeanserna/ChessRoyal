import { NextRequest, NextResponse } from "next/server";
import db from "@repo/db/client";

export async function GET(req: NextRequest, { params }: {
  params: { gameId: string }
}) {
  const gameId: string = params.gameId;
  // Do authentication here
  // Get the data through database
  // make this have a type so that we know what we are getting back
  const game = await db.game.findUnique({
    where: {
      id: gameId
    }
  });

  return NextResponse.json({
    game
  })
}
