import { GameMessages } from "@repo/chess/gameStatus";
import { useCallback } from "react";

export function useGameActions(sendMessage: Function) {
  const offerDraw = useCallback(
    (gameId: string) => {
      sendMessage(GameMessages.DRAW_OFFERED, { gameId });
    },
    [sendMessage]
  );

  const respondToDraw = useCallback(
    (gameId: string, response: 'accept' | 'decline') => {
      sendMessage(GameMessages.DRAW_RESPONSED, {
        gameId,
        response
      });
    },
    [sendMessage]
  );

  const resignGame = useCallback(
    (gameId: string) => {
      sendMessage(GameMessages.USER_RESIGNED, { gameId });
    },
    [sendMessage]
  );


  return {
    offerDraw,
    resignGame,
    respondToDraw
  };
}
