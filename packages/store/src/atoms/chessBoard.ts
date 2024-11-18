import { atom } from "recoil";
import { Move } from "chess.js";
import { KingStatus } from "../../../chess/src/GameEnums";

export const movesAtom = atom<Move[]>({
  key: "moves",
  default: []
});

export const isCheckAtom = atom<{
  king_status: KingStatus
  player: string | null
}>({
  key: "inCheck",
  default: {
    king_status: KingStatus.SAFE,
    player: null
  }
});

type IsGameOver = {
  isGameOver: boolean;
  playerWon: string | null;
};

export const isGameOverAtom = atom<IsGameOver>({
  key: "isGameOver",
  default: {
    isGameOver: false,
    playerWon: null
  }
});
