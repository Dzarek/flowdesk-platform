"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { CalendarEntry } from "@/lib/calendar/types";
import { mockCalendarEntries } from "@/lib/calendar/mock-data";

import CalendarHeader from "./CalendarHeader";
import CalendarStats from "./CalendarStats";
import MonthCalendar from "./MonthCalendar";
import SelectedDayPanel from "./SelectedDayPanel";
import CalendarEntryModal from "./CalendarEntryModal";
import type { CalendarFormValues } from "./types";
import { getMonthDays, parseDateKey, toDateKey } from "./utils";

const EMPTY_FORM: CalendarFormValues = {
  title: "",
  description: "",
  time: "",
};

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
  const [form, setForm] = useState<CalendarFormValues>(EMPTY_FORM);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const { cells } = useMemo(() => getMonthDays(year, month), [year, month]);
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
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  }

  function goToToday() {
    const today = new Date();
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(toDateKey(today));
  }

  function openAddModal() {
    setEditingEntry(null);
    setForm(EMPTY_FORM);
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

  function updateFormField(field: keyof CalendarFormValues, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSaveEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = form.title.trim();

    if (!title) {
      setError("Podaj tytuł wydarzenia.");
      return;
    }

    const entryDate = selectedDate;

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

  function selectUpcomingDate(dateKey: string) {
    const date = parseDateKey(dateKey);
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setSelectedDate(dateKey);
  }

  return (
    <div className="space-y-7 pb-8">
      <CalendarHeader onAdd={openAddModal} />

      <CalendarStats
        monthEntriesCount={monthEntries.length}
        occupiedDaysCount={new Set(monthEntries.map((entry) => entry.date)).size}
        todayEntriesCount={entriesByDate.get(todayKey)?.length ?? 0}
      />

      <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <MonthCalendar
          year={year}
          month={month}
          selectedDate={selectedDate}
          todayKey={todayKey}
          cells={cells}
          entriesByDate={entriesByDate}
          onSelectDate={setSelectedDate}
          onChangeMonth={changeMonth}
          onGoToToday={goToToday}
        />

        <SelectedDayPanel
          selectedDate={selectedDate}
          selectedEntries={selectedEntries}
          upcomingEntries={upcomingEntries}
          onAdd={openAddModal}
          onEdit={openEditModal}
          onDelete={deleteEntry}
          onSelectUpcoming={selectUpcomingDate}
        />
      </section>

      <CalendarEntryModal
        isOpen={isModalOpen}
        editingEntry={editingEntry}
        selectedDate={selectedDate}
        form={form}
        error={error}
        onClose={closeModal}
        onSubmit={handleSaveEntry}
        onFormChange={updateFormField}
      />
    </div>
  );
}
