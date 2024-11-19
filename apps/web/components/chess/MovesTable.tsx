import { movesAtom } from "@repo/store/chessBoard";
import { useRecoilValue, useSetRecoilState } from "recoil";
import React, { useState } from "react";
import { Move } from "chess.js";
import { userSelectedMoveIndexAtom } from "@repo/store/user";
import { gameResignedAtom } from "@repo/store/gameMetadata";
import { Button } from "@repo/ui/components/ui/button";
import { GameMessages } from "@repo/chess/gameStatus";
import { Flag, FlagOff } from 'lucide-react';
import { Tooltip } from "@repo/ui/components/ui/tooltip";
import { ConfirmResignModal } from "../ui/ConfirmResignModal";

interface MovesTableProps {
  sendMessage: (event: string, data?: any) => void;
  gameId: string;
}

const MovesTable: React.FC<MovesTableProps> = ({
  sendMessage,
  gameId
}) => {
  const moves = useRecoilValue<Move[]>(movesAtom);
  const [selectedMove, setSelectedMove] = useState<number | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const setUserSelectedMove = useSetRecoilState(userSelectedMoveIndexAtom);
  const isResigned = useRecoilValue(gameResignedAtom);

  const handleMoveClick = (index: number) => {
    setSelectedMove(index);
    setUserSelectedMove(index);
  };

  const handleConfirmResign = () => {
    sendMessage(GameMessages.USER_RESIGNED, { gameId });
  };

  return (
    <div className="rounded-lg text-white border border-gray-300 flex flex-col items-center w-full min-h-[810px] max-w-4xl mx-auto">
      <div className="border-b border-gray-300 w-full">
        <div className="flex flex-col sm:flex-row justify-between p-4 sm:p-8">
          <Tooltip content="Resign Game">
            {isResigned ? (
              <FlagOff className="cursor-not-allowed text-gray-500" />
            ) : (
              <Flag
                onClick={() => setModalOpen(true)}
                className="cursor-pointer hover:text-white transition-colors"
              />
            )}
          </Tooltip>
        </div>
      </div>
      <div className="space-y-4 p-4 sm:p-8 md:w-full">
        {moves.map((move, index) =>
          index % 2 === 0 ? (
            <div className="flex flex-col sm:flex-row items-center" key={index}>
              <span className="text-lg font-semibold mb-2 sm:mb-0 sm:mr-4 md:mr-8 lg:mr-16 w-full sm:w-auto text-center sm:text-left">
                {Math.floor(index / 2) + 1}.
              </span>
              <div className="flex-1 w-full sm:w-auto mb-2 sm:mb-0 sm:mr-4 md:mr-8 lg:mr-28">
                <Button
                  onClick={() => handleMoveClick(index)}
                  className={`text-lg sm:w-full p-4 sm:p-6 rounded-md ${selectedMove === index
                    ? 'bg-white text-black hover:bg-gray-200 hover:text-black'
                    : 'bg-transparent text-white hover:bg-gray-200 hover:text-black'
                    }`}
                >
                  {move.to}
                </Button>
              </div>
              {moves[index + 1] ? (
                <div className="flex-1 w-full sm:w-auto">
                  <Button
                    onClick={() => handleMoveClick(index + 1)}
                    className={`text-lg sm:w-full p-4 sm:p-6 rounded-md ${selectedMove === index + 1
                      ? 'bg-white text-black hover:bg-gray-200 hover:text-black'
                      : 'bg-transparent text-white hover:bg-gray-200 hover:text-black'
                      }`}
                  >
                    {moves[index + 1]?.to}
                  </Button>
                </div>
              ) : (
                <div className="flex-1 w-full sm:w-auto">
                  <span className="block w-full p-4 sm:p-6 rounded-md bg-transparent"></span>
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
    </div>
  );
};

export default MovesTable;
