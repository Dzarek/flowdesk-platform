export type ScheduleEntryType = "WORK" | "SCHOOL" | "ACTIVITY" | "OTHER";

export type ScheduleEntry = {
  id: string;
  memberId: string;
  title: string;
  description: string;
  type: ScheduleEntryType;
  dayOfWeek: number; // 1 = poniedziałek, 7 = niedziela
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  repeatWeekly: boolean;
  date: string | null; // data wydarzenia jednorazowego: YYYY-MM-DD
};

export type ScheduleNote = {
  id: string;
  entryId: string;
  date: string; // konkretna data lekcji: YYYY-MM-DD
  text: string;
};
