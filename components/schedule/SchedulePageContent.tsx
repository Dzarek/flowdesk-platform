"use client";

import { useMemo, useState } from "react";
import {
  MdAdd,
  MdArrowBack,
  MdArrowForward,
  MdCalendarMonth,
  MdClose,
  MdDeleteOutline,
  MdEdit,
  MdRepeat,
} from "react-icons/md";
import { mockScheduleEntries } from "@/lib/schedule/mock-data";
import type { ScheduleEntry, ScheduleEntryType } from "@/lib/schedule/types";

import { mockScheduleNotes } from "@/lib/schedule/mock-notes";
import type { ScheduleNote } from "@/lib/schedule/types";
import { MdStickyNote2 } from "react-icons/md";

const DAYS = [
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
  "Niedziela",
];

const START_HOUR = 7;
const END_HOUR = 22;
const HOUR_HEIGHT = 72;
const GRID_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

const MEMBERS = [
  { id: "member-1", name: "Jarek", initials: "J", color: "#DDEBE2" },
  { id: "member-2", name: "Anna", initials: "A", color: "#F3E4D6" },
  { id: "member-3", name: "Ola", initials: "O", color: "#E4E5F5" },
  { id: "member-4", name: "Maja", initials: "M", color: "#F5E3EB" },
];

const TYPE_OPTIONS: { value: ScheduleEntryType; label: string }[] = [
  { value: "WORK", label: "Praca" },
  { value: "SCHOOL", label: "Szkoła" },
  { value: "ACTIVITY", label: "Zajęcia dodatkowe" },
  { value: "OTHER", label: "Inne" },
];

const EVENT_STYLES: Record<
  ScheduleEntryType,
  { background: string; border: string; text: string }
> = {
  WORK: {
    background: "#E2F0EB",
    border: "#287969",
    text: "#19483D",
  },
  SCHOOL: {
    background: "#E8E9F8",
    border: "#8586C9",
    text: "#44467E",
  },
  ACTIVITY: {
    background: "#F8EBD9",
    border: "#D7A15C",
    text: "#80551E",
  },
  OTHER: {
    background: "#E9ECE7",
    border: "#A2ADA2",
    text: "#465348",
  },
};

type EntryForm = {
  title: string;
  description: string;
  type: ScheduleEntryType;
  date: string;
  startTime: string;
  endTime: string;
  repeatWeekly: boolean;
  note: string;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateString(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
}

function parseDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getMonday(date: Date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = result.getDay();
  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1));
  return result;
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function dayNumber(date: Date) {
  return date.getDay() === 0 ? 7 : date.getDay();
}

function minutes(time: string) {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatRange(start: Date, end: Date) {
  const sameMonth = start.getMonth() === end.getMonth();
  const startText = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    ...(sameMonth ? {} : { month: "short" }),
  }).format(start);
  const endText = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(end);

  return `${startText} – ${endText}`;
}

function emptyForm(date: Date, startTime = "09:00"): EntryForm {
  const endMinutes = Math.min(minutes(startTime) + 60, END_HOUR * 60);

  return {
    title: "",
    description: "",
    type: "OTHER",
    date: toDateString(date),
    startTime,
    endTime: `${pad(Math.floor(endMinutes / 60))}:${pad(endMinutes % 60)}`,
    repeatWeekly: true,
    note: "",
  };
}

export default function SchedulePageContent() {
  const [entries, setEntries] = useState<ScheduleEntry[]>(mockScheduleEntries);
  const [selectedMemberId, setSelectedMemberId] = useState("member-1");
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const [form, setForm] = useState<EntryForm | null>(null);
  const [formError, setFormError] = useState("");
  const [notes, setNotes] = useState<ScheduleNote[]>(mockScheduleNotes);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  const todayString = toDateString(new Date());
  const currentMember =
    MEMBERS.find((member) => member.id === selectedMemberId) ?? MEMBERS[0];

  const isCurrentWeek =
    toDateString(weekStart) === toDateString(getMonday(new Date()));

  const visibleEntries = entries.filter(
    (entry) => entry.memberId === selectedMemberId,
  );

  function entriesForDate(date: Date) {
    const dateString = toDateString(date);
    const weekday = dayNumber(date);

    return visibleEntries
      .filter((entry) =>
        entry.repeatWeekly
          ? entry.dayOfWeek === weekday
          : entry.date === dateString,
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  function openAdd(date: Date, startTime = "09:00") {
    setEditingEntry(null);
    setForm(emptyForm(date, startTime));
    setFormError("");
  }

  function openEdit(entry: ScheduleEntry, date: Date) {
    setEditingEntry(entry);
    setForm({
      title: entry.title,
      description: entry.description,
      type: entry.type,
      date: toDateString(date),
      startTime: entry.startTime,
      endTime: entry.endTime,
      repeatWeekly: entry.repeatWeekly,
      note:
        notes.find(
          (note) =>
            note.entryId === entry.id && note.date === toDateString(date),
        )?.text ?? "",
    });
    setFormError("");
  }

  function closeForm() {
    setForm(null);
    setEditingEntry(null);
    setFormError("");
  }

  function saveEntry() {
    if (!form) return;

    if (!form.title.trim()) {
      setFormError("Wpisz nazwę wydarzenia.");
      return;
    }

    if (
      !form.date ||
      !form.startTime ||
      !form.endTime ||
      minutes(form.endTime) <= minutes(form.startTime)
    ) {
      setFormError("Sprawdź datę oraz godziny wydarzenia.");
      return;
    }

    const selectedDate = parseDate(form.date);

    const entry: ScheduleEntry = {
      id: editingEntry?.id ?? `schedule-${Date.now()}`,
      memberId: selectedMemberId,
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      dayOfWeek: dayNumber(selectedDate),
      startTime: form.startTime,
      endTime: form.endTime,
      repeatWeekly: form.repeatWeekly,
      date: form.repeatWeekly ? null : form.date,
    };

    setEntries((previous) =>
      editingEntry
        ? previous.map((item) => (item.id === editingEntry.id ? entry : item))
        : [...previous, entry],
    );
    const noteDate = form.date;
    const noteText = form.note.trim();

    setNotes((previous) => {
      const existing = previous.find(
        (note) => note.entryId === entry.id && note.date === noteDate,
      );

      if (!noteText) {
        return previous.filter(
          (note) => !(note.entryId === entry.id && note.date === noteDate),
        );
      }

      if (existing) {
        return previous.map((note) =>
          note.id === existing.id ? { ...note, text: noteText } : note,
        );
      }

      return [
        ...previous,
        {
          id: `note-${Date.now()}`,
          entryId: entry.id,
          date: noteDate,
          text: noteText,
        },
      ];
    });
    closeForm();
  }

  function deleteEntry() {
    if (!editingEntry) return;

    setEntries((previous) =>
      previous.filter((item) => item.id !== editingEntry.id),
    );
    closeForm();
  }

  function handleGridClick(
    event: React.MouseEvent<HTMLDivElement>,
    date: Date,
  ) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const y = event.clientY - bounds.top;
    const rawMinutes = START_HOUR * 60 + (y / HOUR_HEIGHT) * 60;
    const roundedMinutes = Math.max(
      START_HOUR * 60,
      Math.min((END_HOUR - 1) * 60 + 30, Math.round(rawMinutes / 30) * 30),
    );
    const startTime = `${pad(
      Math.floor(roundedMinutes / 60),
    )}:${pad(roundedMinutes % 60)}`;

    openAdd(date, startTime);
  }

  return (
    <div className="space-y-6 pb-8 text-[#263C35]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#839087]">
            ORGANIZACJA RODZINY
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Harmonogram
          </h1>
          <p className="mt-2 text-sm text-[#839087]">
            Wszystkie ważne zajęcia w jednym miejscu.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openAdd(new Date())}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#287969] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#19483D]"
        >
          <MdAdd size={20} />
          Dodaj wydarzenie
        </button>
      </header>

      <section className="rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm text-[#839087]">Wyświetlany tydzień</p>
            <h2 className="mt-1 text-xl font-extrabold">
              {formatRange(weekStart, addDays(weekStart, 6))}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setWeekStart((date) => addDays(date, -7))}
              aria-label="Poprzedni tydzień"
              className="rounded-xl border border-[#DCE4D9] p-2.5 transition hover:bg-[#F5F6EE]"
            >
              <MdArrowBack size={20} />
            </button>
            <button
              type="button"
              onClick={() => setWeekStart(getMonday(new Date()))}
              className="rounded-xl border border-[#DCE4D9] px-4 py-2.5 text-sm font-bold transition hover:bg-[#F5F6EE]"
            >
              Dzisiaj
            </button>
            <button
              type="button"
              onClick={() => setWeekStart((date) => addDays(date, 7))}
              aria-label="Następny tydzień"
              className="rounded-xl border border-[#DCE4D9] p-2.5 transition hover:bg-[#F5F6EE]"
            >
              <MdArrowForward size={20} />
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {MEMBERS.map((member) => {
            const active = selectedMemberId === member.id;

            return (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelectedMemberId(member.id)}
                aria-pressed={active}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
                  active
                    ? "border-[#287969] bg-[#E2F0EB] text-[#19483D]"
                    : "border-[#DCE4D9] bg-white text-[#65746A] hover:bg-[#F5F6EE]"
                }`}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-extrabold"
                  style={{ backgroundColor: member.color }}
                >
                  {member.initials}
                </span>
                {member.name}
              </button>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA]">
        <div className="flex items-center justify-between gap-3 border-b border-[#DCE4D9] px-4 py-3">
          <div className="flex items-center gap-2">
            <MdCalendarMonth className="text-[#287969]" size={21} />
            <h2 className="font-extrabold">Plan: {currentMember.name}</h2>
          </div>
          <span className="text-xs text-[#839087]">
            Kliknij wolne miejsce, aby dodać wydarzenie
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1050px]">
            <div
              className="grid border-b border-[#DCE4D9]"
              style={{
                gridTemplateColumns: "64px repeat(7, minmax(0, 1fr))",
              }}
            >
              <div className="border-r border-[#DCE4D9] bg-[#F5F6EE]" />

              {weekDays.map((date, index) => {
                const dateString = toDateString(date);
                const today = dateString === todayString;

                return (
                  <div
                    key={dateString}
                    className={`border-r border-[#DCE4D9] px-2 py-3 text-center last:border-r-0 ${
                      today ? "bg-[#E2F0EB]" : "bg-[#F5F6EE]"
                    }`}
                  >
                    <p
                      className={`text-xs font-bold ${
                        today ? "text-[#287969]" : "text-[#839087]"
                      }`}
                    >
                      {DAYS[index]}
                    </p>
                    <p
                      className={`mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-extrabold ${
                        today ? "bg-[#287969] text-white" : "text-[#263C35]"
                      }`}
                    >
                      {date.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>

            <div
              className="grid"
              style={{
                gridTemplateColumns: "64px repeat(7, minmax(0, 1fr))",
              }}
            >
              <div className="border-r border-[#DCE4D9] bg-[#FEFEFA]">
                {Array.from(
                  { length: END_HOUR - START_HOUR },
                  (_, index) => START_HOUR + index,
                ).map((hour) => (
                  <div
                    key={hour}
                    className="relative border-b border-[#E9EDE6] pr-2 text-right"
                    style={{ height: HOUR_HEIGHT }}
                  >
                    <span className="-top-2 relative text-[11px] font-medium text-[#839087]">
                      {pad(hour)}:00
                    </span>
                  </div>
                ))}
              </div>

              {weekDays.map((date) => {
                const dateString = toDateString(date);
                const dayEntries = entriesForDate(date);

                return (
                  <div
                    key={dateString}
                    onClick={(event) => handleGridClick(event, date)}
                    className={`relative cursor-crosshair border-r border-[#E9EDE6] last:border-r-0 ${
                      dateString === todayString ? "bg-[#FAFCF8]" : ""
                    }`}
                    style={{
                      height: GRID_HEIGHT,
                      backgroundImage:
                        "repeating-linear-gradient(to bottom, transparent 0, transparent 63px, #E9EDE6 63px, #E9EDE6 64px)",
                    }}
                  >
                    {Array.from({ length: 15 }, (_, index) => (
                      <div
                        key={index}
                        className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-[#F0F2ED]"
                        style={{ top: index * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
                      />
                    ))}

                    {dayEntries.map((entry) => {
                      const style = EVENT_STYLES[entry.type];
                      const top =
                        ((minutes(entry.startTime) - START_HOUR * 60) / 60) *
                        HOUR_HEIGHT;
                      const height =
                        ((minutes(entry.endTime) - minutes(entry.startTime)) /
                          60) *
                        HOUR_HEIGHT;

                      if (
                        minutes(entry.endTime) <= START_HOUR * 60 ||
                        minutes(entry.startTime) >= END_HOUR * 60
                      ) {
                        return null;
                      }

                      const clippedTop = Math.max(0, top);
                      const clippedBottom = Math.min(GRID_HEIGHT, top + height);
                      const note = notes.find(
                        (item) =>
                          item.entryId === entry.id && item.date === dateString,
                      );
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEdit(entry, date);
                          }}
                          title={`${entry.title}: ${entry.startTime}–${entry.endTime}`}
                          className="absolute left-1 right-1 z-10 overflow-hidden rounded-lg border-l-[3px] px-2 py-1 text-left transition hover:brightness-[0.97]"
                          style={{
                            top: clippedTop,
                            height: Math.max(22, clippedBottom - clippedTop),
                            backgroundColor: style.background,
                            borderLeftColor: style.border,
                            color: style.text,
                          }}
                        >
                          <span className="block truncate text-[11px] font-extrabold leading-4">
                            {entry.title}
                          </span>
                          <span className="block truncate text-[10px] leading-4 opacity-80">
                            {entry.startTime}–{entry.endTime}
                          </span>
                          {note && (
                            <span className="flex items-center gap-1 truncate text-[10px] font-bold">
                              <MdStickyNote2 size={12} className="shrink-0" />
                              <span className="truncate">{note.text}</span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[#DCE4D9] px-4 py-3">
          {TYPE_OPTIONS.map((option) => {
            const style = EVENT_STYLES[option.value];

            return (
              <div key={option.value} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: style.border }}
                />
                <span className="text-xs text-[#65746A]">{option.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {form && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#17251F]/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="schedule-modal-title"
            className="my-auto w-full max-w-lg rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] p-5 shadow-xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#839087]">
                  {editingEntry ? "EDYCJA WYDARZENIA" : "NOWE WYDARZENIE"}
                </p>
                <h2
                  id="schedule-modal-title"
                  className="mt-1 text-xl font-extrabold"
                >
                  {editingEntry ? "Edytuj wydarzenie" : "Dodaj wydarzenie"}
                </h2>
                <p className="mt-1 text-sm text-[#839087]">
                  Harmonogram: {currentMember.name}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Zamknij"
                className="rounded-lg p-2 text-[#839087] hover:bg-[#F5F6EE]"
              >
                <MdClose size={22} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold">
                  Nazwa wydarzenia *
                </span>
                <input
                  autoFocus
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="Np. szkoła, praca, basen..."
                  className="w-full rounded-xl border border-[#DCE4D9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#287969]"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold">
                  Rodzaj wydarzenia
                </span>
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      type: event.target.value as ScheduleEntryType,
                    })
                  }
                  className="w-full rounded-xl border border-[#DCE4D9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#287969]"
                >
                  {TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold">Data</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm({ ...form, date: event.target.value })
                  }
                  className="w-full rounded-xl border border-[#DCE4D9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#287969]"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold">Od</span>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(event) =>
                      setForm({ ...form, startTime: event.target.value })
                    }
                    className="w-full rounded-xl border border-[#DCE4D9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#287969]"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold">Do</span>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(event) =>
                      setForm({ ...form, endTime: event.target.value })
                    }
                    className="w-full rounded-xl border border-[#DCE4D9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#287969]"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold">
                  Opis (opcjonalnie)
                </span>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Dodatkowe informacje..."
                  className="w-full resize-y rounded-xl border border-[#DCE4D9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#287969]"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-sm font-bold">
                  <MdStickyNote2 size={18} className="text-[#287969]" />
                  Notatka do tej aktywności
                </span>

                <textarea
                  rows={3}
                  value={form.note}
                  onChange={(event) =>
                    setForm({ ...form, note: event.target.value })
                  }
                  placeholder="Np. SPRAWDZIAN — powtórzyć materiał z rozdziału 3..."
                  className="w-full resize-y rounded-xl border border-[#DCE4D9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#287969]"
                />

                <span className="mt-1 block text-xs text-[#839087]">
                  Notatka będzie przypisana do daty {form.date}.
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#DCE4D9] bg-[#F5F6EE] p-3">
                <input
                  type="checkbox"
                  checked={form.repeatWeekly}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      repeatWeekly: event.target.checked,
                    })
                  }
                  className="mt-1 h-4 w-4 accent-[#287969]"
                />
                <span>
                  <span className="flex items-center gap-2 text-sm font-bold">
                    <MdRepeat size={18} />
                    Powtarzaj co tydzień
                  </span>
                  <span className="mt-1 block text-xs text-[#839087]">
                    {form.repeatWeekly
                      ? "Wydarzenie będzie widoczne w każdym tygodniu."
                      : "Wydarzenie pojawi się tylko w wybranym dniu."}
                  </span>
                </span>
              </label>

              {formError && (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {formError}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                {editingEntry && (
                  <button
                    type="button"
                    onClick={deleteEntry}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                  >
                    <MdDeleteOutline size={19} />
                    Usuń
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-[#DCE4D9] px-4 py-2.5 text-sm font-bold hover:bg-[#F5F6EE]"
                >
                  Anuluj
                </button>
                <button
                  type="button"
                  onClick={saveEntry}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#287969] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#19483D]"
                >
                  {editingEntry && <MdEdit size={17} />}
                  {editingEntry ? "Zapisz zmiany" : "Dodaj"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
