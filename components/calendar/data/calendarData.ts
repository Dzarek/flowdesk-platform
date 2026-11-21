import { nameDays } from "./nameDays";
import { getHolidays } from "./holidays";
import { specialDays } from "./specialDays";

export type CalendarDayInfo = {
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName: string | null;
  specialDayName: string | null;
  nameDays: string | null;
};

const holidaysCache = new Map<number, ReturnType<typeof getHolidays>>();

export function getCalendarDayInfo(dateKey: string): CalendarDayInfo {
  const [year, month, day] = dateKey.split("-").map(Number);

  const date = new Date(year, month - 1, day);
  const monthDay = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  let holidays = holidaysCache.get(year);

  if (!holidays) {
    holidays = getHolidays(year);
    holidaysCache.set(year, holidays);
  }

  const holiday = holidays[monthDay];

  return {
    isWeekend: date.getDay() === 0 || date.getDay() === 6,
    isHoliday: Boolean(holiday),
    holidayName: holiday?.name ?? null,
    specialDayName: specialDays[monthDay] ?? null,
    nameDays: nameDays[monthDay] ?? null,
  };
}
