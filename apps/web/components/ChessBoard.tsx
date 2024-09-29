"use client";

import { Color, PieceSymbol, Square, Move, Chess } from "chess.js";
import ChessSquare from "./chess/ChessSquare";
import { MouseEvent, useEffect, useState } from "react";
import { GameMessages } from "@repo/chess/gameStatus";
import { isPromoting } from "@repo/chess/isPromoting";
import { useRecoilState } from "recoil";
import { isGameOverAtom, movesAtom } from "@repo/store/chessBoard";
import { userSelectedMoveIndexAtom } from "@repo/store/user";

interface ChessBoardProps {
  started: boolean;
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
  started,
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
  const [gameOver, setGameOver] = useRecoilState(isGameOverAtom);
  const [isFlipped, setIsFlipped] = useState(false);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [captureMoves, setCaptureMoves] = useState<Square[]>([]);
  const [userSelectedMoveIndex, setUserSelectedMoveIndex] = useRecoilState(userSelectedMoveIndexAtom);
  const [lastMove, setLastMove] = useState<{ from: Square, to: Square } | null>(null);

  const isHighlightedSquare = (square: Square) => {
    return lastMove && (lastMove.from === square || lastMove.to === square);
  }

  const isKingInCheckSquare = (piece: string, color: string, chess: Chess) => {
    return piece === "k" && color === chess.turn() && chess.isCheck();
  }

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Clear existing highlights
    setLegalMoves([]);
    setCaptureMoves([]);
  };

  useEffect(() => {
    if (myColor === 'b') {
      setIsFlipped(true);
    }
  }, [myColor]);

  useEffect(() => {
    if (userSelectedMoveIndex !== null) {
      const move: Move = moves[userSelectedMoveIndex];
      chess.load(move.after);
      setLastMove({
        from: move.from,
        to: move.to
      });
      setBoard(chess.board());
      return;
    }
  }, [userSelectedMoveIndex]);

  useEffect(() => {
    if (userSelectedMoveIndex !== null) {
      chess.reset();
      moves.forEach((move: Move) => {
        chess.move({
          from: move.from,
          to: move.to
        });
      });
      setBoard(chess.board());
      setUserSelectedMoveIndex(null);
    } else {
      setBoard(chess.board());
    }
  }, [moves]);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      Chess Board
      {(isFlipped ? board.slice().reverse() : board).map((row, i) => {
        i = isFlipped ? i + 1 : 8 - i;

        row = isFlipped ? row.slice().reverse() : row;
        return <div key={i} className="flex">
          {row.map((square, j) => {
            j = isFlipped ? 7 - (j % 8) : j % 8;

            const isMainBoxColor: boolean = (i + j) % 2 !== 0;
            const isPiece: boolean = square !== null && square !== undefined;
            const squareRepresentation = (String.fromCharCode(97 + j) + '' + i) as Square;
            const piece = square && square.type;

            return <ChessSquare
              onClick={() => {
                if (!started) return;

                if (userSelectedMoveIndex !== null) {
                  chess.reset();
                  moves.forEach((move: Move) => {
                    chess.move({
                      from: move.from,
                      to: move.to
                    });
                  });
                  setBoard(chess.board());
                  setUserSelectedMoveIndex(null);
                  setLastMove(null);
                  return;
                }

                if (!isMyTurn) {
                  console.log("not my turn");
                  return;
                }

                if (square?.color === chess.turn()) {
                  // If clicking on a piece that belongs to the player
                  if (from !== squareRepresentation) {
                    setFrom(squareRepresentation);

                    const moves = chess.moves({
                      square: squareRepresentation,
                      verbose: true
                    });

                    // Set legal moves and capture moves
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
                  } else {
                    // If clicking the same piece, reset
                    setFrom(null);
                    setLegalMoves([]);
                    setCaptureMoves([]);
                  }
                } else if (from) {
                  // Attempt to make a move if from is set
                  try {
                    let moveResult: Move;

                    if (isPromoting(chess, from, squareRepresentation)) {
                      moveResult = chess.move({
                        from,
                        to: squareRepresentation,
                        promotion: 'q' // or whatever promotion you want
                      });
                    } else {
                      moveResult = chess.move({
                        from,
                        to: squareRepresentation
                      });
                    }

                    if (moveResult) {
                      setMoves((prevMove) => [...prevMove, moveResult]);
                      setFrom(null);

                      if (moveResult.san.includes('#')) {
                        setGameOver({
                          isGameOver: true,
                          playerWon: chess.turn()
                        });
                      }

                      sendMessage(GameMessages.MOVE, {
                        gameId,
                        move: moveResult
                      });
                    }
                  } catch (error) {
                    console.log(error);
                  }
                }
              }}
              onMouseDown={(e: MouseEvent<HTMLDivElement>) => handleMouseDown(e)}
              isKingChecked={isKingInCheckSquare(square?.type!, square?.color!, chess)}
              isCaptured={captureMoves.includes(squareRepresentation)}
              isHighlightedSquare={isHighlightedSquare(squareRepresentation) || false}
              isHighlighted={legalMoves.includes(squareRepresentation)}
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
