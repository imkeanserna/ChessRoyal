import { User } from "./games/user";

export class SocketManager {
  private static instance: SocketManager;
  private interestedSockets: Map<string, User[]>;

  private constructor() {
    this.interestedSockets = new Map();
  }

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }

    SocketManager.instance = new SocketManager;
    return SocketManager.instance;
  }

  addUser(user: User, roomId: string) {
    this.interestedSockets.set(roomId, [
      ...this.interestedSockets.get(roomId) || [],
      user
    ]);
  }

  broadcast(roomId: string, message: string) {
    const users: User[] = this.interestedSockets.get(roomId) || [];

    if (users.length === 0) {
      console.error("Users not found");
      return;
    }

    users.forEach((user: User) => {
      user.socket.send(message)
    })
  }
}

export const socketManager = SocketManager.getInstance();
