import { isGameOverAtom } from "@repo/store/chessBoard";
import { Color, PieceSymbol, Square } from "chess.js";
import { useRecoilValue } from "recoil";

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
  isKingChecked,
  isCaptured,
  isHighlightedSquare,
  isHighlighted,
  isMainBoxColor,
  piece,
  square,
  onClick }) => {
  const gameOver = useRecoilValue(isGameOverAtom);

  return (
    <div
      onClick={onClick}
      className={`
        ${isHighlightedSquare ? "bg-yellow-200" : ""}
        ${isHighlighted ? "bg-yellow-400" : ""}
        ${isMainBoxColor ? "bg-gray-400" : "bg-white"}
        w-16 h-16
      `}>
      {square ? (
        <div
          className={`
          ${isCaptured ? "bg-red-400" : ""}
          ${isKingChecked ? "bg-red-200" : ""}
           w-full h-full relative flex justify-center items-center`
          }>
          <img className="w-12" src={`/cardinal/${square?.color}/${piece}.svg`} alt="" />
          {piece === "k" && gameOver.isGameOver && gameOver.playerWon![0]?.toLowerCase() === square?.color ?
            <img className="w-6 absolute top-1 right-1" src={`/crown.svg`} alt="" />
            :
            null
          }
          {gameOver.isGameOver && piece === "k" && gameOver.playerWon![0]?.toLowerCase() !== square?.color &&
            (gameOver.playerWon![0]?.toLowerCase() !== "w" ?
              <img className="w-6 absolute top-1 right-1" src={`/black-mate.svg`} alt="" />
              :
              <img className="w-6 absolute top-1 right-1" src={`/white-mate.svg`} alt="" />)
          }
        </div>
      ) : null}
    </div>
  )
}

export default ChessSquare;
