import { movesAtom } from "@repo/store/chessBoard";
import { useRecoilValue, useSetRecoilState } from "recoil";
import React, { useEffect, useState } from "react";
import { Move } from "chess.js";
import { userSelectedMoveIndexAtom } from "@repo/store/user";
import { gameResignedAtom } from "@repo/store/gameMetadata";
import { Button } from "@repo/ui/components/ui/button";
import { ConfirmResignModal } from "../ui/ConfirmResignModal";
import DrawOfferButton from "../ui/DrawOfferButton";
import { useGameActions } from "@/hooks/useGameActions";
import ThemeToggle from "@repo/ui/components/ui/themeToggle";
import { GameClipClipboard } from "../ui/GameCopyClipBoard";
import { SettingsButton } from "../ui/SettingsIcon";
import { ResignButton } from "../ui/ResignButton";
import {
  ChevronFirst,
  ChevronLeft,
  ChevronRight,
  ChevronLast
} from 'lucide-react';
interface MovesTableProps {
  sendMessage: (event: string, data?: any) => void;
  gameId: string;
}

const MovesTable: React.FC<MovesTableProps> = ({
  sendMessage,
  gameId
}) => {
  const moves = useRecoilValue<Move[]>(movesAtom);
  const { offerDraw, resignGame } = useGameActions(sendMessage);
  const [selectedMove, setSelectedMove] = useState<number | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const setUserSelectedMove = useSetRecoilState(userSelectedMoveIndexAtom);
  const isResigned = useRecoilValue(gameResignedAtom);

  const handleMoveClick = (index: number) => {
    setSelectedMove(index);
    setUserSelectedMove(index);
  };

  const handleConfirmResign = () => {
    resignGame(gameId);
    setModalOpen(false);
  };

  const handleStartMove = () => {
    if (moves.length > 0) {
      setSelectedMove(0);
      setUserSelectedMove(0);
    }
  };

  const handlePreviousMove = () => {
    if (selectedMove !== null && selectedMove > 0) {
      setSelectedMove(selectedMove - 1);
      setUserSelectedMove(selectedMove - 1);
    } else if (selectedMove === null && moves.length > 0) {
      setSelectedMove(moves.length - 1);
      setUserSelectedMove(moves.length - 1);
    }
  };

  const handleNextMove = () => {
    if (selectedMove !== null && selectedMove < moves.length - 1) {
      setSelectedMove(selectedMove + 1);
      setUserSelectedMove(selectedMove + 1);
    }
  };

  const handlePresentMove = () => {
    if (moves.length > 0) {
      setSelectedMove(moves.length - 1);
      setUserSelectedMove(moves.length - 1);
    }
  };

  useEffect(() => {
    if (moves.length > 0) {
      setSelectedMove(moves.length - 1);
      setUserSelectedMove(moves.length - 1);
    }
  }, [moves, setUserSelectedMove]);

  return (
    <div className="rounded-xl overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-700 flex flex-col items-center w-full min-h-[810px] min-w-[450px] mx-auto shadow-xl">
      {/* Header section with gradient */}
      <div className="w-full px-8 py-4 border-amber-700/30 bg-gradient-to-r from-amber-900/30 to-amber-800/30 border-b border-amber-700">
        <div className="flex sm:flex-row justify-between items-center p-4 sm:p-6 gap-4 sm:gap-6">
          <SettingsButton />
          <GameClipClipboard clipUrl={gameId} />
          <ResignButton isResigned={isResigned} setModalOpen={setModalOpen} />
          <DrawOfferButton onOffer={offerDraw} gameId={gameId} />
          <ThemeToggle />
        </div>
      </div>

      {/* Moves section */}
      <div className="space-y-4 p-6 md:w-full">
        {moves.map((move, index) =>
          index % 2 === 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-12" key={index}>
              <span className="text-lg font-semibold text-amber-100 mb-2 sm:mb-0 sm:mr-4 w-full sm:w-auto text-center sm:text-left">
                {Math.floor(index / 2) + 1}.
              </span>
              <div className="flex-1 w-full sm:w-auto mb-2 sm:mb-0 sm:mr-4">
                <Button
                  onClick={() => handleMoveClick(index)}
                  className={`transition-all duration-200 ease-in-out text-sm sm:text-base p-8 rounded-lg ${selectedMove === index
                    ? 'bg-amber-700 text-amber-100 hover:bg-amber-600'
                    : 'bg-transparent border border-amber-700/50 text-amber-200/80 hover:bg-amber-900/30 hover:text-amber-100'
                    }`}
                >
                  {move.to}
                </Button>
              </div>
              {moves[index + 1] ? (
                <div className="flex-1 w-full sm:w-auto">
                  <Button
                    onClick={() => handleMoveClick(index + 1)}
                    className={`transition-all duration-200 ease-in-out text-sm sm:text-base p-8 rounded-lg ${selectedMove === index + 1
                      ? 'bg-amber-700 text-amber-100 hover:bg-amber-600'
                      : 'bg-transparent border border-amber-700/50 text-amber-200/80 hover:bg-amber-900/30 hover:text-amber-100'
                      }`}
                  >
                    {moves[index + 1]?.to}
                  </Button>
                </div>
              ) : (
                <div className="flex-1 w-full sm:w-auto">
                  <span className="block w-full p-3 rounded-lg bg-transparent"></span>
                </div>
              )}
            </div>
          ) : null
        )}
      </div>

      <ConfirmResignModal
        open={isModalOpen}
        setOpen={setModalOpen}
        onConfirm={handleConfirmResign}
      />

      {/* Moves Navigation Buttons */}
      <div className="w-full flex justify-center items-center gap-4 p-4 bg-neutral-900/50 mt-auto">
        <Button
          onClick={handleStartMove}
          disabled={selectedMove === null || moves.length === 0}
          className="bg-amber-700/30 hover:bg-amber-700/50 text-amber-100 disabled:opacity-30"
        >
          <ChevronFirst className="h-5 w-5" />
        </Button>
        <Button
          onClick={handlePreviousMove}
          disabled={selectedMove === null || moves.length === 0}
          className="bg-amber-700/30 hover:bg-amber-700/50 text-amber-100 disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          onClick={handleNextMove}
          disabled={selectedMove === null || selectedMove === moves.length - 1}
          className="bg-amber-700/30 hover:bg-amber-700/50 text-amber-100 disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        <Button
          onClick={handlePresentMove}
          disabled={selectedMove === null || selectedMove === moves.length - 1}
          className="bg-amber-700/30 hover:bg-amber-700/50 text-amber-100 disabled:opacity-30"
        >
          <ChevronLast className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MovesTable;
