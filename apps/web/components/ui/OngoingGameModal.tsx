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
import { AlertTriangle } from 'lucide-react'

interface OngoingGameModalProps {
  isOpen: boolean;
  onQuit: () => void;
  onResume: () => void;
}

export const OngoingGameModal: React.FC<OngoingGameModalProps> = ({ isOpen, onQuit, onResume }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onQuit}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-600">
            <AlertTriangle className="h-5 w-5" />
            Game in Progress
          </DialogTitle>
          <DialogDescription>
            You have an unfinished game. Please choose to quit or resume your current game.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button
            variant="destructive"
            onClick={onQuit}
            className="w-full sm:w-auto"
          >
            Quit Game
          </Button>
          <Button
            variant="default"
            onClick={onResume}
            className="w-full sm:w-auto"
          >
            Resume Game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
