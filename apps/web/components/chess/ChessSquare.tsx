import { Color, PieceSymbol, Square } from "chess.js";

interface ChessSquareProps {
  isMainBoxColor: boolean;
  piece: PieceSymbol | null;
  square: {
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null;
}

const ChessSquare: React.FC<ChessSquareProps> = ({ isMainBoxColor, piece, square }) => {
  return (
    <div className={`w-16 h-16 ${isMainBoxColor ? "bg-gray-400" : "bg-white"}`}>
      {square ? (
        <div className="w-full h-full flex justify-center items-center">
          <img className="w-12" src={`/cardinal/${square?.color}/${piece}.svg`} alt="" />
        </div>
      ) : null}
    </div>
  )
}

export default ChessSquare;
