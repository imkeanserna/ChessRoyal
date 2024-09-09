"use client";

import { GameMessages, GameResult, GameStatus } from "@repo/chess/gameStatus";
import { gameMetadataAtom, remoteGameIdAtom } from "@repo/store/gameMetadata";
import { useSocketContext } from "@repo/ui/context/socketContext";
import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Players } from "./ChessMenu";
import ChessBoard from "./ChessBoard";
import { Chess, Move } from "chess.js";
import { isPromoting } from "@repo/chess/isPromoting";
import { movesAtom } from "@repo/store/chessBoard";
import { userAtom } from "@repo/store/user";
import { useRouter } from "next/navigation";
import TimerCountDown from "./chess/TimerCountDown";

interface ChessGameProps {
  gameId: string
}

const ChessGame: React.FC<ChessGameProps> = ({ gameId }) => {
  const { socket, sendMessage } = useSocketContext();
  const gameMetadataState = useRecoilValue<Players>(gameMetadataAtom);
  const remoteGameId = useRecoilValue(remoteGameIdAtom);
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const setMoves = useSetRecoilState(movesAtom);
  const user = useRecoilValue(userAtom);
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [player1ConsumeTimer, setPlayer1ConsumeTimer] = useState(0);
  const [player2ConsumeTimer, setPlayer2ConsumeTimer] = useState(0);
  const initialTime = 10 * 60 * 1000;

  const startedGameHandler = async (gameId: string) => {
    try {
      const response = await fetch(`/api/game/${gameId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
      });
      if (response.ok) {
        const { started } = await response.json();
        if (!started) {
          router.push("/play/online");
          return;
        }
        setStarted(started);
      }
    } catch (error) {
      console.log("Error", error);
    }
  }

  useEffect(() => {
    if (!socket) {
      console.log("no socket");
      return;
    }

    startedGameHandler(gameId);

    if (user === null) {
      return;
    }

    socket.onmessage = (messageEvent) => {
      const { event, payload } = JSON.parse(messageEvent.data);
      let wonBy: GameResult | null = null;

      switch (event) {
        case GameMessages.MOVE:
          // do something
          try {
            if (isPromoting(chess, payload.move.from, payload.move.to)) {
              chess.move({
                from: payload.move.from,
                to: payload.move.to,
                promotion: 'q'
              });
            } else {
              chess.move({
                from: payload.move.from,
                to: payload.move.to
              });
            }
            setMoves((moves) => [...moves, payload.move]);
          } catch (error) {
            console.log("Error", error);
          }
          break;
        case GameMessages.GAME_ENDED:
          // do something
          console.log(JSON.parse(messageEvent.data))
          console.log(payload);

          switch (payload.status) {
            case GameStatus.COMPLETED:
              wonBy = payload.result === GameResult.DRAW ? GameResult.DRAW : payload.result === GameResult.WHITE_WINS ? GameResult.WHITE_WINS : GameResult.BLACK_WINS;
              console.log(wonBy);
              break;
            case GameStatus.DRAW:
              break;
            case GameStatus.TIME_UP:
              break;
            case GameStatus.ABANDONED:
              break;
            case GameStatus.PLAYER_EXIT:
              break;
          }
          break;
        case GameMessages.WAITING:
          // do something
          console.log("asdasd")
          break;
        default:
          break;
      }
    };
  }, [socket]);

  return (
    <div>
      <TimerCountDown duration={player2ConsumeTimer || initialTime} isPaused={(chess.turn() === (user?.id === gameMetadataState.whitePlayer.id ? 'w' : 'b'))} />
      <ChessBoard
        started={started}
        setBoard={setBoard}
        gameId={gameId}
        board={board}
        chess={chess}
        sendMessage={sendMessage}
        myColor={user?.id === gameMetadataState.whitePlayer.id ? 'w' : 'b'}
      />
      <TimerCountDown duration={player1ConsumeTimer || initialTime} isPaused={!(chess.turn() === (user?.id === gameMetadataState.whitePlayer.id ? 'w' : 'b'))} />
    </div>
  )
}

export default ChessGame;
