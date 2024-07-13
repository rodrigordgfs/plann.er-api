/*
  Warnings:

  - You are about to drop the column `tripId` on the `links` table. All the data in the column will be lost.
  - Added the required column `trip_id` to the `links` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "links" DROP CONSTRAINT "links_tripId_fkey";

-- AlterTable
ALTER TABLE "links" DROP COLUMN "tripId",
ADD COLUMN     "trip_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "links" ADD CONSTRAINT "links_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
