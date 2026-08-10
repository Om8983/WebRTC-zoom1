import { error } from "console";
import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";

export function initiateWSS(server: any) {
  let senderSocket: null | WebSocket = null;
  let receiverSocket: null | WebSocket = null;
  const wss = new WebSocketServer({ server: server });

  wss.on("connection", (ws, res) => {
    ws.on("error", () => {
      console.error("Error connecting to the server");
      throw error;
    });

    ws.on("message", (data: string) => {
      const message = JSON.parse(data);
      switch (message.type) {
        case "sender":
          senderSocket = ws;
          return;
        case "receiver":
          receiverSocket = ws;
          return;
        case "createOffer":
          if (ws !== senderSocket) return;
          ws.send(JSON.stringify({ type: "createOffer", sdp: message.sdp }));
          return;
        case "createAnswer":
          if (ws !== receiverSocket) return;
          ws.send(JSON.stringify({ type: "createAnswer", sdp: message.sdp }));
          return;
        case "addIceCandidate":
          if (ws === senderSocket) {
            receiverSocket?.send(
              JSON.stringify({
                type: "addIceCandidate",
                candidate: message.candidate,
              }),
            );
            return;
          }
          if (ws === receiverSocket) {
            senderSocket?.send(
              JSON.stringify({
                type: "addIceCandidate",
                candidate: message.candidate,
              }),
            );
            return;
          }
      }
    });
  });
}
