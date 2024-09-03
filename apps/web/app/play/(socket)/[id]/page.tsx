"use client";

import ChessGame from "@/components/ChessGame";

export default function Page({ params }: { params: { id: string } }) {
  const gameId = params.id;

  return (
    <div>
      <ChessGame gameId={gameId} />
    </div>
  )
}
