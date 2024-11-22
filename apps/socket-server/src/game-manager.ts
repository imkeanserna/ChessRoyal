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
      console.error("Remove User: User not found");
      return;
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
        console.error('Error processing WebSocket message:', error);
      }
    });
  }

  public async handleGameEvent(user: User, gameEvent: GameEvent): Promise<void> {
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
        console.warn(`Unhandled game event: ${event}`);
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
      console.error(`User ${user.userId} already has an ongoing game (${ongoingGame.id}).`);
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
        console.error("Pending game not found");
        return;
      }
      if (user.userId === game.player1UserId) {
        console.error("The user is already in the room");
        return;
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
    if (!payload || !payload.gameId) {
      console.error("Invalid payload: gameId is missing");
      return;
    }

    const { gameId } = payload;
    const game = this.games.get(gameId);

    if (!gameId || !game) {
      console.error("Game not found");
      return;
    }

    this.redisPubSub.subscribe(user.userId, game.id, user.socket);

    if (!game.player2UserId) {
      await game.addSecondPlayer(user);
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
    if (!payload || !payload.gameId) {
      console.error("Invalid payload: gameId is missing");
      return;
    }

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

  private async handleResign(user: User, payload: any): Promise<void> {
    // Validate payload and ensure gameId is present
    if (!payload || !payload.gameId) {
      console.error("Invalid payload or missing gameId:", payload);
      return;
    }

    const game = this.games.get(payload.gameId);
    if (!game) {
      console.error(`Game not found for gameId: ${payload.gameId}`);
      return;
    }

    try {
      await game.processResignation(user);

      // If the game has a result, remove it from the games collection
      if (game.result) {
        await this.removeGame(game.id);
        console.log(`Game ${game.id} has been removed after resignation.`);
      }
    } catch (error) {
      console.error("An error occurred while processing resignation:", error);
    }
  }

  private async handleDrawOffer(user: User, payload: any): Promise<void> {
    // Validate payload and ensure gameId is present
    if (!payload || !payload.gameId) {
      console.error("Invalid payload or missing gameId:", payload);
      return;
    }

    const game = this.games.get(payload.gameId);
    if (!game) {
      console.error(`Game not found for gameId: ${payload.gameId}`);
      return;
    }

    if (game.getMoves().length <= 2) {
      console.error(`Cannot respond to draw offer. Game ${game.id} has less than 3 moves.`);
      return;
    }

    const opponentId = game.getOpponentId(user.userId);
    if (!opponentId) {
      console.error(`Opponent not found for user ${user.userId} in game ${game.id}`);
      return;
    }

    const opponentSocket = this.users.get(opponentId)?.socket;
    if (!opponentSocket) {
      console.error(`Opponent socket not found for user ${opponentId}`);
      return;
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
    if (!payload || !payload.gameId || !payload.response) {
      console.error("Invalid payload or missing gameId/response:", payload);
      return;
    }

    const game = this.games.get(payload.gameId);
    if (!game) {
      console.error(`Game not found for gameId: ${payload.gameId}`);
      return;
    }

    const offeredById = game.getOpponentId(user.userId);
    if (!offeredById) {
      console.error(`Original draw offer user not found`);
      return;
    }

    if (game.drawOffererUserId !== offeredById || game.drawOffererUserId === null) {
      console.error(`User ${user.userId} is not the original draw offer user`);
      return;
    }

    const offererSocket = this.users.get(offeredById)?.socket;
    if (!offererSocket) {
      console.error(`Offerer socket not found for user ${offeredById}`);
      return;
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
      game.processDrawOffer(user);
      this.removeGame(game.id);
    } else {
      game.cancelDrawOffer();
    }
  }

  private async handleTimer(payload: any): Promise<void> {
    if (!payload || !payload.gameId) {
      console.error("Invalid payload: gameId is missing");
      return;
    }

    const { gameId } = payload;
    const game = this.games.get(gameId);

    if (!game) {
      console.error("Game not found");
      return;
    }

    const gameTimer = this.timers.get(gameId);
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
      console.error("Game not found");
      return;
    }

    await deleteGameIfBothPlayersAreGuests(game.id, game.player1UserId, game.player2UserId);
    this.games.delete(gameId);
    this.timers.delete(gameId);
  }
}
