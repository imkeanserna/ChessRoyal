import { createServer } from "http";
import { ServerOptions, WebSocket, WebSocketServer } from "ws";
import { GameManager } from "./game-manager";
import { User } from "./games/user";
import url from "url";

const server = createServer();
const port = process.env.PORT || 3001;

const wss = new WebSocketServer({ server });

const gameManager = new GameManager();

wss.on("connection", (ws: WebSocket, req: any) => {
  console.log("Client connected");
  const token: any = url.parse(req.url, true).query.token;
  console.log(token)
  const user = new User(ws, token);
  gameManager.addUser(user);

  ws.on("close", () => {
    console.log("Client disconnected");
    gameManager.removeUser(ws);
  })
})

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
