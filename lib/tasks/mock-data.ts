import type { Task } from "./types";

function dateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Zrobić zakupy na weekend",
    description: "Przygotować listę i kupić potrzebne produkty.",
    dueDate: dateOffset(0),
    assigneeId: "member-2",
    completed: false,
    createdAt: dateOffset(-2),
  },
  {
    id: "task-2",
    title: "Posprzątać salon",
    description: "Odkurzyć, wytrzeć kurze i uporządkować rzeczy.",
    dueDate: dateOffset(0),
    assigneeId: "member-3",
    completed: false,
    createdAt: dateOffset(-1),
  },
  {
    id: "task-3",
    title: "Opłacić rachunek za internet",
    description: "Sprawdzić kwotę i wykonać przelew.",
    dueDate: dateOffset(-1),
    assigneeId: "member-1",
    completed: false,
    createdAt: dateOffset(-4),
  },
  {
    id: "task-4",
    title: "Przygotować ubrania na jutro",
    description: "",
    dueDate: dateOffset(1),
    assigneeId: "member-4",
    completed: false,
    createdAt: dateOffset(0),
  },
  {
    id: "task-5",
    title: "Sprawdzić kalendarz rodzinny",
    description: "Przejrzeć plany na nadchodzący tydzień.",
    dueDate: null,
    assigneeId: "member-1",
    completed: true,
    createdAt: dateOffset(-3),
  },
  {
    id: "task-6",
    title: "Uzupełnić zapasy w domu",
    description: "Sprawdzić, czego brakuje.",
    dueDate: dateOffset(3),
    assigneeId: null,
    completed: false,
    createdAt: dateOffset(0),
  },
  {
    id: "task-7",
    title: "Przygotować rzeczy do prania",
    description: "",
    dueDate: dateOffset(0),
    assigneeId: "member-2",
    completed: true,
    createdAt: dateOffset(-2),
  },
];
