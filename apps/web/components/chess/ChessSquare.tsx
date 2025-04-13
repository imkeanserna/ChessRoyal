"use client";

import { Color, PieceSymbol, Square } from "chess.js";
import { useRecoilValue } from "recoil";
import { isGameOverAtom } from "@repo/store/chessBoard";
import Image from "next/image";
import { useRef } from "react";

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
  onMouseDown: (element: HTMLElement, e: React.MouseEvent | React.TouchEvent) => void;
  isDragging: boolean;
  isHovered: boolean;
  row: number;
  col: number;
  isFlipped: boolean;
  isValidMoveTarget?: boolean;
  isAnimationSource?: boolean;
  isBeingCaptured?: boolean;
}

const ChessSquare: React.FC<ChessSquareProps> = ({
  onMouseDown,
  isKingChecked,
  isCaptured,
  isHighlightedSquare,
  isHighlighted,
  isMainBoxColor,
  piece,
  square,
  isDragging,
  isHovered = false,
  row,
  col,
  isFlipped,
  isValidMoveTarget = false,
  isAnimationSource = false,
  isBeingCaptured = false,
}) => {
  const gameOver = useRecoilValue(isGameOverAtom);
  const pieceRef = useRef<HTMLDivElement>(null);

  // Determine the column label based on whether the board is flipped
  const getColumnLabel = () => {
    return String.fromCharCode(97 + col);
  };

  // Determine the row label based on whether the board is flipped
  const getRowLabel = () => {
    return row;
  };

  const woodTexture = isMainBoxColor
    ? 'bg-blackPlayer'
    : 'bg-whitePlayer';

  const handleMouseDown = (e: React.MouseEvent) => {
    if (pieceRef.current && square) {
      e.preventDefault();
      onMouseDown(pieceRef.current, e);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (pieceRef.current && square) {
      e.preventDefault();
      onMouseDown(pieceRef.current, e);
    }
  };

  return (
    <div
      className={`
        ${woodTexture}
        ${isHighlightedSquare ? "bg-yellow-500" : ""}
        ${isHovered ? "shadow-[inset_0_0_0_4px_rgba(75,85,99,0.3)] z-10" : ""}
        w-20 h-20 relative transition-colors duration-150
      `}
    >
      {/* Legal move indicator */}
      {isHighlighted && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gray-950 rounded-full opacity-40 transition-opacity duration-200" />
      )}

      {/* Valid move target indicator when dragging */}
      {isValidMoveTarget && isDragging && !isHighlighted && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-gray-600 rounded-full opacity-30" />
      )}

      {/* Capture indicator */}
      {isCaptured && (
        <div className="absolute inset-0 flex justify-center items-center z-50">
          <div className="w-8 h-8 bg-red-400 rounded-full shadow-md animate-pulse opacity-70" />
        </div>
      )}

      {/* Column label (bottom row if white, top row if flipped for black) */}
      {(isFlipped ? row === 8 : row === 1) && (
        <div className="absolute bottom-0 right-0 text-lg text-boardBackground font-semibold opacity-50 p-1">
          {getColumnLabel()}
        </div>
      )}

      {/* Row label (leftmost column if white, rightmost column if flipped for black) */}
      {(isFlipped ? col === 7 : col === 0) && (
        <div className="absolute top-0 left-0 text-lg text-boardBackground font-semibold opacity-50 p-1">
          {getRowLabel()}
        </div>
      )}

      {square && !isAnimationSource && !isBeingCaptured ? (
        <div
          ref={pieceRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`
            cursor-grab active:cursor-grabbing
            ${isKingChecked ? "bg-red-600 bg-opacity-40 rounded-full" : ""}
            w-full h-full relative flex justify-center items-center
            ${isDragging ? 'opacity-0' : 'opacity-100'}
            transition-all duration-200
          `}
        >
          <Image
            src={`/cardinal/${square?.color}/${piece}.svg`}
            alt={`${square?.color} ${piece}`}
            width={72}
            height={72}
            className={`pointer-events-none transition-transform duration-200 ${isDragging ? 'scale-95' : 'scale-100'}`}
          />
          {piece === "k" && gameOver.isGameOver && gameOver.playerWon?.[0]?.toLowerCase() === square?.color ? (
            <Image
              src="/crown.svg"
              alt="Crown for winner king"
              width={24}
              height={24}
              className="absolute top-1 right-1 animate-bounce"
            />
          ) : null}
          {gameOver.isGameOver && piece === "k" && gameOver.playerWon?.[0]?.toLowerCase() !== square?.color && (
            gameOver.playerWon?.[0]?.toLowerCase() !== "w" ? (
              <Image
                src="/black-mate.svg"
                alt="Black mate icon"
                width={24}
                height={24}
                className="absolute top-1 right-1"
              />
            ) : (
              <Image
                src="/white-mate.svg"
                alt="White mate icon"
                width={24}
                height={24}
                className="absolute top-1 right-1"
              />
            )
          )}
        </div>
      ) : null}
      {isBeingCaptured && (
        <div className="absolute inset-0 flex justify-center items-center z-10">
          <div className="w-full h-full flex justify-center items-center opacity-30 bg-red-500 animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default ChessSquare;
