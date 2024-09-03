import { atom } from "recoil";
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
      isGuest: true
    },
    whitePlayer: {
      id: "",
      name: "",
      isGuest: true
    }
  }
});

export const remoteGameIdAtom = atom<string | null>({
  key: "remoteGameId",
  default: null
});
