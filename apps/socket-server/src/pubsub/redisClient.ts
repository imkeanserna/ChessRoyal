import { User } from "../games/user";
import { WebSocket } from "ws";
import Redis from "ioredis";

interface Subscription {
  room: string;
  users: User[];
}

interface ReverseSubscription {
  userId: string;
  ws: WebSocket;
}

export class RedisPubSubManager {
  private static instance: RedisPubSubManager;
  private subscriber: Redis;
  private publisher: Redis;
  private subscriptions: Map<string, Map<string, Subscription>>;
  private reverseSubscriptions: Map<string, Map<string, ReverseSubscription>>;
  private userRoomMapping: Map<string, string>;

  private constructor() {
    this.subscriber = new Redis();
    this.publisher = new Redis();
    this.subscriptions = new Map();
    this.reverseSubscriptions = new Map();
    this.userRoomMapping = new Map();

    this.subscriber.on("message", (channel: string, message: string) => {
      console.log(`Received ${message} from ${channel}`);
      const subscribers = this.reverseSubscriptions.get(channel);
      subscribers?.forEach(({ ws }) => ws.send(message));
    });
  }

  static getInstance(): RedisPubSubManager {
    if (!RedisPubSubManager.instance) {
      RedisPubSubManager.instance = new RedisPubSubManager();
    }
    return RedisPubSubManager.instance;
  }

  subscribe(userId: string, room: string, ws: WebSocket): void {
    // Add room to user's subscriptions
    if (!this.subscriptions.has(userId)) {
      this.subscriptions.set(userId, new Map());
    }
    const userSubscriptions = this.subscriptions.get(userId)!;
    userSubscriptions.set(room, { room, users: [] });

    // Add user to room's subscribers
    if (!this.reverseSubscriptions.has(room)) {
      this.reverseSubscriptions.set(room, new Map());
    }
    const roomSubscribers = this.reverseSubscriptions.get(room)!;
    roomSubscribers.set(userId, { userId, ws });

    // Add user to userRoomMapping
    if (!this.userRoomMapping.has(userId)) {
      this.userRoomMapping.set(userId, room);
    }

    // If this is the 1st subscriber to this room, subscribe to the room
    if (roomSubscribers.size === 1) {
      console.log(`Subscribing to messages from ${room}`);
      this.subscriber.subscribe(room, (err, count) => {
        if (err) {
          console.error("Failed to subscribe: %s", err.message);
        } else {
          console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
        }
      });
    }
  }

  unsubscribe(userId: string): void {
    if (!userId) return;

    const room = this.userRoomMapping.get(userId);
    if (!room) {
      console.error("Room not found");
      return;
    };

    // Remove room from user's subscriptions
    const userSubscriptions = this.subscriptions.get(userId);
    if (userSubscriptions) {
      userSubscriptions.delete(room);
      if (userSubscriptions.size === 0) {
        this.subscriptions.delete(userId);
      }
    }

    // Remove user from room's subscribers
    const roomSubscribers = this.reverseSubscriptions.get(room);
    if (roomSubscribers) {
      roomSubscribers.delete(userId);
      if (roomSubscribers.size === 0) {
        console.log(`Unsubscribing from ${room}`);
        this.subscriber.unsubscribe(room);
        this.reverseSubscriptions.delete(room);
      }
    }

    this.userRoomMapping.delete(userId);

    console.log({
      userRoomMapping: this.userRoomMapping,
      subscriptions: this.subscriptions,
      reverseSubscriptions: this.reverseSubscriptions,
    });
  }

  async sendMessage(room: string, payload: string): Promise<void> {
    await this.publish(room, payload);
  }

  private async publish(room: string, message: string): Promise<void> {
    console.log(`Publishing message to ${room}`);
    await this.publisher.publish(room, message);
  }
}
