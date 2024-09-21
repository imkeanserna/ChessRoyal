import { atom, selector } from "recoil";
import { Player } from "../../../chess/src/PlayerTypes";

interface Players {
  blackPlayer: Player;
  whitePlayer: Player;
}

export const gameMetadataAtom = atom<Players>({
  key: "gameMetadata",
  default: {
    blackPlayer: {
      id: "",
      name: "",
      isGuest: true,
      remainingTime: 0
    },
    whitePlayer: {
      id: "",
      name: "",
      isGuest: true,
      remainingTime: 0
    }
  }
});

export const remoteGameIdAtom = atom<string | null>({
  key: "remoteGameId",
  default: null
});
