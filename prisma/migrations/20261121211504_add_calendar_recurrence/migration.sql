-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "CalendarEntry" ADD COLUMN     "recurrenceFrequency" "RecurrenceFrequency";
