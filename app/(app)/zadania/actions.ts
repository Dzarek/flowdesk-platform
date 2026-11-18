"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getFamilyContext } from "@/lib/auth/get-family-context";

type TaskInput = {
  title: string;
  description?: string;
  dueDate?: string | null;
  assigneeId?: string | null;
};

type ActionResult = {
  success: boolean;
  message: string;
};

function parseDate(date: string | null | undefined): Date | null {
  if (!date) return null;

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

function isAdult(role: string) {
  return role === "HEAD" || role === "ADULT";
}

// Pobieranie zadań rodziny
export async function getTasks() {
  const context = await getFamilyContext();

  if (!context.authenticated || !context.hasFamily) {
    return [];
  }

  const tasks = await prisma.task.findMany({
    where: {
      familyId: context.familyId,
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          color: true,
          imageUrl: true,
        },
      },
    },
    orderBy: [{ completed: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  });

  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    dueDate: task.dueDate?.toISOString().slice(0, 10) ?? null,
    assigneeId: task.assigneeId,
    assignee: task.assignee,
    completed: task.completed,
    createdAt: task.createdAt.toISOString(),
  }));
}

// Dodawanie zadania
export async function createTask(input: TaskInput): Promise<ActionResult> {
  const context = await getFamilyContext();

  if (!context.authenticated || !context.hasFamily) {
    return { success: false, message: "Brak dostępu." };
  }

  if (!isAdult(context.memberRole)) {
    return {
      success: false,
      message: "Nie masz uprawnień do dodawania zadań.",
    };
  }

  const title = input.title?.trim();
  const description = input.description?.trim();

  if (!title) {
    return { success: false, message: "Podaj nazwę zadania." };
  }

  if (title.length > 120) {
    return {
      success: false,
      message: "Nazwa zadania może mieć maksymalnie 120 znaków.",
    };
  }
  if (description && description.length > 2000) {
    return {
      success: false,
      message: "Opis zadania może mieć maksymalnie 2000 znaków.",
    };
  }

  const dueDate = input.dueDate ? parseDate(input.dueDate) : null;

  if (input.dueDate && !dueDate) {
    return { success: false, message: "Nieprawidłowa data." };
  }

  const assigneeId = input.assigneeId || null;

  if (assigneeId) {
    const member = await prisma.familyMember.findFirst({
      where: {
        id: assigneeId,
        familyId: context.familyId,
      },
      select: { id: true },
    });

    if (!member) {
      return {
        success: false,
        message: "Wybrany członek nie należy do Twojej rodziny.",
      };
    }
  }

  await prisma.task.create({
    data: {
      title,
      description: input.description?.trim() ?? "",
      dueDate,
      familyId: context.familyId,
      assigneeId,
      createdByUserId: context.userId,
    },
  });

  revalidatePath("/zadania");
  revalidatePath("/kalendarz");

  return { success: true, message: "Dodano zadanie." };
}

// Edycja zadania
export async function updateTask(
  taskId: string,
  input: TaskInput,
): Promise<ActionResult> {
  const context = await getFamilyContext();

  if (!context.authenticated || !context.hasFamily) {
    return { success: false, message: "Brak dostępu." };
  }

  if (!isAdult(context.memberRole)) {
    return {
      success: false,
      message: "Nie masz uprawnień do edycji zadań.",
    };
  }

  const title = input.title?.trim();

  if (!title) {
    return { success: false, message: "Podaj nazwę zadania." };
  }

  if (title.length > 120) {
    return {
      success: false,
      message: "Nazwa zadania może mieć maksymalnie 120 znaków.",
    };
  }

  const dueDate = input.dueDate ? parseDate(input.dueDate) : null;

  if (input.dueDate && !dueDate) {
    return { success: false, message: "Nieprawidłowa data." };
  }

  const assigneeId = input.assigneeId || null;

  if (assigneeId) {
    const member = await prisma.familyMember.findFirst({
      where: {
        id: assigneeId,
        familyId: context.familyId,
      },
      select: { id: true },
    });

    if (!member) {
      return {
        success: false,
        message: "Wybrany członek nie należy do Twojej rodziny.",
      };
    }
  }

  const result = await prisma.task.updateMany({
    where: {
      id: taskId,
      familyId: context.familyId,
    },
    data: {
      title,
      description: input.description?.trim() ?? "",
      dueDate,
      assigneeId,
    },
  });

  if (result.count === 0) {
    return { success: false, message: "Nie znaleziono zadania." };
  }

  revalidatePath("/zadania");
  revalidatePath("/kalendarz");

  return { success: true, message: "Zaktualizowano zadanie." };
}

// Oznaczanie zadania jako ukończone / nieukończone
export async function toggleTask(
  taskId: string,
  completed: boolean,
): Promise<ActionResult> {
  const context = await getFamilyContext();

  if (!context.authenticated || !context.hasFamily) {
    return { success: false, message: "Brak dostępu." };
  }

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      familyId: context.familyId,
    },
    select: {
      id: true,
      assigneeId: true,
    },
  });

  if (!task) {
    return { success: false, message: "Nie znaleziono zadania." };
  }

  // Dziecko może zmieniać status wyłącznie własnego zadania.
  if (context.memberRole === "CHILD" && task.assigneeId !== context.memberId) {
    return {
      success: false,
      message: "Możesz zmieniać status tylko własnych zadań.",
    };
  }

  await prisma.task.update({
    where: { id: task.id },
    data: { completed },
  });

  revalidatePath("/zadania");
  revalidatePath("/kalendarz");

  return {
    success: true,
    message: completed
      ? "Zadanie oznaczono jako ukończone."
      : "Przywrócono zadanie.",
  };
}

// Usuwanie zadania
export async function deleteTask(taskId: string): Promise<ActionResult> {
  const context = await getFamilyContext();

  if (!context.authenticated || !context.hasFamily) {
    return { success: false, message: "Brak dostępu." };
  }

  if (!isAdult(context.memberRole)) {
    return {
      success: false,
      message: "Nie masz uprawnień do usuwania zadań.",
    };
  }

  const result = await prisma.task.deleteMany({
    where: {
      id: taskId,
      familyId: context.familyId,
    },
  });

  if (result.count === 0) {
    return { success: false, message: "Nie znaleziono zadania." };
  }

  revalidatePath("/zadania");
  revalidatePath("/kalendarz");

  return { success: true, message: "Usunięto zadanie." };
}
