import { GameResultType, GameStatus } from "@repo/chess/gameStatus";
import { v4 as uuidv4 } from 'uuid';
import { Redis } from "ioredis";

export class RedisPubSubManager {
  private static instance: RedisPubSubManager;
  private subscriber: Redis;
  private publisher: Redis;
  private subscriptions: Map<
    string,
    {
      [room: string]: {
        id: string;
        status: GameStatus;
        moves: string[];
        players: string[];
        result?: GameResultType | null;
        currentBoard: string;
        turn: string;
        whitePlayerRemainingTime: number;
        blackPlayerRemainingTime: number;
      }
    }
  >;
  private reverseSubscriptions: Map<
    string,
    {
      [userId: string]: {
        userId: string;
        ws: WebSocket;
      }
    }
  >;

  private constructor() {
    this.subscriber = new Redis();
    this.publisher = new Redis();
    this.subscriptions = new Map();
    this.reverseSubscriptions = new Map();

    this.subscriber.on("message", (channel, message) => {
      console.log(`Received ${message} from ${channel}`);

      const subscribers = this.reverseSubscriptions.get(channel) || {};

      Object.values(subscribers).forEach(({ ws }: { ws: WebSocket }) => {
        ws.send(message);
      })
    });
  }

  static getInstance() {
    if (!this.instance) this.instance = new RedisPubSubManager();

    return this.instance;
  }

  subscribe(userId: string, room: string, ws: WebSocket) {
    // Addd room to user's subscriptions
    this.subscriptions.set(userId, {
      ...(this.subscriptions.get(userId) || {}),
      [room]: {
        id: uuidv4(),
        status: GameStatus.IN_PROGRESS,
        moves: [],
        players: [],
        currentBoard: "",
        turn: "",
        whitePlayerRemainingTime: 0,
        blackPlayerRemainingTime: 0
      }
    });

    // Add user to room's subscribers
    this.reverseSubscriptions.set(room, {
      ...(this.reverseSubscriptions.get(room) || {}),
      [userId]: {
        userId,
        ws
      }
    });

    // If this is the 1st subscriber to this room, subscribe to the room
    if (Object.keys(this.reverseSubscriptions.get(room) || {}).length === 1) {
      console.log(`subscribing to ${room}`);

      this.subscriber.subscribe(room, (err, count) => {
        if (err) {
          console.error("Failed to subscribe: %s", err.message);
        } else {
          console.log(
            `Subscribed successfully! This client is currently subscribed to ${count} channels.`,
          );
        }
      });
    }
  }


  unsubscribe(userId: string, room: string) {
    if (!userId || !room || !this.subscriptions.get(userId)) return;

    // Remove room from user's subscriptions
    const userSubscriptions = this.subscriptions.get(userId);
    if (userSubscriptions) {
      delete userSubscriptions[room];

      // if no more subscriptions, remove user from subscriptions
      if (Object.keys(userSubscriptions).length === 0) {
        this.subscriptions.delete(userId);
      }
    }

    //Remove user from room's subscribers
    const roomSubscribers = this.reverseSubscriptions.get(room);
    if (roomSubscribers) {
      delete roomSubscribers[userId];
    }

    if (!this.reverseSubscriptions.get(room) || Object.keys(this.reverseSubscriptions.get(room) || {}).length === 0) {
      console.log(`unsubscribing from ${room}`);
      this.subscriber.unsubscribe(room);
      this.reverseSubscriptions.delete(room);
    }

    console.log({
      subs: this.subscriptions,
      revSubs: this.reverseSubscriptions
    });
  }

  async sendMessage(room: string, message: string, sender: string) {
    this.publish(room, JSON.stringify({
      type: "message",
      payload: {
        id: uuidv4(),
        sender,
        message
      }
    })
    );
  }

  publish(room: string, message: string) {
    console.log(`publishing message to ${room}`);
    this.publisher.publish(room, message);
  }
}
