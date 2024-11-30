import { createServer, IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { GameMessages } from "@repo/chess/gameStatus";
import { GameManager } from "./game-manager";
import { User } from "./games/user";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;

class WebSocketGameServer {
  private server: ReturnType<typeof createServer>;
  private wss: WebSocketServer;
  private gameManager: GameManager;

  constructor() {
    this.server = createServer();
    this.wss = new WebSocketServer({ server: this.server });
    this.gameManager = new GameManager();
  }

  private handleConnection(ws: WebSocket, req: IncomingMessage): void {
    let user: User | undefined;
    console.log("Client connected");

    ws.on("message", async (payload) => {
      const { event, data } = JSON.parse(payload.toString())

      if (event == "auth") {
        user = new User(ws, data.id, data.name, data.isGuest, data.avatar);
        this.gameManager.addUser(user);
        return;
      } else if (user) {
        if (this.isGameEvent(event)) {
          await this.gameManager.handleGameEvent(user, { event, payload: data });
        } else {
          console.warn("Unhandled event type:", event);
        }
      } else {
        console.log("User not authenticated, cannot add to game");
      }
    });

    ws.on("error", this.handleError);
    ws.on("close", () => {
      try {
        if (user) {
          this.handleDisconnection(user);
        }
      } catch (error) {
        console.error("Error handling disconnection:", error);
      }
    });
  }

  private isGameEvent(event: string): boolean {
    return Object.values(GameMessages).includes(event as GameMessages);
  }

  private handleDisconnection(user: User): void {
    console.log("Client disconnected");
    this.gameManager.removeUser(user.userId);
  }

  private handleError(error: Error): void {
    console.error("WebSocket error:", error);
  }

  private validateDatabaseURL(databaseURL: string | undefined): void {
    if (!databaseURL) {
      throw new Error("DATABASE_URL is not defined");
    }

    // Check if the URL is for a third-party database
    const isThirdParty = databaseURL.includes("aivencloud.com");

    if (!isThirdParty) {
      console.log("Using a local PostgreSQL database.");
      // Ensure the database URL points to localhost
      if (!databaseURL.includes("localhost")) {
        throw new Error("Invalid DATABASE_URL: Must point to localhost for local setup.");
      }
    } else {
      console.log("Using an Aiven Cloud PostgreSQL database.");
    }
  }

  public start(): void {
    try {
      this.validateDatabaseURL(process.env.DATABASE_URL);
    } catch (error: any) {
      console.error(error.message);
      process.exit(1);
    }

    this.wss.on("connection", (ws: WebSocket, req: IncomingMessage) => this.handleConnection(ws, req));

    this.server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

    process.on("SIGINT", () => this.gracefulShutdown());
    process.on("SIGTERM", () => this.gracefulShutdown());
  }

  private gracefulShutdown(): void {
    console.log("Shutting down server...");
    this.wss.close(() => {
      console.log("WebSocket server closed");
      this.server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    });
  }
}

// Start the server
const gameServer = new WebSocketGameServer();
gameServer.start();
