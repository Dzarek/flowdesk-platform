export type CalendarEntry = {
  id: string;
  date: string;
  title: string;
  description: string;
  time: string | null;
  createdAt: string;

  // Rozróżnienie wydarzeń i zadań
  type: "EVENT" | "TASK";

  // Dodatkowe dane dla zadań
  completed?: boolean;
  assigneeName?: string | null;
};
