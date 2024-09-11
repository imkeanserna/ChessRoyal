import { movesAtom } from "@repo/store/chessBoard";
import { useRecoilValue, useSetRecoilState } from "recoil";
import React from "react";
import { Move } from "chess.js";
import { userSelectedMoveIndexAtom } from "@repo/store/user";
import { Button } from "@repo/ui/components/ui/button";

const MovesTable: React.FC = () => {
  const moves = useRecoilValue<Move[]>(movesAtom);
  const setUserSelectedMove = useSetRecoilState(userSelectedMoveIndexAtom);

  return (<div>
    <h1>Moves</h1>
    <div className="grid grid-cols-7 w-full gap-2">
      {moves.map((move, index) =>
        index % 2 === 0 ? (
          <React.Fragment key={index}>
            <span>{index / 2 + 1}.</span>
            <div className="col-span-3">
              <Button onClick={() => {
                console.log("clicked");
                setUserSelectedMove(index);
              }}>
                {move.to}
              </Button>
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div className="col-span-3">
              <Button onClick={() => {
                console.log("clicked");
                setUserSelectedMove(index);
              }}>
                {move.to}
              </Button>
            </div>
          </React.Fragment>
        )
      )}
    </div>
  </div>);
}

export default MovesTable;
