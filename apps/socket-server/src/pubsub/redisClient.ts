import { User } from "../games/user";
import { WebSocket } from "ws";
import Redis from "ioredis";

export class RedisPubSubManager {
  private static instance: RedisPubSubManager;
  private subscriber: Redis;
  private publisher: Redis;

  private subscriptions: Map<
    string,
    { [room: string]: { room: string; user: User[] } }
  >;

  private reverseSubscriptions: Map<
    string,
    { [userId: string]: { userId: string; ws: WebSocket } }
  >;

  private constructor() {
    this.subscriber = new Redis();
    this.publisher = new Redis();

    this.subscriptions = new Map<
      string,
      { [room: string]: { room: string; user: User[] } }
    >();
    this.reverseSubscriptions = new Map<
      string,
      { [userId: string]: { userId: string; ws: WebSocket } }
    >();

    this.subscriber.on("message", (channel, message) => {
      console.log(`Received ${message} from ${channel}`);
      const subscribers = this.reverseSubscriptions.get(channel) || {};
      Object.values(subscribers).forEach(({ ws }) => ws.send(message));
    });
  }

  static getInstance() {
    if (!this.instance) this.instance = new RedisPubSubManager();

    return this.instance;
  }

  subscribe(userId: string, room: string, ws: any) {
    // Add room to user's subscriptions
    this.subscriptions.set(userId, {
      ...(this.subscriptions.get(userId) || {}),
      [room]: { room, user: [] },
    });

    // Add user to room's subscribers
    this.reverseSubscriptions.set(room, {
      ...(this.reverseSubscriptions.get(room) || {}),
      [userId]: { userId, ws },
    });

    // If this is the 1st subscriber to this room, subscribe to the room
    if (Object.keys(this.reverseSubscriptions.get(room) || {})?.length === 1) {
      console.log(`subscribing messages from ${room}`);

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

    // --TODO: This is it
    // this.publish(room, {
    //   payload: {
    //     event: "userJoined",
    //     payload: { userId },
    //   },
    // });
  }

  unsubscribe(userId: string, room: string) {
    if (!userId || !room || !this.subscriptions.get(userId)) return;

    // Remove room from user's subscriptions
    const userSubscriptions = this.subscriptions.get(userId);
    if (userSubscriptions) {
      delete userSubscriptions[room];

      // If user has no more subscriptions, remove user from subscriptions
      if (Object.keys(userSubscriptions).length === 0) {
        this.subscriptions.delete(userId);
      }
    }

    // Remove user from room's subscribers
    delete this.reverseSubscriptions.get(room)?.[userId];

    // If room has no more subscribers, unsubscribe from it
    if (
      !this.reverseSubscriptions.get(room) ||
      Object.keys(this.reverseSubscriptions.get(room) || {}).length === 0
    ) {
      console.log("unsubscribing from " + room);
      this.subscriber.unsubscribe(room);
      this.reverseSubscriptions.delete(room);
    }

    console.log({
      subs: this.subscriptions,
      revSubs: this.reverseSubscriptions,
    });
  }

  async sendMessage(room: string, message: any) {
    this.publish(room, {
      payload: {
        message
      },
    });
  }

  publish(room: string, message: any) {
    console.log(`publishing message to ${room}`);
    this.publisher.publish(room, JSON.stringify(message));
  }
}
