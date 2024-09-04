"use client";

import { Color, PieceSymbol, Square, Move, Chess } from "chess.js";
import ChessSquare from "./chess/ChessSquare";
import { useState } from "react";

interface ChessBoardProps {
  gameId: string;
  setBoard: (board: any) => void;
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  chess: Chess;
  socket: WebSocket;
  sendMessage: (event: string, data?: any) => void;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  setBoard,
  gameId,
  board,
  chess,
  socket,
  sendMessage
}) => {
  const [from, setFrom] = useState<Square | null>(null);
  const [moves, setMoves] = useState<Move[]>([]);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      Chess Board
      {board.map((row, i) => {
        i = 8 - i;
        return <div key={i} className="flex">
          {row.map((square, j) => {
            j = j % 8;

            const isMainBoxColor: boolean = (i + j) % 2 !== 0;
            const isPiece: boolean = !!square;
            const squareRepresentation = (String.fromCharCode(97 + j) + '' + i) as Square;
            const piece = square && square.type;

            return <ChessSquare
              onClick={() => {
                try {
                  if (!from) {
                    setFrom(squareRepresentation);
                  }

                  if (!from) {
                    return;
                  }

                  let moveResult: Move;
                  moveResult = chess.move({
                    from,
                    to: squareRepresentation
                  });

                  if (moveResult) {
                    setMoves((prevMove) => [...prevMove, moveResult]);
                    setFrom(null);

                    setBoard(chess.board());
                    sendMessage("move", {
                      gameId,
                      move: moveResult
                    });
                  }
                } catch (error) {
                  console.log(error);
                }
              }}
              isMainBoxColor={isMainBoxColor}
              piece={piece}
              key={j}
              square={square}
            />
          })}
        </div>
      })}
    </div>
  );
};

export default ChessBoard;
