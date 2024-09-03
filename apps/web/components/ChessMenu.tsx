"use client";

import { GameStatus } from "@repo/chess/gameStatus";
import { Button } from "@repo/ui/components/ui/button";
import { useSocketContext } from "@repo/ui/context/socketContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import WaitingForOpponent from "./WaitingForOpponent";
import { Player } from "@repo/chess/playerTypes";
import { useSetRecoilState } from "recoil";
import { gameMetadataAtom, remoteGameIdAtom } from "@repo/store/gameMetadata";

export interface Players {
  blackPlayer: Player;
  whitePlayer: Player;
}

const ChessMenu: React.FC = () => {
  const { socket, sendMessage } = useSocketContext();
  const router = useRouter();

  const setgameMetadataAtom = useSetRecoilState<Players>(gameMetadataAtom);
  const setRemoteGameIdAtom = useSetRecoilState(remoteGameIdAtom);
  const [isWaiting, setIsWaiting] = useState(false);

  const handleGameAdded = useCallback(({ gameId }: { gameId: string }) => {
    setRemoteGameIdAtom(gameId);
  }, []);

  const handleGameInit = useCallback((payload: any) => {
    setIsWaiting(false);
    setgameMetadataAtom({
      whitePlayer: {
        id: payload.whitePlayer.id,
        name: payload.whitePlayer.name,
        isGuest: true
      },
      blackPlayer: {
        id: payload.blackPlayer.id,
        name: payload.blackPlayer.name,
        isGuest: true
      }
    });

    router.push(`/play/${payload.gameId}`);
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
          setRemoteGameIdAtom(payload.gameId);
          handleGameInit(payload);
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
