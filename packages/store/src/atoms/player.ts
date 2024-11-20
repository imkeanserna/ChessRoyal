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
  key: "gameMetadataSelector",
  get: async ({ get }) => {
    const gameId = get(remoteGameIdAtom);

    if (!gameId) {
      console.error("No game id found");
      return null;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    try {
      const response = await fetch(`/api/game/${gameId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: signal,  // attach the abort signal to the fetch request
      });

      if (response.ok) {
        const { game } = await response.json();
        return {
          blackPlayer: {
            id: game.players[1].id,
            name: game.players[1].name,
            isGuest: game.players[1].isGuest,
            avatar: game.players[1]?.image || null,
            remainingTime: game.blackPlayerRemainingTime || 0,
          },
          whitePlayer: {
            id: game.players[0].id,
            name: game.players[0].name,
            avatar: game.players[0]?.image || null,
            isGuest: game.players[0].isGuest,
            remainingTime: game.whitePlayerRemainingTime || 0,
          },
        };
      }
    } catch (error) {
      if (signal.aborted) {
        console.log("Fetch request aborted");
      } else {
        console.error("Error fetching game data:", error);
      }
      return null;
    }

    return () => controller.abort();  // abort the fetch if the component unmounts
  },
});

export const gameResignedAtom = atom<boolean>({
  key: "gameResigned",
  default: false
});
