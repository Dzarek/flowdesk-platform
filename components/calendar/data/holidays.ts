export type Holiday = {
  name: string;
  isPublicHoliday: boolean;
};

function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function dateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${month}-${day}`;
}

export function getHolidays(year: number): Record<string, Holiday> {
  const holidays: Record<string, Holiday> = {
    "01-01": { name: "Nowy Rok", isPublicHoliday: true },
    "01-06": { name: "Trzech Króli", isPublicHoliday: true },
    "05-01": { name: "Święto Pracy", isPublicHoliday: true },
    "05-03": { name: "Święto Konstytucji 3 Maja", isPublicHoliday: true },
    "08-15": { name: "Wniebowzięcie NMP", isPublicHoliday: true },
    "11-01": { name: "Wszystkich Świętych", isPublicHoliday: true },
    "11-11": { name: "Święto Niepodległości", isPublicHoliday: true },
    "12-24": { name: "Wigilia", isPublicHoliday: true },
    "12-25": { name: "Boże Narodzenie", isPublicHoliday: true },
    "12-26": { name: "Drugi dzień świąt", isPublicHoliday: true },
  };

  const easter = getEasterDate(year);

  const easterMonday = addDays(easter, 1);
  const pentecost = addDays(easter, 49);
  const corpusChristi = addDays(easter, 60);

  holidays[dateKey(easter)] = {
    name: "Wielkanoc",
    isPublicHoliday: true,
  };

  holidays[dateKey(easterMonday)] = {
    name: "Poniedziałek Wielkanocny",
    isPublicHoliday: true,
  };

  holidays[dateKey(pentecost)] = {
    name: "Zielone Świątki",
    isPublicHoliday: true,
  };

  holidays[dateKey(corpusChristi)] = {
    name: "Boże Ciało",
    isPublicHoliday: true,
  };

  return holidays;
}
