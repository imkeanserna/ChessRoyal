import { Button } from "@repo/ui/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogOverlay, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Crown, RotateCw, Scale, X } from "lucide-react";

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
      <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300" />
      <DialogContent className="min-w-[200px] min-h-[300px] overflow-auto p-6 bg-white rounded-lg shadow-lg transform transition-all duration-500 scale-105">
        <DialogHeader className="flex flex-col justify-center items-center text-center space-y-4">
          <div className="relative">
            {isDraw ? (
              <Scale size={80} className="text-amber-400 animate-pulse" />
            ) : (
              <Crown size={80} className="text-amber-400 animate-bounce" />
            )}
          </div>

          <DialogTitle className="text-4xl font-bold text-gray-950">
            {playerWon}
          </DialogTitle>

          {/* DialogDescription for additional context */}
          <DialogDescription className="text-xl text-gray-950">
            {playerWon === 'Draw' ? 'The game ended in a draw.' : `The game was won by ${wonBy}.`}
          </DialogDescription>

          <div className="flex gap-4 mt-8">
            <Button
              onClick={handleNewGame}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transform transition-all hover:scale-105"
            >
              <RotateCw size={20} />
              New Game
            </Button>

            <Button
              onClick={handleClose}
              variant="outline"
              className="border-gray-300 text-gray-700 px-6 py-2 rounded-lg flex items-center gap-2 transform transition-all hover:scale-105"
            >
              <X size={20} />
              Close
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default ModalGameOver;
