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
import ThemeToggle from "@repo/ui/components/ui/themeToggle";
import PlayerTimer from "./ui/PlayerTimer";

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
        const whitePlayer = gameMetadataState.whitePlayer.id;
        setColor(user?.id === whitePlayer ? "w" : "b");
      }
    } catch (error) {
      console.error("Error fetching game status:", error);
    }
  };

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
    router.push('/play/online');
  }, [router, resetGameState]);

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
    console.log(player)
    return {
      name: player.name,
      remainingTime: player.remainingTime,
      avatar: player?.avatar,
      isPaused: isTimerPaused(isPlayingAsBlack ? 'white' : 'black')
    };
  };

  return (
    <div className="w-full min-h-screen  flex items-center justify-center py-4">
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
      <ThemeToggle />
      <div>
        {blackPlayer && whitePlayer ? (
          <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-8 lg:gap-10">
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
