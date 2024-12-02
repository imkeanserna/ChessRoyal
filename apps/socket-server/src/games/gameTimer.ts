import { GameResultType, PlayerWon } from "@repo/chess/gameStatus";
import { ChessGame } from "./chess";

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

  getLastTurnTime() {
    return this.lastTurnTime;
  }

  switchTurn() {
    if (this.isPaused) return;

    const currentTime = Date.now();
    const elapsedTime = currentTime - (this.lastTurnTime || currentTime);

    if (this.currentTurn === 'w') {
      this.player1RemainingTime -= elapsedTime;
      this.currentTurn = 'b'; // Switch to player 2
    } else {
      this.player2RemainingTime -= elapsedTime;
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
    } else {
      this.player2RemainingTime -= elapsedTime;
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
    this.stop();
    this.totalAbortTime = 60;
  }

  tickTimer(game: ChessGame, playerExitId: string) {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    let seconds = 0;
    this.timerInterval = setInterval(async () => {
      seconds = this.totalAbortTime % 60;

      if (--this.totalAbortTime < 0) {
        if (this.timerInterval) {
          clearInterval(this.timerInterval);

          game.gameEnded(
            GameResultType.RESIGNATION,
            playerExitId === game.player1UserId ? PlayerWon.BLACK_WINS : PlayerWon.WHITE_WINS
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
