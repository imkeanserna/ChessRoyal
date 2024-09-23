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

export const gameMetadataSelector = selector<Players | null>({
  key: 'gameMetadataSelector',
  get: async ({ get }) => {
    const gameId = get(remoteGameIdAtom);

    if (!gameId) {
      console.error("No game id found");
      return null;
    }

    try {
      const response = await fetch(`/api/game/${gameId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const { game } = await response.json();

        return {
          // get the data from the server
          blackPlayer: {
            id: game.blackPlayerId || "",
            name: "",
            isGuest: true,
            remainingTime: game.blackPlayerRemainingTime || 0
          },
          whitePlayer: {
            id: game.whitePlayerId || "",
            name: "",
            isGuest: true,
            remainingTime: game.whitePlayerRemainingTime || 0
          }
        };
      }
    } catch (error) {
      console.error("Error fetching game data:", error);
      return null;
    }
  }
});
