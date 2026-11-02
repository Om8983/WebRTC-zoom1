import { WebSocket } from "ws";
import { fetchActiveUserSocket } from "../commonControllers";
import { prisma } from "../../prismaInstance";

const socketUserMap = new Map<
  string,
  {
    userId: string;
    meetingId: string;
    socketConnection: WebSocket;
  }
>();
const meetingUsersMap = new Map<string, string[]>();

export type MessageType = {
  type: string;
  userId: string;
  meetingId: string;

  // optional based on the message type
  targetId?: string; // the userId to whom the sdp or candidate is supposed to be sent
  sdp?: {
    type?: string;
    sdp?: string;
  };
  candidate?: {
    candidate: string;
    sdpMid?: string | null;
    sdpMLineIndex?: number | null;
    usernameFragment?: string | null;
  };
};

export const wsTypeJoin = (message: MessageType, ws: WebSocket) => {
  if (!message.userId || !message.meetingId) return;
  for (const [socketId, userSocket] of socketUserMap) {
    if (
      userSocket.userId === message.userId &&
      userSocket.meetingId === message.meetingId
    ) {
      socketUserMap.delete(socketId);
      if (
        userSocket.socketConnection !== ws &&
        userSocket.socketConnection.readyState === WebSocket.OPEN
      ) {
        userSocket.socketConnection.close();
      }
    }
  }

  const socketId = crypto.randomUUID();

  socketUserMap.set(socketId, {
    userId: message.userId,
    meetingId: message.meetingId,
    socketConnection: ws,
  });

  const users = meetingUsersMap.get(message.meetingId) ?? [];

  if (!users.includes(message.userId)) users.push(message.userId);
  meetingUsersMap.set(message.meetingId, users);

  return {
    msg: "User joined successfully.",
    type: "join",
    existingUsers: users.filter((c) => c !== message.userId),
  };
};

export const wsTypeDisconnect = (ws: WebSocket) => {
  for (const [socketId, userSocket] of socketUserMap) {
    if (userSocket.socketConnection !== ws) continue;

    socketUserMap.delete(socketId);
    const users = meetingUsersMap.get(userSocket.meetingId) ?? [];
    const remainingUsers = users.filter((userId) => userId !== userSocket.userId);
    if (remainingUsers.length === 0) {
      meetingUsersMap.delete(userSocket.meetingId);
    } else {
      meetingUsersMap.set(userSocket.meetingId, remainingUsers);
    }

    const message = JSON.stringify({
      type: "participantLeft",
      userId: userSocket.userId,
    });
    for (const remainingUserId of remainingUsers) {
      const peer = fetchActiveUserSocket(
        remainingUserId,
        userSocket.meetingId,
        socketUserMap,
      );
      if (peer?.ws.readyState === WebSocket.OPEN) peer.ws.send(message);
    }
  }
};

// 2 other functions are supposed to be created which will be responsible for letting other users know that some user has joined or left
export const wsTypeParticpantJoined = async (
  message: MessageType,
  ws: WebSocket,
) => {
  // first verify the participant credentials are being provided
  // validate if the user is being registered in the socketUserMap
  // extract and validate if the meeting is active and the user is part of that meetingUsersMap
  // get users from the meetingUsersMap and filter out the current user
  // broadcast message to the rest of the user

  if (!message.userId || !message.meetingId) {
    return { msg: "Invalid user creds provided." };
  }

  const userSocket = socketUserMap.get(message.userId);
  if (!userSocket) {
    return { msg: "No user found." };
  }
  const meetingId = userSocket.meetingId;
  const meeting = await prisma.meeting.findUnique({
    where: {
      id: meetingId,
    },
    select: {
      meetingStatus: true,
      participants: {
        where: {
          participantId: message.userId,
        },
        select: {
          role: true,
          user: {
            select: {
              userName: true,
              email: true,
              id: true,
            },
          },
        },
      },
    },
  });
  if (meeting?.meetingStatus === "END") {
    return { msg: "Meeting has already ended" };
  }
  const users = meetingUsersMap.get(meetingId);
  const updatedUsers = users?.filter((c) => c !== message.userId) || [];
  meetingUsersMap.set(meetingId, updatedUsers);
  ws.send(
    JSON.stringify({
      type: "participantJoined",
      userId: message.userId,
      meetingId: meetingId,
      msg: "User has joined the meeting.",
    }),
  );

  return {
    msg: "New user joined.",
    type: "joinMeeting",
    user: meeting?.participants[0],
  };
};
export const wsTypeParticipantLeft = async (
  message: MessageType,
  ws: WebSocket,
) => {
  if (!message.userId || !message.meetingId) {
    return { msg: "Invalid user details." };
  }

  // first verify the user
  // validate the user socket connection in socketUserMap
  // validate if meeting is active. If not then close the socketConnection for the user and no global send message
  // validate user exist in that meeting
  // close the user's socket connection and deregister user from socketUserMap.
  // get the userId's from the meetingUserMap.
  // filter out and then remove the userId from meetingUsersMap.
  // broadcast the message to remaining other users in the meeting.
  const userSocket = socketUserMap.get(message.userId);
  if (!userSocket) {
    return { msg: "No user found" };
  }
  const meetingId = userSocket.meetingId;
  const meeting = await prisma.meeting.findFirst({
    where: {
      id: meetingId,
    },
    select: {
      meetingStatus: true,
    },
  });
  if (meeting?.meetingStatus === "END") {
    return { msg: "Meeting has already ended" };
  }
  // removing user from the socketmapping
  socketUserMap.delete(message.userId);
  // closing socket connection
  userSocket.socketConnection.close();
  // get all the users and remove the current user
  const users = meetingUsersMap.get(meetingId);
  const updatedUsers = users?.filter((c) => c !== message.userId) || [];
  meetingUsersMap.set(meetingId, updatedUsers);

  ws.send(
    JSON.stringify({
      type: "participantLeft",
      userId: message.userId,
      meetingId: meetingId,
      msg: "User has left the meeting.",
    }),
  );
};

export const wsTypeOffer = async (message: MessageType, ws: WebSocket) => {
  try {
    // first we will check if the user is a part of that meeting
    if (!message.userId || !message.meetingId || !message.targetId || !message.sdp) {
      return { type: "signalingError", msg: "Invalid offer signaling payload." };
    }

    // offer will be responsible for forwarding the respective sdp to the other users present in the room
    // therefore the 'offer' expects the 'to'(the userId for whom the sdp is created) and 'sdp'(the created sdp to forward) in the request incoming from the user.

    // first we will check if a socket connection is created across the user requesting to share sdp to other users
    const sender = fetchActiveUserSocket(
      message.userId,
      message.meetingId,
      socketUserMap,
    );
    if (!sender || sender.ws !== ws || ws.readyState !== WebSocket.OPEN) {
      return { type: "signalingError", msg: "Sender is not connected to this meeting." };
    }
    // if user connection exist then we will check if user is registered in the meeting
    const users = meetingUsersMap.get(message.meetingId) ?? [];
    const userRegistered = users.find((c) => c === message.userId);
    if (!userRegistered) {
      return { type: "signalingError", msg: "No user registered in the meeting." };
    }

    // if user's connection is created and also exist in the meeting then we will proceed forwarding the user created sdp to the respective user in the meeting

    // but before even sharing users their respective sdp we first need to check if the user to whom we are sharing still exist in the meeting.

    // or even if i don't check if the user exist the sdp still won't be forwarded right?? NO, that's wrong assumption.

    // Just validating that the target still exist in the meeting isn't enough

    // 1. Sender is authenticated
    // 2. Sender belongs to the meeting
    // 3. Target belongs to the same meeting
    // 4. Target has an active WebSocket connection
    // 5. Target socket is OPEN
    // 6. Meeting is still active
    // 7. Offer is for the expected peer connection/negotiation
    // 8. Forward the SDP

    // before writing you might think that we probably need to create a map for fowarding respective sdp's to the users but that isn't the case. The offer function in the signaling should purely be responsible for handling forwarding of sdp's to the user. It's the frontend's job to use a map to create sdp for the number of users.

    // check if the target exist in the meeting
    const targetExist = users.find((c) => c === message.targetId);
    if (!targetExist) {
      return { type: "signalingError", msg: "Target user doesn't exist in the meeting." };
    }
    const targetSocketConnection = fetchActiveUserSocket(
      message.targetId as string,
      message.meetingId,
      socketUserMap,
    );
    if (
      !targetSocketConnection ||
      targetSocketConnection.ws.readyState !== WebSocket.OPEN
    ) {
      return { type: "signalingError", msg: "User is not connected." };
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: message.meetingId },
      select: { meetingStatus: true },
    });
    if (meeting?.meetingStatus !== "ACTIVE") {
      return { type: "signalingError", msg: "Meeting is not active." };
    }

    const targetPayload = {
      type: "createOffer",
      sdp: message.sdp,
      from: message.userId,
    };

    targetSocketConnection.ws.send(JSON.stringify(targetPayload));
  } catch (error) {
    console.error("Failed to relay offer.", error);
    return { type: "signalingError", msg: "Unable to relay offer." };
  }
};
export const wsTypeAnswer = async (message: MessageType, ws: WebSocket) => {
  try {
    if (
      !message.userId ||
      !message.meetingId ||
      !message.targetId ||
      !message.sdp
    ) {
      return { type: "signalingError", msg: "Invalid answer signaling payload." };
    }

    const sender = fetchActiveUserSocket(
      message.userId,
      message.meetingId,
      socketUserMap,
    );
    if (!sender || sender.ws !== ws || ws.readyState !== WebSocket.OPEN) {
      return { type: "signalingError", msg: "Sender is not connected to this meeting." };
    }

    const meetingId = message.meetingId;
    const isMeetingActive = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
      },
      select: {
        meetingStatus: true,
      },
    });
    if (isMeetingActive?.meetingStatus !== "ACTIVE") {
      return { type: "signalingError", msg: "Meeting is not active." };
    }

    const users = meetingUsersMap.get(meetingId);

    const userExistInMeeting = users?.find((c) => c === message.userId);
    if (!userExistInMeeting || message.userId === message.targetId) {
      return {
        type: "signalingError",
        msg: "Either user doesn't exist in meeting or the targetId is invalid",
      };
    }

    const targetUserExistInMeeting = users?.find((c) => c === message.targetId);
    if (!targetUserExistInMeeting) {
      return { type: "signalingError", msg: "Target user has left the meeting." };
    }

    const targetSocket = fetchActiveUserSocket(
      message.targetId,
      meetingId,
      socketUserMap,
    );
    if (!targetSocket || targetSocket.ws.readyState !== WebSocket.OPEN) {
      return { type: "signalingError", msg: "Target user doesn't have an active socket connection." };
    }
    const payload = {
      type: "createAnswer",
      sdp: message.sdp,
      from: message.userId,
    };
    targetSocket.ws.send(JSON.stringify(payload));
  } catch (error) {
    console.error("Failed to relay answer.", error);
    return { type: "signalingError", msg: "Unable to relay answer." };
  }
};

export const wsTypeEnd = async (message: MessageType, ws: WebSocket) => {
  if (!message.userId || !message.meetingId) {
    return { type: "endMeetingResult", success: false, msg: "Invalid user credentials." };
  }

  const sender = fetchActiveUserSocket(
    message.userId,
    message.meetingId,
    socketUserMap,
  );
  if (!sender || sender.ws !== ws || ws.readyState !== WebSocket.OPEN) {
    return { type: "endMeetingResult", success: false, msg: "User is not connected to this meeting." };
  }

  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: message.meetingId },
      select: {
        meetingStatus: true,
        participants: {
          where: { participantId: message.userId },
          select: { role: true },
        },
      },
    });
    if (meeting?.meetingStatus !== "ACTIVE") {
      return { type: "endMeetingResult", success: false, msg: "Meeting is not active." };
    }
    if (meeting.participants[0]?.role !== "HOST") {
      return { type: "endMeetingResult", success: false, msg: "Only the host can end the meeting." };
    }

    const endedAt = new Date();
    await prisma.meeting.update({
      where: { id: message.meetingId },
      data: {
        meetingStatus: "END",
        endTime: endedAt,
        isMeetingCodeInvalid: true,
        participants: {
          updateMany: {
            where: { meetingId: message.meetingId },
            data: { leaveAt: endedAt },
          },
        },
      },
    });

    for (const [socketId, userSocket] of socketUserMap) {
      if (userSocket.meetingId !== message.meetingId) continue;

      if (userSocket.socketConnection.readyState === WebSocket.OPEN) {
        userSocket.socketConnection.send(
          JSON.stringify({ type: "meetingEnded", from: message.userId }),
        );
        userSocket.socketConnection.close();
      }
      socketUserMap.delete(socketId);
    }
    meetingUsersMap.delete(message.meetingId);

    return { type: "endMeetingResult", success: true };
  } catch (error) {
    console.error("Failed to end meeting from signaling.", error);
    return {
      type: "endMeetingResult",
      success: false,
      msg: "Unable to end the meeting.",
    };
  }
};

export const wsTypeICECandidate = async (
  message: MessageType,
  ws: WebSocket,
) => {
  const signalingError = (msg: string) => ({ type: "signalingError", msg });
  const candidate = message.candidate;

  if (
    !message.userId ||
    !message.meetingId ||
    !message.targetId ||
    !candidate
  ) {
    return signalingError("Invalid ICE candidate signaling payload.");
  }

  if (message.userId === message.targetId) {
    return signalingError("Cannot send an ICE candidate to yourself.");
  }

  const sender = fetchActiveUserSocket(
    message.userId,
    message.meetingId,
    socketUserMap,
  );
  if (!sender || sender.ws !== ws || ws.readyState !== WebSocket.OPEN) {
    return signalingError("Sender is not connected to this meeting.");
  }

  const users = meetingUsersMap.get(message.meetingId) ?? [];
  if (!users.includes(message.userId) || !users.includes(message.targetId)) {
    return signalingError("Sender or target is not in this meeting.");
  }

  const target = fetchActiveUserSocket(
    message.targetId,
    message.meetingId,
    socketUserMap,
  );
  if (!target || target.ws.readyState !== WebSocket.OPEN) {
    return signalingError("Target user is not connected.");
  }

  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: message.meetingId },
      select: { meetingStatus: true },
    });
    if (meeting?.meetingStatus !== "ACTIVE") {
      return signalingError("Meeting is not active.");
    }
  } catch (error) {
    console.error(
      "Failed to validate meeting before relaying ICE candidate.",
      error,
    );
    return signalingError("Unable to validate meeting for ICE candidate.");
  }

  if (
    ws.readyState !== WebSocket.OPEN ||
    target.ws.readyState !== WebSocket.OPEN
  ) {
    return signalingError("Sender or target disconnected before relay.");
  }

  target.ws.send(
    JSON.stringify({
      type: "addIceCandidate",
      candidate,
      from: message.userId,
    }),
  );
};
