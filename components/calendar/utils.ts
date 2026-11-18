export const WEEKDAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];

export const MONTHS = [
  "styczeń",
  "luty",
  "marzec",
  "kwiecień",
  "maj",
  "czerwiec",
  "lipiec",
  "sierpień",
  "wrzesień",
  "październik",
  "listopad",
  "grudzień",
];

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatFullDate(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseDateKey(value));
}

export function getMonthDays(year: number, month: number) {
  const count = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;

  return {
    cells: Array.from({ length: offset + count }, (_, index) =>
      index < offset ? null : index - offset + 1,
    ),
  };
}

export function formatTime(time: string | null) {
  return time || "Cały dzień";
}

export function formatEntryCount(count: number) {
  if (count === 1) return "1 wpis";
  if (count >= 2 && count <= 4) return `${count} wpisy`;
  return `${count} wpisów`;
}
