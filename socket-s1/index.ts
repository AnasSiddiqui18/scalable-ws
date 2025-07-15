import { WebSocketServer, WebSocket as WebSocketWS } from "ws";

const port = parseInt(Bun.argv[2] || "3000");
const wss = new WebSocketServer({ port });

type extendedWebSocket = WebSocketWS & {
    id: string;
};

interface Room {
    sockets: extendedWebSocket[];
}

const rooms: Record<string, Room> = {};

const RELAYER_URL = "ws://localhost:3001";
const relayerSocket = new WebSocket(RELAYER_URL);

let senderId = "";

// when we get a new message from relayer server

relayerSocket.onmessage = ({ data }) => {
    const parsedData = JSON.parse(data as string);
    const room = parsedData.room;

    if (parsedData.type === "chat") {
        rooms[room]?.sockets
            .filter((socket) => socket.id !== senderId)
            .map((socket) => socket.send(data));
    }
};

wss.on("connection", function connection(ws: extendedWebSocket, req) {
    ws.on("error", console.error);

    const id = req.headers["sec-websocket-key"] || crypto.randomUUID();
    ws["id"] = id;

    ws.on("message", function message(data: string) {
        const parsedData = JSON.parse(data);

        if (parsedData.type === "join_room") {
            const room = parsedData.room;

            if (!rooms[room]) {
                rooms[room] = {
                    sockets: [],
                };
            }

            rooms[room].sockets.push(ws);
        }

        if (parsedData.type === "chat") {
            senderId = ws.id;

            relayerSocket.send(data);
        }
    });
});
