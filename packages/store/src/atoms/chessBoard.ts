import { atom } from "recoil";
import { Move } from "chess.js";

export const movesAtom = atom<Move[]>({
  key: "moves",
  default: []
});
