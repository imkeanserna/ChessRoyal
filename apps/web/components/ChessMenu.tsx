"use client";

import { Player } from "@repo/chess/playerTypes";
import { AuthModal } from "@repo/ui/components/auth/auth-modal";
import { signUpUser } from "@/lib";
import InitializeButton from "./InitializeButton";

export interface Players {
  blackPlayer: Player;
  whitePlayer: Player;
}

const ChessMenu: React.FC = () => {
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

        <div className="relative z-20 w-full">
          <AuthModal onSubmitAction={signUpUser} />
        </div>

        <InitializeButton user={null} />

        <p className="text-center text-sm text-amber-200/40 max-w-sm">
          Sign in to track your progress, join ranked matches, and climb the leaderboard
        </p>
      </div>
    </div>
  );
}

export default ChessMenu;
