"use client";

import { GameMessages, GameResultType, KingStatus } from "@repo/chess/gameStatus";
import { gameMetadataAtom, gameMetadataSelector, remoteGameIdAtom } from "@repo/store/gameMetadata";
import { useSocketContext } from "@repo/ui/context/socketContext";
import React, { Suspense, useCallback, useEffect, useState } from "react";
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
  const [wonBy, setWonBy] = useState<GameResultType | null>(null);
  const setGameMetaDataAtom = useSetRecoilState<Players>(gameMetadataAtom);
  const [myColor, setColor] = useState<"w" | "b">("w");
  const setRemoteGameIdAtom = useSetRecoilState(remoteGameIdAtom);

  useEffect(() => {
    setRemoteGameId(gameId);
  }, [gameId, setRemoteGameId]);

  const { blackPlayer, whitePlayer } = useRecoilValue<Players | null>(gameMetadataSelector) || {};
  // let's wait for further coding if this thing is very important in the component.
  const [player1ConsumeTimer, setPlayer1ConsumeTimer] = useState(blackPlayer?.remainingTime || 0);
  const [player2ConsumeTimer, setPlayer2ConsumeTimer] = useState(whitePlayer?.remainingTime || 0);

  useEffect(() => {
    if (!blackPlayer) return;
    setColor(user?.id === blackPlayer.id ? "b" : "w");
  }, []);

  const handleGameInit = useCallback((payload: any) => {
    const user: { id: string } | null = JSON.parse(localStorage.getItem("user") as string);
    if (!user || user.id !== payload.whitePlayer.id) {
      // set the second player as a black player
      setUser({
        id: payload.blackPlayer.id
      })
      window.location.reload();
    }
  }, []);

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
        setStarted(!!game.id);
        const whitePlayer = game.players[0].id;
        setColor(user?.id === whitePlayer ? "w" : "b");
      }
    } catch (error) {
      console.error("Error fetching game status:", error);
    }
  };

  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;

    const tryJoinRoom = () => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
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
          case GameMessages.INIT_GAME:
            setRemoteGameIdAtom(payload.gameId);
            handleGameInit(payload);
            break;
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

    if (payload.userId !== user?.id) return;

    payload.moves.forEach((move: Move) => {
      const legalMoves = chess.moves({ verbose: true });
      const isLegalMove = legalMoves.some((m: Move) => m.from === move.from && m.to === move.to);

      if (isLegalMove) {
        chess.move(isPromoting(chess, move.from, move.to) ? { ...move, promotion: 'q' } : move);
      } else {
        console.error("Invalid move attempted:", move);
      }
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
    switch (payload.status) {
      case GameResultType.WIN:
        setWonBy(GameResultType.WIN);
        setIsGameOver({ isGameOver: true, playerWon: payload.result });
        setOpen(true);
        break;
      case GameResultType.DRAW:
        setWonBy(GameResultType.DRAW);
        setIsGameOver({ isGameOver: true, playerWon: GameResultType.DRAW });
        setOpen(true);
        break;
      case GameResultType.TIMEOUT:
        setWonBy(GameResultType.TIMEOUT);
        setIsGameOver({ isGameOver: true, playerWon: payload.result });
        setOpen(true);
        break;
      case GameResultType.RESIGNATION:
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
          playerWon={isGameOver.playerWon === GameResultType.DRAW ? GameResultType.DRAW : isGameOver.playerWon}
          wonBy={wonBy === GameResultType.WIN ? "checkmate" : wonBy}
          open={open}
          setOpen={setOpen}
        />
      )}
      <div>
        {blackPlayer && whitePlayer ? (
          <div className="grid grid-cols-12">
            <div className="col-span-9">
              <TimerCountDown
                duration={user?.id === blackPlayer.id ? blackPlayer.remainingTime : whitePlayer.remainingTime}
                isPaused={chess.turn() === (user?.id === whitePlayer.id ? 'w' : 'b')}
              />
              <Suspense fallback={<div>Loading...</div>}>
                <ChessBoard
                  started={started}
                  setBoard={setBoard}
                  gameId={gameId}
                  board={board}
                  chess={chess}
                  sendMessage={sendMessage}
                  myColor={myColor}
                />
              </Suspense>
              <TimerCountDown
                duration={user?.id === whitePlayer.id ? whitePlayer.remainingTime : blackPlayer.remainingTime}
                isPaused={!(chess.turn() === (user?.id === whitePlayer.id ? 'w' : 'b'))}
              />
            </div>
            <div className="col-span-3">
              <MovesTable />
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )
        }
      </div>
    </div>
  );
}

export default ChessGame;
