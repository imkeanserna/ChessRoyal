"use client";

import { Color, PieceSymbol, Square } from "chess.js";
import { useRecoilValue } from "recoil";
import { isGameOverAtom } from "@repo/store/chessBoard";

interface ChessSquareProps {
  isKingChecked: boolean;
  isCaptured: boolean;
  isHighlightedSquare: boolean;
  isHighlighted: boolean;
  isMainBoxColor: boolean;
  piece: PieceSymbol;
  square: {
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

const ChessSquare: React.FC<ChessSquareProps> = ({
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isKingChecked,
  isCaptured,
  isHighlightedSquare,
  isHighlighted,
  isMainBoxColor,
  piece,
  square,
  isDragging
}) => {
  const gameOver = useRecoilValue(isGameOverAtom);

  return (
    <div
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`
        ${isHighlightedSquare ? "bg-yellow-200" : ""}
        ${isHighlighted ? "bg-yellow-400" : ""}
        ${isMainBoxColor ? "bg-gray-400" : "bg-white"}
        w-16 h-16
      `}
    >
      {square ? (
        <div
          draggable
          className={`
            cursor-grab active:cursor-grabbing
            ${isCaptured ? "bg-red-400" : ""}
            ${isKingChecked ? "bg-red-200" : ""}
            w-full h-full relative flex justify-center items-center
            ${isDragging ? 'opacity-0' : 'opacity-100'}
            transition-opacity duration-200
          `}
        >
          <img
            className={`w-12 pointer-events-none`}
            src={`/cardinal/${square?.color}/${piece}.svg`}
          />
          {piece === "k" && gameOver.isGameOver && gameOver.playerWon![0]?.toLowerCase() === square?.color ? (
            <img className="w-6 absolute top-1 right-1" src={`/crown.svg`} alt="" />
          ) : null}
          {gameOver.isGameOver && piece === "k" && gameOver.playerWon![0]?.toLowerCase() !== square?.color && (
            gameOver.playerWon![0]?.toLowerCase() !== "w" ? (
              <img className="w-6 absolute top-1 right-1" src={`/black-mate.svg`} alt="" />
            ) : (
              <img className="w-6 absolute top-1 right-1" src={`/white-mate.svg`} alt="" />
            )
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ChessSquare;
