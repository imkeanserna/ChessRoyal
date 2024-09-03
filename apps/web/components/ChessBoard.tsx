import { Color, PieceSymbol, Square } from "chess.js";
import ChessSquare from "./chess/ChessSquare";

const ChessBoard: React.FC<any> = ({ board }: {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
}) => {

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
