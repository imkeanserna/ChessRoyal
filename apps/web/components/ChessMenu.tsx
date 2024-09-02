"use client";

import { GameStatus } from "@repo/chess/gameStatus";
import { Button } from "@repo/ui/components/ui/button";
import { useSocketContext } from "@repo/ui/context/socketContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import WaitingForOpponent from "./WaitingForOpponent";

const ChessMenu: React.FC = () => {
  const { socket, sendMessage } = useSocketContext();
  const router = useRouter();

  const [remoteGameId, setRemoteGameId] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);

  const handleGameAdded = useCallback(({ gameId }: { gameId: string }) => {
    console.log("game added", gameId);
    setRemoteGameId(gameId);
  }, []);

  useEffect(() => {
    if (!socket) {
      console.log("no socket");
      return;
    }

    socket.onmessage = (messageEvent) => {
      const { event, payload } = JSON.parse(messageEvent.data);

      switch (event) {
        case GameStatus.INIT_GAME:
          // an id and initialize those store/atoms
          setIsWaiting(false);
          router.push(`/play/${payload.gameId}`);
          break;
        case GameStatus.GAME_ADDED:
          setIsWaiting(true);
          handleGameAdded({ gameId: payload.gameId });
          break;
        default:
          break;
      }
    }
  }, [socket]);

  const handleFindGame = () => {
    if (!socket) {
      console.log("no socket");
      return
    }
    sendMessage("init_game");
  }

  return (
    <div>
      <WaitingForOpponent isWaiting={isWaiting} />
      <Button>
        Create Game
      </Button>
      <Button disabled={isWaiting} onClick={handleFindGame}>
        Play as Guest
      </Button>
    </div>
  )
}

export default ChessMenu;
