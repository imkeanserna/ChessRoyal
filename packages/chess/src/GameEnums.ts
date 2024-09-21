
export enum GameStatus {
  COMPLETED = "completed",
  IN_PROGRESS = "in_progress",
  ABANDONED = "abandoned",
  TIME_UP = "time_up",
  PLAYER_EXIT = "player_exit",
  DRAW = "draw"
}

export enum KingStatus {
  SAFE = "safe",
  CHECKED = "checked",
  CHECKMATE = "checkmate"
}

export enum GameMessages {
  GAME_ADDED = "game_added",
  GAME_ENDED = "game_ended",
  INIT_GAME = "init_game",
  JOIN_ROOM = "join_room",
  WAITING = "waiting",
  MOVE = "move",
  KING_STATUS = "king_status",
  TIMER = "timer"
}

export enum GameResult {
  WHITE_WINS = "white_wins",
  BLACK_WINS = "black_wins",
  DRAW = "draw"
}
