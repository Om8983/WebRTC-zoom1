/*
  Warnings:

  - The primary key for the `MeetingParticipant` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "MeetingParticipant" DROP CONSTRAINT "MeetingParticipant_pkey",
ALTER COLUMN "id" DROP NOT NULL;
