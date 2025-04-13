"use client";

import { useRef, useState } from 'react';
import { Square, PieceSymbol, Color, Chess } from 'chess.js';
import { cubicBezier } from '@repo/chess/chessUtils';

export const useAnimatedMove = (
  boardRef: React.RefObject<HTMLDivElement>,
  chess: Chess,
  isFlipped: boolean,
  setBoard: React.Dispatch<React.SetStateAction<any>>,
  userSelectedMoveIndex: number | null
) => {
  const [animating, setAnimating] = useState(false);
  const [animationSource, setAnimationSource] = useState<Square | null>(null);
  const [animationDestination, setAnimationDestination] = useState<Square | null>(null);
  const [animationPiece, setAnimationPiece] = useState<{ type: PieceSymbol, color: Color } | null>(null);
  const [animationPosition, setAnimationPosition] = useState({ x: 0, y: 0 });
  const [capturedPiece, setCapturedPiece] = useState<{ square: Square, piece: { type: PieceSymbol, color: Color } } | null>(null);
  const animatedPieceRef = useRef<HTMLDivElement>(null);

  const animateMove = (from: Square, to: Square, piece: { type: PieceSymbol, color: Color }) => {
    // Store animation state
    setAnimating(true);
    setAnimationSource(from);
    setAnimationDestination(to);
    setAnimationPiece(piece);

    // Check if this is a capture move
    const destinationPiece = chess.get(to);
    if (destinationPiece) {
      // Store information about the captured piece
      setCapturedPiece({
        square: to,
        piece: destinationPiece
      });
    } else {
      setCapturedPiece(null);
    }

    // Get positions for animation
    if (boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect();
      const squareSize = boardRect.width / 8;

      // Calculate start position (source square)
      let fromCol = from.charCodeAt(0) - 97;
      let fromRow = 8 - parseInt(from.charAt(1));

      // Calculate end position (destination square)
      let toCol = to.charCodeAt(0) - 97;
      let toRow = 8 - parseInt(to.charAt(1));

      // Adjust for flipped board if needed
      if (isFlipped) {
        fromCol = 7 - fromCol;
        fromRow = 7 - fromRow;
        toCol = 7 - toCol;
        toRow = 7 - toRow;
      }

      // Set starting position
      setAnimationPosition({
        x: fromCol * squareSize,
        y: fromRow * squareSize
      });

      // Calculate move distance for dynamic timing
      const distance = Math.sqrt(
        Math.pow(toCol - fromCol, 2) +
        Math.pow(toRow - fromRow, 2)
      );

      // Animation timing: longer distance = slightly longer animation
      // milliseconds
      const baseDuration = 280;
      const duration = baseDuration + (distance * 20);

      // Define animation start and end positions
      const startX = fromCol * squareSize;
      const startY = fromRow * squareSize;
      const endX = toCol * squareSize;
      const endY = toRow * squareSize;

      // Calculate midpoint for arc effect
      const midPointHeight = Math.min(distance * 5, 20);

      // Animate with requestAnimationFrame for smooth motion
      const startTime = performance.now();
      const animate = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        // Enhanced cubic bezier easing function for smoother motion
        const eased = cubicBezier(0.25, 0.1, 0.25, 1.0, progress);

        // Position calculation with slight arc
        const currentX = startX + (endX - startX) * eased;

        // Add arc effect by adjusting Y position using a parabola
        const arcProgress = 4 * eased * (1 - eased);
        const yOffset = -midPointHeight * arcProgress;

        const currentY = startY + (endY - startY) * eased + yOffset;

        // Add scaling effect: slightly larger in the middle of the animation
        const scale = 1 + (0.08 * arcProgress);
        const zIndex = 30;

        setAnimationPosition({
          x: currentX,
          y: currentY
        });

        // Update the styles on the animated piece element
        if (animatedPieceRef.current) {
          animatedPieceRef.current.style.transform = `translate(-1px, -1px) scale(${scale})`;
          animatedPieceRef.current.style.zIndex = `${zIndex}`;

          // Add subtle shadow during animation
          animatedPieceRef.current.style.filter = `drop-shadow(0 ${midPointHeight / 5}px ${midPointHeight / 3}px rgba(0,0,0,0.3))`;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Animation complete - add a small settling effect
          if (animatedPieceRef.current) {
            animatedPieceRef.current.style.transition = 'transform 100ms ease-out';
            animatedPieceRef.current.style.transform = 'translate(-1px, -1px) scale(1)';
            animatedPieceRef.current.style.filter = 'none';
          }

          // Only clear animation states AFTER the settling effect is complete
          setTimeout(() => {
            setAnimating(false);
            setAnimationSource(null);
            setAnimationDestination(null);
            setAnimationPiece(null);
            setCapturedPiece(null);

            // Only now update the board state if needed
            if (!userSelectedMoveIndex) {
              setBoard(chess.board());
            }
          }, 100);
        }
      };

      requestAnimationFrame(animate);
    }
  };

  return {
    animating,
    animationSource,
    animationDestination,
    animationPiece,
    animationPosition,
    animatedPieceRef,
    capturedPiece,
    animateMove
  };
};
