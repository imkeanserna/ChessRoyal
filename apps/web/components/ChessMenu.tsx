"use client";

import { GameMessages } from "@repo/chess/gameStatus";
import { Button } from "@repo/ui/components/ui/button";
import { useSocketContext } from "@repo/ui/context/socketContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import WaitingForOpponent from "./WaitingForOpponent";
import { Player } from "@repo/chess/playerTypes";
import { useSetRecoilState } from "recoil";
import { gameMetadataAtom, gameResignedAtom, remoteGameIdAtom } from "@repo/store/gameMetadata";
import { userAtom } from "@repo/store/user";
import { OngoingGameModal } from "./ui/OngoingGameModal";
import { isGameOverAtom, movesAtom } from "@repo/store/chessBoard";
import { AuthModal } from "@repo/ui/components/auth/auth-modal";
import { signUpUser } from "@/lib";

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

  const [isHovering, setIsHovering] = useState(false);

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
      return;
    }

    socket.onmessage = (messageEvent) => {
      const { event, payload } = JSON.parse(messageEvent.data);

      switch (event) {
        case GameMessages.INIT_GAME:
          setRemoteGameIdAtom(payload.gameId);
          handleGameInit(payload);
          break;
        case GameMessages.GAME_ADDED:
          setUser({
            id: payload.userId
          })
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
    setIsWaiting(true);
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
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-950">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,53,15,0.2),rgba(0,0,0,0))]" />
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-800/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-[repeating-conic-gradient(theme(colors.amber.900)_0%_25%,theme(colors.transparent)_0%_50%)] bg-[length:40px_40px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8 p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent mb-4">
            Chess Royal
          </h1>
          <p className="text-amber-200/60">Challenge players from around the world</p>
        </div>

        <WaitingForOpponent isWaiting={isWaiting} />

        <div className="flex flex-col items-center gap-6">
          <div className="relative z-20 w-full">
            <AuthModal onSubmitAction={signUpUser} />
          </div>

          <div className="relative w-full group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}>
            <div className={`absolute inset-0 bg-gradient-to-r from-amber-400/20 to-amber-600/20 blur-xl transition-all duration-500 ${isHovering ? 'scale-110 opacity-100' : 'scale-100 opacity-70'}`} />

            <Button
              variant="outline"
              disabled={isWaiting}
              onClick={handleFindGame}
              className={`relative w-full bg-gradient-to-r from-amber-900/90 to-amber-800/90 hover:from-amber-800/90 hover:to-amber-700/90
                text-amber-100 border-2 border-amber-600/20 shadow-lg shadow-amber-900/20 hover:shadow-amber-900/40
                transform transition-all duration-300 px-8 py-6 ${isHovering ? '-translate-y-1' : 'translate-y-0'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">Play as Guest</span>
                <span className="text-amber-400/70">→</span>
              </div>
            </Button>
          </div>

          <div className="flex items-center gap-4 w-full mt-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-700/30 to-transparent" />
            <span className="text-amber-500/60 text-sm px-4">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-700/30 to-transparent" />
          </div>

          <p className="text-center text-sm text-amber-200/40 max-w-sm">
            Sign in to track your progress, join ranked matches, and climb the leaderboard
          </p>
        </div>

        <OngoingGameModal
          open={isModalOpen}
          setOpen={setIsModalOpen}
          onQuit={handleQuitGame}
          onResume={handleResumeGame}
        />
      </div>
    </div>
  );
}

export default ChessMenu;
