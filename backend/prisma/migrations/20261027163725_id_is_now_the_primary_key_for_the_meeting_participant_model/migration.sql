/*
  Warnings:

  - Made the column `id` on table `MeetingParticipant` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "MeetingParticipant" ALTER COLUMN "id" SET NOT NULL,
ADD CONSTRAINT "MeetingParticipant_pkey" PRIMARY KEY ("id");
