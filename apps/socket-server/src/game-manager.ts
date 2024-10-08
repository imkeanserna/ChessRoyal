import { WebSocket } from "ws"
import { ChessGame } from "./games/chess";
import { User } from "./games/user";
import { socketManager } from "./socket-manager";
import { GameMessages } from "@repo/chess/gameStatus";
import { GameTimer } from "./games/gameTimer";
import db from "@repo/db/client";
import { deleteGameIfBothPlayersAreGuests } from "./services/gameService";

export class GameManager {
  private games: ChessGame[];
  private pendingGameId: string | null;
  private users: User[];
  private timers: Map<string, GameTimer> = new Map();

  constructor() {
    this.games = [];
    this.pendingGameId = null;
    this.users = [];
  }

  addUser(user: User) {
    this.users.push(user);
    this.addHandler(user);
  }

  removeUser(socket: WebSocket) {
    const user = this.users.find((user: User) => user.socket === socket);

    if (!user) {
      console.error("remove User User not found");
      return;
    }

    this.users = this.users.filter((user: User) => user.socket !== socket);

    const gameId: string | null = socketManager.removeUser(user.id);
    const game: ChessGame | undefined = this.games.find((game: ChessGame) => game.id === gameId);

    if (game) {
      const gameTimer = this.getTimer(game.id);
      gameTimer?.tickTimer(game, user.id);
    }
  }

  private addHandler(user: User) {
    user.socket.on("message", async (data) => {
      const { event, payload } = JSON.parse(data.toString());

      if (event === GameMessages.INIT_GAME) {
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

          // after the pending to fill, it needs to be assigned to null
          await game.addSecondPlayer(user.id);
          this.createTimer(game.id);
          this.pendingGameId = null;
        } else {
          const game: ChessGame = new ChessGame(user.id);
          this.pendingGameId = game.id;
          console.log(game.id)
          this.games.push(game);

          socketManager.addUser(user, game.id);
          socketManager.broadcast(
            game.id,
            JSON.stringify({
              event: GameMessages.GAME_ADDED,
              payload: {
                userId: user.id,
                gameId: game.id
              }
            })
          )
        }
      }

      if (event === GameMessages.JOIN_ROOM) {
        const { gameId } = payload;
        const game = this.games.find((game: ChessGame) => game.id === gameId);

        if (!gameId || !game) {
          console.error("Game not found");
          return;
        }

        socketManager.addUser(user, game.id);

        if (!game.player2UserId) {
          await game.addSecondPlayer(user.id);
          this.createTimer(gameId);
          this.pendingGameId = null;
          return;
        }

        const { player1RemainingTime, player2RemainingTime } = game.gameTimer?.getPlayerTimes() || {};

        const gameTimer = this.getTimer(gameId);
        gameTimer?.resetTimer();

        try {
          const updatedWhitePlayerRemainingTime = user.id === game.player1UserId ? player1RemainingTime! - (Date.now() - game.gameTimer?.getLastTurnTime()!) : player1RemainingTime;
          const updatedBlackPlayerRemainingTime = user.id === game.player2UserId ? player2RemainingTime! - (Date.now() - game.gameTimer?.getLastTurnTime()!) : player2RemainingTime

          const response = await db.chessGame.update({
            where: {
              id: gameId,
            },
            data: {
              whitePlayerRemainingTime: updatedWhitePlayerRemainingTime,
              blackPlayerRemainingTime: updatedBlackPlayerRemainingTime
            }
          });

          socketManager.broadcast(
            gameId,
            JSON.stringify({
              event: GameMessages.JOIN_ROOM,
              payload: {
                userId: user.userId,
                gameId,
                moves: game.getMoves(),
                whitePlayer: {
                  id: game.player1UserId,
                  name: "Guest",
                  isGuest: true,
                  remainingTime: response.whitePlayerRemainingTime
                },
                blackPlayer: {
                  id: game.player2UserId,
                  name: "Guest",
                  isGuest: true,
                  remainingTime: response.blackPlayerRemainingTime
                }
              }
            })
          );
        } catch (error) {
          console.error(error);
        }
      }

      if (event === GameMessages.MOVE) {
        const { gameId, move } = payload;
        const game: ChessGame | undefined = this.games.find((game: ChessGame) => game.id === gameId);

        if (!game) {
          console.error("Game not found");
          return;
        } else {
          // make a move here
          game.move(user, move);
          if (game.result) {
            this.removeGame(game.id);
          }
        }
      }

      if (event === GameMessages.TIMER) {
        const { gameId } = payload;
        const game: ChessGame | undefined = this.games.find((game: ChessGame) => game.id === gameId);

        if (!game) {
          console.error("Game not found");
          return;
        } else {
          // the timer is ended.
          game.gameTimer?.switchTurn();
          const { player1RemainingTime, player2RemainingTime } = game.gameTimer?.getPlayerTimes() || {};

          game.timerEnd(player1RemainingTime, player2RemainingTime);
        }
      }
    })
  }

  private getTimer(gameId: string) {
    return this.timers.get(gameId);
  }

  private createTimer(gameId: string) {
    // set the 60 seconds for each player
    const timer: number = 0 * 60 & 1000;
    this.timers.set(gameId, new GameTimer(timer, timer));
  }

  private async removeGame(gameId: string) {
    const game: ChessGame | undefined = this.games.find((game: ChessGame) => game.id === gameId);

    if (!game) {
      console.error("Game not found");
      return;
    } else {
      await deleteGameIfBothPlayersAreGuests(game.id, game.player1UserId, game.player2UserId);
      this.games = this.games.filter((game: ChessGame) => game.id !== gameId);
    }
  }
}
