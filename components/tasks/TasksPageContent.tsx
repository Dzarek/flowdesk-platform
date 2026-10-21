"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  MdAdd,
  MdCalendarToday,
  MdCheck,
  MdCheckCircle,
  MdClose,
  MdDeleteOutline,
  MdOutlineAccessTime,
  MdOutlineAssignment,
  MdPeopleOutline,
  MdSearch,
  MdTaskAlt,
  MdToday,
} from "react-icons/md";

import type { Task } from "@/lib/tasks/types";
import { mockTasks } from "@/lib/tasks/mock-data";
import type { FamilyMember } from "@/lib/family/types";
import { mockFamilyMembers } from "@/lib/family/mock-data";
import Image from "next/image";

type TaskFilter = "ALL" | "MINE" | "FAMILY" | "COMPLETED";

const CURRENT_MEMBER_ID = "member-1";

function localDateString(date: Date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${date}T12:00:00`));
}

function getDueDateLabel(task: Task) {
  if (!task.dueDate) return "Bez terminu";

  const today = localDateString();

  if (task.dueDate === today) return "Dzisiaj";
  if (task.dueDate < today) return `Po terminie · ${formatDate(task.dueDate)}`;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (task.dueDate === localDateString(tomorrow)) return "Jutro";

  return formatDate(task.dueDate);
}

function isOverdue(task: Task) {
  return Boolean(
    !task.completed && task.dueDate && task.dueDate < localDateString(),
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: typeof MdTaskAlt;
  value: number;
  label: string;
  tone: "green" | "blue" | "orange" | "red";
}) {
  const tones = {
    green: "bg-[#E2F0EB] text-[#287969]",
    blue: "bg-[#E5ECF8] text-[#5876A5]",
    orange: "bg-[#F8EBDD] text-[#A56F43]",
    red: "bg-[#F8E6E2] text-[#BD6557]",
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] p-4">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tones[tone]}`}
      >
        <Icon size={24} />
      </div>

      <div className="min-w-0">
        <p className="text-2xl font-extrabold leading-none text-[#263C35]">
          {value}
        </p>
        <p className="mt-1 text-sm text-[#839087]">{label}</p>
      </div>
    </div>
  );
}

function AssigneeAvatar({
  member,
  size = "sm",
}: {
  member: FamilyMember | undefined;
  size?: "sm" | "md";
}) {
  const dimensions = size === "md" ? "h-9 w-9 text-xs" : "h-7 w-7 text-[10px]";

  if (!member) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-[#F0F2EC] text-[#839087] ${dimensions}`}
        title="Brak przypisanej osoby"
      >
        <MdPeopleOutline size={size === "md" ? 19 : 15} />
      </span>
    );
  }

  return (
    <>
      {member.img ? (
        <Image
          src={member.img}
          alt={member.name}
          height={50}
          width={50}
          className="rounded-full object-cover w-6 h-6"
        />
      ) : (
        <span
          className={`flex shrink-0 items-center justify-center rounded-full font-bold text-[#38544A] ${dimensions}`}
          style={{ backgroundColor: member.color }}
          title={member.name}
        >
          {member.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase()}
        </span>
      )}
    </>
  );
}

function TaskRow({
  task,
  member,
  onToggle,
  onDelete,
}: {
  task: Task;
  member: FamilyMember | undefined;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const overdue = isOverdue(task);

  return (
    <article
      className={`flex items-start gap-3 rounded-2xl border p-4 transition ${
        task.completed
          ? "border-[#E8ECE5] bg-[#F8F9F5]"
          : "border-[#E1E7DE] bg-[#FEFEFA] hover:border-[#BFD5C5]"
      }`}
    >
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        aria-label={
          task.completed
            ? `Przywróć zadanie: ${task.title}`
            : `Oznacz jako ukończone: ${task.title}`
        }
        title={task.completed ? "Przywróć zadanie" : "Ukończ zadanie"}
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
          task.completed
            ? "border-[#287969] bg-[#287969] text-white"
            : "border-[#B7C7BA] text-transparent hover:border-[#287969]"
        }`}
      >
        {task.completed && <MdCheck size={16} />}
      </button>

      <div className="min-w-0 flex-1">
        <h3
          className={`break-words font-bold ${
            task.completed ? "text-[#839087] line-through" : "text-[#263C35]"
          }`}
        >
          {task.title}
        </h3>

        {task.description && (
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-[#839087]">
            {task.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span
            className={`inline-flex items-center gap-1.5 text-xs ${
              overdue ? "font-semibold text-[#BD6557]" : "text-[#839087]"
            }`}
          >
            {overdue ? (
              <MdOutlineAccessTime size={16} />
            ) : (
              <MdCalendarToday size={15} />
            )}
            {getDueDateLabel(task)}
          </span>

          <span className="inline-flex items-center gap-2 text-xs text-[#718078]">
            <AssigneeAvatar member={member} />
            {member?.name ?? "Nieprzypisane"}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDelete(task.id)}
        aria-label={`Usuń zadanie: ${task.title}`}
        title="Usuń zadanie"
        className="shrink-0 rounded-lg p-2 text-[#9AA49C] transition hover:bg-red-50 hover:text-red-600"
      >
        <MdDeleteOutline size={20} />
      </button>
    </article>
  );
}

export default function TasksPageContent() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [filter, setFilter] = useState<TaskFilter>("ALL");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    assigneeId: CURRENT_MEMBER_ID,
  });

  const today = localDateString();

  const pendingCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.filter((task) => task.completed).length;
  const todayCount = tasks.filter(
    (task) => !task.completed && task.dueDate === today,
  ).length;
  const overdueCount = tasks.filter(isOverdue).length;

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pl-PL");

    return tasks
      .filter((task) => {
        if (filter === "COMPLETED" && !task.completed) return false;
        if (filter === "MINE" && task.assigneeId !== CURRENT_MEMBER_ID) {
          return false;
        }
        if (
          filter === "FAMILY" &&
          (!task.assigneeId || task.assigneeId === CURRENT_MEMBER_ID)
        ) {
          return false;
        }

        return task.title.toLocaleLowerCase("pl-PL").includes(query);
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;

        if (a.dueDate === null) return b.dueDate === null ? 0 : 1;
        if (b.dueDate === null) return -1;

        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [tasks, filter, search]);

  function openModal() {
    setForm({
      title: "",
      description: "",
      dueDate: "",
      assigneeId: CURRENT_MEMBER_ID,
    });
    setError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setError("");
  }

  function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = form.title.trim();

    if (!title) {
      setError("Podaj tytuł zadania.");
      return;
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description: form.description.trim(),
      dueDate: form.dueDate || null,
      assigneeId: form.assigneeId || null,
      completed: false,
      createdAt: localDateString(),
    };

    setTasks((current) => [newTask, ...current]);
    setFilter("ALL");
    setSearch("");
    closeModal();
  }

  function toggleTask(id: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function deleteTask(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    const confirmed = window.confirm(
      `Czy na pewno chcesz usunąć zadanie „${task.title}”?`,
    );

    if (!confirmed) return;

    setTasks((current) => current.filter((item) => item.id !== id));
  }

  const filterOptions: { value: TaskFilter; label: string }[] = [
    { value: "ALL", label: "Wszystkie" },
    { value: "MINE", label: "Moje" },
    { value: "FAMILY", label: "Rodziny" },
    { value: "COMPLETED", label: "Ukończone" },
  ];

  return (
    <div className="space-y-7 pb-8">
      {/* Nagłówek */}
      <section className="relative overflow-hidden rounded-3xl bg-[#F5F6EE] p-6 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-[#E2EBD9]" />
        <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-[#E2F0EB]" />

        <div className="h-[230px] relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#287969]">
              <MdTaskAlt size={21} />
              <span>Organizacja domu</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-[#19483D] sm:text-5xl">
              Nasze zadania
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-[#718078]">
              Wszystko pod kontrolą — wspólnie i na czas. Planujcie codzienne
              obowiązki i realizujcie je razem.
            </p>
          </div>

          <button
            type="button"
            onClick={openModal}
            className="absolute top-1/2 left-1/2 -translate-1/2 cursor-pointer inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#287969] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#19483D] lg:self-center"
          >
            <MdAdd size={22} />
            Dodaj zadanie
          </button>
          <Image
            src="/images/tasksHeader.svg"
            alt="tasks"
            width={400}
            height={400}
            className="h-full object-contain"
          />
        </div>
      </section>

      {/* Statystyki */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={MdOutlineAssignment}
          value={pendingCount}
          label="Do wykonania"
          tone="green"
        />
        <StatCard
          icon={MdCheckCircle}
          value={completedCount}
          label="Ukończone"
          tone="blue"
        />
        <StatCard
          icon={MdToday}
          value={todayCount}
          label="Na dziś"
          tone="orange"
        />
        <StatCard
          icon={MdOutlineAccessTime}
          value={overdueCount}
          label="Po terminie"
          tone="red"
        />
      </section>

      {/* Lista zadań */}
      <section className="rounded-3xl border border-[#E4E9E0] bg-[#FEFEFA] p-4 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                  filter === option.value
                    ? "bg-[#287969] text-white"
                    : "bg-[#F3F5EF] text-[#38544A] hover:bg-[#E8EEE5]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="flex min-w-0 items-center gap-2 rounded-xl border border-[#E0E6DE] bg-[#F8F9F4] px-4 xl:w-80">
            <MdSearch className="shrink-0 text-[#718078]" size={21} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Szukaj zadania..."
              aria-label="Szukaj zadania"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#263C35] outline-none placeholder:text-[#98A29B]"
            />
          </label>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-[#263C35]">
            {filter === "COMPLETED"
              ? "Ukończone zadania"
              : filter === "MINE"
                ? "Moje zadania"
                : filter === "FAMILY"
                  ? "Zadania rodziny"
                  : "Lista zadań"}
          </h2>

          <span className="text-sm text-[#839087]">
            {filteredTasks.length}{" "}
            {filteredTasks.length === 1
              ? "zadanie"
              : filteredTasks.length >= 2 && filteredTasks.length <= 4
                ? "zadania"
                : "zadań"}
          </span>
        </div>

        {filteredTasks.length > 0 ? (
          <div className="mt-4 space-y-3 grid gap-x-4 lg:grid-cols-2">
            {filteredTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                member={mockFamilyMembers.find(
                  (person) => person.id === task.assigneeId,
                )}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-[#DCE4D9] px-5 py-12 text-center">
            <MdOutlineAssignment size={38} className="text-[#839087]" />
            <p className="mt-3 font-bold text-[#263C35]">
              Brak zadań do wyświetlenia
            </p>
            <p className="mt-1 text-sm text-[#839087]">
              Zmień filtr lub wyszukiwanie albo dodaj nowe zadanie.
            </p>
            <button
              type="button"
              onClick={openModal}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#E2F0EB] px-4 py-2.5 text-sm font-bold text-[#287969] hover:bg-[#D4E8DE]"
            >
              <MdAdd size={19} />
              Dodaj zadanie
            </button>
          </div>
        )}

        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#F5F6EE] p-4">
          <MdPeopleOutline
            className="mt-0.5 shrink-0 text-[#287969]"
            size={22}
          />
          <div>
            <p className="text-sm font-bold text-[#38544A]">
              Wspólna organizacja
            </p>
            <p className="mt-1 text-sm leading-5 text-[#839087]">
              Przypisuj zadania domownikom i oznaczaj je jako ukończone. Zmiany
              są obecnie przechowywane tylko w pamięci strony.
            </p>
          </div>
        </div>
      </section>

      {/* Modal dodawania zadania */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#193C32]/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
            className="my-auto w-full max-w-lg rounded-3xl bg-[#FEFEFA] p-6 shadow-xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#287969]">
                  LifeHub · Zadania
                </p>
                <h2
                  id="task-modal-title"
                  className="mt-1 text-2xl font-extrabold text-[#19483D]"
                >
                  Dodaj zadanie
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Zamknij"
                className="rounded-xl p-2 text-[#718078] hover:bg-[#F0F3EB]"
              >
                <MdClose size={22} />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="task-title"
                  className="mb-2 block text-sm font-semibold text-[#38544A]"
                >
                  Tytuł zadania *
                </label>
                <input
                  id="task-title"
                  autoFocus
                  required
                  maxLength={150}
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Np. Zrobić zakupy"
                  className="w-full rounded-xl border border-[#DCE4D9] bg-white px-4 py-3 text-[#263C35] outline-none transition focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="task-description"
                  className="mb-2 block text-sm font-semibold text-[#38544A]"
                >
                  Opis{" "}
                  <span className="font-normal text-[#839087]">
                    (opcjonalnie)
                  </span>
                </label>
                <textarea
                  id="task-description"
                  rows={3}
                  maxLength={1000}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Dodaj szczegóły zadania..."
                  className="w-full resize-y rounded-xl border border-[#DCE4D9] bg-white px-4 py-3 text-[#263C35] outline-none transition focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="task-due-date"
                  className="mb-2 block text-sm font-semibold text-[#38544A]"
                >
                  Termin wykonania
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  min={today}
                  value={form.dueDate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      dueDate: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#DCE4D9] bg-white px-4 py-3 text-[#263C35] outline-none transition focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10"
                />
                <p className="mt-1.5 text-xs text-[#839087]">
                  Możesz zostawić termin pusty.
                </p>
              </div>

              <div>
                <label
                  htmlFor="task-assignee"
                  className="mb-2 block text-sm font-semibold text-[#38544A]"
                >
                  Przypisz do
                </label>
                <select
                  id="task-assignee"
                  value={form.assigneeId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      assigneeId: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#DCE4D9] bg-white px-4 py-3 text-[#263C35] outline-none transition focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10"
                >
                  <option value="">Bez przypisania</option>
                  {mockFamilyMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                      {member.id === CURRENT_MEMBER_ID ? " (Ty)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <p role="alert" className="text-sm font-medium text-red-600">
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-[#DCE4D9] px-5 py-3 text-sm font-semibold text-[#38544A] hover:bg-[#F5F6EE]"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#287969] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#19483D]"
                >
                  <MdAdd size={20} />
                  Dodaj zadanie
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
