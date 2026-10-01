import { WebSocket } from "ws";
export const fetchActiveUserSocket = (
  targetId: string,
  meetingId: string,
  usersSocketMap: Map<
    string,
    {
      userId: string;
      meetingId: string;
      socketConnection: WebSocket;
    }
  >,
) => {
  for (const [key, value] of usersSocketMap) {
    if (targetId === value.userId && meetingId === value.meetingId) {
      return {
        socketId: key,
        ws: value.socketConnection,
      };
    }
  }
  return null;
};
