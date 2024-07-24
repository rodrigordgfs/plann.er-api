/*
  Warnings:

  - You are about to drop the column `userId` on the `trip` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `trip` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "trip" DROP CONSTRAINT "trip_userId_fkey";

-- AlterTable
ALTER TABLE "trip" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "trip" ADD CONSTRAINT "trip_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
