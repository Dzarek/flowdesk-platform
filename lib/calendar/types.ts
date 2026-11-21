export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export type CalendarEntry = {
  id: string;
  date: string;
  title: string;
  description: string;
  time: string | null;
  createdAt: string;

  type: "EVENT" | "TASK";

  recurrenceFrequency?: RecurrenceFrequency | null;
  recurrenceStartDate?: string;

  completed?: boolean;
  assigneeName?: string | null;
};
