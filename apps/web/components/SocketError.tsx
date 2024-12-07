"use client";

import { useSocketContext } from "@repo/ui/context/socketContext";
import { Button } from "@repo/ui/components/ui/button";
import { Coffee, RefreshCw } from 'lucide-react';
import Link from "next/link";
import { FC, PropsWithChildren, useEffect, useState } from "react";

const SocketError: FC<PropsWithChildren> = ({ children }) => {
  const { errorMessage } = useSocketContext();

  if (errorMessage) {
    return <ChessLoading />
  }
  return <>{children}</>;
};

export default SocketError;

const BOARD_POSITIONS = {
  'a8': { top: 0, left: 0 },
  'b8': { top: 0, left: 1 },
  'c8': { top: 0, left: 2 },
  'd8': { top: 0, left: 3 },
  'e8': { top: 0, left: 4 },
  'f8': { top: 0, left: 5 },
  'g8': { top: 0, left: 6 },
  'h8': { top: 0, left: 7 },
  'a7': { top: 1, left: 0 },
  'b7': { top: 1, left: 1 },
  'c7': { top: 1, left: 2 },
  'd7': { top: 1, left: 3 },
  'e7': { top: 1, left: 4 },
  'f7': { top: 1, left: 5 },
  'g7': { top: 1, left: 6 },
  'h7': { top: 1, left: 7 },
  'a2': { top: 6, left: 0 },
  'b2': { top: 6, left: 1 },
  'c2': { top: 6, left: 2 },
  'd2': { top: 6, left: 3 },
  'e2': { top: 6, left: 4 },
  'f2': { top: 6, left: 5 },
  'g2': { top: 6, left: 6 },
  'h2': { top: 6, left: 7 },
  'a1': { top: 7, left: 0 },
  'b1': { top: 7, left: 1 },
  'c1': { top: 7, left: 2 },
  'd1': { top: 7, left: 3 },
  'e1': { top: 7, left: 4 },
  'f1': { top: 7, left: 5 },
  'g1': { top: 7, left: 6 },
  'h1': { top: 7, left: 7 }
};

// Chess piece components
const ChessPiece = ({
  type,
  color,
  position,
  index
}: {
  type: string,
  color: 'white' | 'black',
  position: string,
  index: number
}) => {
  const pieceIcons = {
    'king': '♔',
    'queen': '♕',
    'rook': '♖',
    'bishop': '♗',
    'knight': '♘',
    'pawn': '♙'
  };

  const blackPieceIcons = {
    'king': '♚',
    'queen': '♛',
    'rook': '♜',
    'bishop': '♝',
    'knight': '♞',
    'pawn': '♟'
  };

  const iconMap = color === 'white' ? pieceIcons : blackPieceIcons;
  const icon = iconMap[type as keyof typeof iconMap];
  const gridPos = BOARD_POSITIONS[position as keyof typeof BOARD_POSITIONS];

  return (
    <div
      className={`
        absolute w-8 h-8 flex items-center justify-center
        transition-all duration-1000 ease-out
        text-3xl
        ${color === 'white' ? 'text-gray-800' : 'text-gray-900'}
        animate-drop-in
      `}
      style={{
        animationDelay: `${index * 100}ms`,
        top: `${gridPos.top * 12.5}%`,
        left: `${gridPos.left * 12.5}%`,
        transform: `translateY(-100vh) rotate(${Math.random() * 360}deg)`,
      }}
    >
      {icon}
    </div>
  );
};
// Chess board setup
const ChessLoading = () => {

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center p-4 text-center">
      <div className="relative max-w-md w-full bg-white shadow-2xl rounded-2xl p-6 border border-blue-100 overflow-hidden">
        {/* Animated Background Circles */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200 rounded-full opacity-30 animate-blob"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-green-200 rounded-full opacity-30 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-4 relative">
            <Coffee className="text-blue-500 w-16 h-16 animate-bounce" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
          </div>

          <ChessBoardAnimation />

          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Setting up the game
          </h2>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-4 flex items-center gap-3 w-full">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-gray-700 text-sm">
              Our free hosting is waking up. This might take up to 50 seconds.
              Time to prepare your chess strategy!
            </span>
          </div>

          <div className="flex justify-center space-x-4 w-full">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
            <Button asChild className="w-full">
              <Link href="/">
                Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ChessBoardAnimation = () => {
  const [piecesPlaced, setPiecesPlaced] = useState(false);

  const pieces = [
    // White pieces
    { type: 'rook', color: 'white', position: 'a1' },
    { type: 'knight', color: 'white', position: 'b1' },
    { type: 'bishop', color: 'white', position: 'c1' },
    { type: 'queen', color: 'white', position: 'd1' },
    { type: 'king', color: 'white', position: 'e1' },
    { type: 'bishop', color: 'white', position: 'f1' },
    { type: 'knight', color: 'white', position: 'g1' },
    { type: 'rook', color: 'white', position: 'h1' },
    ...['a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2'].map(pos => ({ type: 'pawn', color: 'white', position: pos })),

    // Black pieces
    { type: 'rook', color: 'black', position: 'a8' },
    { type: 'knight', color: 'black', position: 'b8' },
    { type: 'bishop', color: 'black', position: 'c8' },
    { type: 'queen', color: 'black', position: 'd8' },
    { type: 'king', color: 'black', position: 'e8' },
    { type: 'bishop', color: 'black', position: 'f8' },
    { type: 'knight', color: 'black', position: 'g8' },
    { type: 'rook', color: 'black', position: 'h8' },
    ...['a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7'].map(pos => ({ type: 'pawn', color: 'black', position: pos })),
  ];

  useEffect(() => {
    const timer = setTimeout(() => setPiecesPlaced(true), pieces.length * 120);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="relative w-64 h-64 bg-gray-100 border-4 border-gray-300 rounded-lg mb-4 overflow-hidden grid grid-cols-8 grid-rows-8">
      {[...Array(64)].map((_, index) => {
        const row = Math.floor(index / 8);
        const col = index % 8;
        return (
          <div
            key={index}
            className={`
              w-full h-full
              ${(row + col) % 2 === 0 ? 'bg-white' : 'bg-gray-300'}
            `}
          />
        );
      })}

      {/* Pieces */}
      {pieces.map((piece, index) => (
        <ChessPiece
          key={piece.position}
          type={piece.type}
          color={piece.color as any}
          position={piece.position}
          index={index}
        />
      ))}
    </div>
  )
}
