import { v4 as uuidv4 } from 'uuid';
import { User } from './user';
// import { GameResult, GameStatus } from '../types';
import { GameMessages, GameResult, GameStatus, KingStatus } from "@repo/chess/gameStatus";
import { Chess, Move, Square } from 'chess.js';
import { socketManager } from '../socket-manager';
import { GameTimer } from './gameTimer';
import db from "@repo/db/client";

export class ChessGame {
  public id: string;
  public result: GameResult | null = null;
  public player1UserId: string;
  public player2UserId: string;
  public initializeTime: number;
  public gameTimer: GameTimer | null = null;
  private board: Chess;
  private moves: Move[];
  private pieceValues: Record<string, number> = {
    p: 1, //pawn
    n: 3, //knight
    b: 3, //bishop
    r: 5, //rook
    q: 9, //queen
    k: 0 //king (not captured)
  };

  constructor(player1UserId: string, player2UserId?: string) {
    this.player1UserId = player1UserId;
    this.player2UserId = player2UserId || "";
    this.initializeTime = new Date().getTime();
    this.id = uuidv4();
    this.board = new Chess();
    this.moves = [];
  }

  async move(user: User, move: Move) {
    // use the chess library to make move

    // --TODO: make this good
    if (this.board.turn() === 'w' && (user.id !== this.player1UserId)) {
      if (user.userId !== "" && user.userId !== this.player1UserId) {
        console.log("out 1")
        return;
      }
    }
    console.log("User making move:", user.id);
    console.log("Player 1 ID:", this.player1UserId);
    console.log("Player 2 ID:", this.player2UserId);
    console.log("Current turn:", this.board.turn());
    if (this.board.turn() === "b" && (user.id !== this.player2UserId)) {
      if (user.userId !== "" && user.userId !== this.player2UserId) {
        console.log("out 2")
        return;
      }
    }

    if (this.result) {
      console.error(`Game ${this.id} is already over with result ${this.result}`);
      return;
    }

    this.gameTimer?.switchTurn();

    const { player1RemainingTime, player2RemainingTime } = this.gameTimer?.getPlayerTimes() || {};

    try {
      const response = await db.game.update({
        where: {
          id: this.id,
        },
        data: {
          whitePlayerId: this.player1UserId,
          blackPlayerId: this.player2UserId,
          whitePlayerRemainingTime: player1RemainingTime,
          blackPlayerRemainingTime: player2RemainingTime
        }
      });
    } catch (error) {
      console.log(error);
    }

    // check if the timer is expired both side.
    this.timerEnd(player1RemainingTime, player2RemainingTime);

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

    // add the move to the database
    this.moves.push(move);

    if (this.board.isCheck()) {
      socketManager.broadcast(
        this.id,
        JSON.stringify({
          event: GameMessages.KING_STATUS,
          payload: {
            kingStatus: this.board.inCheck() ? KingStatus.CHECKED : this.board.isCheckmate() ? KingStatus.CHECKMATE : KingStatus.SAFE,
            player: this.board.turn()
          }
        })
      );
    }

    // send the move to the other player
    socketManager.broadcast(
      this.id,
      JSON.stringify({
        event: GameMessages.MOVE,
        payload: {
          move,
          player1RemainingTime,
          player2RemainingTime
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
    const { player1RemainingTime, player2RemainingTime } = this.gameTimer?.getPlayerTimes() || {};

    try {
      const response = await db.game.create({
        data: {
          id: this.id,
          whitePlayerId: this.player1UserId,
          blackPlayerId: this.player2UserId,
          whitePlayerRemainingTime: player1RemainingTime || 0,
          blackPlayerRemainingTime: player2RemainingTime || 0,
        }
      });
      console.log(response)
    } catch (error) {
      console.error("Error in addSecondPlayer", error);
      return;
    }

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
            remainingTime: player1RemainingTime
          },
          blackPlayer: {
            id: this.player2UserId,
            name: "Guest",
            isGuest: true,
            remainingTime: player2RemainingTime
          },
          fen: this.board.fen(),
          moves: [],
        },
      })
    );
  }

  public timerEnd(player1RemainingTime?: number, player2RemainingTime?: number) {
    if (player1RemainingTime! <= 0 || player2RemainingTime! <= 0) {
      const { whiteScore, blackScore } = this.calculateMaterialDifference(this.board);

      if (whiteScore < blackScore) {
        this.GameEnded(GameStatus.TIME_UP, GameResult.WHITE_WINS);
      } else if (blackScore < whiteScore) {
        this.GameEnded(GameStatus.TIME_UP, GameResult.BLACK_WINS);
      } else {
        this.GameEnded(GameStatus.TIME_UP, GameResult.DRAW);
      }
      return;
    }
  }

  public exitGame(user: User) {
    this.GameEnded(GameStatus.PLAYER_EXIT, user.id === this.player1UserId ? GameResult.BLACK_WINS : GameResult.WHITE_WINS);
  }

  private calculateMaterialDifference(game: Chess): {
    whiteScore: number;
    blackScore: number;
  } {
    const board = game.board();
    let whiteScore = 0;
    let blackScore = 0;

    board.forEach((row) => {
      row.forEach((square) => {
        if (square !== null) {
          const piece = square.type;
          const color = square.color;
          const pieceValues = this.pieceValues[piece] || 0;

          if (color === 'w') {
            whiteScore += pieceValues;
          } else {
            blackScore += pieceValues;
          }
        }
      });
    });

    const totalPieceValue = 39;
    return {
      whiteScore: totalPieceValue - whiteScore,
      blackScore: totalPieceValue - blackScore,
    }
  };

  getMoves() {
    return this.moves;
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

  public async GameEnded(status: GameStatus, result: GameResult) {
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
