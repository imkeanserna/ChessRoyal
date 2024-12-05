import { WebSocket } from "ws"
import { ChessGame } from "./games/chess";
import { User } from "./games/user";
import { GameMessages, GameStatus } from "@repo/chess/gameStatus";
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
    this.users.set(user.userId, user);
    this.addHandler(user);
  }

  removeUser(userId: string): void {
    const user = this.users.get(userId);

    if (!user) {
      throw new Error("User not found");
    }

    this.users.delete(userId);
    this.redisPubSub.unsubscribe(userId);
    this.redisPubSub.unsubscribeUser(userId);

    for (const [gameId, game] of this.games) {
      if (game.player1UserId === userId || game.player2UserId === userId) {
        const gameTimer = this.timers.get(gameId);
        gameTimer?.tickTimer(game, userId);
        break;
      }
    }
  }

  private addHandler(user: User): void {
    // Set up WebSocket message handler
    user.socket.on('message', (data: WebSocket) => {
      try {
        const message = data.toString();
        const gameEvent: any = JSON.parse(message);
        this.handleGameEvent(user, gameEvent);
      } catch (error) {
        throw new Error(`Error processing WebSocket message: ${error}`);
      }
    });
  }

  public async handleGameEvent(user: User, gameEvent: GameEvent): Promise<void> {
    const { event, payload } = gameEvent;

    try {
      switch (event) {
        case GameMessages.INIT_GAME:
          await this.handleInitGame(user);
          break;
        case GameMessages.JOIN_ROOM:
          await this.handleJoinRoom(user, payload);
          break;
        case GameMessages.MOVE:
          await this.handleMove(user, payload);
          break;
        case GameMessages.TIMER:
          await this.handleTimer(payload);
          break;
        case GameMessages.USER_RESIGNED:
          await this.handleResign(user, payload);
          break;
        case GameMessages.DRAW_OFFERED:
          await this.handleDrawOffer(user, payload);
          break;
        case GameMessages.DRAW_RESPONSED:
          await this.handleDrawOfferResponse(user, payload);
          break;
        default:
          throw new Error(`Unhandled game event: ${event}`);
      }
    } catch (error) {
      console.error('Failed to send error to client', error);
    }
  }

  private async handleInitGame(user: User): Promise<void> {
    const ongoingGame = await db.chessGame.findFirst({
      where: {
        status: GameStatus.IN_PROGRESS,
        players: { some: { id: user.userId } }
      },
    });

    if (ongoingGame) {
      this.redisPubSub.subscribeUser(user.userId, user.socket);
      await this.redisPubSub.sendToUser(user.userId, JSON.stringify({
        event: GameMessages.ERROR,
        payload: {
          gameId: ongoingGame.id
        }
      }));
      return;
    }

    if (this.pendingGameId) {
      const game = this.games.get(this.pendingGameId);
      if (!game) {
        throw new Error("Pending game not found");
      }
      if (user.userId === game.player1UserId) {
        throw new Error("The user is already in the room");
      }

      // Subscribe the second player to the game channel
      this.redisPubSub.subscribe(user.userId, game.id, user.socket);

      await game.addSecondPlayer(user);
      this.createTimer(game.id);
      this.pendingGameId = null;
    } else {
      const game = new ChessGame(user.userId);
      this.pendingGameId = game.id;
      this.games.set(game.id, game);

      // Subscribe the first player to the game channel
      this.redisPubSub.subscribe(user.userId, game.id, user.socket);

      // add first player
      await game.addFirstPlayer(user);

      this.redisPubSub.sendMessage(game.id, JSON.stringify({
        event: GameMessages.GAME_ADDED,
        payload: {
          userId: user.userId,
          gameId: game.id
        }
      }));
    }
  }

  private async handleJoinRoom(user: User, payload: any): Promise<void> {
    const game = this.validateGamePayload(payload);

    this.redisPubSub.subscribe(user.userId, game.id, user.socket);

    if (!game.player2UserId) {
      await game.addSecondPlayer(user);
      this.createTimer(game.id);
      this.pendingGameId = null;
      return;
    }

    const gameTimer = this.timers.get(game.id);
    gameTimer?.resetTimer();

    try {
      const { player1RemainingTime, player2RemainingTime } = gameTimer?.getPlayerTimes() || {};

      const updatedWhitePlayerRemainingTime = user.userId === game.player1UserId ? player1RemainingTime! - (Date.now() - game.gameTimer?.getLastTurnTime()!) : player1RemainingTime;
      const updatedBlackPlayerRemainingTime = user.userId === game.player2UserId ? player2RemainingTime! - (Date.now() - game.gameTimer?.getLastTurnTime()!) : player2RemainingTime;


      const response = await db.chessGame.update({
        where: { id: game.id },
        data: {
          whitePlayerRemainingTime: updatedWhitePlayerRemainingTime,
          blackPlayerRemainingTime: updatedBlackPlayerRemainingTime
        }
      });

      this.redisPubSub.sendMessage(game.id, JSON.stringify({
        event: GameMessages.JOIN_ROOM,
        payload: {
          userId: user.userId,
          gameId: game.id,
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
      throw error;
    }
  }

  private async handleMove(user: User, payload: any): Promise<void> {
    const game = this.validateGamePayload(payload);

    game.move(user, payload.move);
    if (game.result) {
      await this.removeGame(game.id);
    }
  }

  private async handleResign(user: User, payload: any): Promise<void> {
    // Validate payload and ensure gameId is present
    const game = this.validateGamePayload(payload);

    try {
      await game.processResignation(user);

      // If the game has a result, remove it from the games collection
      if (game.result) {
        await this.removeGame(game.id);
      }
    } catch (error) {
      throw new Error(`An error occurred while processing resignation: ${error}`);
    }
  }

  private async handleDrawOffer(user: User, payload: any): Promise<void> {
    // Validate payload and ensure gameId is present
    const game = this.validateGamePayload(payload);

    if (game.getMoves().length <= 2) {
      throw new Error(`Cannot respond to draw offer. Game ${game.id} has less than 3 moves.`);
    }

    const opponentId = game.getOpponentId(user.userId);
    if (!opponentId) {
      throw new Error(`Opponent not found for user ${user.userId} in game ${game.id}`);
    }

    const opponentSocket = this.users.get(opponentId)?.socket;
    if (!opponentSocket) {
      throw new Error(`Opponent socket not found for user ${opponentId}`);
    }

    game.initiateDrawOffer(user.userId);

    // Send a message to the opponent signaling the draw offer
    this.redisPubSub.subscribeUser(opponentId, opponentSocket);
    await this.redisPubSub.sendToUser(opponentId, JSON.stringify({
      event: GameMessages.DRAW_OFFERED,
      payload: {
        offeredBy: user.userId,
        gameId: game.id,
      },
    }));
  }

  private async handleDrawOfferResponse(user: User, payload: any): Promise<void> {
    // Validate payload and ensure gameId and response are present
    const game = this.validateGamePayload(payload);

    const offeredById = game.getOpponentId(user.userId);
    if (!offeredById) {
      throw new Error(`Opponent not found for user ${user.userId} in game ${game.id}`);
    }

    if (game.drawOffererUserId !== offeredById || game.drawOffererUserId === null) {
      throw new Error(`Game ${game.id} does not have a draw offer from user ${offeredById}`);
    }

    const offererSocket = this.users.get(offeredById)?.socket;
    if (!offererSocket) {
      throw new Error(`Offerer socket not found for user ${offeredById}`);
    }

    // Determine the response type
    const isDrawAccepted = payload.response === 'accept';

    this.redisPubSub.subscribeUser(offeredById, offererSocket);
    await this.redisPubSub.sendToUser(offeredById, JSON.stringify({
      event: GameMessages.DRAW_RESPONSED,
      payload: {
        respondedBy: user.userId,
        gameId: game.id,
        response: payload.response, // 'accept' or 'decline'
      },
    }));

    // If draw is accepted, end the game
    if (isDrawAccepted) {
      await game.processDrawOffer(user);
      if (game.result) {
        await this.removeGame(game.id);
      }
    } else {
      game.cancelDrawOffer();
    }
  }

  private async handleTimer(payload: any): Promise<void> {
    const game = this.validateGamePayload(payload);

    const gameTimer = this.timers.get(game.id);
    gameTimer?.switchTurn();
    const { player1RemainingTime, player2RemainingTime } = gameTimer?.getPlayerTimes() || {};

    // Putting 0's in the main if the timer is expired
    game.timerEnd(0, 0);
  }

  private createTimer(gameId: string): void {
    const timer = 60 * 60 * 1000; // 60 minutes
    this.timers.set(gameId, new GameTimer(timer, timer));
  }

  private async removeGame(gameId: string): Promise<void> {
    const game = this.games.get(gameId);

    if (!game) {
      throw new Error(`Game ${gameId} not found`);
    }

    await deleteGameIfBothPlayersAreGuests(game.id, game.player1UserId, game.player2UserId);
    this.games.delete(gameId);
    this.timers.delete(gameId);
  }

  private validateGamePayload(payload: any) {
    if (!payload || !payload.gameId) {
      throw new Error("Invalid payload or missing gameId");
    }

    const game = this.games.get(payload.gameId);
    if (!game) {
      throw new Error(`Game not found for gameId: ${payload.gameId}`);
    }

    return game;
  }
}
