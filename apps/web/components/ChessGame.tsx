"use client";

import { GameStatus } from "@repo/chess/gameStatus";
import { Button } from "@repo/ui/components/ui/button";
import { useSocketContext } from "@repo/ui/context/socketContext";
import React, { useEffect } from "react";

interface ChessGameProps {
  gameId: string
}

const ChessGame: React.FC<ChessGameProps> = ({ gameId }) => {
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket) {
      console.log("no socket");
      return;
    }

    socket.onmessage = (messageEvent) => {
      const { event, payload } = JSON.parse(messageEvent.data);
      switch (event) {
        case GameStatus.MOVE:
          // do something
          console.log("move", payload);
          break;
        case GameStatus.GAME_OVER:
          // do something
          break;
        case GameStatus.WAITING:
          // do something
          break;
        default:
          break;
      }
    };
  }, [socket]);

  const moveHandler = () => {
    if (!socket) {
      console.log("no socket");
      return
    }
    socket.send(JSON.stringify({
      event: "move",
      gameId: gameId,
      data: {
        from: "e2",
        to: "e4"
      }
    }));
  };

  return (
    <div>
      <Button onClick={moveHandler}>Move</Button>
    </div>
  )
}

export default ChessGame;
