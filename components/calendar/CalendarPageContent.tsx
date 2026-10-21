"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  MdAdd,
  MdCalendarMonth,
  MdCheck,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdDeleteOutline,
  MdEdit,
  MdEventNote,
  MdOutlineAccessTime,
  MdToday,
} from "react-icons/md";

import type { CalendarEntry } from "@/lib/calendar/types";
import { mockCalendarEntries } from "@/lib/calendar/mock-data";
import Image from "next/image";

const WEEKDAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];

const MONTHS = [
  "styczeń",
  "luty",
  "marzec",
  "kwiecień",
  "maj",
  "czerwiec",
  "lipiec",
  "sierpień",
  "wrzesień",
  "październik",
  "listopad",
  "grudzień",
];

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatFullDate(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseDateKey(value));
}

function getMonthDays(year: number, month: number) {
  const count = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  // Poniedziałek = 0, niedziela = 6
  const offset = (firstDay + 6) % 7;

  return {
    count,
    offset,
    cells: Array.from({ length: offset + count }, (_, index) =>
      index < offset ? null : index - offset + 1,
    ),
  };
}

function formatTime(time: string | null) {
  return time || "Cały dzień";
}

export default function CalendarPageContent() {
  const [entries, setEntries] = useState<CalendarEntry[]>(mockCalendarEntries);

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CalendarEntry | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    time: "",
  });

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const { count: daysInMonth, cells } = useMemo(
    () => getMonthDays(year, month),
    [year, month],
  );

  const todayKey = toDateKey(new Date());

  const entriesByDate = useMemo(() => {
    const grouped = new Map<string, CalendarEntry[]>();

    for (const entry of entries) {
      const current = grouped.get(entry.date) ?? [];
      current.push(entry);
      grouped.set(entry.date, current);
    }

    for (const dayEntries of grouped.values()) {
      dayEntries.sort((a, b) => {
        if (a.time === null) return b.time === null ? 0 : -1;
        if (b.time === null) return 1;
        return a.time.localeCompare(b.time);
      });
    }

    return grouped;
  }, [entries]);

  const selectedEntries = entriesByDate.get(selectedDate) ?? [];

  const monthEntries = entries.filter((entry) => {
    const date = parseDateKey(entry.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });

  const upcomingEntries = entries
    .filter((entry) => entry.date >= todayKey)
    .sort((a, b) => {
      const dateComparison = a.date.localeCompare(b.date);
      if (dateComparison !== 0) return dateComparison;

      if (a.time === null) return b.time === null ? 0 : -1;
      if (b.time === null) return 1;
      return a.time.localeCompare(b.time);
    })
    .slice(0, 4);

  function changeMonth(amount: number) {
    setVisibleMonth((current) => {
      const next = new Date(
        current.getFullYear(),
        current.getMonth() + amount,
        1,
      );

      return next;
    });
  }

  function goToToday() {
    const today = new Date();
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(toDateKey(today));
  }

  function openAddModal() {
    setEditingEntry(null);
    setForm({ title: "", description: "", time: "" });
    setError("");
    setIsModalOpen(true);
  }

  function openEditModal(entry: CalendarEntry) {
    setEditingEntry(entry);
    setSelectedDate(entry.date);
    setForm({
      title: entry.title,
      description: entry.description,
      time: entry.time ?? "",
    });
    setError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingEntry(null);
    setError("");
  }

  function handleSaveEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = form.title.trim();

    if (!title) {
      setError("Podaj tytuł wydarzenia.");
      return;
    }

    const entryDate = editingEntry ? selectedDate : selectedDate;

    if (editingEntry) {
      setEntries((current) =>
        current.map((entry) =>
          entry.id === editingEntry.id
            ? {
                ...entry,
                date: entryDate,
                title,
                description: form.description.trim(),
                time: form.time || null,
              }
            : entry,
        ),
      );
    } else {
      const newEntry: CalendarEntry = {
        id: crypto.randomUUID(),
        date: entryDate,
        title,
        description: form.description.trim(),
        time: form.time || null,
        createdAt: todayKey,
      };

      setEntries((current) => [...current, newEntry]);
    }

    closeModal();
  }

  function deleteEntry(id: string) {
    const entry = entries.find((item) => item.id === id);
    if (!entry) return;

    if (!window.confirm(`Usunąć wpis „${entry.title}”?`)) return;

    setEntries((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-7 pb-8">
      {/* Nagłówek */}
      <section className="relative overflow-hidden rounded-3xl bg-[#F5F6EE] p-6 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-[#E2EBD9]" />
        <div className="pointer-events-none absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-[#E2F0EB]" />

        <div className="h-[230px] relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#287969]">
              <MdCalendarMonth size={22} />
              <span>Organizacja rodziny</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-[#19483D] sm:text-5xl">
              Kalendarz rodzinny
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-[#718078]">
              Ważne daty, rodzinne plany i codzienne sprawy. Wszystko w jednym
              miejscu, zawsze pod ręką.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="absolute top-1/2 left-1/2 -translate-1/2 cursor-pointer inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#287969] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#19483D] sm:self-center"
          >
            <MdAdd size={22} />
            Dodaj wpis
          </button>
          <Image
            src="/images/calendarHeader.svg"
            alt="tasks"
            width={400}
            height={400}
            className="h-full object-contain"
          />
        </div>
      </section>

      {/* Statystyki */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E2F0EB] text-[#287969]">
            <MdEventNote size={25} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#263C35]">
              {monthEntries.length}
            </p>
            <p className="text-sm text-[#839087]">Wpisów w miesiącu</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5ECF8] text-[#5876A5]">
            <MdCalendarMonth size={25} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#263C35]">
              {new Set(monthEntries.map((entry) => entry.date)).size}
            </p>
            <p className="text-sm text-[#839087]">Zajętych dni</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F8EBDD] text-[#A56F43]">
            <MdToday size={25} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#263C35]">
              {entriesByDate.get(todayKey)?.length ?? 0}
            </p>
            <p className="text-sm text-[#839087]">Wpisów na dziś</p>
          </div>
        </div>
      </section>

      {/* Kalendarz i szczegóły */}
      <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 rounded-3xl border border-[#E4E9E0] bg-[#FEFEFA] p-4 sm:p-6">
          {/* Nawigacja miesiąca */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold capitalize text-[#19483D]">
                {MONTHS[month]} {year}
              </h2>
              <p className="mt-1 text-sm text-[#839087]">
                Wybierz dzień, aby zobaczyć szczegóły
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToToday}
                className="rounded-xl border border-[#DCE4D9] px-3 py-2 text-sm font-semibold text-[#38544A] transition hover:bg-[#F5F6EE]"
              >
                Dzisiaj
              </button>

              <button
                type="button"
                onClick={() => changeMonth(-1)}
                aria-label="Poprzedni miesiąc"
                className="rounded-xl border border-[#DCE4D9] p-2.5 text-[#38544A] transition hover:bg-[#F5F6EE]"
              >
                <MdChevronLeft size={22} />
              </button>

              <button
                type="button"
                onClick={() => changeMonth(1)}
                aria-label="Następny miesiąc"
                className="rounded-xl border border-[#DCE4D9] p-2.5 text-[#38544A] transition hover:bg-[#F5F6EE]"
              >
                <MdChevronRight size={22} />
              </button>
            </div>
          </div>

          {/* Siatka kalendarza */}
          <div className="mt-6 grid grid-cols-7 gap-1.5 sm:gap-2">
            {WEEKDAYS.map((weekday) => (
              <div
                key={weekday}
                className="pb-2 text-center text-xs font-bold text-[#839087] sm:text-sm"
              >
                {weekday}
              </div>
            ))}

            {cells.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} />;
              }

              const date = toDateKey(new Date(year, month, day));
              const dayEntries = entriesByDate.get(date) ?? [];
              const isSelected = date === selectedDate;
              const isToday = date === todayKey;

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  aria-label={`${day} ${MONTHS[month]}, ${dayEntries.length} wpisów`}
                  aria-pressed={isSelected}
                  className={`group flex min-h-[92px] min-w-0 flex-col items-stretch overflow-hidden rounded-xl border p-1.5 text-left transition sm:min-h-[118px] sm:p-2 ${
                    isSelected
                      ? "border-[#287969] bg-[#EAF3E9] ring-1 ring-[#287969]"
                      : isToday
                        ? "border-[#A6CBB5] bg-[#F5F8F0] hover:border-[#287969]"
                        : "border-[#E8ECE5] bg-white hover:border-[#BFD5C5] hover:bg-[#F8FAF5]"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold sm:h-7 sm:w-7 sm:text-sm ${
                      isToday
                        ? "bg-[#287969] text-white"
                        : isSelected
                          ? "text-[#19483D]"
                          : "text-[#52665C]"
                    }`}
                  >
                    {day}
                  </span>

                  <div className="mt-1.5 space-y-1 overflow-hidden">
                    {dayEntries.slice(0, 2).map((entry) => (
                      <div
                        key={entry.id}
                        className="truncate rounded-md bg-[#DDECE0] px-1 py-1 text-[9px] font-semibold leading-tight text-[#285D49] sm:text-[11px]"
                        title={entry.title}
                      >
                        {entry.time && (
                          <span className="hidden sm:inline">
                            {entry.time}{" "}
                          </span>
                        )}
                        {entry.title}
                      </div>
                    ))}

                    {dayEntries.length > 2 && (
                      <p className="truncate px-1 text-[9px] font-semibold text-[#718078] sm:text-[11px]">
                        +{dayEntries.length - 2} więcej
                      </p>
                    )}
                  </div>

                  {dayEntries.length > 0 && (
                    <span className="mt-auto flex items-center gap-1 px-1 pt-1 text-[9px] text-[#839087] sm:hidden">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#287969]" />
                      {dayEntries.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#E8ECE5] pt-4 text-xs text-[#839087]">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#287969]" />
              Dzisiaj
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded border border-[#287969] bg-[#EAF3E9]" />
              Wybrany dzień
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#DDECE0]" />
              Dzień z wpisami
            </span>
          </div>
        </div>

        {/* Panel wybranego dnia */}
        <aside className="rounded-3xl border border-[#E4E9E0] bg-[#FEFEFA] p-5 sm:p-6 xl:sticky xl:top-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#287969]">
                Wybrany dzień
              </p>
              <h2 className="mt-1 text-lg font-extrabold capitalize leading-6 text-[#19483D]">
                {formatFullDate(selectedDate)}
              </h2>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              aria-label="Dodaj wpis w wybranym dniu"
              title="Dodaj wpis"
              className="shrink-0 rounded-xl bg-[#287969] p-2.5 text-white transition hover:bg-[#19483D]"
            >
              <MdAdd size={22} />
            </button>
          </div>

          <p className="mt-2 text-sm text-[#839087]">
            {selectedEntries.length === 0
              ? "Brak wpisów na ten dzień."
              : `${selectedEntries.length} ${
                  selectedEntries.length === 1
                    ? "wpis"
                    : selectedEntries.length >= 2 && selectedEntries.length <= 4
                      ? "wpisy"
                      : "wpisów"
                }`}
          </p>

          {selectedEntries.length > 0 ? (
            <div className="mt-5 space-y-3">
              {selectedEntries.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-2xl border border-[#E1E7DE] bg-[#F8F9F4] p-4"
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 h-9 w-1 shrink-0 rounded-full bg-[#287969]" />

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-bold text-[#263C35]">
                        {entry.title}
                      </h3>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-[#839087]">
                        <MdOutlineAccessTime size={16} />
                        {formatTime(entry.time)}
                      </p>
                    </div>
                  </div>

                  {entry.description && (
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#718078]">
                      {entry.description}
                    </p>
                  )}

                  <div className="mt-3 flex justify-end gap-1 border-t border-[#E5EAE2] pt-3">
                    <button
                      type="button"
                      onClick={() => openEditModal(entry)}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-[#287969] transition hover:bg-[#E2F0EB]"
                    >
                      <MdEdit size={16} />
                      Edytuj
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteEntry(entry.id)}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-[#9C6259] transition hover:bg-red-50"
                    >
                      <MdDeleteOutline size={17} />
                      Usuń
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-[#DCE4D9] px-4 py-8 text-center">
              <MdEventNote size={32} className="mx-auto text-[#A0ADA1]" />
              <p className="mt-3 text-sm font-bold text-[#38544A]">
                Dzień jest wolny
              </p>
              <p className="mt-1 text-xs leading-5 text-[#839087]">
                Dodaj wydarzenie, przypomnienie lub ważną informację.
              </p>
              <button
                type="button"
                onClick={openAddModal}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#E2F0EB] px-4 py-2.5 text-sm font-bold text-[#287969] hover:bg-[#D4E8DE]"
              >
                <MdAdd size={18} />
                Dodaj wpis
              </button>
            </div>
          )}

          {/* Najbliższe wydarzenia */}
          <div className="mt-7 border-t border-[#E8ECE5] pt-5">
            <h3 className="font-extrabold text-[#263C35]">
              Najbliższe wydarzenia
            </h3>

            {upcomingEntries.length > 0 ? (
              <div className="mt-3 space-y-3">
                {upcomingEntries.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      const date = parseDateKey(entry.date);
                      setVisibleMonth(
                        new Date(date.getFullYear(), date.getMonth(), 1),
                      );
                      setSelectedDate(entry.date);
                    }}
                    className="flex w-full min-w-0 items-start gap-3 rounded-xl p-2 text-left transition hover:bg-[#F5F6EE]"
                  >
                    <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-[#E2F0EB] text-[#287969]">
                      <span className="text-sm font-extrabold leading-4">
                        {parseDateKey(entry.date).getDate()}
                      </span>
                      <span className="text-[9px] font-semibold uppercase">
                        {new Intl.DateTimeFormat("pl-PL", {
                          month: "short",
                        }).format(parseDateKey(entry.date))}
                      </span>
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[#38544A]">
                        {entry.title}
                      </span>
                      <span className="mt-1 block text-xs text-[#839087]">
                        {entry.time ?? "Cały dzień"}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-[#839087]">
                Brak nadchodzących wydarzeń.
              </p>
            )}
          </div>
        </aside>
      </section>

      {/* Modal dodawania i edycji */}
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
            aria-labelledby="calendar-modal-title"
            className="my-auto w-full max-w-lg rounded-3xl bg-[#FEFEFA] p-6 shadow-xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#287969]">
                  {formatFullDate(selectedDate)}
                </p>
                <h2
                  id="calendar-modal-title"
                  className="mt-1 text-2xl font-extrabold text-[#19483D]"
                >
                  {editingEntry ? "Edytuj wpis" : "Dodaj wpis"}
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

            <form onSubmit={handleSaveEntry} className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="calendar-title"
                  className="mb-2 block text-sm font-semibold text-[#38544A]"
                >
                  Tytuł wpisu *
                </label>
                <input
                  id="calendar-title"
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
                  placeholder="Np. Spotkanie rodzinne"
                  className="w-full rounded-xl border border-[#DCE4D9] bg-white px-4 py-3 text-[#263C35] outline-none transition focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="calendar-description"
                  className="mb-2 block text-sm font-semibold text-[#38544A]"
                >
                  Opis{" "}
                  <span className="font-normal text-[#839087]">
                    (opcjonalnie)
                  </span>
                </label>
                <textarea
                  id="calendar-description"
                  rows={4}
                  maxLength={3000}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Dodaj szczegóły, notatki lub ważne informacje..."
                  className="w-full resize-y rounded-xl border border-[#DCE4D9] bg-white px-4 py-3 text-[#263C35] outline-none transition focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="calendar-time"
                  className="mb-2 block text-sm font-semibold text-[#38544A]"
                >
                  Godzina{" "}
                  <span className="font-normal text-[#839087]">
                    (opcjonalnie)
                  </span>
                </label>
                <input
                  id="calendar-time"
                  type="time"
                  value={form.time}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      time: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#DCE4D9] bg-white px-4 py-3 text-[#263C35] outline-none transition focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10"
                />
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
                  <MdCheck size={20} />
                  {editingEntry ? "Zapisz zmiany" : "Dodaj wpis"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
