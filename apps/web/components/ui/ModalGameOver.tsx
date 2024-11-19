import { Button } from "@repo/ui/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogOverlay, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Crown, Scale, RotateCw, X, Trophy, Medal, Sparkles } from 'lucide-react';

interface ModalGameOverProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  playerWon: string;
  wonBy: string;
  onNewGame?: () => void;
  onClose?: () => void;
}

const ModalGameOver: React.FC<ModalGameOverProps> = ({
  open,
  setOpen,
  playerWon,
  wonBy,
  onNewGame,
  onClose
}) => {
  const isDraw = playerWon === 'Draw';

  const handleNewGame = () => {
    onNewGame?.();
    setOpen(false);
  };

  const handleClose = () => {
    onClose?.();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 rounded-xl overflow-hidden border-2 border-amber-600/20">
        <div className="relative">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,53,15,0.1),rgba(0,0,0,0))]" />

          {/* Content */}
          <div className="relative z-10 p-6">
            <DialogHeader className="flex flex-col justify-center items-center text-center space-y-6">
              {/* Victory/Draw Icon with effects */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-400/20 to-transparent rounded-full blur-xl transform -translate-y-4 scale-150" />
                {isDraw ? (
                  <div className="relative bg-neutral-900/50 p-6 rounded-full">
                    <Scale size={80} className="text-amber-400 animate-pulse" />
                  </div>
                ) : (
                  <div className="relative bg-amber-900/50 p-6 rounded-full transform animate-float">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <Sparkles className="h-6 w-6 text-amber-300 animate-spin-slow" />
                    </div>
                    <Crown size={80} className="text-amber-400" />
                    <Trophy className="absolute bottom-4 right-0 h-8 w-8 text-amber-300 animate-bounce" />
                    <Medal className="absolute bottom-4 left-0 h-8 w-8 text-amber-300 animate-bounce delay-100" />
                  </div>
                )}
              </div>

              {/* Result Text */}
              <div className="space-y-2 text-center">
                <DialogTitle className="text-4xl font-bold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
                  {isDraw ? "It's a Draw!" : "Game Over!"}
                </DialogTitle>
                <DialogDescription className="text-xl text-neutral-200">
                  {isDraw
                    ? 'The game ended in a stalemate'
                    : <span>Victory goes to <span className="font-semibold text-amber-400">{playerWon.replace('_', ' ')}!</span></span>
                  }
                </DialogDescription>
                <div className="flex justify-end pt-6">
                  <p className="text-xs text-neutral-400 flex items-center gap-2">
                    {!isDraw && (
                      <>
                        <Medal className="h-4 w-4 text-amber-300" />
                        <span>
                          Won by{' '}
                          <span className="font-semibold text-amber-400 underline decoration-amber-400/50">
                            {wonBy}
                          </span>
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-4 w-full max-w-sm">
                <Button
                  onClick={handleNewGame}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-none shadow-lg shadow-amber-900/20 hover:shadow-amber-900/40 transform transition-all duration-200 hover:-translate-y-0.5"
                >
                  <span className="flex items-center justify-center gap-2">
                    <RotateCw className="h-4 w-4" />
                    New Game
                  </span>
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1 border-2 border-neutral-700 bg-transparent text-neutral-200 hover:bg-neutral-800 hover:text-white transform transition-all duration-200 hover:-translate-y-0.5"
                >
                  <span className="flex items-center justify-center gap-2">
                    <X className="h-4 w-4" />
                    Close
                  </span>
                </Button>
              </div>
            </DialogHeader>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalGameOver;
