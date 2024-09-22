"use client";

import { GameMessages, GameResult, GameStatus, KingStatus } from "@repo/chess/gameStatus";
import { gameMetadataAtom, gameMetadataSelector, remoteGameIdAtom } from "@repo/store/gameMetadata";
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
import { Button } from "@repo/ui/components/ui/button";

interface ChessGameProps {
  gameId: string;
}

const ChessGame: React.FC<ChessGameProps> = ({ gameId }) => {
  const { socket, sendMessage } = useSocketContext();
  const setRemoteGameId = useSetRecoilState(remoteGameIdAtom);
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const setMoves = useSetRecoilState(movesAtom);
  const [user, setUser] = useRecoilState(userAtom);
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [isCheck, setIsCheck] = useRecoilState(isCheckAtom);
  const [isGameOver, setIsGameOver] = useRecoilState(isGameOverAtom);
  const [open, setOpen] = useState(false);
  const [wonBy, setWonBy] = useState<GameStatus | null>(null);
  const setGameMetaDataAtom = useSetRecoilState<Players>(gameMetadataAtom);

  useEffect(() => {
    setRemoteGameId(gameId);
  }, [gameId, setRemoteGameId]);


  const { blackPlayer, whitePlayer } = useRecoilValue<Players | null>(gameMetadataSelector) || {};
  const [player1ConsumeTimer, setPlayer1ConsumeTimer] = useState(blackPlayer?.remainingTime || 0);
  const [player2ConsumeTimer, setPlayer2ConsumeTimer] = useState(whitePlayer?.remainingTime || 0);

  const startedGameHandler = async (gameId: string) => {
    try {
      const response = await fetch(`/api/game/${gameId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (response.ok) {
        const { game } = await response.json();
        if (!game.id) {
          router.push("/play/online");
          return;
        }
        setStarted(true);
      }
    } catch (error) {
      console.error("Error fetching game status:", error);
    }
  };

  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;

    const tryJoinRoom = () => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.log('Socket not open, retrying...');
        retryTimeout = setTimeout(tryJoinRoom, 1000);
        return;
      }

      if (gameId) {
        console.log('Joining room', gameId);
        startedGameHandler(gameId);
        sendMessage(GameMessages.JOIN_ROOM, { gameId });
      }
    };

    if (socket) {
      socket.onmessage = (messageEvent) => {
        const { event, payload } = JSON.parse(messageEvent.data);

        switch (event) {
          case GameMessages.JOIN_ROOM:
            handleJoinRoom(payload);
            break;
          case GameMessages.MOVE:
            handleMove(payload);
            break;
          case GameMessages.KING_STATUS:
            setIsCheck({ king_status: payload.kingStatus, player: payload.player });
            break;
          case GameMessages.GAME_ENDED:
            handleGameEnded(payload);
            break;
          case GameMessages.WAITING:
            console.log("Waiting for players...");
            break;
          default:
            console.warn("Unhandled message event:", event);
        }
      };

      if (socket.readyState === WebSocket.OPEN) {
        tryJoinRoom();
      } else {
        socket.addEventListener('open', tryJoinRoom);
      }
    }

    return () => {
      if (socket) {
        socket.removeEventListener('open', tryJoinRoom);
        socket.onmessage = null;
      }
      clearTimeout(retryTimeout);
    };
  }, [socket, chess]);

  const handleJoinRoom = (payload: any) => {
    setGameMetaDataAtom({
      whitePlayer: {
        id: payload.whitePlayer.id,
        name: payload.whitePlayer.name,
        isGuest: true,
        remainingTime: payload.whitePlayer.remainingTime,
      },
      blackPlayer: {
        id: payload.blackPlayer.id,
        name: payload.blackPlayer.name,
        isGuest: true,
        remainingTime: payload.blackPlayer.remainingTime,
      },
    });

    payload.moves.forEach((move: Move) => {
      chess.move(isPromoting(chess, move.from, move.to) ? { ...move, promotion: 'q' } : move);
    });

    setPlayer1ConsumeTimer(payload.whitePlayer.remainingTime);
    setPlayer2ConsumeTimer(payload.blackPlayer.remainingTime);
    setMoves(payload.moves);
  };

  const handleMove = (payload: any) => {
    try {
      chess.move(isPromoting(chess, payload.move.from, payload.move.to) ?
        { from: payload.move.from, to: payload.move.to, promotion: 'q' } :
        { from: payload.move.from, to: payload.move.to });
      setMoves(prev => [...prev, payload.move]);
      setPlayer1ConsumeTimer(payload.player1RemainingTime);
      setPlayer2ConsumeTimer(payload.player2RemainingTime);
      setIsCheck({ king_status: KingStatus.SAFE, player: "" });
    } catch (error) {
      console.error("Error processing move:", error);
    }
  };

  const handleGameEnded = (payload: any) => {
    console.log("Game ended:", payload);
    switch (payload.status) {
      case GameStatus.COMPLETED:
        setWonBy(GameStatus.COMPLETED);
        setIsGameOver({ isGameOver: true, playerWon: payload.result });
        setOpen(true);
        break;
      case GameStatus.DRAW:
        alert("DRAW");
        break;
      case GameStatus.TIME_UP:
        setWonBy(GameStatus.TIME_UP);
        setIsGameOver({ isGameOver: true, playerWon: payload.result });
        setOpen(true);
        break;
      case GameStatus.PLAYER_EXIT:
        alert("A player has exited the game.");
        break;
      default:
        console.warn("Unhandled game end status:", payload.status);
    }
  };

  return (
    <div className="w-full h-full">
      {isGameOver.playerWon && wonBy && (
        <ModalGameOver
          playerWon={isGameOver.playerWon === GameResult.DRAW ? GameResult.DRAW : isGameOver.playerWon}
          wonBy={wonBy === GameStatus.COMPLETED ? "checkmate" : wonBy}
          open={open}
          setOpen={setOpen}
        />
      )}
      <div>
        {blackPlayer && whitePlayer ? (
          <div>
            <TimerCountDown
              duration={user?.id === blackPlayer.id ? blackPlayer.remainingTime : whitePlayer.remainingTime}
              isPaused={chess.turn() === (user?.id === whitePlayer.id ? 'w' : 'b')}
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
              duration={user?.id === whitePlayer.id ? whitePlayer.remainingTime : blackPlayer.remainingTime}
              isPaused={!(chess.turn() === (user?.id === whitePlayer.id ? 'w' : 'b'))}
            />
          </div>
        ) : (
          <div>Loading...</div>
        )
        }
      </div>
      <MovesTable />
      <Button onClick={() => {
        console.log("asdasdasd");
        startedGameHandler(gameId)
      }}>asdasdasd</Button>
    </div>
  );
}

export default ChessGame;
