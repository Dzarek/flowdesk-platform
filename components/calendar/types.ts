import type { FormEvent } from "react";
import type { CalendarEntry } from "@/lib/calendar/types";

export type CalendarFormValues = {
  title: string;
  description: string;
  time: string;
};

export type CalendarStatsProps = {
  monthEntriesCount: number;
  occupiedDaysCount: number;
  todayEntriesCount: number;
};

export type MonthCalendarProps = {
  year: number;
  month: number;
  selectedDate: string;
  todayKey: string;
  cells: (number | null)[];
  entriesByDate: Map<string, CalendarEntry[]>;
  onSelectDate: (date: string) => void;
  onChangeMonth: (amount: number) => void;
  onGoToToday: () => void;
};

export type SelectedDayPanelProps = {
  selectedDate: string;
  selectedEntries: CalendarEntry[];
  upcomingEntries: CalendarEntry[];
  onAdd: () => void;
  onEdit: (entry: CalendarEntry) => void;
  onDelete: (id: string) => void;
  onSelectUpcoming: (date: string) => void;
};

export type CalendarEntryModalProps = {
  isOpen: boolean;
  editingEntry: CalendarEntry | null;
  selectedDate: string;
  form: CalendarFormValues;
  error: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormChange: (field: keyof CalendarFormValues, value: string) => void;
};
