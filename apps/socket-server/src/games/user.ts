import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from "ws";

export class User {
  public socket: WebSocket;
  public userId: string;
  public id: string;
  public name: string;
  public isGuest?: boolean;

  constructor(socket: WebSocket, token?: string) {
    this.socket = socket;
    this.userId = token || "";
    this.id = uuidv4();
    this.name = "Guest";
    this.isGuest = true;
  }
}
