import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({
  port: 8081,
});

const servers: WebSocket[] = [];

wss.on("connection", (ws) => {
  servers.push(ws);
  console.log("server connected");

  ws.on("error", (err) => {
    console.log("relayer connection failed", err);
  });

  ws.on("message", (ev: string) => {
    console.log("message inside relayer server");
    console.log("message received inside relayer", JSON.parse(ev));
    servers.map((socket) => socket.send(ev));
  });
});
