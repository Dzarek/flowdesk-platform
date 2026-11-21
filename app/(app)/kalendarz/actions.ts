"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getFamilyContext } from "@/lib/auth/get-family-context";
import { RecurrenceFrequency } from "@prisma/client";

type CalendarEntryInput = {
  title: string;
  description?: string;
  date: string;
  time?: string | null;
  recurrenceFrequency?: RecurrenceFrequency | null;
};

type ActionResult = {
  success: boolean;
  message: string;
};

function isValidEntryId(entryId: unknown): entryId is string {
  return (
    typeof entryId === "string" &&
    entryId.trim().length > 0 &&
    entryId.length <= 30
  );
}
function handleActionError(action: string, error: unknown): ActionResult {
  console.error(`Błąd ${action}:`, error);

  return {
    success: false,
    message: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
  };
}

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

function validateInput(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      success: false as const,
      message: "Nieprawidłowe dane wydarzenia.",
    };
  }

  const data = input as Partial<CalendarEntryInput>;

  if (
    typeof data.title !== "string" ||
    typeof data.date !== "string" ||
    (data.description !== undefined && typeof data.description !== "string") ||
    (data.time !== undefined &&
      data.time !== null &&
      typeof data.time !== "string")
  ) {
    return {
      success: false as const,
      message: "Nieprawidłowe dane wydarzenia.",
    };
  }

  const title = data.title.trim();
  const description = data.description?.trim() ?? "";
  const date = parseDate(data.date);
  const time = data.time?.trim() || null;

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
  const allowedFrequencies = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"] as const;

  const recurrenceFrequency = data.recurrenceFrequency ?? null;

  if (
    recurrenceFrequency !== null &&
    !allowedFrequencies.includes(
      recurrenceFrequency as (typeof allowedFrequencies)[number],
    )
  ) {
    return {
      success: false as const,
      message: "Nieprawidłowa częstotliwość wydarzenia.",
    };
  }

  return {
    success: true as const,
    data: {
      title,
      description,
      date,
      time,
      recurrenceFrequency,
    },
  };
}

// Pobieranie wydarzeń rodziny
export async function getCalendarEntries() {
  try {
    const context = await getFamilyContext();

    if (!context.authenticated || !context.hasFamily) {
      return [];
    }

    const [events, tasks] = await Promise.all([
      prisma.calendarEntry.findMany({
        where: {
          familyId: context.familyId,
        },
        orderBy: [{ date: "asc" }, { time: "asc" }, { createdAt: "asc" }],
      }),

      prisma.task.findMany({
        where: {
          familyId: context.familyId,
          dueDate: {
            not: null,
          },
        },
        include: {
          assignee: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
      }),
    ]);

    const calendarEvents = events.map((entry) => ({
      id: entry.id,
      date: entry.date.toISOString().slice(0, 10),
      title: entry.title,
      description: entry.description,
      time: entry.time,
      createdAt: entry.createdAt.toISOString(),
      type: "EVENT" as const,
      recurrenceFrequency: entry.recurrenceFrequency,
    }));

    const calendarTasks = tasks.map((task) => ({
      id: `task-${task.id}`,
      date: task.dueDate!.toISOString().slice(0, 10),
      title: task.title,
      description: task.description,
      time: null,
      createdAt: task.createdAt.toISOString(),
      type: "TASK" as const,
      completed: task.completed,
      assigneeName: task.assignee?.name ?? null,
    }));

    return [...calendarEvents, ...calendarTasks].sort((a, b) => {
      const dateComparison = a.date.localeCompare(b.date);

      if (dateComparison !== 0) return dateComparison;

      if (a.time === null) return b.time === null ? 0 : -1;
      if (b.time === null) return 1;

      return a.time.localeCompare(b.time);
    });
  } catch (error) {
    console.error("Błąd pobierania kalendarza:", error);
    throw new Error("Nie udało się pobrać wydarzeń kalendarza.");
  }
}

// Dodawanie wydarzenia
export async function createCalendarEntry(
  input: CalendarEntryInput,
): Promise<ActionResult> {
  try {
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
  } catch (error) {
    return handleActionError("dodawania wydarzenia", error);
  }
}

// Edycja wydarzenia
export async function updateCalendarEntry(
  entryId: string,
  input: CalendarEntryInput,
): Promise<ActionResult> {
  try {
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
    if (!isValidEntryId(entryId)) {
      return {
        success: false,
        message: "Nieprawidłowy identyfikator wydarzenia.",
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
  } catch (error) {
    return handleActionError("edycja wydarzenia", error);
  }
}

// Usuwanie wydarzenia
export async function deleteCalendarEntry(
  entryId: string,
): Promise<ActionResult> {
  try {
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
    if (!isValidEntryId(entryId)) {
      return {
        success: false,
        message: "Nieprawidłowy identyfikator wydarzenia.",
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
  } catch (error) {
    return handleActionError("usuwanie wydarzenia", error);
  }
}
