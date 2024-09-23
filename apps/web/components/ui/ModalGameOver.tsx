import { Dialog, DialogContent, DialogHeader } from "@repo/ui/components/ui/dialog";

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
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="min-w-[700px] min-h-[500px] overflow-auto">
        <DialogHeader className="flex justify-center text-center items-center">
          <p>{playerWon}</p>
          <p>by {wonBy}</p>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default ModalGameOver;
