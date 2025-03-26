/*
  Warnings:

  - You are about to drop the column `endDate` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Booking` table. All the data in the column will be lost.
  - The `status` column on the `Booking` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `chatId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `read` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `receiverId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `bookingId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Chat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ParticipantsToChats` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `date` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookingId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "_ParticipantsToChats" DROP CONSTRAINT "_ParticipantsToChats_A_fkey";

-- DropForeignKey
ALTER TABLE "_ParticipantsToChats" DROP CONSTRAINT "_ParticipantsToChats_B_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "chatId",
DROP COLUMN "read",
DROP COLUMN "receiverId",
ADD COLUMN     "bookingId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "address",
DROP COLUMN "phoneNumber",
ADD COLUMN     "expertise" TEXT[],
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "bookingId";

-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "included" TEXT[],
ALTER COLUMN "imageUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "password" SET NOT NULL;

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Chat";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "VerificationToken";

-- DropTable
DROP TABLE "_ParticipantsToChats";

-- CreateIndex
CREATE INDEX "Message_bookingId_idx" ON "Message"("bookingId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
