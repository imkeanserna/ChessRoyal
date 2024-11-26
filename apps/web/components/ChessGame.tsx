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
import { gameResignedAtom } from "@repo/store/gameMetadata";
import MovesTable from "./chess/MovesTable";
import ModalGameOver from "./ui/ModalGameOver";
import PlayerTimer from "./ui/PlayerTimer";
import { useGameActions } from "@/hooks/useGameActions";
import { toast } from "@repo/ui/components/ui/sonner";
import { CheckCircle, XCircle } from "lucide-react";

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
  const [gameMetadataState, setGameMetaDataAtom] = useRecoilState<Players>(gameMetadataAtom);
  const [myColor, setColor] = useState<"w" | "b">("w");
  const setRemoteGameIdAtom = useSetRecoilState(remoteGameIdAtom);
  const setIsResigned = useSetRecoilState(gameResignedAtom);
  const { respondToDraw } = useGameActions(sendMessage);

  useEffect(() => {
    setRemoteGameId(gameId);
  }, [gameId, setRemoteGameId]);

  const { blackPlayer, whitePlayer } = useRecoilValue<Players | null>(gameMetadataSelector) || {};

  // let's wait for further coding if this thing is very important in the component.
  const [player1ConsumeTimer, setPlayer1ConsumeTimer] = useState(blackPlayer?.remainingTime || 0);
  const [player2ConsumeTimer, setPlayer2ConsumeTimer] = useState(whitePlayer?.remainingTime || 0);

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

  // const startedGameHandler = async (gameId: string) => {
  //   try {
  //     const response = await fetch(`/api/game/${gameId}`, {
  //       method: "GET",
  //       headers: { "Content-Type": "application/json" },
  //       credentials: "include",
  //     });
  //     if (response.ok) {
  //       const { game } = await response.json();
  //       if (!game.id) {
  //         router.push("/play/online");
  //         return;
  //       }
  //       setStarted(!!game.id);
  //       const whitePlayer = gameMetadataState.whitePlayer.id;
  //       setColor(user?.id === whitePlayer ? "w" : "b");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching game status:", error);
  //   }
  // };

  const resetGameState = useCallback(() => {
    setChess(new Chess());
    setIsCheck({ king_status: KingStatus.SAFE, player: "" });
    setIsGameOver({ isGameOver: false, playerWon: null });
    setWonBy(null);
    setOpen(false);
    setPlayer1ConsumeTimer(blackPlayer?.remainingTime || 0);
    setPlayer2ConsumeTimer(whitePlayer?.remainingTime || 0);
  }, [setMoves, setIsCheck, setIsGameOver]);

  const handleNewGame = useCallback(() => {
    resetGameState();
    router.push('/dashboard');
  }, [router, resetGameState]);

  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;

    const tryJoinRoom = () => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        retryTimeout = setTimeout(tryJoinRoom, 1000);
        return;
      }

      if (gameId) {
        // startedGameHandler(gameId);
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
          case GameMessages.DRAW_OFFERED:
            toast("Opponent offered a draw", {
              description: (
                <div className="space-y-3 py-2">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        respondToDraw(gameId, "accept");
                        toast.dismiss();
                      }}
                      className="bg-gradient-to-r from-amber-900 to-amber-800 text-amber-100 px-4 py-2 rounded-lg font-semibold hover:bg-amber-900/80 transition-all duration-200 ease-in-out transform active:scale-95 shadow-lg"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => {
                        respondToDraw(gameId, "decline");
                        toast.dismiss();
                      }}
                      className="bg-neutral-900 text-amber-200 px-4 py-2 rounded-lg font-semibold hover:bg-neutral-950 hover:text-amber-100 transition-all duration-200 ease-in-out transform active:scale-95 shadow-lg"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ),
              className:
                "bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-700 shadow-2xl rounded-lg p-2 text-amber-100",
              duration: 10000,
            });
            break;
          case GameMessages.DRAW_RESPONSED:
            if (payload.response === "accept") {
              toast(
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-gray-800">Draw Accepted</span>
                </div>,
                {
                  className:
                    "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-none shadow-lg shadow-amber-900/20 hover:shadow-amber-900/40 rounded-lg p-4 transform transition-all duration-200",
                  duration: 5000,
                }
              );
            } else {
              toast(
                <div className="flex items-center space-x-3">
                  <XCircle className="h-6 w-6 text-white" />
                  <span className="text-white">Draw Declined</span>
                </div>,
                {
                  className:
                    "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-none shadow-lg shadow-red-900/20 hover:shadow-red-900/40 rounded-lg p-4 transform transition-all duration-200",
                  duration: 5000,
                }
              );
            }
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

    const whitePlayer = payload.whitePlayer.id;

    setColor(user?.id === whitePlayer ? "w" : "b");
    setMoves(payload.moves);
    setStarted(!!payload.gameId);
    setPlayer1ConsumeTimer(payload.whitePlayer.remainingTime);
    setPlayer2ConsumeTimer(payload.blackPlayer.remainingTime);
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
        setWonBy(GameResultType.TIMEOUT);
        setIsGameOver({ isGameOver: true, playerWon: payload.result });
        setOpen(true);
        setIsResigned(true);
        break;
      default:
        console.warn("Unhandled game end status:", payload.status);
    }
  };

  // Determine if the current user is playing as black
  const isPlayingAsBlack = user?.id === blackPlayer?.id;

  // Helper function to determine if a timer should be paused
  const isTimerPaused = (playerColor: string) => {
    const isWhite = playerColor === 'white';
    return chess.turn() !== (isWhite ? 'w' : 'b');
  };

  // Get opponent and current player info based on user's color
  const getCurrentPlayerInfo = () => {
    const player: any = isPlayingAsBlack ? blackPlayer : whitePlayer;
    return {
      name: player.name,
      remainingTime: player.remainingTime,
      avatar: player?.avatar,
      isPaused: isTimerPaused(isPlayingAsBlack ? 'black' : 'white')
    };
  };

  const getOpponentInfo = () => {
    const player: any = isPlayingAsBlack ? whitePlayer : blackPlayer;
    return {
      name: player.name,
      remainingTime: player.remainingTime,
      avatar: player?.avatar,
      isPaused: isTimerPaused(isPlayingAsBlack ? 'white' : 'black')
    };
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-950">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,53,15,0.2),rgba(0,0,0,0))]" />
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-800/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-[repeating-conic-gradient(theme(colors.amber.900)_0%_25%,theme(colors.transparent)_0%_50%)] bg-[length:40px_40px]" />
      </div>

      {isGameOver.playerWon && wonBy && (
        <ModalGameOver
          playerWon={isGameOver.playerWon === GameResultType.DRAW ? GameResultType.DRAW : isGameOver.playerWon}
          wonBy={wonBy === GameResultType.WIN ? "checkmate" : wonBy}
          open={open}
          onNewGame={handleNewGame}
          onClose={() => setOpen(false)}
          setOpen={setOpen}
        />
      )}
      <div className="relative z-10 w-full max-w-6xl px-4">
        {blackPlayer && whitePlayer ? (
          <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-8 lg:gap-10 rounded-xl p-6 shadow-2xl">
            <div className="w-full space-y-4">
              <div className="text-end">
                <PlayerTimer
                  playerName={getOpponentInfo().name}
                  duration={getOpponentInfo().remainingTime}
                  isPaused={getOpponentInfo().isPaused}
                  avatar={getOpponentInfo().avatar}
                  isActive={chess.turn() !== myColor[0]}
                  color={isPlayingAsBlack ? 'black' : 'white'}
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
                <PlayerTimer
                  playerName={getCurrentPlayerInfo().name}
                  duration={getCurrentPlayerInfo().remainingTime}
                  isPaused={getCurrentPlayerInfo().isPaused}
                  avatar={getCurrentPlayerInfo().avatar}
                  isActive={chess.turn() === myColor[0]}
                  color={isPlayingAsBlack ? 'white' : 'black'}
                />
              </div>
            </div>
            <MovesTable
              sendMessage={sendMessage}
              gameId={gameId}
            />
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
