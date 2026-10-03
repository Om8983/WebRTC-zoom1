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

type MessageType = {
  type: string;
  userId: string;
  meetingId: string;

  // optional based on the message type
  targetId?: string; // the userId to whom the sdp or candidate is supposed to be sent
  sdp?: string;
  candidate?: string;
};

export const wsTypeJoin = (message: MessageType, ws: WebSocket) => {
  if (!message.userId && !message.meetingId) return;
  const socketId = crypto.randomUUID();

  socketUserMap.set(socketId, {
    userId: message.userId,
    meetingId: message.meetingId,
    socketConnection: ws,
  });

  const users = meetingUsersMap.get(message.meetingId) ?? [];

  users.push(message.userId);
  meetingUsersMap.set(message.meetingId, users);

  return {
    msg: "User joined successfully.",
    existingUsers: users.filter((c) => c !== message.userId),
  };
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

export const wsTypeOffer = (message: MessageType, ws: WebSocket) => {
  try {
    // first we will check if the user is a part of that meeting
    if (message.userId && message.meetingId) {
      return { msg: "Invalid user credentials" };
    }

    // offer will be responsible for forwarding the respective sdp to the other users present in the room
    // therefore the 'offer' expects the 'to'(the userId for whom the sdp is created) and 'sdp'(the created sdp to forward) in the request incoming from the user.

    // first we will check if a socket connection is created across the user requesting to share sdp to other users
    const isSocketConnectionCreated = socketUserMap.get(message.userId);
    if (!isSocketConnectionCreated) {
      return { msg: "No socket connection created across user." };
    }
    // if user connection exist then we will check if user is registered in the meeting
    const users = meetingUsersMap.get(message.meetingId) ?? [];
    const userRegistered = users.find((c) => c === message.userId);
    if (!userRegistered) {
      return { msg: "No user registered in the meeting." };
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
      return { message: "Target user doesn't exist in the meeting." };
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
      return { msg: "User is not connected." };
    }

    const targetPayload = {
      type: "createOffer",
      sdp: message.sdp,
      from: message.userId,
    };

    targetSocketConnection.ws.send(JSON.stringify(targetPayload));
  } catch (error) {
    return { msg: "Internal Server Error." };
  }
};
export const wsTypeAnswer = async (message: MessageType, ws: WebSocket) => {
  try {
    if (!message.userId || !message.meetingId) {
      return { msg: "Invalid meeting credentials" };
    }

    const receiverSocket = socketUserMap.get(message.userId);
    if (!receiverSocket) {
      return { msg: "Unauth user." };
    }

    const meetingId = receiverSocket.meetingId;
    const isMeetingActive = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
      },
      select: {
        meetingStatus: true,
      },
    });
    if (isMeetingActive?.meetingStatus !== "ACTIVE") {
      return { msg: "Meeting has ended. No more request tolerated." };
    }

    const users = meetingUsersMap.get(meetingId);

    const userExistInMeeting = users?.find((c) => c === message.userId);
    if (!userExistInMeeting || message.userId === message.targetId) {
      return {
        msg: "Either user doesn't exist in meeting or the targetId is invalid",
      };
    }

    const targetUser = socketUserMap.get(message.targetId as string);
    if (!targetUser) {
      return { msg: "target user doesn't have an active socketConnection." };
    }
    const targetUserExistInMeeting = users?.find((c) => c === message.targetId);
    if (!targetUserExistInMeeting) {
      return { msg: "Target User has left the meeting" };
    }

    const targetSocket = fetchActiveUserSocket(
      message.targetId as string,
      meetingId,
      socketUserMap,
    );
    // checking if the targetUser's ws connection is OPEN
    if (!targetSocket || targetSocket.ws.readyState !== WebSocket.OPEN) {
      return { msg: "Target user doesn't have an active socket connection." };
    }
    const payload = {
      type: "createAnswer",
      sdp: message.sdp,
      from: message.userId,
    };
    targetSocket.ws.send(JSON.stringify(payload));
  } catch (error) {
    return { msg: "Internal server issue" };
  }
};

export const wsTypeLeave = async (message: MessageType) => {
  // first verify the credentials by the user
  // get the user and validate socket Connection
  // validate the meeting is active
  // check if user exist in the meetingUsersMap
  // validate if user is a host
  // get all the users and end socketConnection and delete their mapping from socketUserMap
  // delete the meeting from the meetingUsersMap
  if (!message.userId || !message.meetingId) {
    return { msg: "Invalid user credentials" };
  }
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
      participants: {
        where: {
          participantId: message.userId,
        },
        select: {
          role: true,
        },
      },
    },
  });
  if (meeting?.meetingStatus === "END") {
    return { msg: "Meeting has already ended" };
  }
  if (meeting?.participants[0]?.role !== "HOST") {
    return { msg: "Only host can end the meeting." };
  }
  const users = meetingUsersMap.get(meetingId);
  users?.forEach((userId) => {
    const userSocket = socketUserMap.get(userId);
    if (userSocket) {
      userSocket.socketConnection.close();
      socketUserMap.delete(userId);
    }
  });
  meetingUsersMap.delete(meetingId);
  return { msg: "Meeting has ended successfully." };
};

export const wsTypeICECandidate = (message: MessageType) => {};
