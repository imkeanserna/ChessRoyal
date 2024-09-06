"use client";

import { Color, PieceSymbol, Square, Move, Chess } from "chess.js";
import ChessSquare from "./chess/ChessSquare";
import { useEffect, useState } from "react";
import { GameStatus } from "@repo/chess/gameStatus";
import { isPromoting } from "@repo/chess/isPromoting";
import { useRecoilState } from "recoil";
import { movesAtom } from "@repo/store/chessBoard";

interface ChessBoardProps {
  gameId: string;
  setBoard: React.Dispatch<
    React.SetStateAction<
      ({
        square: Square;
        type: PieceSymbol;
        color: Color;
      } | null)[][]
    >
  >;
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
  setBoard,
  gameId,
  board,
  chess,
  sendMessage,
  myColor
}) => {
  const [from, setFrom] = useState<Square | null>(null);
  const [moves, setMoves] = useRecoilState(movesAtom);
  const isMyTurn: boolean = chess.turn() === myColor;

  useEffect(() => {
    console.log(isMyTurn);
    setBoard(chess.board());
  }, [moves]);

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
                  if (!isMyTurn) {
                    return;
                  }

                  if (!from) {
                    setFrom(squareRepresentation);
                  }

                  if (!from) {
                    return;
                  }

                  let moveResult: Move;
                  if (isPromoting(chess, from, squareRepresentation)) {
                    console.log("isPromoting")
                    moveResult = chess.move({
                      from,
                      to: squareRepresentation,
                      promotion: 'q'
                    });
                  } else {
                    moveResult = chess.move({
                      from,
                      to: squareRepresentation
                    });
                  }

                  if (moveResult) {
                    console.log("moving.....................")
                    setMoves((prevMove) => [...prevMove, moveResult]);
                    setFrom(null);

                    sendMessage(GameStatus.MOVE, {
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