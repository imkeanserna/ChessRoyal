import { Button } from "@repo/ui/components/ui/button";
import { Tooltip } from "@repo/ui/components/ui/tooltip";
import { Flag, FlagOff } from "lucide-react";

interface ResignButtonProps {
  isResigned: boolean;
  setModalOpen: (open: boolean) => void;
}

export function ResignButton({ isResigned, setModalOpen }: ResignButtonProps) {
  return (
    <Tooltip content="Resign Game">
      <Button
        variant="outline"
        size="icon"
        className={`p-2 ${isResigned ? 'cursor-not-allowed' : ''}`}
        onClick={!isResigned ? () => setModalOpen(true) : undefined}
      >
        {isResigned ? (
          <FlagOff className="h-6 w-6 text-gray-500" />
        ) : (
          <Flag className="h-6 w-6 transition-colors" />
        )}
      </Button>
    </Tooltip>
  );
}
