import { GameStatus } from "@repo/chess/gameStatus";
import { ChessGame } from "./chess";
import { GameResult } from "../types";


export class GameTimer {
  private player1RemainingTime: number;
  private player2RemainingTime: number;
  private lastTurnTime: number | null;
  private currentTurn: "w" | "b";
  private isPaused: boolean;

  private timerInterval: NodeJS.Timeout | null;
  private totalAbortTime = 60;

  constructor(player1Time: number, player2Time: number) {
    this.player1RemainingTime = player1Time;
    this.player2RemainingTime = player2Time;
    this.lastTurnTime = Date.now();
    this.currentTurn = 'w';
    this.isPaused = false;
    this.timerInterval = null;
  }

  switchTurn() {
    if (this.isPaused) return;

    const currentTime = Date.now();
    const elapsedTime = currentTime - (this.lastTurnTime || currentTime);

    if (this.currentTurn === 'w') {
      this.player1RemainingTime -= elapsedTime;
      console.log("Player 1 remaining time:", this.player1RemainingTime);
      this.currentTurn = 'b'; // Switch to player 2
    } else {
      this.player2RemainingTime -= elapsedTime;
      console.log("Player 2 remaining time:", this.player2RemainingTime);
      this.currentTurn = 'w'; // Switch to player 1
    }

    this.lastTurnTime = currentTime;
  }

  pause() {
    if (this.isPaused) return; // If already paused, do nothing
    this.isPaused = true;

    const currentTime = Date.now();
    const elapsedTime = currentTime - (this.lastTurnTime || currentTime);

    if (this.currentTurn === 'w') {
      this.player1RemainingTime -= elapsedTime;
      console.log("Player 1 paused with time left:", this.player1RemainingTime);
    } else {
      this.player2RemainingTime -= elapsedTime;
      console.log("Player 2 paused with time left:", this.player2RemainingTime);
    }

    this.lastTurnTime = null; // Reset last turn time since the game is paused
  }

  resume() {
    if (!this.isPaused) return; // If not paused, do nothing
    this.isPaused = false;

    this.lastTurnTime = Date.now();
  }

  getPlayerTimes() {
    return {
      player1RemainingTime: this.player1RemainingTime,
      player2RemainingTime: this.player2RemainingTime,
    };
  }

  resetTimer() {
    console.log("Timer reset " + this.totalAbortTime);
    this.stop();
    this.totalAbortTime = 60;
    console.log("Timer reset after " + this.totalAbortTime);
  }

  tickTimer(game: ChessGame, playerExitId: string) {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    let seconds = 0;
    this.timerInterval = setInterval(() => {
      seconds = this.totalAbortTime % 60;

      if (--this.totalAbortTime < 0) {
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          // then notify the client by broadcasting it.
          // the who is the winner or the one who is left

          game.GameEnded(
            GameStatus.PLAYER_EXIT,
            playerExitId === game.player1UserId ? GameResult.BLACK_WINS : GameResult.WHITE_WINS
          );

          this.stop();
        }
      }
    }, 1000);
  }

  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startTime() {
    this.switchTurn();
  }
}
