import { Button } from "@repo/ui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogOverlay } from "@repo/ui/components/ui/dialog";
import { Crown, Scale } from "lucide-react";

interface ModalGameOverProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  playerWon: string;
  wonBy: string;
}

const ModalGameOver: React.FC<ModalGameOverProps> = ({
  open,
  setOpen,
  playerWon,
  wonBy
}) => {
  const isDraw = playerWon === 'Draw';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300" /> {/* Semi-transparent dark overlay */}
      <DialogContent className="min-w-[200px] min-h-[300px] overflow-auto p-6 bg-white rounded-lg shadow-lg transform transition-all duration-500 scale-105">
        <DialogHeader className="flex flex-col justify-center items-center text-center space-y-4">
          <div className="relative">
            {isDraw ? (
              <Scale size={80} className="text-amber-400 animate-pulse" />
            ) : (
              <Crown size={80} className="text-amber-400 animate-bounce" />
            )}
          </div>
          <h2 className="text-4xl font-bold text-gray-950">
            {playerWon}
          </h2>
          <p className="text-xl text-gray-950">
            by {wonBy}
          </p>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default ModalGameOver;
