/*
  Warnings:

  - The values [SCHEDULED] on the enum `MeetingStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `hostId` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Meeting` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[meetingId,participantId]` on the table `MeetingParticipant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `role` to the `MeetingParticipant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('HOST', 'PARTICIPANT', 'INVITED');

-- AlterEnum
BEGIN;
CREATE TYPE "MeetingStatus_new" AS ENUM ('ACTIVE', 'END');
ALTER TABLE "Meeting" ALTER COLUMN "meetingStatus" TYPE "MeetingStatus_new" USING ("meetingStatus"::text::"MeetingStatus_new");
ALTER TYPE "MeetingStatus" RENAME TO "MeetingStatus_old";
ALTER TYPE "MeetingStatus_new" RENAME TO "MeetingStatus";
DROP TYPE "public"."MeetingStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_hostId_fkey";

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_userId_fkey";

-- DropIndex
DROP INDEX "Meeting_id_userId_key";

-- DropIndex
DROP INDEX "MeetingParticipant_meetingId_key";

-- AlterTable
ALTER TABLE "Meeting" DROP COLUMN "hostId",
DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "MeetingParticipant" ADD COLUMN     "role" "Role" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MeetingParticipant_meetingId_participantId_key" ON "MeetingParticipant"("meetingId", "participantId");

-- AddForeignKey
ALTER TABLE "MeetingParticipant" ADD CONSTRAINT "MeetingParticipant_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
