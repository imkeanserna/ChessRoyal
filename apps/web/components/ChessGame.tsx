"use client";

import { GameStatus } from "@repo/chess/gameStatus";
import { gameMetadataAtom, remoteGameIdAtom } from "@repo/store/gameMetadata";
import { useSocketContext } from "@repo/ui/context/socketContext";
import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Players } from "./ChessMenu";
import ChessBoard from "./ChessBoard";
import { Chess, Move } from "chess.js";
import { isPromoting } from "@repo/chess/isPromoting";
import { movesAtom } from "@repo/store/chessBoard";
import { userAtom } from "@repo/store/user";

interface ChessGameProps {
  gameId: string
}

const ChessGame: React.FC<ChessGameProps> = ({ gameId }) => {
  const { socket, sendMessage } = useSocketContext();
  const gameMetadataState = useRecoilValue<Players>(gameMetadataAtom);
  const remoteGameId = useRecoilValue(remoteGameIdAtom);
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const setMoves = useSetRecoilState(movesAtom);
  const user = useRecoilValue(userAtom);

  useEffect(() => {
    if (!socket) {
      console.log("no socket");
      return;
    }

    if (user === null) {
      return;
    }

    socket.onmessage = (messageEvent) => {
      const { event, payload } = JSON.parse(messageEvent.data);

      console.log("message", event, payload);
      switch (event) {
        case GameStatus.MOVE:
          // do something
          console.log("move", payload.move);
          try {
            if (isPromoting(chess, payload.move.from, payload.move.to)) {
              chess.move({
                from: payload.move.from,
                to: payload.move.to,
                promotion: 'q'
              });
            } else {
              chess.move({
                from: payload.move.from,
                to: payload.move.to
              });
            }
            setMoves((moves) => [...moves, payload.move]);
          } catch (error) {
            console.log("Error", error);
          }
          break;
        case GameStatus.GAME_OVER:
          // do something
          break;
        case GameStatus.WAITING:
          // do something
          break;
        default:
          break;
      }
    };
  }, [socket]);

  return (
    <div>
      <ChessBoard
        setBoard={setBoard}
        gameId={gameId}
        board={board}
        chess={chess}
        sendMessage={sendMessage}
        myColor={user?.id === gameMetadataState.whitePlayer.id ? 'w' : 'b'}
      />
    </div>
  )
}

export default ChessGame;
