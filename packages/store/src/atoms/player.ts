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

export const gameMetadataSelector = selector<Players>({
  key: 'gameMetadataSelector',
  get: async ({ get }) => {
    // Helper function to add a 3-second delay
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      // Wait for 3 seconds before returning the data
      await delay(3000);

      return {
        // get the data from the server
        blackPlayer: {
          id: "",
          name: "",
          isGuest: true,
          remainingTime: 12312312312121
        },
        whitePlayer: {
          id: "",
          name: "",
          isGuest: true,
          remainingTime: 12312312312123
        }
      };
    } catch (error) {
      console.error("Error fetching game data:", error);
      return null;
    }
  }
});
