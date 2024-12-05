import { User } from "../games/user";
import { WebSocket } from "ws";
import { Redis } from "ioredis";
import { REDIS_URL } from "../config/config";

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
  private userChannels: Map<string, WebSocket>;

  private constructor() {
    this.subscriber = new Redis(REDIS_URL);
    this.publisher = new Redis(REDIS_URL);
    this.subscriptions = new Map();
    this.reverseSubscriptions = new Map();
    this.userRoomMapping = new Map();
    this.userChannels = new Map();

    this.subscriber.on("message", (channel: string, message: string) => {
      if (channel.startsWith("user:")) {
        const userId = channel.split(':')[1];
        if (userId) {
          const userWs = this.userChannels.get(userId);
          if (userWs) {
            userWs.send(message);
          }
        }
      } else {
        const subscribers = this.reverseSubscriptions.get(channel);
        subscribers?.forEach(({ ws }) => ws.send(message));
      }
    });
  }

  static getInstance(): RedisPubSubManager {
    if (!RedisPubSubManager.instance) {
      RedisPubSubManager.instance = new RedisPubSubManager();
    }
    return RedisPubSubManager.instance;
  }

  subscribe(userId: string, room: string, ws: WebSocket): void {
    if (!userId || !room) {
      console.error("User ID and room must be provided.");
      return;
    }

    // Subscribe to user's personal channel if not already subscribed
    if (!this.userChannels.has(userId)) {
      this.subscribeUser(userId, ws);
    }

    // Rest of the original subscribe method remains the same
    if (!this.subscriptions.has(userId)) {
      this.subscriptions.set(userId, new Map());
    }
    const userSubscriptions = this.subscriptions.get(userId)!;
    userSubscriptions.set(room, { room, users: [] });

    if (!this.reverseSubscriptions.has(room)) {
      this.reverseSubscriptions.set(room, new Map());
    }
    const roomSubscribers = this.reverseSubscriptions.get(room)!;
    roomSubscribers.set(userId, { userId, ws });

    if (!this.userRoomMapping.has(userId)) {
      this.userRoomMapping.set(userId, room);
    }

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

    // Unsubscribe from user's personal channel
    this.unsubscribeUser(userId);

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
  }

  subscribeUser(userId: string, ws: WebSocket): void {
    if (!userId) {
      console.error("User ID must be provided.");
      return;
    }

    const userChannel = `user:${userId}`;
    this.userChannels.set(userId, ws);

    // Subscribe to user's personal channel
    this.subscriber.subscribe(userChannel, (err, count) => {
      if (err) {
        console.error(`Failed to subscribe to user channel: ${err.message}`);
      } else {
        console.log(`Subscribed to user channel ${userChannel}. Total subscriptions: ${count}`);
      }
    });
  }

  unsubscribeUser(userId: string): void {
    if (!userId) return;

    const userChannel = `user:${userId}`;
    this.userChannels.delete(userId);
    this.subscriber.unsubscribe(userChannel);
  }

  async sendToUser(userId: string, payload: string): Promise<void> {
    const userChannel = `user:${userId}`;
    await this.publish(userChannel, payload);
  }

  async sendMessage(room: string, payload: string): Promise<void> {
    await this.publish(room, payload);
  }

  private async publish(room: string, message: string): Promise<void> {
    console.log(`Publishing message to ${room}`);
    await this.publisher.publish(room, message);
  }
}
