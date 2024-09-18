"use client";

import { GameMessages, GameResult, GameStatus, KingStatus } from "@repo/chess/gameStatus";
import { gameMetadataAtom, remoteGameIdAtom } from "@repo/store/gameMetadata";
import { useSocketContext } from "@repo/ui/context/socketContext";
import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Players } from "./ChessMenu";
import ChessBoard from "./ChessBoard";
import { Chess, Move } from "chess.js";
import { isPromoting } from "@repo/chess/isPromoting";
import { isCheckAtom, isGameOverAtom, movesAtom } from "@repo/store/chessBoard";
import { userAtom } from "@repo/store/user";
import { useRouter } from "next/navigation";
import TimerCountDown from "./chess/TimerCountDown";
import MovesTable from "./chess/MovesTable";
import ModalGameOver from "./ui/ModalGameOver";

interface ChessGameProps {
  gameId: string
}

const ChessGame: React.FC<ChessGameProps> = ({ gameId }) => {
  const { socket, sendMessage } = useSocketContext();
  const { blackPlayer, whitePlayer } = useRecoilValue<Players>(gameMetadataAtom);
  const remoteGameId = useRecoilValue(remoteGameIdAtom);
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const setMoves = useSetRecoilState(movesAtom);
  const user = useRecoilValue(userAtom);
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [player1ConsumeTimer, setPlayer1ConsumeTimer] = useState(blackPlayer.remainingTime);
  const [player2ConsumeTimer, setPlayer2ConsumeTimer] = useState(whitePlayer.remainingTime);
  const [isCheck, setIsCheck] = useRecoilState(isCheckAtom);
  const [isGameOver, setIsGameOver] = useRecoilState(isGameOverAtom);
  const [open, setOpen] = useState(false);
  const [wonBy, setWonBy] = useState<GameStatus | null>(null);
  // const [playerWon, setPlayerWon] = useState<string | null>(null);

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
            setPlayer1ConsumeTimer(payload.player1RemainingTime);
            setPlayer2ConsumeTimer(payload.player2RemainingTime);
            setIsCheck({
              king_status: KingStatus.SAFE,
              player: ""
            });
          } catch (error) {
            console.log("Error", error);
          }
          break;
        case GameMessages.KING_STATUS:
          console.log(payload);
          setIsCheck({
            king_status: payload.kingStatus,
            player: payload.player
          });
          break;
        case GameMessages.GAME_ENDED:
          // do something
          console.log(JSON.parse(messageEvent.data))
          console.log(payload);

          switch (payload.status) {
            case GameStatus.COMPLETED:
              // setPlayerWon(payload.result === GameResult.DRAW ? GameResult.DRAW : payload.result === GameResult.WHITE_WINS ? GameResult.WHITE_WINS : GameResult.BLACK_WINS);
              console.log(payload.result === GameResult.WHITE_WINS ? GameResult.WHITE_WINS : GameResult.BLACK_WINS)
              setWonBy(GameStatus.COMPLETED);
              setIsGameOver({
                isGameOver: true,
                playerWon: payload.result === GameResult.WHITE_WINS ? GameResult.WHITE_WINS : GameResult.BLACK_WINS
              });
              setOpen(true);
              console.log(wonBy);
              break;
            case GameStatus.DRAW:
              alert("DRAW");
              break;
            case GameStatus.TIME_UP:
              setWonBy(GameStatus.TIME_UP);
              setIsGameOver({
                isGameOver: true,
                playerWon: payload.result
              });
              setOpen(true);
              break;
            case GameStatus.ABANDONED:
              break;
            case GameStatus.PLAYER_EXIT:
              alert("player exit");
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
    <div className="w-full h-full">
      {isGameOver.playerWon && isGameOver.playerWon && wonBy && <ModalGameOver
        playerWon={isGameOver.playerWon === GameResult.DRAW ? GameResult.DRAW : isGameOver.playerWon}
        wonBy={wonBy === GameStatus.COMPLETED ? "checkmate" : wonBy}
        open={open}
        setOpen={setOpen}
      />}
      <div>
        <TimerCountDown
          duration={user?.id !== blackPlayer.id ? player1ConsumeTimer : player2ConsumeTimer}
          isPaused={(chess.turn() === (user?.id === whitePlayer.id ? 'w' : 'b'))}
        />
        <ChessBoard
          started={started}
          setBoard={setBoard}
          gameId={gameId}
          board={board}
          chess={chess}
          sendMessage={sendMessage}
          myColor={user?.id === whitePlayer.id ? 'w' : 'b'}
        />
        <TimerCountDown
          duration={user?.id === whitePlayer.id ? player1ConsumeTimer : player2ConsumeTimer}
          isPaused={!(chess.turn() === (user?.id === whitePlayer.id ? 'w' : 'b'))}
        />
      </div>
      <MovesTable />
    </div>
  )
}

export default ChessGame;
