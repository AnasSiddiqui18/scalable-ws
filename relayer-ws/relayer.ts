import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({
    port: 3001,
});

const servers: WebSocket[] = [];

wss.on("connection", (ws) => {
    servers.push(ws);

    ws.on("error", (err) => {
        console.log("relayer connection failed", err);
    });

    ws.on("message", (ev: string) => {
        servers.map((socket) => socket.send(ev));
    });
});
