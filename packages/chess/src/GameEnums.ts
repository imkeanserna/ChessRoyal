export enum GameStatus {
  NOT_STARTED = "NOT_STARTED",
  COMPLETED = "COMPLETED",
  IN_PROGRESS = "IN_PROGRESS",
}

export enum KingStatus {
  SAFE = "SAFE",
  CHECKED = "CHECKED",
  CHECKMATE = "CHECKMATE"
}

export enum GameMessages {
  GAME_ADDED = "GAME_ADDED",
  GAME_ENDED = "GAME_ENDED",
  INIT_GAME = "INIT_GAME",
  JOIN_ROOM = "JOIN_ROOM",
  WAITING = "WAITING",
  MOVE = "MOVE",
  KING_STATUS = "KING_STATUS",
  TIMER = "TIMER"
}

export enum PlayerWon {
  WHITE_WINS = "WHITE_WINS",
  BLACK_WINS = "BLACK_WINS",
}

export enum GameResultType {
  WIN = "WIN",
  DRAW = "DRAW",
  RESIGNATION = "RESIGNATION",
  TIMEOUT = "TIMEOUT"
}
