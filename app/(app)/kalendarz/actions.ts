"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getFamilyContext } from "@/lib/auth/get-family-context";

type CalendarEntryInput = {
  title: string;
  description?: string;
  date: string;
  time?: string | null;
};

type ActionResult = {
  success: boolean;
  message: string;
};

function isAdult(role: string) {
  return role === "HEAD" || role === "ADULT";
}

function parseDate(date: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    return null;
  }

  return parsed;
}

function validateInput(input: CalendarEntryInput) {
  const title = input.title?.trim();
  const description = input.description?.trim() ?? "";
  const date = parseDate(input.date);
  const time = input.time?.trim() || null;

  if (!title) {
    return {
      success: false as const,
      message: "Podaj nazwę wydarzenia.",
    };
  }

  if (title.length > 120) {
    return {
      success: false as const,
      message: "Nazwa wydarzenia może mieć maksymalnie 120 znaków.",
    };
  }

  if (description.length > 2000) {
    return {
      success: false as const,
      message: "Opis może mieć maksymalnie 2000 znaków.",
    };
  }

  if (!date) {
    return {
      success: false as const,
      message: "Podaj prawidłową datę wydarzenia.",
    };
  }

  if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return {
      success: false as const,
      message: "Podaj prawidłową godzinę w formacie HH:mm.",
    };
  }

  return {
    success: true as const,
    data: {
      title,
      description,
      date,
      time,
    },
  };
}

// Pobieranie wydarzeń rodziny
export async function getCalendarEntries() {
  const context = await getFamilyContext();

  if (!context.authenticated || !context.hasFamily) {
    return [];
  }

  const entries = await prisma.calendarEntry.findMany({
    where: {
      familyId: context.familyId,
    },
    orderBy: [{ date: "asc" }, { time: "asc" }, { createdAt: "asc" }],
  });

  return entries.map((entry) => ({
    id: entry.id,
    date: entry.date.toISOString().slice(0, 10),
    title: entry.title,
    description: entry.description,
    time: entry.time,
    createdAt: entry.createdAt.toISOString(),
  }));
}

// Dodawanie wydarzenia
export async function createCalendarEntry(
  input: CalendarEntryInput,
): Promise<ActionResult> {
  const context = await getFamilyContext();

  if (!context.authenticated || !context.hasFamily) {
    return {
      success: false,
      message: "Brak dostępu.",
    };
  }

  if (!isAdult(context.memberRole)) {
    return {
      success: false,
      message: "Nie masz uprawnień do dodawania wydarzeń.",
    };
  }

  const validation = validateInput(input);

  if (!validation.success) {
    return {
      success: false,
      message: validation.message,
    };
  }

  await prisma.calendarEntry.create({
    data: {
      ...validation.data,
      familyId: context.familyId,
      createdByUserId: context.userId,
    },
  });

  revalidatePath("/kalendarz");

  return {
    success: true,
    message: "Dodano wydarzenie.",
  };
}

// Edycja wydarzenia
export async function updateCalendarEntry(
  entryId: string,
  input: CalendarEntryInput,
): Promise<ActionResult> {
  const context = await getFamilyContext();

  if (!context.authenticated || !context.hasFamily) {
    return {
      success: false,
      message: "Brak dostępu.",
    };
  }

  if (!isAdult(context.memberRole)) {
    return {
      success: false,
      message: "Nie masz uprawnień do edycji wydarzeń.",
    };
  }

  const validation = validateInput(input);

  if (!validation.success) {
    return {
      success: false,
      message: validation.message,
    };
  }

  const result = await prisma.calendarEntry.updateMany({
    where: {
      id: entryId,
      familyId: context.familyId,
    },
    data: validation.data,
  });

  if (result.count === 0) {
    return {
      success: false,
      message: "Nie znaleziono wydarzenia.",
    };
  }

  revalidatePath("/kalendarz");

  return {
    success: true,
    message: "Zaktualizowano wydarzenie.",
  };
}

// Usuwanie wydarzenia
export async function deleteCalendarEntry(
  entryId: string,
): Promise<ActionResult> {
  const context = await getFamilyContext();

  if (!context.authenticated || !context.hasFamily) {
    return {
      success: false,
      message: "Brak dostępu.",
    };
  }

  if (!isAdult(context.memberRole)) {
    return {
      success: false,
      message: "Nie masz uprawnień do usuwania wydarzeń.",
    };
  }

  const result = await prisma.calendarEntry.deleteMany({
    where: {
      id: entryId,
      familyId: context.familyId,
    },
  });

  if (result.count === 0) {
    return {
      success: false,
      message: "Nie znaleziono wydarzenia.",
    };
  }

  revalidatePath("/kalendarz");

  return {
    success: true,
    message: "Usunięto wydarzenie.",
  };
}
