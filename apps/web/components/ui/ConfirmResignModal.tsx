import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { AlertTriangle, Flag, X } from "lucide-react";

interface ConfirmResignModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}

export const ConfirmResignModal: React.FC<ConfirmResignModalProps> = ({
  open,
  setOpen,
  onConfirm,
}) => {
  const handleClose = () => setOpen(false);
  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[425px] p-0 rounded-xl overflow-hidden"
      >
        {/* Chess-themed header */}
        <div className="bg-gradient-to-r from-amber-900 to-amber-800 p-6 border-b border-amber-700">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="bg-red-500/10 p-3 rounded-full mb-3">
              <Flag className="h-8 w-8 text-red-500" />
            </div>
            <DialogTitle className="text-2xl font-bold text-amber-100">
              Resign Game?
            </DialogTitle>
            <DialogDescription className="text-amber-200/80">
              Please confirm if you want to resign from this game
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Modal body */}
        <div className="p-6 bg-gradient-to-b from-neutral-900 to-neutral-950">
          <div className="flex items-start space-x-4 mb-6">
            <div className="flex-shrink-0 bg-amber-500/10 p-2 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="space-y-2">
              <p className="text-amber-100" id="resignation-consequences">
                You are about to forfeit this game. This action:
              </p>
              <ul className="text-neutral-300 space-y-1 text-sm list-disc list-inside"
                aria-labelledby="resignation-consequences">
                <li>Will count as a loss in your record</li>
                <li>Cannot be undone or reversed</li>
                <li>Will immediately end the game</li>
              </ul>
            </div>
          </div>

          {/* Footer buttons */}
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-start space-y-3 sm:space-y-0 sm:space-x-3">
            <Button
              variant="destructive"
              onClick={handleConfirm}
              className="group relative w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white transition-all duration-200 ease-in-out"
              aria-label="Resign from the game"
            >
              <span className="flex items-center justify-center space-x-2">
                <Flag className="h-4 w-4" />
                <span>Resign Game</span>
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto border-amber-800 text-amber-100 hover:bg-amber-900/30 hover:text-amber-50"
              aria-label="Continue playing the game"
            >
              <span className="flex items-center justify-center space-x-2">
                <X className="h-4 w-4" />
                <span>Continue Playing</span>
              </span>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
