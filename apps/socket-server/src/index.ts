import { createServer, IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { GameManager } from "./game-manager";
import { User } from "./games/user";
import url from "url";

const server = createServer();
const port = process.env.PORT || 3001;

const wss = new WebSocketServer({ server });

const gameManager = new GameManager();

const getTokenFromRequest = (req: IncomingMessage): string | undefined => {
  const parseUrl = url.parse(req.url || '', true);
  const tokenQuery = parseUrl.query.token;

  if (Array.isArray(tokenQuery)) {
    return tokenQuery[0];
  }
  return typeof tokenQuery === 'string' ? tokenQuery : undefined;
}

wss.on("connection", (ws: WebSocket, req: any) => {
  console.log("Client connected");
  const token: string | undefined = getTokenFromRequest(req);
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
