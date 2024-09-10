"use client";

import { movesAtom } from "@repo/store/chessBoard";
import { useRecoilValue } from "recoil";
import React, { useEffect } from "react";
import { Move } from "chess.js";

const MovesTable: React.FC = () => {
  const moves = useRecoilValue<Move[]>(movesAtom);

  return (<div>
    <h1>Moves</h1>
    <div className="grid grid-cols-7 w-full gap-2">
      {moves.map((move, index) =>
        index % 2 === 0 ? (
          <React.Fragment key={index}>
            <span>{index / 2 + 1}</span>
            <div className="col-span-3">
              {move.to}
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div className="col-span-3">
              {move.to}
            </div>
          </React.Fragment>
        )
      )}
    </div>
  </div>);
}

export default MovesTable;
