/*
  Warnings:

  - You are about to drop the column `tripId` on the `activities` table. All the data in the column will be lost.
  - Added the required column `trip_id` to the `activities` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_tripId_fkey";

-- AlterTable
ALTER TABLE "activities" DROP COLUMN "tripId",
ADD COLUMN     "trip_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
