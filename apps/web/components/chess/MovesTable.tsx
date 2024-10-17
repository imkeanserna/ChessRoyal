import { movesAtom } from "@repo/store/chessBoard";
import { useRecoilValue, useSetRecoilState } from "recoil";
import React, { useState } from "react";
import { Move } from "chess.js";
import { userSelectedMoveIndexAtom } from "@repo/store/user";
import { Button } from "@repo/ui/components/ui/button";

const MovesTable: React.FC = () => {
  const moves = useRecoilValue<Move[]>(movesAtom);
  const [selectedMove, setSelectedMove] = useState<number | null>(null);
  const setUserSelectedMove = useSetRecoilState(userSelectedMoveIndexAtom);

  const handleMoveClick = (index: number) => {
    setSelectedMove(index);
    setUserSelectedMove(index);
  };

  return (
    <div className="rounded-lg text-white border border-gray-300 flex flex-col items-center w-full min-h-[810px] max-w-4xl mx-auto">
      <div className="border-b border-gray-300 w-full">
        <div className="flex flex-col sm:flex-row justify-between p-4 sm:p-8">
          <p className="mb-2 sm:mb-0">asdadasdasdasdasdas dasd</p>
          <p>asdadasdasdasdasdas</p>
        </div>
      </div>
      <div className="space-y-4 p-4 sm:p-8 md:w-full">
        {moves.map((move, index) =>
          index % 2 === 0 ? (
            <div className="flex flex-col sm:flex-row items-center" key={index}>
              <span className="font-semibold mb-2 sm:mb-0 sm:mr-4 md:mr-8 lg:mr-16 w-full sm:w-auto text-center sm:text-left">
                {Math.floor(index / 2) + 1}.
              </span>
              <div className="flex-1 w-full sm:w-auto mb-2 sm:mb-0 sm:mr-4 md:mr-8 lg:mr-28">
                <Button
                  onClick={() => handleMoveClick(index)}
                  className={`sm:w-full p-4 sm:p-6 rounded-md ${selectedMove === index
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
                    className={`sm:w-full p-4 sm:p-6 rounded-md ${selectedMove === index + 1
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
    </div>
  );
};

export default MovesTable;
