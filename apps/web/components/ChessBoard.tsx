"use client";

import { Color, PieceSymbol, Square, Move, Chess } from "chess.js";
import { DragEvent, useEffect, useRef, useState } from "react";
import { GameMessages } from "@repo/chess/gameStatus";
import { isPromoting } from "@repo/chess/isPromoting";
import { useRecoilState } from "recoil";
import { isGameOverAtom, movesAtom } from "@repo/store/chessBoard";
import { userSelectedMoveIndexAtom } from "@repo/store/user";
import ChessSquare from "./chess/ChessSquare";
import Image from "next/image";
import { useAnimatedMove } from "@/hooks/useAnimatedMove";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";

interface ChessBoardProps {
  started: boolean;
  gameId: string;
  setBoard: React.Dispatch<React.SetStateAction<({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][]>>;
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  chess: Chess;
  myColor: Color;
  sendMessage: (event: string, data?: any) => void;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  started,
  setBoard,
  gameId,
  board,
  chess,
  sendMessage,
  myColor
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [moves, setMoves] = useRecoilState(movesAtom);
  const [gameOver, setGameOver] = useRecoilState(isGameOverAtom);
  const [userSelectedMoveIndex, setUserSelectedMoveIndex] = useRecoilState(userSelectedMoveIndexAtom);
  const [isFlipped, setIsFlipped] = useState(myColor === 'b');
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [history, setHistory] = useState<Move[][]>([[]]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  const chessRef = useRef(chess);
  const processedMovesRef = useRef(new Set<string>());
  const isAnimatingRef = useRef(false);
  const boardStateRef = useRef(board);

  useEffect(() => {
    chessRef.current = chess;
  }, [chess]);

  useEffect(() => {
    boardStateRef.current = board;
  }, [board]);

  const isMyTurn = chess.turn() === myColor;

  const {
    animating,
    animationSource,
    animationDestination,
    animationPiece,
    animationPosition,
    animatedPieceRef,
    capturedPiece,
    animateMove
  } = useAnimatedMove(boardRef, chess, isFlipped, setBoard, userSelectedMoveIndex);

  const {
    isDragging,
    draggedPiece,
    dragPosition,
    hoverSquare,
    legalMoves,
    captureMoves,
    setDragPosition,
    setHoverSquare,
    setDraggedPiece,
    setIsDragging,
    setLegalMoves,
    setCaptureMoves,
    handleDragStart,
    getSquareFromPosition
  } = useDragAndDrop(boardRef, chess, isFlipped, isMyTurn, started, myColor);

  // Set board orientation based on player color - only run once when color is set
  useEffect(() => {
    setIsFlipped(myColor === 'b');
  }, [myColor]);

  // Handle reviewing specific moves
  useEffect(() => {
    if (userSelectedMoveIndex === null || !moves[userSelectedMoveIndex]) return;

    const move = moves[userSelectedMoveIndex];
    if (!move || !move.after) return;

    // Only update if we're actually changing position
    const moveSignature = `review-${userSelectedMoveIndex}`;
    if (processedMovesRef.current.has(moveSignature)) return;
    processedMovesRef.current.add(moveSignature);

    try {
      chess.load(move.after);
      setLastMove({ from: move.from, to: move.to });
      setBoard(chess.board());
    } catch (error) {
      console.error("Error loading position:", error);
    }
  }, [userSelectedMoveIndex, moves, chess, setBoard]);

  // Handle new moves (especially opponent moves)
  useEffect(() => {
    if (moves.length === 0 || isAnimatingRef.current) return;

    const lastMoveIndex = moves.length - 1;
    const lastMove = moves[lastMoveIndex];
    if (!lastMove) return;

    // Create a unique key for this move
    const moveKey = `${lastMove.from}-${lastMove.to}-${lastMoveIndex}`;

    if (processedMovesRef.current.has(moveKey)) return;
    processedMovesRef.current.add(moveKey);

    if (lastMove.color !== myColor) {
      isAnimatingRef.current = true;

      animateMove(
        lastMove.from,
        lastMove.to,
        { type: lastMove.piece, color: lastMove.color }
      );

      setTimeout(() => {
        resetChessPosition();
        setUserSelectedMoveIndex(null);
        setBoard(chess.board());
        setLastMove({ from: lastMove.from, to: lastMove.to });
        isAnimatingRef.current = false;
      }, 500);
    } else {
      setLastMove({ from: lastMove.from, to: lastMove.to });
    }
  }, [moves.length, myColor, animateMove, setBoard, setUserSelectedMoveIndex]);

  // Reset to current game state (not reviewing moves)
  const resetToOngoingGame = () => {
    if (userSelectedMoveIndex !== null) {
      resetChessPosition();
      setBoard(chess.board());
      setUserSelectedMoveIndex(null);
    }
  };

  // Helper to reset the chess position based on all moves
  const resetChessPosition = () => {
    try {
      chess.reset();
      moves.forEach((move: Move) => {
        chess.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion
        });
      });
    } catch (error) {
      console.error("Error resetting position:", error);
    }
  };

  // Handle mouse/touch events during dragging
  useEffect(() => {
    if (!isDragging || !draggedPiece) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!boardRef.current) return;
      const boardRect = boardRef.current.getBoundingClientRect();
      updateDragPosition(e.clientX, e.clientY, boardRect);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!boardRef.current || !e.touches[0]) return;

      e.preventDefault();
      const boardRect = boardRef.current.getBoundingClientRect();
      updateDragPosition(e.touches[0].clientX, e.touches[0].clientY, boardRect);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!boardRef.current) return;
      const to = getSquareFromPosition(e.clientX, e.clientY);
      handleMovePiece(to);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!boardRef.current) return;

      if (e.changedTouches[0]) {
        const touch = e.changedTouches[0];
        const to = getSquareFromPosition(touch.clientX, touch.clientY);
        handleMovePiece(to);
      } else {
        cancelMove();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, draggedPiece, getSquareFromPosition]);

  // Helper for drag position updates
  // Center piece on cursor/touch
  const updateDragPosition = (clientX: number, clientY: number, boardRect: DOMRect) => {
    const newDragPosition = {
      x: clientX - boardRect.left - 36,
      y: clientY - boardRect.top - 36,
    };

    if (typeof setDragPosition === 'function') {
      setDragPosition(newDragPosition);

      const newHoverSquare = getSquareFromPosition(clientX, clientY);
      if (typeof setHoverSquare === 'function') {
        setHoverSquare(newHoverSquare);
      }
    }
  };

  // Process a chess move
  const handleMovePiece = (to: Square | null) => {
    if (!to || !draggedPiece) {
      cancelMove();
      return;
    }

    try {
      const pieceToMove = chess.get(draggedPiece.from);
      if (!pieceToMove) {
        cancelMove();
        return;
      }

      let moveResult: Move;
      if (isPromoting(chess, draggedPiece.from, to)) {
        moveResult = chess.move({
          from: draggedPiece.from,
          to,
          promotion: 'q'
        });
      } else {
        moveResult = chess.move({
          from: draggedPiece.from,
          to
        });
      }

      if (moveResult) {
        animateMove(draggedPiece.from, to, pieceToMove);
        const newHistory = [...history.slice(0, currentMoveIndex + 1), [...moves, moveResult]];
        setHistory(newHistory);
        setCurrentMoveIndex(newHistory.length - 1);

        setMoves([...moves, moveResult]);
        setLastMove({ from: draggedPiece.from, to });

        // Check for checkmate
        if (moveResult.san && moveResult.san.includes('#')) {
          setGameOver({
            isGameOver: true,
            playerWon: chess.turn() === 'w' ? 'b' : 'w'
          });
        }

        sendMessage(GameMessages.MOVE, {
          gameId,
          move: moveResult
        });
        setBoard(chess.board());
      }
    } catch (error) {
      console.log('Invalid move:', error);
    }

    cancelMove();
  };

  const cancelMove = () => {
    if (typeof setDraggedPiece === 'function') setDraggedPiece(null);
    if (typeof setIsDragging === 'function') setIsDragging(false);
    if (typeof setLegalMoves === 'function') setLegalMoves([]);
    if (typeof setCaptureMoves === 'function') setCaptureMoves([]);
    if (typeof setHoverSquare === 'function') setHoverSquare(null);
  };

  const isHighlightedSquare = (square: Square) => {
    return lastMove && (lastMove.from === square || lastMove.to === square);
  }

  return (
    <div
      className="my-4 flex flex-col justify-center items-center"
      onClick={resetToOngoingGame}
    >
      <div
        ref={boardRef}
        className="relative border-16 border-customBorder rounded-lg shadow-[5px_5px_15px_rgba(128,128,128,0.4)]"
      >
        {/* Chessboard squares */}
        {(isFlipped ? board.slice().reverse() : board).map((row, i) => {
          const displayRow = isFlipped ? i + 1 : 8 - i;
          const displayRowData = isFlipped ? row.slice().reverse() : row;

          return (
            <div key={displayRow} className="flex">
              {displayRowData.map((square, j) => {
                const displayCol = isFlipped ? 7 - (j % 8) : j % 8;
                const isMainBoxColor = (displayRow + displayCol) % 2 !== 0;
                const squareRepresentation = (String.fromCharCode(97 + displayCol) + '' + displayRow) as Square;
                const piece = square && square.type;

                // Square state calculations
                const isValidMoveTarget = legalMoves.includes(squareRepresentation) || captureMoves.includes(squareRepresentation);
                const isHovered = isDragging && hoverSquare === squareRepresentation;
                const isBeingCaptured = animating && capturedPiece?.square === squareRepresentation;

                return (
                  <ChessSquare
                    key={displayCol}
                    onMouseDown={(element, e) => square && handleDragStart(squareRepresentation, square, element, e)}
                    isKingChecked={square?.type === 'k' && square?.color === chess.turn() && chess.isCheck()}
                    isCaptured={captureMoves.includes(squareRepresentation)}
                    isHighlightedSquare={isHighlightedSquare(squareRepresentation) || false}
                    isHighlighted={legalMoves.includes(squareRepresentation)}
                    isMainBoxColor={isMainBoxColor}
                    piece={piece!}
                    square={square}
                    isDragging={draggedPiece?.from === squareRepresentation && isDragging}
                    isHovered={isHovered}
                    row={displayRow}
                    col={displayCol}
                    isFlipped={isFlipped}
                    isValidMoveTarget={isValidMoveTarget}
                    isAnimationSource={animating && animationSource === squareRepresentation}
                    isAnimationDestination={animating && animationDestination === squareRepresentation}
                    isBeingCaptured={isBeingCaptured}
                  />
                );
              })}
            </div>
          );
        })}

        {/* Dragging piece overlay */}
        {isDragging && draggedPiece && (
          <div
            className="absolute cursor-grab active:cursor-grabbing z-10 transition-transform duration-75"
            style={{
              left: `${dragPosition.x}px`,
              top: `${dragPosition.y}px`,
              width: "72px",
              height: "72px",
              transform: `scale(1.1)`,
              opacity: 0.9
            }}
          >
            <Image
              src={`/cardinal/${draggedPiece.piece.color}/${draggedPiece.piece.type}.svg`}
              alt={`${draggedPiece.piece.color} ${draggedPiece.piece.type}`}
              width={72}
              height={72}
              className="select-none"
            />
          </div>
        )}

        {/* Animated piece overlay */}
        {animating && animationPiece && (
          <div
            ref={animatedPieceRef}
            className="absolute z-20 pointer-events-none transition-all"
            style={{
              left: `${animationPosition.x}px`,
              top: `${animationPosition.y}px`,
              width: "72px",
              height: "72px",
              transform: "translate(-1px, -1px)",
            }}
          >
            <Image
              src={`/cardinal/${animationPiece.color}/${animationPiece.type}.svg`}
              alt={`${animationPiece.color} ${animationPiece.type}`}
              width={72}
              height={72}
              className="select-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChessBoard;
