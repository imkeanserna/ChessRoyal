"use client";

import ChessGame from "@/components/ChessGame";
import { GameStatus } from "@repo/chess/gameStatus";
import { Button } from "@repo/ui/components/ui/button";
import { useSocketContext } from "@repo/ui/context/socketContext";
import { useEffect } from "react";

export default function Page({ params }: { params: { id: string } }) {
  const gameId = params.id;

  return (
    <div>
      <ChessGame gameId={gameId} />
    </div>
  )
}
