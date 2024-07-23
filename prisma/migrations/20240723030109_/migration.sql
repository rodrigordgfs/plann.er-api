/*
  Warnings:

  - You are about to drop the column `email` on the `participants` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `participants` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `participants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "participants" DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
