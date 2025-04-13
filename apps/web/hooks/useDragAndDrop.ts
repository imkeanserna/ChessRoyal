import { useState } from 'react';
import { Square, PieceSymbol, Color, Chess } from 'chess.js';

export const useDragAndDrop = (
  boardRef: React.RefObject<HTMLDivElement>,
  chess: Chess,
  isFlipped: boolean,
  isMyTurn: boolean,
  started: boolean,
  myColor: Color
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState<{
    from: Square;
    piece: { type: PieceSymbol; color: Color };
    element: HTMLElement | null;
  } | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [hoverSquare, setHoverSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [captureMoves, setCaptureMoves] = useState<Square[]>([]);

  const getSquareFromPosition = (x: number, y: number): Square | null => {
    if (boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect();
      const squareSize = boardRect.width / 8;

      // Calculate which square the piece is over
      let col = Math.floor((x - boardRect.left) / squareSize);
      let row = Math.floor((y - boardRect.top) / squareSize);
      col = Math.max(0, Math.min(7, col));
      row = Math.max(0, Math.min(7, row));

      if (isFlipped) {
        row = 7 - row;
        col = 7 - col;
      }
      return (String.fromCharCode(97 + col) + (8 - row)) as Square;
    }
    return null;
  };

  const handleDragStart = (
    from: Square,
    piece: { type: PieceSymbol; color: Color },
    element: HTMLElement,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    if (!isMyTurn || !started || piece.color !== myColor) {
      return;
    }
    setDraggedPiece({ from, piece, element });
    setIsDragging(true);

    if (boardRef.current && element) {
      const boardRect = boardRef.current.getBoundingClientRect();
      let clientX: number, clientY: number;

      if ('touches' in e && e.touches.length > 0) {
        const touch = e.touches[0];
        if (touch) {
          clientX = touch.clientX;
          clientY = touch.clientY;
        } else {
          return;
        }
      } else if ('touches' in e) {
        // Touch event with no touches (rare edge case)
        // Exit early if no touch points
        return;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      setDragPosition({
        x: clientX - boardRect.left - 36,
        y: clientY - boardRect.top - 36,
      });
    }

    const moves = chess.moves({ square: from, verbose: true });
    setLegalMoves(
      moves
        .filter((move: { flags: string }) => !move.flags.includes("c"))
        .map((it: { to: Square }) => it.to)
    );
    setCaptureMoves(
      moves
        .filter((move: { flags: string }) => move.flags.includes("c"))
        .map((it: { to: Square }) => it.to)
    );
  };

  return {
    isDragging,
    setIsDragging,
    draggedPiece,
    setDraggedPiece,
    dragPosition,
    setDragPosition,
    hoverSquare,
    setHoverSquare,
    legalMoves,
    setLegalMoves,
    captureMoves,
    setCaptureMoves,
    handleDragStart,
    getSquareFromPosition
  };
};
