import { v4 as uuidv4 } from 'uuid';
import { User } from './user';
// import { GameResult, GameStatus } from '../types';
import { GameMessages, GameResult, GameStatus } from "@repo/chess/gameStatus";
import { Chess, Move, Square } from 'chess.js';
import { socketManager } from '../socket-manager';
import { GameTimer } from './gameTimer';

export class ChessGame {
  public id: string;
  public result: GameResult | null = null;
  public player1UserId: string;
  public player2UserId: string;
  public initializeTime: number;
  public gameTimer: GameTimer | null = null;
  private board: Chess;

  constructor(player1UserId: string, player2UserId?: string) {
    this.player1UserId = player1UserId;
    this.player2UserId = player2UserId || "";
    this.initializeTime = new Date().getTime();
    this.id = uuidv4();
    this.board = new Chess();
  }

  move(user: User, move: Move) {
    // use the chess library to make move

    if (this.board.turn() === 'w' && user.id !== this.player1UserId) {
      console.log("out 1")
      return;
    }

    if (this.board.turn() === "b" && user.id !== this.player2UserId) {
      console.log("out 2")
      return;
    }

    if (this.result) {
      console.error(`Game ${this.id} is already over with result ${this.result}`);
      return;
    }

    this.gameTimer?.switchTurn();

    const { player1RemainingTime, player2RemainingTime } = this.gameTimer?.getPlayerTimes() || {};

    console.log(player1RemainingTime, player2RemainingTime);
    if (player1RemainingTime! <= 0 || player2RemainingTime! <= 0) {
      console.log("Game over");
      return;
    }

    // we can do the logic of moving the piece here
    try {
      if (this.isPromoting(this.board, move.from, move.to)) {
        const moveResult = this.board.move({
          from: move.from,
          to: move.to,
          promotion: 'q'
        });
      } else {
        const moveResult = this.board.move({
          from: move.from,
          to: move.to
        });
      }
    } catch (error) {
      console.error("Erorr in move", error);
      return;
    }

    // send the move to the other player
    socketManager.broadcast(
      this.id,
      JSON.stringify({
        event: GameMessages.MOVE,
        payload: {
          move,
          // --TODO: try to send the remaining time to the other player
        }
      })
    );

    if (this.board.isGameOver()) {
      const result: boolean = this.board.isDraw();
      if (result) {
        this.result = GameResult.DRAW;
      } else {
        this.result = this.board.turn() === 'w' ? GameResult.BLACK_WINS : GameResult.WHITE_WINS;
      }
      this.GameEnded(GameStatus.COMPLETED, this.result);
    }
  }

  async addSecondPlayer(player2UserId: string) {
    this.player2UserId = player2UserId;

    // if the applications get bigger then we need a database to store the players

    // after the initialization the whitePlayer should start the time (let test the 10mins)
    this.gameTimer = new GameTimer(10 * 60 * 1000, 10 * 60 * 1000);

    socketManager.broadcast(
      this.id,
      JSON.stringify({
        event: GameMessages.INIT_GAME,
        payload: {
          gameId: this.id,
          whitePlayer: {
            id: this.player1UserId,
            name: "Guest",
            isGuest: true,
          },
          blackPlayer: {
            id: this.player2UserId,
            name: "Guest",
            isGuest: true,
          },
          fen: this.board.fen(),
          moves: [],
        },
      })
    );
  }

  private isPromoting(chess: Chess, from: Square, to: Square): boolean {
    if (!from || !to) {
      return false;
    }

    const piece: {
      type: string;
      color: string;
    } | null = chess.get(from);

    if (!piece) {
      return false;
    }

    if (piece.color !== chess.turn()) {
      return false;
    }

    if (!['1', '8'].some((it: string) => to.endsWith(it))) {
      return false;
    }

    return chess
      .moves({ square: from, verbose: true })
      .map((it: { to: Square }) => it.to)
      .includes(to);
  }

  private async GameEnded(status: GameStatus, result: GameResult) {
    socketManager.broadcast(
      this.id,
      JSON.stringify({
        event: GameMessages.GAME_ENDED,
        payload: {
          result,
          status,
          whitePlayer: {
            id: this.player1UserId,
            name: "Guest",
            isGuest: true
          },
          blackPlayer: {
            id: this.player2UserId,
            name: "Guest",
            isGuest: true
          }
        }
      })
    );
  }
}
