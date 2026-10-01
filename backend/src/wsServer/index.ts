import { error } from "console";
import { WebSocketServer, WebSocket } from "ws";
import {
  wsTypeAnswer,
  wsTypeICECandidate,
  wsTypeJoin,
  wsTypeLeave,
  wsTypeOffer,
} from "../controllers/signalingControllers/wsSignalingControllers";

const socketUserMap = new Map<
  string,
  {
    userId: string;
    meetingId: string;
  }
>();
const meetingUsersMap = new Map<string, string[]>();

export function initiateWSS(server: any) {
  // so the socket <=> userId map will contain array of {key}:{value} pairs where key would be the generated socketId and value would be the usreObj containing the userId and the meetingId

  // the other map object will be responsible for storing the {key} : {value} pairs which will have key as the meetingId and the value would be the array of userId's

  // edge case to take a note off
  // 1. what should i validate in /sender before creating a socketId and assigning it to a map and also the other map..????
  // =>

  type MessageType = {
    type: string;
    userId: string;
    meetingId: string;

    // optional based on the message type
    targetId: string;
    sdp?: string;
    candidate?: string;
  };

  const wss = new WebSocketServer({ server: server });

  wss.on("connection", (ws: WebSocket, res) => {
    ws.on("error", () => {
      console.error("Error connecting to the server");
      throw error;
    });

    ws.on("message", (data: string) => {
      const message = JSON.parse(data) as MessageType;
      switch (message.type) {
        case "join":
          wsTypeJoin(message, ws);
        case "createOffer":
          wsTypeOffer(message, ws);
          return;
        case "createAnswer":
          wsTypeAnswer(message, ws);
          return;
        case "leaveMeeting":
          wsTypeLeave(message);
          return;
        case "addIceCandidate":
          wsTypeICECandidate(message);
          return;
      }
    });
  });
}
