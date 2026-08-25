/*
  Warnings:

  - Added the required column `joinStatus` to the `MeetingParticipant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ParticipantJoinStatus" AS ENUM ('PENDING', 'JOINED', 'DECLINED');

-- AlterTable
ALTER TABLE "MeetingParticipant" ADD COLUMN     "joinStatus" "ParticipantJoinStatus" NOT NULL;
