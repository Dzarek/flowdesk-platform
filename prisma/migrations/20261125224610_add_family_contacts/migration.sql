/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `FamilyMember` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ContactCategory" AS ENUM ('HEALTH', 'AUTOMOTIVE', 'HOME', 'SCHOOL', 'PETS', 'OTHER');

-- CreateTable
CREATE TABLE "FamilyContact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ContactCategory" NOT NULL DEFAULT 'OTHER',
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "familyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FamilyContact_familyId_idx" ON "FamilyContact"("familyId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyMember_email_key" ON "FamilyMember"("email");

-- AddForeignKey
ALTER TABLE "FamilyContact" ADD CONSTRAINT "FamilyContact_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
