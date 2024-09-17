import { User } from "./games/user";

export class SocketManager {
  private static instance: SocketManager;
  private interestedSockets: Map<string, User[]>;
  private userRoomMapping: Map<string, string>;

  private constructor() {
    this.interestedSockets = new Map();
    this.userRoomMapping = new Map();
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
    this.userRoomMapping.set(user.id, roomId);
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

  removeUser(userId: string) {
    const roomId = this.userRoomMapping.get(userId);

    if (!roomId) {
      console.log("User not found");
      return;
    }

    this.interestedSockets.set(
      roomId,
      this.interestedSockets.get(roomId)?.filter((user: User) => user.id !== userId) || []
    );
    if (this.interestedSockets.get(roomId)?.length === 0) {
      this.interestedSockets.delete(roomId);
      return;
    }
    this.userRoomMapping.delete(userId);
  }
}

export const socketManager = SocketManager.getInstance();
