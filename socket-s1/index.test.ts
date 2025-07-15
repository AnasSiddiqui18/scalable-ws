import { describe, expect, test } from "bun:test";

const BACKEND_URL = "ws://localhost:8080";

describe("Chat Application", () => {
  test("Message sent from room 1 reaches another participant at room 1", async () => {
    const ws1 = new WebSocket(BACKEND_URL);
    const ws2 = new WebSocket(BACKEND_URL);

    await Promise.all([
      new Promise<void>((resolve) => {
        ws1.onopen = () => {
          console.log("first runs");
          resolve();
        };
      }),

      new Promise<void>((resolve) => {
        ws2.onopen = () => {
          console.log("second runs");
          resolve();
        };
      }),
    ]);

    console.log("first and second runs");

    ws1.send(
      JSON.stringify({
        type: "join_room",
        room: "gaming room",
      })
    );

    ws2.send(
      JSON.stringify({
        type: "join_room",
        room: "gaming room",
      })
    );

    await new Promise<void>((resolve) => {
      ws2.onmessage = ({ data }) => {
        try {
          const parsedData = JSON.parse(data);
          expect(parsedData.type === "chat").toBeTrue();
          expect(parsedData.message === "message from user 1").toBeTrue();
          expect(parsedData.room === "gaming room").toBeTrue();
          resolve();
        } catch (error) {
          console.log("error", error);
        }
      };

      ws1.send(
        JSON.stringify({
          type: "chat",
          room: "gaming room",
          message: "message from user 1",
        })
      );
    });
  });
});
