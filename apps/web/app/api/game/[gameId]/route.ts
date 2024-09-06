import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: {
  params: { gameId: string }
}) {
  const gameId: string = params.gameId;
  // Do authentication here
  // Get the data through database
  console.log(gameId);
  return NextResponse.json({
    started: true
  })
}
