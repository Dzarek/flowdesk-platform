import type { CalendarEntry } from "./types";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function parseUTCDate(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function formatDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function createMonthlyDate(startDate: Date, monthOffset: number): string {
  const targetMonth = new Date(
    Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth() + monthOffset,
      1,
    ),
  );

  const year = targetMonth.getUTCFullYear();
  const month = targetMonth.getUTCMonth();

  const day = Math.min(startDate.getUTCDate(), getDaysInMonth(year, month));

  return formatDateKey(new Date(Date.UTC(year, month, day)));
}

function createYearlyDate(startDate: Date, yearOffset: number): string {
  const year = startDate.getUTCFullYear() + yearOffset;
  const month = startDate.getUTCMonth();

  const day = Math.min(startDate.getUTCDate(), getDaysInMonth(year, month));

  return formatDateKey(new Date(Date.UTC(year, month, day)));
}

export function expandCalendarEntries(
  entries: CalendarEntry[],
  rangeStart: string,
  rangeEnd: string,
): CalendarEntry[] {
  const result: CalendarEntry[] = [];

  const startRange = parseUTCDate(rangeStart);
  const endRange = parseUTCDate(rangeEnd);

  for (const entry of entries) {
    const originalDate = parseUTCDate(entry.date);

    // Zadania i zwykłe wydarzenia jednorazowe.
    if (!entry.recurrenceFrequency) {
      if (entry.date >= rangeStart && entry.date <= rangeEnd) {
        result.push(entry);
      }

      continue;
    }

    if (originalDate > endRange) continue;

    const frequency = entry.recurrenceFrequency;

    function addOccurrence(dateKey: string) {
      if (dateKey < rangeStart || dateKey > rangeEnd) return;

      result.push({
        ...entry,
        date: dateKey,
        recurrenceStartDate: entry.date,
      });
    }

    if (frequency === "DAILY" || frequency === "WEEKLY") {
      const interval = frequency === "DAILY" ? 1 : 7;

      const difference = Math.max(
        0,
        Math.ceil((startRange.getTime() - originalDate.getTime()) / DAY_IN_MS),
      );

      const firstOccurrence = Math.ceil(difference / interval) * interval;

      for (let offset = firstOccurrence; ; offset += interval) {
        const occurrence = new Date(
          originalDate.getTime() + offset * DAY_IN_MS,
        );

        const dateKey = formatDateKey(occurrence);

        if (dateKey > rangeEnd) break;

        addOccurrence(dateKey);
      }
    }

    if (frequency === "MONTHLY") {
      const monthDifference =
        (startRange.getUTCFullYear() - originalDate.getUTCFullYear()) * 12 +
        startRange.getUTCMonth() -
        originalDate.getUTCMonth();

      const firstMonth = Math.max(0, monthDifference);

      for (let offset = firstMonth; ; offset++) {
        const dateKey = createMonthlyDate(originalDate, offset);

        if (dateKey > rangeEnd) break;

        addOccurrence(dateKey);
      }
    }

    if (frequency === "YEARLY") {
      const yearDifference =
        startRange.getUTCFullYear() - originalDate.getUTCFullYear();

      const firstYear = Math.max(0, yearDifference);

      for (let offset = firstYear; ; offset++) {
        const dateKey = createYearlyDate(originalDate, offset);

        if (dateKey > rangeEnd) break;

        addOccurrence(dateKey);
      }
    }
  }

  return result.sort((a, b) => {
    const dateComparison = a.date.localeCompare(b.date);

    if (dateComparison !== 0) return dateComparison;

    if (a.time === null) return b.time === null ? 0 : -1;
    if (b.time === null) return 1;

    return a.time.localeCompare(b.time);
  });
}
