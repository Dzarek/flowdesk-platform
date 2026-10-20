import type { ScheduleEntry } from "./types";

const olaLessons: Record<number, { title: string; start: string }[]> = {
  1: [
    { title: "Język polski", start: "08:00" },
    { title: "Matematyka", start: "08:55" },
    { title: "Język angielski", start: "09:50" },
    { title: "Przyroda", start: "10:45" },
    { title: "Plastyka", start: "11:40" },
    { title: "WF", start: "12:35" },
  ],
  2: [
    { title: "Matematyka", start: "08:00" },
    { title: "Język polski", start: "08:55" },
    { title: "Historia", start: "09:50" },
    { title: "Język angielski", start: "10:45" },
    { title: "Muzyka", start: "11:40" },
  ],
  3: [
    { title: "Język polski", start: "08:00" },
    { title: "Informatyka", start: "08:55" },
    { title: "Matematyka", start: "09:50" },
    { title: "Przyroda", start: "10:45" },
    { title: "WF", start: "11:40" },
  ],
  4: [
    { title: "Język angielski", start: "08:00" },
    { title: "Matematyka", start: "08:55" },
    { title: "Język polski", start: "09:50" },
    { title: "Historia", start: "10:45" },
    { title: "Technika", start: "11:40" },
  ],
  5: [
    { title: "Matematyka", start: "08:00" },
    { title: "Język polski", start: "08:55" },
    { title: "Przyroda", start: "09:50" },
    { title: "Język angielski", start: "10:45" },
    { title: "WF", start: "11:40" },
  ],
};

const majaLessons: Record<number, { title: string; start: string }[]> = {
  1: [
    { title: "Edukacja polonistyczna", start: "08:30" },
    { title: "Matematyka", start: "09:25" },
    { title: "Język angielski", start: "10:20" },
    { title: "Edukacja przyrodnicza", start: "11:15" },
  ],
  2: [
    { title: "Matematyka", start: "08:30" },
    { title: "Edukacja polonistyczna", start: "09:25" },
    { title: "Plastyka", start: "10:20" },
    { title: "Język angielski", start: "11:15" },
  ],
  3: [
    { title: "Edukacja polonistyczna", start: "08:30" },
    { title: "Matematyka", start: "09:25" },
    { title: "Edukacja przyrodnicza", start: "10:20" },
    { title: "Muzyka", start: "11:15" },
  ],
  4: [
    { title: "Matematyka", start: "08:30" },
    { title: "Język angielski", start: "09:25" },
    { title: "Edukacja polonistyczna", start: "10:20" },
    { title: "WF", start: "11:15" },
  ],
  5: [
    { title: "Edukacja polonistyczna", start: "08:30" },
    { title: "Matematyka", start: "09:25" },
    { title: "Plastyka", start: "10:20" },
    { title: "Edukacja przyrodnicza", start: "11:15" },
  ],
};

function createSchoolEntries(
  memberId: string,
  lessons: Record<number, { title: string; start: string }[]>,
  prefix: string,
): ScheduleEntry[] {
  return Object.entries(lessons).flatMap(([day, dayLessons]) =>
    dayLessons.map((lesson, index) => {
      const [hours, mins] = lesson.start.split(":").map(Number);
      const endMinutes = hours * 60 + mins + 45;

      return {
        id: `${prefix}-${day}-${index + 1}`,
        memberId,
        title: lesson.title,
        description: "Lekcja szkolna",
        type: "SCHOOL" as const,
        dayOfWeek: Number(day),
        startTime: lesson.start,
        endTime: `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(
          endMinutes % 60,
        ).padStart(2, "0")}`,
        repeatWeekly: true,
        date: null,
      };
    }),
  );
}

const childrenSchedule: ScheduleEntry[] = [
  ...createSchoolEntries("member-3", olaLessons, "ola"),
  ...createSchoolEntries("member-4", majaLessons, "michał"),
  {
    id: "schedule-ola-english",
    memberId: "member-3",
    title: "Angielski dodatkowy",
    description: "Dodatkowe zajęcia z angielskiego",
    type: "ACTIVITY",
    dayOfWeek: 2,
    startTime: "16:00",
    endTime: "17:00",
    repeatWeekly: true,
    date: null,
  },
  {
    id: "schedule-ola-swimming",
    memberId: "member-3",
    title: "Basen",
    description: "Zajęcia pływackie",
    type: "ACTIVITY",
    dayOfWeek: 4,
    startTime: "17:00",
    endTime: "18:00",
    repeatWeekly: true,
    date: null,
  },
  {
    id: "schedule-maja-dance",
    memberId: "member-4",
    title: "Taniec",
    description: "Zajęcia taneczne",
    type: "ACTIVITY",
    dayOfWeek: 3,
    startTime: "16:00",
    endTime: "17:00",
    repeatWeekly: true,
    date: null,
  },
  {
    id: "schedule-maja-music",
    memberId: "member-4",
    title: "Muzyka",
    description: "Zajęcia muzyczne",
    type: "ACTIVITY",
    dayOfWeek: 5,
    startTime: "15:00",
    endTime: "16:00",
    repeatWeekly: true,
    date: null,
  },
];

export const mockScheduleEntries: ScheduleEntry[] = [
  // Jarek — praca i trening
  {
    id: "schedule-1",
    memberId: "member-1",
    title: "Praca",
    description: "Dzień pracy",
    type: "WORK",
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "16:00",
    repeatWeekly: true,
    date: null,
  },
  {
    id: "schedule-2",
    memberId: "member-1",
    title: "Praca",
    description: "Dzień pracy",
    type: "WORK",
    dayOfWeek: 2,
    startTime: "08:00",
    endTime: "16:00",
    repeatWeekly: true,
    date: null,
  },
  {
    id: "schedule-3",
    memberId: "member-1",
    title: "Praca",
    description: "Dzień pracy",
    type: "WORK",
    dayOfWeek: 3,
    startTime: "08:00",
    endTime: "16:00",
    repeatWeekly: true,
    date: null,
  },
  {
    id: "schedule-4",
    memberId: "member-1",
    title: "Praca",
    description: "Dzień pracy",
    type: "WORK",
    dayOfWeek: 4,
    startTime: "08:00",
    endTime: "16:00",
    repeatWeekly: true,
    date: null,
  },
  {
    id: "schedule-5",
    memberId: "member-1",
    title: "Praca",
    description: "Dzień pracy",
    type: "WORK",
    dayOfWeek: 5,
    startTime: "08:00",
    endTime: "16:00",
    repeatWeekly: true,
    date: null,
  },
  {
    id: "schedule-6",
    memberId: "member-1",
    title: "Trening na siłowni",
    description: "Trening siłowy",
    type: "ACTIVITY",
    dayOfWeek: 3,
    startTime: "18:00",
    endTime: "19:00",
    repeatWeekly: true,
    date: null,
  },

  // Anna — praca i joga
  ...[1, 2, 3, 4, 5].map(
    (day): ScheduleEntry => ({
      id: `schedule-anna-work-${day}`,
      memberId: "member-2",
      title: "Praca",
      description: "Dzień pracy",
      type: "WORK",
      dayOfWeek: day,
      startTime: "09:00",
      endTime: "17:00",
      repeatWeekly: true,
      date: null,
    }),
  ),
  ...[2, 4].map(
    (day): ScheduleEntry => ({
      id: `schedule-anna-yoga-${day}`,
      memberId: "member-2",
      title: "Joga",
      description: "Zajęcia jogi",
      type: "ACTIVITY",
      dayOfWeek: day,
      startTime: "18:00",
      endTime: "19:00",
      repeatWeekly: true,
      date: null,
    }),
  ),

  ...childrenSchedule,
];
