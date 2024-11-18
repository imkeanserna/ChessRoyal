"use client"

import { Button } from "@repo/ui/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog"
import { Crown, Castle } from "lucide-react";
import clsx from "clsx"

interface OngoingGameModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onQuit: () => void;
  onResume: () => void;
}

export const OngoingGameModal: React.FC<OngoingGameModalProps> = ({
  open,
  setOpen,
  onQuit,
  onResume,
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={clsx(
          "sm:max-w-[425px] p-6 rounded-lg bg-gradient-to-b from-gray-800 to-gray-900",
          "shadow-lg text-white"
        )}
        aria-labelledby="ongoing-game-title"
        aria-describedby="ongoing-game-description"
      >
        <DialogTitle
          id="ongoing-game-title"
          className="flex items-center gap-2 text-yellow-400 text-xl sr-only"
        >
          <Crown className="h-6 w-6 text-yellow-400" />
          Game in Progress
        </DialogTitle>

        <DialogDescription
          id="ongoing-game-description"
          className="sr-only"
        >
          You have an unfinished chess game. What would you like to do?
        </DialogDescription>

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-400 text-xl">
            <Crown className="h-6 w-6 text-yellow-400" />
            Game in Progress
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            You have an unfinished chess game. What would you like to do?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-start space-y-3 sm:space-y-0 sm:space-x-3">
          <Button
            variant="destructive"
            onClick={onQuit}
            className={clsx(
              "w-full sm:w-auto transform transition-transform hover:scale-105",
              "bg-red-600 hover:bg-red-700 border-2 border-red-700"
            )}
            aria-label="Quit current game"
          >
            <Castle className="inline mr-2" />
            Quit Game
          </Button>
          <Button
            variant="default"
            onClick={onResume}
            className={clsx(
              "w-full sm:w-auto transform transition-transform hover:scale-105",
              "bg-green-600 hover:bg-green-700 border-2 border-green-700"
            )}
            aria-label="Resume current game"
          >
            <Crown className="inline mr-2" />
            Resume Game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
