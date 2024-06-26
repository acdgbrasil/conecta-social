/*
  Warnings:

  - Added the required column `situation` to the `ReferencePerson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `ReferencePerson` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReferencePerson" ADD COLUMN     "situation" TEXT NOT NULL,
ADD COLUMN     "state" BOOLEAN NOT NULL;

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "crm" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
