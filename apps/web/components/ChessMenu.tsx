"use client";

import { GameMessages } from "@repo/chess/gameStatus";
import { Button } from "@repo/ui/components/ui/button";
import { useSocketContext } from "@repo/ui/context/socketContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import WaitingForOpponent from "./WaitingForOpponent";
import { Player } from "@repo/chess/playerTypes";
import { useRecoilState, useSetRecoilState } from "recoil";
import { gameMetadataAtom, gameResignedAtom, remoteGameIdAtom } from "@repo/store/gameMetadata";
import { userAtom } from "@repo/store/user";
import { OngoingGameModal } from "./ui/OngoingGameModal";
import { isGameOverAtom, movesAtom } from "@repo/store/chessBoard";

export interface Players {
  blackPlayer: Player;
  whitePlayer: Player;
}

const ChessMenu: React.FC = () => {
  const { socket, sendMessage } = useSocketContext();
  const router = useRouter();

  const setgameMetadataAtom = useSetRecoilState<Players>(gameMetadataAtom);
  const setRemoteGameIdAtom = useSetRecoilState(remoteGameIdAtom);
  const setUser = useSetRecoilState(userAtom);
  const setMoves = useSetRecoilState(movesAtom);
  const setIsResigned = useSetRecoilState(gameResignedAtom);
  const gameOver = useSetRecoilState(isGameOverAtom);

  const [isWaiting, setIsWaiting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ongoingGameId, setOngoingGameId] = useState<string | null>(null);

  const handleGameAdded = useCallback(({ gameId }: { gameId: string }) => {
    setRemoteGameIdAtom(gameId);
  }, []);

  const handleGameInit = useCallback((payload: any) => {
    setIsWaiting(false);

    const user: { id: string } | null = JSON.parse(localStorage.getItem("user") as string);
    if (!user || user.id !== payload.whitePlayer.id) {
      // set the second player as a black player
      setUser({
        id: payload.blackPlayer.id
      })
    }

    setgameMetadataAtom({
      whitePlayer: {
        id: payload.whitePlayer.id,
        name: payload.whitePlayer.name,
        isGuest: payload.whitePlayer.isGuest,
        remainingTime: payload.whitePlayer.remainingTime
      },
      blackPlayer: {
        id: payload.blackPlayer.id,
        name: payload.blackPlayer.name,
        isGuest: payload.whitePlayer.isGuest,
        remainingTime: payload.blackPlayer.remainingTime
      }
    });

    setMoves([]);
    setIsResigned(false);
    gameOver({
      isGameOver: false,
      playerWon: null
    });

    // let say they initialize it into 10 minutes
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
        case GameMessages.INIT_GAME:
          // an id and initialize those store/atoms
          setRemoteGameIdAtom(payload.gameId);
          handleGameInit(payload);
          break;
        case GameMessages.GAME_ADDED:
          // setUser({
          //   id: payload.userId
          // })
          // initialize the firstPlayer which is white player
          setUser({
            id: payload.userId
          })
          setIsWaiting(true);
          handleGameAdded({ gameId: payload.gameId });
          break;
        case GameMessages.ERROR:
          setOngoingGameId(payload?.gameId || null);
          setIsModalOpen(true);
          break;
        default:
          break;
      }
    }
  }, [socket, handleGameInit]);

  const handleFindGame = () => {
    if (!socket) {
      console.log("no socket");
      return
    }
    sendMessage(GameMessages.INIT_GAME);
  }

  const handleQuitGame = () => {
    setIsModalOpen(false);
    sendMessage(GameMessages.USER_RESIGNED, {
      gameId: ongoingGameId,
    });
  };

  const handleResumeGame = () => {
    if (ongoingGameId) {
      router.push(`/play/${ongoingGameId}`);
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <WaitingForOpponent isWaiting={isWaiting} />
      <Button>
        Create Game
      </Button>
      <Button disabled={isWaiting} onClick={handleFindGame}>
        Play as Guest
      </Button>
      <OngoingGameModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        onQuit={handleQuitGame}
        onResume={handleResumeGame}
      />
    </div>
  )
}

export default ChessMenu;
