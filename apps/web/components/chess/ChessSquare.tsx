import { Color, PieceSymbol, Square } from "chess.js";

interface ChessSquareProps {
  isKingChecked: boolean;
  isCaptured: boolean;
  isHighlightedSquare: boolean;
  isHighlighted: boolean;
  isMainBoxColor: boolean;
  piece: PieceSymbol | null;
  square: {
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null;
  onClick: () => any;
}

const ChessSquare: React.FC<ChessSquareProps> = ({
  isCaptured,
  isHighlightedSquare,
  isHighlighted,
  isMainBoxColor,
  piece,
  square,
  onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        ${isHighlightedSquare ? "bg-yellow-200" : ""}
        ${isCaptured ? "bg-red-400" : ""}
        ${isHighlighted ? "bg-yellow-400" : ""}
        ${isMainBoxColor ? "bg-gray-400" : "bg-white"}
        w-16 h-16
      `}>
      {square ? (
        <div className="w-full h-full flex justify-center items-center">
          <img className="w-12" src={`/cardinal/${square?.color}/${piece}.svg`} alt="" />
        </div>
      ) : null}
    </div>
  )
}

export default ChessSquare;
