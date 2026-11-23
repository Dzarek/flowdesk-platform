-- CreateEnum
CREATE TYPE "ScheduleEntryType" AS ENUM ('WORK', 'SCHOOL', 'ACTIVITY', 'OTHER');

-- CreateTable
CREATE TABLE "ScheduleEntry" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" "ScheduleEntryType" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "repeatWeekly" BOOLEAN NOT NULL DEFAULT false,
    "dayOfWeek" INTEGER,
    "date" DATE,
    "familyId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleNote" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduleEntry_familyId_memberId_idx" ON "ScheduleEntry"("familyId", "memberId");

-- CreateIndex
CREATE INDEX "ScheduleEntry_familyId_dayOfWeek_idx" ON "ScheduleEntry"("familyId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "ScheduleEntry_familyId_date_idx" ON "ScheduleEntry"("familyId", "date");

-- CreateIndex
CREATE INDEX "ScheduleEntry_memberId_idx" ON "ScheduleEntry"("memberId");

-- CreateIndex
CREATE INDEX "ScheduleEntry_createdByUserId_idx" ON "ScheduleEntry"("createdByUserId");

-- CreateIndex
CREATE INDEX "ScheduleNote_date_idx" ON "ScheduleNote"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleNote_entryId_date_key" ON "ScheduleNote"("entryId", "date");

-- AddForeignKey
ALTER TABLE "ScheduleEntry" ADD CONSTRAINT "ScheduleEntry_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleEntry" ADD CONSTRAINT "ScheduleEntry_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "FamilyMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleEntry" ADD CONSTRAINT "ScheduleEntry_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleNote" ADD CONSTRAINT "ScheduleNote_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "ScheduleEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
