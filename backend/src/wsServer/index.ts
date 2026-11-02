import { error } from "console";
import { WebSocketServer, WebSocket } from "ws";
import {
  type MessageType,
  wsTypeAnswer,
  wsTypeEnd,
  wsTypeICECandidate,
  wsTypeDisconnect,
  wsTypeJoin,
  wsTypeOffer,
  wsTypeParticipantLeft,
  wsTypeParticpantJoined,
} from "../controllers/signalingControllers/wsSignalingControllers";

export function initiateWSS(server: any) {
  // so the socket <=> userId map will contain array of {key}:{value} pairs where key would be the generated socketId and value would be the usreObj containing the userId and the meetingId

  // the other map object will be responsible for storing the {key} : {value} pairs which will have key as the meetingId and the value would be the array of userId's

  // edge case to take a note off
  // 1. what should i validate in /sender before creating a socketId and assigning it to a map and also the other map..????
  // =>

  const wss = new WebSocketServer({ server: server });

  wss.on("connection", (ws: WebSocket, res) => {
    ws.on("close", () => wsTypeDisconnect(ws));

    ws.on("error", () => {
      console.error("Error connecting to the server");
      throw error;
    });

    ws.on("message", async (data: string) => {
      const message = JSON.parse(data) as MessageType;
      let res;
      switch (message.type) {
        case "join":
          res = wsTypeJoin(message, ws);
          if (res && ws.readyState === WebSocket.OPEN) {
            return ws.send(JSON.stringify(res));
          }
          return;
        case "joinMeeting":
          res = wsTypeParticpantJoined(message, ws);
          if (res && ws.readyState === WebSocket.OPEN) {
            return ws.send(JSON.stringify(res));
          }
          return;
        case "leaveMeeting":
          res = wsTypeParticipantLeft(message, ws);
          if (res && ws.readyState === WebSocket.OPEN) {
            return ws.send(JSON.stringify(res));
          }
          return;
        case "createOffer":
          res = await wsTypeOffer(message, ws);
          if (res && ws.readyState === WebSocket.OPEN) {
            return ws.send(JSON.stringify(res));
          }
          return;
        case "createAnswer":
          res = await wsTypeAnswer(message, ws);
          if (res && ws.readyState === WebSocket.OPEN) {
            return ws.send(JSON.stringify(res));
          }
          return;
        case "endMeeting":
          res = await wsTypeEnd(message, ws);
          if (res && ws.readyState === WebSocket.OPEN) {
            return ws.send(JSON.stringify(res));
          }
          return;
        case "addIceCandidate":
          res = await wsTypeICECandidate(message, ws);
          if (res && ws.readyState === WebSocket.OPEN) {
            return ws.send(JSON.stringify(res));
          }
          return;
      }
    });
  });
}
