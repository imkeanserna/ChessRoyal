import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from "ws";

export class User {
  public socket: WebSocket;
  public id: string;
  public name: string;
  public isGuest?: boolean;

  constructor(socket: WebSocket) {
    this.socket = socket;
    this.id = uuidv4();
    this.name = "Guest";
    this.isGuest = true;
  }
}
