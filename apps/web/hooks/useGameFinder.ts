"use client";

import { useRouter } from 'next/navigation';
import { useSocketContext } from "@repo/ui/context/socketContext";
import { GameMessages } from "@repo/chess/gameStatus";
import { useSetRecoilState } from 'recoil';
import {
  gameMetadataAtom,
  remoteGameIdAtom,
  gameResignedAtom,
} from '@repo/store/gameMetadata';
import { isGameOverAtom, movesAtom } from "@repo/store/chessBoard";
import { userAtom } from "@repo/store/user";
import { useCallback, useEffect, useState } from 'react';

interface Players {
  whitePlayer: {
    id: string;
    name: string;
    isGuest: boolean;
    remainingTime: number;
  };
  blackPlayer: {
    id: string;
    name: string;
    isGuest: boolean;
    remainingTime: number;
  };
}

export const useGameFinder = () => {
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
  }, [setRemoteGameIdAtom]);

  const handleGameInit = useCallback((payload: any) => {
    setIsWaiting(false);

    const user: { id: string } | null = JSON.parse(localStorage.getItem("user") as string);
    if (!user || user.id !== payload.whitePlayer.id) {
      // set the second player as a black player
      setUser({
        id: payload.blackPlayer.id
      });
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

    router.push(`/play/${payload.gameId}`);
  }, [
    setUser,
    setgameMetadataAtom,
    setMoves,
    setIsResigned,
    gameOver,
    router
  ]);

  useEffect(() => {
    if (!socket) return;

    const handleSocketMessage = (messageEvent: MessageEvent) => {
      const { event, payload } = JSON.parse(messageEvent.data);

      switch (event) {
        case GameMessages.INIT_GAME:
          setRemoteGameIdAtom(payload.gameId);
          handleGameInit(payload);
          setIsWaiting(true);
          break;
        case GameMessages.GAME_ADDED:
          setIsWaiting(true);
          setUser({
            id: payload.userId
          });
          handleGameAdded({ gameId: payload.gameId });
          break;
        case GameMessages.ERROR:
          setIsWaiting(false);
          setOngoingGameId(payload?.gameId || null);
          setIsModalOpen(true);
          break;
        default:
          break;
      }
    };

    socket.onmessage = handleSocketMessage;

    return () => {
      socket.onmessage = null;
    };
  }, [socket, handleGameInit, handleGameAdded, setUser, setRemoteGameIdAtom]);

  const findGame = useCallback(() => {
    if (!socket) {
      console.log("no socket");
      return;
    }
    sendMessage(GameMessages.INIT_GAME);
  }, [socket, sendMessage]);

  const quitGame = useCallback(() => {
    setIsModalOpen(false);
    sendMessage(GameMessages.USER_RESIGNED, {
      gameId: ongoingGameId,
    });
  }, [sendMessage, ongoingGameId]);

  const resumeGame = useCallback(() => {
    if (ongoingGameId) {
      router.push(`/play/${ongoingGameId}`);
    }
    setIsModalOpen(false);
  }, [ongoingGameId, router]);

  return {
    isWaiting,
    isModalOpen,
    ongoingGameId,
    setIsModalOpen,
    findGame,
    quitGame,
    resumeGame
  };
};
