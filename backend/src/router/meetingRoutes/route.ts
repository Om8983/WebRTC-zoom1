import { Router } from "express";
import { Request, Response } from "express";
import { prisma } from "../../prismaInstance";
import { ParticipantJoinStatus } from "../../generated/prisma/enums";

const router = Router();

type Meetdata = {
  creatorId: string;
  meetingStatus: "ACTIVE" | "END";
  meetingCode: string;
  invitees: Participant[];
};
type Participant = {
  role: "HOST" | "PARTICIPANT" | "INVITED";
  participantId: string;
  joinedAt: string;
  leaveAt: string;
};

// a user can join only one meeting at a time since only one meeting id is tied to each participant. If you want to change this constraint change single meetingId to an array of ids
router.post("/createMeeting", async (req: Request, res: Response) => {
  try {
    const meetData = req.body as Meetdata;
    // a user can create multiple meetings and also can joing multiple meets on the same time
    // we create invitees only when the join the meet. Creting them initially would just create stale data for the invitees. ( case in which user is invited but never joined. The data for that user i.e joined and leave reamains null but entry for the user is made)
    // well still i'm gonna create it to know which users were invited and to see how many of 'em actually joined the mee
    await prisma.$transaction(async (txn) => {
      const meetingData = await txn.meeting.create({
        data: {
          meetingCode: meetData.meetingCode,
          meetingStatus: meetData.meetingStatus,
        },
        select: {
          id: true,
          meetingCode: true,
          meetingStatus: true,
        },
      });

      if (!meetingData) return false;

      await txn.meeting.update({
        where: {
          id: meetingData.id,
        },
        data: {
          participants: {
            create: [
              {
                role: "HOST",
                participantId: meetData.creatorId,
                joinStatus: "JOINED" as ParticipantJoinStatus,
              },
              ...meetData.invitees.map((inviteeId) => ({
                role: inviteeId.role,
                participantId: inviteeId.participantId,
                joinStatus: "PENDING" as ParticipantJoinStatus,
              })),
            ],
          },
        },
      });
    });
    return res.status(200).json({ msg: "Meeting Created Successfully." });
  } catch (error) {
    return res.status(500).json({ msg: "Internal server Error!" });
  }
});

type JoinLeaveMeeting = {
  meetingId: string;
  meetingCode: string;
  userId: string;
};
router.post("/joinMeeting", async (req: Request, res: Response) => {
  try {
    const body = req.body as JoinLeaveMeeting;
    // even before joining the meeting first we need to check that if the meeting exist and the meeting code is valid.
    // if the meeting doesn't exist and is invalid then return 404 "no meeting found"

    const meetingExists = await prisma.meeting.findUnique({
      where: {
        id: body.meetingId,
        meetingCode: body.meetingCode,
      },
      select: {
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
          meetingId: body.meetingId,
          participantId: body.userId,
        },
      },
      data: {
        joinedAt: new Date().toISOString(),
      },
    });
    return res.status(200).json({ msg: "Joined meeting successfully." });
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error!" });
  }
});

router.post("/leaveMeeting", async (req: Request, res: Response) => {
  try {
    const body = req.body as JoinLeaveMeeting;

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
});

type EndMeeting = {
  userId: string;
  meetingId: string;
};
router.post("/endMeeting", async (req: Request, res: Response) => {
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
});

type GetParticipants = {
  meetingId: string;
};
router.get("/viewParticipants", async (req: Request, res: Response) => {
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
});
