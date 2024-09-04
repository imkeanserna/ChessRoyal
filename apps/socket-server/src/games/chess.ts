import { v4 as uuidv4 } from 'uuid';
import { User } from './user';
// import { GameResult, GameStatus } from '../types';
import { GameResult, GameStatus } from "@repo/chess/gameStatus";
import { Chess, Move, Square } from 'chess.js';
import { socketManager } from '../socket-manager';

export class ChessGame {
  public id: string;
  public result: GameResult | null = null;
  public player1UserId: string;
  public player2UserId: string;
  private board: Chess;

  constructor(player1UserId: string, player2UserId?: string) {
    this.player1UserId = player1UserId;
    this.player2UserId = player2UserId || "";
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
        event: GameStatus.MOVE,
        payload: {
          move
        }
      })
    );

    // --TODO: check if the game is over and test it in the client (front-end)
  }

  async addSecondPlayer(player2UserId: string) {
    this.player2UserId = player2UserId;

    // if the applications get bigger then we need a database to store the players

    socketManager.broadcast(
      this.id,
      JSON.stringify({
        event: GameStatus.INIT_GAME,
        payload: {
          gameId: this.id,
          whitePlayer: {
            id: this.player1UserId,
            name: "Guest",
            isGuest: true
          },
          blackPlayer: {
            id: this.player2UserId,
            name: "Guest",
            isGuest: true
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
}
