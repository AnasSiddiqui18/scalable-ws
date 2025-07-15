import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface Room {
  sockets: WebSocket[];
}

const rooms: Record<string, Room> = {};

const RELAYER_URL = "ws://localhost:8081";
const relayerSocket = new WebSocket(RELAYER_URL);

// when we get a new message from relayer server

relayerSocket.onmessage = ({ data }) => {
  const parsedData = JSON.parse(data as string);
  const room = parsedData.room;

  console.log("message received from relayer", parsedData);

  if (parsedData.type === "chat") {
    rooms[room]?.sockets.map((socket) => socket.send(data));
  }
};

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  console.log("client connected");

  ws.on("message", function message(data: string) {
    const parsedData = JSON.parse(data);

    if (parsedData.type === "join_room") {
      const room = parsedData.room;

      if (!rooms[room]) {
        console.log("joining room");

        rooms[room] = {
          sockets: [],
        };
      }

      rooms[room].sockets.push(ws);
    }

    if (parsedData.type === "chat") {
      console.log("sending message to relayer server");
      relayerSocket.send(data);
    }
  });
});
