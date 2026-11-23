"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getFamilyContext } from "@/lib/auth/get-family-context";
import { ScheduleEntryType, FamilyMemberRole } from "@prisma/client";

const SCHEDULE_PATH = "/harmonogram";

type ScheduleEntryInput = {
  id?: string;
  memberId: string;
  title: string;
  description: string;
  type: ScheduleEntryType;
  date: string;
  startTime: string;
  endTime: string;
  repeatWeekly: boolean;
};

type ScheduleNoteInput = {
  entryId: string;
  date: string;
  text: string;
};

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function toDbDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

async function getAuthorizedContext() {
  const context = await getFamilyContext();

  if (!context.authenticated || !context.hasFamily) {
    return { error: "Brak dostępu do rodziny." } as const;
  }

  if (
    context.memberRole !== FamilyMemberRole.HEAD &&
    context.memberRole !== FamilyMemberRole.ADULT
  ) {
    return {
      error: "Nie masz uprawnień do zarządzania harmonogramem.",
    } as const;
  }

  return {
    familyId: context.familyId,
    userId: context.userId,
  } as const;
}

export async function getScheduleEntries() {
  const context = await getFamilyContext();

  if (!context.authenticated || !context.hasFamily) {
    return {
      success: false as const,
      error: "Brak dostępu.",
      entries: [],
      members: [],
    };
  }

  const [entries, members] = await Promise.all([
    prisma.scheduleEntry.findMany({
      where: { familyId: context.familyId },
      include: {
        notes: true,
      },
      orderBy: [{ startTime: "asc" }],
    }),
    prisma.familyMember.findMany({
      where: { familyId: context.familyId },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        color: true,
        role: true,
      },
      orderBy: { joinedAt: "asc" },
    }),
  ]);

  return {
    success: true as const,
    entries: entries.map((entry) => ({
      id: entry.id,
      memberId: entry.memberId,
      title: entry.title,
      description: entry.description,
      type: entry.type,
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
      repeatWeekly: entry.repeatWeekly,
      date: entry.date?.toISOString().slice(0, 10) ?? null,
      notes: entry.notes.map((note) => ({
        id: note.id,
        entryId: note.entryId,
        date: note.date.toISOString().slice(0, 10),
        text: note.text,
      })),
    })),
    members,
  };
}

export async function saveScheduleEntry(input: ScheduleEntryInput) {
  const context = await getAuthorizedContext();

  if ("error" in context) {
    return { success: false as const, error: context.error };
  }

  const title = input.title?.trim();
  const description = input.description?.trim() ?? "";

  if (!title || title.length > 120) {
    return {
      success: false as const,
      error: "Podaj nazwę (maksymalnie 120 znaków).",
    };
  }

  if (description.length > 2000) {
    return { success: false as const, error: "Opis jest za długi." };
  }

  if (!Object.values(ScheduleEntryType).includes(input.type)) {
    return {
      success: false as const,
      error: "Nieprawidłowy rodzaj wydarzenia.",
    };
  }

  if (
    !isValidDate(input.date) ||
    !isValidTime(input.startTime) ||
    !isValidTime(input.endTime) ||
    input.endTime <= input.startTime
  ) {
    return {
      success: false as const,
      error: "Sprawdź datę oraz godziny wydarzenia.",
    };
  }

  if (typeof input.repeatWeekly !== "boolean" || !input.memberId) {
    return { success: false as const, error: "Nieprawidłowe dane wydarzenia." };
  }

  const member = await prisma.familyMember.findFirst({
    where: {
      id: input.memberId,
      familyId: context.familyId,
    },
    select: { id: true },
  });

  if (!member) {
    return {
      success: false as const,
      error: "Nie znaleziono członka rodziny.",
    };
  }

  const selectedDate = toDbDate(input.date);
  const dayOfWeek = selectedDate.getUTCDay() || 7;

  const data = {
    title,
    description,
    type: input.type,
    startTime: input.startTime,
    endTime: input.endTime,
    repeatWeekly: input.repeatWeekly,
    dayOfWeek: input.repeatWeekly ? dayOfWeek : null,
    date: input.repeatWeekly ? null : selectedDate,
    memberId: input.memberId,
  };

  let entryId: string;

  if (input.id) {
    const existing = await prisma.scheduleEntry.findFirst({
      where: {
        id: input.id,
        familyId: context.familyId,
      },
      select: { id: true },
    });

    if (!existing) {
      return { success: false as const, error: "Nie znaleziono wydarzenia." };
    }

    await prisma.scheduleEntry.update({
      where: { id: existing.id },
      data,
    });

    entryId = existing.id;
  } else {
    const created = await prisma.scheduleEntry.create({
      data: {
        ...data,
        familyId: context.familyId,
        createdByUserId: context.userId,
      },
      select: { id: true },
    });

    entryId = created.id;
  }

  revalidatePath(SCHEDULE_PATH);

  return { success: true as const, entryId };
}

export async function deleteScheduleEntry(entryId: string) {
  const context = await getAuthorizedContext();

  if ("error" in context) {
    return { success: false as const, error: context.error };
  }

  if (!entryId) {
    return {
      success: false as const,
      error: "Brak identyfikatora wydarzenia.",
    };
  }

  const result = await prisma.scheduleEntry.deleteMany({
    where: {
      id: entryId,
      familyId: context.familyId,
    },
  });

  if (result.count === 0) {
    return { success: false as const, error: "Nie znaleziono wydarzenia." };
  }

  revalidatePath(SCHEDULE_PATH);

  return { success: true as const };
}

export async function saveScheduleNote(input: ScheduleNoteInput) {
  const context = await getAuthorizedContext();

  if ("error" in context) {
    return { success: false as const, error: context.error };
  }

  if (!input.entryId || !isValidDate(input.date)) {
    return { success: false as const, error: "Nieprawidłowe dane notatki." };
  }

  const text = input.text?.trim() ?? "";

  if (text.length > 2000) {
    return { success: false as const, error: "Notatka jest za długa." };
  }

  const entry = await prisma.scheduleEntry.findFirst({
    where: {
      id: input.entryId,
      familyId: context.familyId,
    },
    select: { id: true },
  });

  if (!entry) {
    return { success: false as const, error: "Nie znaleziono wydarzenia." };
  }

  const date = toDbDate(input.date);

  if (!text) {
    await prisma.scheduleNote.deleteMany({
      where: {
        entryId: entry.id,
        date,
      },
    });
  } else {
    await prisma.scheduleNote.upsert({
      where: {
        entryId_date: {
          entryId: entry.id,
          date,
        },
      },
      create: {
        entryId: entry.id,
        date,
        text,
      },
      update: { text },
    });
  }

  revalidatePath(SCHEDULE_PATH);

  return { success: true as const };
}
