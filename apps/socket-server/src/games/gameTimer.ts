

export class GameTimer {
  private player1RemainingTime: number;
  private player2RemainingTime: number;
  private lastTurnTime: number | null;
  private currentTurn: "w" | "b";
  private isPaused: boolean;

  constructor(player1Time: number, player2Time: number) {
    this.player1RemainingTime = player1Time;
    this.player2RemainingTime = player2Time;
    this.lastTurnTime = Date.now();
    this.currentTurn = 'w';
    this.isPaused = false;
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

  startTime() {
    this.switchTurn();
  }
}
