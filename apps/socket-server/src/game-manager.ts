import { WebSocket } from "ws"
import { ChessGame } from "./games/chess";
import { User } from "./games/user";
import { GameMessages } from "@repo/chess/gameStatus";
import { GameTimer } from "./games/gameTimer";
import db from "@repo/db/client";
import { deleteGameIfBothPlayersAreGuests } from "./services/gameService";
import { RedisPubSubManager } from "./pubsub/redisClient";

interface GameEvent {
  event: GameMessages;
  payload: any;
}

export class GameManager {
  private games: Map<string, ChessGame>;
  private pendingGameId: string | null;
  private users: Map<string, User>;
  private timers: Map<string, GameTimer>;
  private redisPubSub: RedisPubSubManager;

  constructor() {
    this.games = new Map();
    this.pendingGameId = null;
    this.users = new Map();
    this.timers = new Map();
    this.redisPubSub = RedisPubSubManager.getInstance();
  }

  addUser(user: User) {
    this.users.set(user.id, user);
    this.addHandler(user);
  }

  removeUser(userId: string): void {
    const user = this.users.get(userId);

    if (!user) {
      console.error("Remove User: User not found");
      return;
    }

    this.users.delete(userId);
    this.redisPubSub.unsubscribe(userId);

    for (const [gameId, game] of this.games) {
      if (game.player1UserId === userId || game.player2UserId === userId) {
        const gameTimer = this.timers.get(gameId);
        gameTimer?.tickTimer(game, userId);
        break;
      }
    }
  }

  private addHandler(user: User): void {
    // Subscribe the user to the 'games' channel
    // this.redisPubSub.subscribe(user.id, 'games', user.socket);

    // Set up WebSocket message handler
    user.socket.on('message', (data: WebSocket) => {
      try {
        const message = data.toString();
        const gameEvent: any = JSON.parse(message);
        this.handleGameEvent(user, gameEvent);
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
  }

  private async handleGameEvent(user: User, gameEvent: GameEvent): Promise<void> {
    const { event, payload } = gameEvent;

    switch (event) {
      case GameMessages.INIT_GAME:
        console.log("Init game");
        await this.handleInitGame(user);
        break;
      case GameMessages.JOIN_ROOM:
        console.log("Joining room");
        await this.handleJoinRoom(user, payload);
        break;
      case GameMessages.MOVE:
        await this.handleMove(user, payload);
        break;
      case GameMessages.TIMER:
        await this.handleTimer(payload);
        break;
      default:
        console.warn(`Unhandled game event: ${event}`);
    }
  }

  private async handleInitGame(user: User): Promise<void> {
    if (this.pendingGameId) {
      const game = this.games.get(this.pendingGameId);
      if (!game) {
        console.error("Pending game not found");
        return;
      }
      if (user.id === game.player1UserId) {
        console.error("The user is already in the room");
        return;
      }

      // Subscribe the second player to the game channel
      this.redisPubSub.subscribe(user.id, game.id, user.socket);

      await game.addSecondPlayer(user.id);
      this.createTimer(game.id);
      this.pendingGameId = null;
    } else {
      const game = new ChessGame(user.id);
      this.pendingGameId = game.id;
      this.games.set(game.id, game);

      // Subscribe the first player to the game channel
      this.redisPubSub.subscribe(user.id, game.id, user.socket);

      this.redisPubSub.sendMessage(game.id, JSON.stringify({
        event: GameMessages.GAME_ADDED,
        payload: {
          userId: user.id,
          gameId: game.id
        }
      }));
    }
  }

  private async handleJoinRoom(user: User, payload: any): Promise<void> {
    const { gameId } = payload;
    const game = this.games.get(gameId);

    if (!gameId || !game) {
      console.error("Game not found");
      return;
    }

    this.redisPubSub.subscribe(user.id, game.id, user.socket);

    if (!game.player2UserId) {
      await game.addSecondPlayer(user.id);
      this.createTimer(gameId);
      this.pendingGameId = null;
      return;
    }

    const gameTimer = this.timers.get(gameId);
    gameTimer?.resetTimer();

    try {
      const { player1RemainingTime, player2RemainingTime } = gameTimer?.getPlayerTimes() || {};

      const updatedWhitePlayerRemainingTime = user.userId === game.player1UserId ? player1RemainingTime! - (Date.now() - game.gameTimer?.getLastTurnTime()!) : player1RemainingTime;
      const updatedBlackPlayerRemainingTime = user.userId === game.player2UserId ? player2RemainingTime! - (Date.now() - game.gameTimer?.getLastTurnTime()!) : player2RemainingTime;

      const response = await db.chessGame.update({
        where: { id: gameId },
        data: {
          whitePlayerRemainingTime: updatedWhitePlayerRemainingTime,
          blackPlayerRemainingTime: updatedBlackPlayerRemainingTime
        }
      });

      console.log({
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
      });

      this.redisPubSub.sendMessage(gameId, JSON.stringify({
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
      }));
    } catch (error) {
      console.error(error);
    }
  }

  private async handleMove(user: User, payload: any): Promise<void> {
    const { gameId, move } = payload;
    const game = this.games.get(gameId);

    if (!game) {
      console.error("Game not found");
      return;
    }

    game.move(user, move);
    if (game.result) {
      await this.removeGame(game.id);
    }
  }

  private async handleTimer(payload: any): Promise<void> {
    const { gameId } = payload;
    const game = this.games.get(gameId);

    if (!game) {
      console.error("Game not found");
      return;
    }

    const gameTimer = this.timers.get(gameId);
    gameTimer?.switchTurn();
    const { player1RemainingTime, player2RemainingTime } = gameTimer?.getPlayerTimes() || {};

    game.timerEnd(player1RemainingTime, player2RemainingTime);
  }

  private createTimer(gameId: string): void {
    const timer = 60 * 60 * 1000; // 60 minutes
    this.timers.set(gameId, new GameTimer(timer, timer));
  }

  private async removeGame(gameId: string): Promise<void> {
    const game = this.games.get(gameId);

    if (!game) {
      console.error("Game not found");
      return;
    }

    await deleteGameIfBothPlayersAreGuests(game.id, game.player1UserId, game.player2UserId);
    this.games.delete(gameId);
    this.timers.delete(gameId);
  }
}
