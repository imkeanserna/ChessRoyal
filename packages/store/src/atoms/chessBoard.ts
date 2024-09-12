import { atom } from "recoil";
import { Move } from "chess.js";
import { KingStatus } from "@repo/chess/gameStatus";

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
