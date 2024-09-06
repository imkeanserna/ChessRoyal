
export enum GameStatus {
  COMPLETED = "completed",
  IN_PROGRESS = "in_progress",
  ABANDONED = "abandoned",
  TIME_UP = "time_up",
  PLAYER_EXIT = "player_exit",
  DRAW = "draw"
}

export enum GameMessages {
  GAME_ADDED = "game_added",
  GAME_ENDED = "game_ended",
  INIT_GAME = "init_game",
  WAITING = "waiting",
  MOVE = "move",
}

export enum GameResult {
  WHITE_WINS = "white_wins",
  BLACK_WINS = "black_wins",
  DRAW = "draw"
}
