import type { CalendarEntry } from "./types";

export const mockCalendarEntries: CalendarEntry[] = [
  {
    id: "event-1",
    date: "2026-10-20",
    title: "Zakupy na weekend",
    description: "Kupić produkty z listy i sprawdzić zapasy w domu.",
    time: "17:00",
    createdAt: "2026-10-15",
  },
  {
    id: "event-2",
    date: "2026-10-20",
    title: "Wizyta u lekarza",
    description: "Zabrać dokumenty i wyniki badań.",
    time: "18:30",
    createdAt: "2026-10-16",
  },
  {
    id: "event-3",
    date: "2026-10-22",
    title: "Spotkanie rodzinne",
    description: "Ustalić plany na weekend.",
    time: null,
    createdAt: "2026-10-17",
  },
  {
    id: "event-4",
    date: "2026-10-24",
    title: "Wycieczka",
    description: "Przygotować przekąski i sprawdzić pogodę.",
    time: "09:00",
    createdAt: "2026-10-18",
  },
  {
    id: "event-5",
    date: "2026-10-24",
    title: "Sprawdzić samochód",
    description: "Paliwo, ciśnienie w oponach i płyn do spryskiwaczy.",
    time: null,
    createdAt: "2026-10-18",
  },
];
