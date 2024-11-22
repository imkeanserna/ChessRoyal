"use client"

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import { X } from 'lucide-react';
import { Tooltip } from "@repo/ui/components/ui/tooltip";

interface DrawOfferButtonProps {
  onOffer: (gameId: string) => void;
  gameId: string;
}

export default function DrawOfferButton({ onOffer, gameId }: DrawOfferButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleDrawOffer = () => {
    setIsOpen(false);
    onOffer(gameId);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip content="Draw">
        <PopoverTrigger asChild>
          <Button variant="outline" className="p-2">1/2</Button>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent className="w-80 bg-gradient-to-b from-neutral-900 to-neutral-950 border-amber-700 rounded-xl p-0 overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-amber-900 to-amber-800 p-2 border-b border-amber-700">
          <div className="flex flex-col items-center text-center">
            <h1 className="font-bold text-l text-amber-100">Offer Draw</h1>
            <p className="text-sm text-amber-200/80">Propose a draw to your opponent</p>
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="text-amber-200 hover:bg-amber-900/30 hover:text-amber-50 group"
            >
              <X className="mr-2 h-4 w-4 text-amber-400 group-hover:text-amber-100" />
              Cancel
            </Button>
            <Button
              onClick={handleDrawOffer}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
            >
              Confirm Draw
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
