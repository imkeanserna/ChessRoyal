import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from "ws";

export class User {
  public socket: WebSocket;
  public userId: string;
  public id: string;
  public name: string;
  public isGuest: boolean;

  constructor(socket: WebSocket, userId: string, name: string, isGuest: boolean) {
    this.socket = socket;
    this.userId = userId;
    this.id = uuidv4();
    this.name = name;
    this.isGuest = isGuest;
  }
}
