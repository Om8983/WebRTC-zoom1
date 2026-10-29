import { Request, Response } from "express";
import { prisma } from "../../prismaInstance";
import { ParticipantJoinStatus } from "../../generated/prisma/enums";

type Meetdata = {
  creatorId: string;
  meetingStatus: "ACTIVE" | "END";
  meetingCode: string;
  invitees: string[];
};

export async function createMeeting(req: Request, res: Response) {
  try {
    const meetData = req.body as Meetdata;

    const inviteeEmails = [...new Set(meetData.invitees ?? [])].filter(
      (email) => email.length > 0,
    );

    // Read-only lookup — no transaction needed for this.
    const invitedUsers =
      inviteeEmails.length > 0
        ? await prisma.user.findMany({
            where: {
              email: { in: inviteeEmails, mode: "insensitive" },
              NOT: { id: meetData.creatorId },
            },
            select: { id: true },
          })
        : [];

    // A single nested create is one atomic statement: either the meeting
    // and all its participants are written, or none of them are.
    //
    // This previously used prisma.$transaction(async (txn) => ...) doing
    // create -> findMany -> update. An interactive transaction must check
    // out a pooled connection and issue BEGIN within Prisma's `maxWait`
    // (2s by default); on a cold Neon compute that checkout takes ~4s,
    // so the transaction failed with P2028 before any SQL ran. A plain
    // query has no such deadline, so it just waits for the wake-up.
    // If you ever need an interactive transaction again, pass
    // { maxWait: 10_000, timeout: 15_000 } as its second argument.
    const newMeeting = await prisma.meeting.create({
      data: {
        meetingCode: meetData.meetingCode,
        meetingStatus: meetData.meetingStatus,
        participants: {
          create: [
            {
              role: "HOST",
              participantId: meetData.creatorId,
              joinStatus: "JOINED" as ParticipantJoinStatus,
            },
            ...invitedUsers.map((user) => ({
              role: "INVITED" as const,
              participantId: user.id,
              joinStatus: "PENDING" as ParticipantJoinStatus,
            })),
          ],
        },
      },
      select: {
        id: true,
        meetingCode: true,
      },
    });

    return res.status(200).json({
      msg: "Meeting Created Successfully.",
      meetingId: newMeeting.id,
      meetingCode: newMeeting.meetingCode,
    });
  } catch (error) {
    console.error("createMeeting failed:", error);
    return res.status(500).json({ msg: "Internal server Error!" });
  }
}

type JoinMeeting = {
  meetingCode: string;
  userId: string;
};
export async function joinMeeting(req: Request, res: Response) {
  try {
    const body = req.body as JoinMeeting;
    const meetingExists = await prisma.meeting.findUnique({
      where: {
        meetingCode: body.meetingCode,
      },
      select: {
        id: true,
        meetingStatus: true,
        isMeetingCodeInvalid: true,
      },
    });

    if (
      meetingExists?.meetingStatus === "END" &&
      meetingExists.isMeetingCodeInvalid
    ) {
      return res.status(404).json({ msg: "Meeting link/code has expired." });
    }

    await prisma.meetingParticipant.update({
      where: {
        meetingId_participantId: {
          meetingId: meetingExists?.id || "",
          participantId: body.userId,
        },
      },
      data: {
        joinedAt: new Date().toISOString(),
        joinStatus: "JOINED",
      },
    });
    return res.status(200).json({
      msg: "Joined meeting successfully.",
      meetingId: meetingExists?.id,
    });
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error!" });
  }
}

type LeaveMeeting = {
  meetingId: string;
  meetingCode: string;
  userId: string;
};
export async function leaveMeeting(req: Request, res: Response) {
  try {
    const body = req.body as LeaveMeeting;
    await prisma.meetingParticipant.update({
      where: {
        meetingId_participantId: {
          meetingId: body.meetingId,
          participantId: body.userId,
        },
      },
      data: {
        leaveAt: new Date().toISOString(),
      },
    });
    return res.status(200).json({ msg: "Left meeting successfuflly." });
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error!" });
  }
}

type EndMeeting = {
  userId: string;
  meetingId: string;
};
export async function endMeeting(req: Request, res: Response) {
  try {
    const body = req.body as EndMeeting;
    const user = await prisma.meetingParticipant.findUnique({
      where: {
        meetingId_participantId: {
          meetingId: body.meetingId,
          participantId: body.userId,
        },
      },
      select: {
        role: true,
      },
    });
    if (user?.role !== "HOST") {
      return res
        .status(409)
        .json({ msg: "Unauthorized access. User is not the host." });
    }

    await prisma.meeting.update({
      where: {
        id: body.meetingId,
      },
      data: {
        endTime: new Date().toISOString(),
        meetingStatus: "END",
        isMeetingCodeInvalid: true,
        participants: {
          updateMany: {
            where: {
              meetingId: body.meetingId,
            },
            data: {
              leaveAt: new Date().toISOString(),
            },
          },
        },
      },
    });
    return res.status(200).json({ msg: "Left meeting successfuflly." });
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error!" });
  }
}

type GetParticipants = {
  meetingId: string;
};
export async function viewParticipants(req: Request, res: Response) {
  try {
    const body = req.body as GetParticipants;
    const meeting = await prisma.meeting.findUnique({
      where: {
        id: body.meetingId,
      },
      select: {
        participants: true,
      },
    });
    const host = meeting?.participants.filter((c) => c.role === "HOST");
    if (meeting?.participants.length === 0) {
      const invitedParticipants = meeting.participants.filter(
        (c) => c.role === "INVITED",
      );
      return res.status(200).json({
        msg: "No participants joined",
        host: host,
        invitees: invitedParticipants,
      });
    }

    const participants = meeting?.participants.filter((c) => c.role !== "HOST");
    return res.status(200).json({
      msg: "Fetched Successfully",
      host: host,
      participants: participants,
    });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
}
