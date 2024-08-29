import { WebSocket } from "ws"
import { ChessGame } from "./games/chess";
import { User } from "./games/user";
import { GameStatus } from "./types";
import { socketManager } from "./socket-manager";

export class GameManager {
  private games: ChessGame[];
  private pendingGameId: string | null;
  private users: User[];

  constructor() {
    this.games = [];
    this.pendingGameId = null;
    this.users = [];
  }

  addUser(user: User) {
    this.users.push(user);
    this.addHandler(user);
  }

  private addHandler(user: User) {
    user.socket.on("message", (payload) => {
      const { event, data } = JSON.parse(payload.toString());

      if (event === GameStatus.INIT_GAME) {
        if (this.pendingGameId) {
          const game: ChessGame | undefined = this.games.find((game: ChessGame) => game.id === this.pendingGameId);
          if (!game) {
            console.error("Pending game not found");
            return;
          }
          // players can join the game again if the game isn't over
          if (user.id === game.player1UserId) {
            console.error("The user is already in the room")
            return;
          }

          socketManager.addUser(user, game.id);

          // afte the pending to fill, it needs to be assigned to null
          game.addSecondPlayer(user.id);
          this.pendingGameId = null;
        } else {
          const game: ChessGame = new ChessGame(user.id);
          this.pendingGameId = game.id;
          this.games.push(game);

          socketManager.addUser(user, game.id);
          socketManager.broadcast(
            game.id,
            JSON.stringify({
              event: GameStatus.INIT_GAME,
              gameId: game.id
            })
          )
        }
      }

      if (event === GameStatus.MOVE) {
        const { gameId } = JSON.parse(payload.toString());
        const game: ChessGame | undefined = this.games.find((game: ChessGame) => game.id === gameId);

        if (!game) {
          console.error("Game not found");
          return;
        } else {
          // make a move here
          game.move(user, data);
          if (game.result) {
            this.removeGame(game.id);
          }
        }
      }
    })
  }

  private removeGame(gameId: string) {
    const game: ChessGame | undefined = this.games.find((game: ChessGame) => game.id === gameId);
    if (!game) {
      console.error("Game not found");
      return;
    } else {
      this.games = this.games.filter((game: ChessGame) => game.id !== gameId);
    }
  }
}
