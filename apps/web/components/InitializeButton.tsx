"use client";

import { useGameFinder } from "@/hooks/useGameFinder";
import { Button } from "@repo/ui/components/ui/button";
import { OngoingGameModal } from "./ui/OngoingGameModal";
import WaitingForOpponent from "./WaitingForOpponent";
import { User } from "next-auth";
import { useState } from "react";

type InitializeButtonProps = {
  user: User | null;
};

const InitializeButton: React.FC<InitializeButtonProps> = ({ user }) => {
  const [isHovering, setIsHovering] = useState(false);
  const {
    isWaiting,
    isModalOpen,
    setIsModalOpen,
    findGame,
    quitGame,
    resumeGame
  } = useGameFinder();

  return (
    <>
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-full group"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}>
          <div className={`absolute inset-0 bg-gradient-to-r from-amber-400/20 to-amber-600/20 blur-xl transition-all duration-500 ${isHovering ? 'scale-110 opacity-100' : 'scale-100 opacity-70'}`} />

          <Button
            variant="outline"
            disabled={isWaiting}
            onClick={findGame}
            className={`relative w-full bg-gradient-to-r from-amber-900/90 to-amber-800/90 hover:from-amber-800/90 hover:to-amber-700/90
                text-amber-100 border-2 border-amber-600/20 shadow-lg shadow-amber-900/20 hover:shadow-amber-900/40
                transform transition-all duration-300 px-8 py-6 ${isHovering ? '-translate-y-1' : 'translate-y-0'}
                active:scale-[0.98]`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold">{user ? `Play online` : "Play as Guest"}</span>
              <span className="text-amber-400/70">→</span>
            </div>
          </Button>
        </div>

        <div className="flex items-center gap-4 w-full mt-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-700/30 to-transparent" />
          {!user ? <span className="text-amber-500/60 text-sm px-4">or</span> : null}
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-700/30 to-transparent" />
        </div>
      </div>

      <WaitingForOpponent isWaiting={isWaiting} />

      <OngoingGameModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        onQuit={quitGame}
        onResume={resumeGame}
      />
    </>
  );
}

export default InitializeButton;
