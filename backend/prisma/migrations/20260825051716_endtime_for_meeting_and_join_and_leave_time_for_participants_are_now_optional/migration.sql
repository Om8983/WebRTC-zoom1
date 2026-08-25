-- AlterTable
ALTER TABLE "Meeting" ALTER COLUMN "endTime" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MeetingParticipant" ALTER COLUMN "joinedAt" DROP NOT NULL,
ALTER COLUMN "leaveAt" DROP NOT NULL;
