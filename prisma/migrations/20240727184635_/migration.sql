/*
  Warnings:

  - You are about to drop the column `imagem_url` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "imagem_url",
ADD COLUMN     "image_url" TEXT;
