"use client";

import { useMemo, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { MdDeleteOutline } from "react-icons/md";

import type { CalendarEntry } from "@/lib/calendar/types";

import {
  createCalendarEntry,
  updateCalendarEntry,
  deleteCalendarEntry,
  getCalendarEntries,
} from "@/app/(app)/kalendarz/actions";

import CalendarHeader from "./CalendarHeader";
import CalendarStats from "./CalendarStats";
import MonthCalendar from "./MonthCalendar";
import SelectedDayPanel from "./SelectedDayPanel";
import CalendarEntryModal from "./CalendarEntryModal";

import type { CalendarFormValues } from "./types";
import { getMonthDays, parseDateKey, toDateKey } from "./utils";

type CalendarPageContentProps = {
  initialEntries: CalendarEntry[];
  canManageEntries: boolean;
};

const EMPTY_FORM: CalendarFormValues = {
  title: "",
  description: "",
  time: "",
};

export default function CalendarPageContent({
  initialEntries,
  canManageEntries,
}: CalendarPageContentProps) {
  const [entries, setEntries] = useState<CalendarEntry[]>(initialEntries);

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CalendarEntry | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CalendarFormValues>(EMPTY_FORM);

  const [isSaving, setIsSaving] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<CalendarEntry | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDayPanelOpen, setIsDayPanelOpen] = useState(false);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const { cells } = useMemo(() => getMonthDays(year, month), [year, month]);

  const todayKey = toDateKey(new Date());

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setIsDayPanelOpen(true);
  }

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
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  }

  function goToToday() {
    const today = new Date();

    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));

    setSelectedDate(toDateKey(today));
  }

  function openAddModal() {
    if (!canManageEntries) return;

    setEditingEntry(null);
    setForm(EMPTY_FORM);
    setError("");
    setIsModalOpen(true);
  }

  function openEditModal(entry: CalendarEntry) {
    if (!canManageEntries) return;

    setEditingEntry(entry);
    setSelectedDate(entry.date);

    const date = parseDateKey(entry.date);

    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));

    setForm({
      title: entry.title,
      description: entry.description,
      time: entry.time ?? "",
    });

    setError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) return;

    setIsModalOpen(false);
    setEditingEntry(null);
    setError("");
  }

  function updateFormField(field: keyof CalendarFormValues, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSaveEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canManageEntries || isSaving) return;

    const title = form.title.trim();

    if (!title) {
      setError("Podaj tytuł wydarzenia.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const input = {
        title,
        description: form.description.trim(),
        date: selectedDate,
        time: form.time || null,
      };

      const result = editingEntry
        ? await updateCalendarEntry(editingEntry.id, input)
        : await createCalendarEntry(input);

      if (!result.success) {
        setError(result.message);
        toast.error(result.message);
        return;
      }

      const updatedEntries = await getCalendarEntries();

      setEntries(updatedEntries);

      setIsModalOpen(false);
      setEditingEntry(null);
      setForm(EMPTY_FORM);

      toast.success(result.message);
    } catch (error) {
      console.error("Błąd podczas zapisywania wydarzenia:", error);
      setError("Nie udało się zapisać wydarzenia. Spróbuj ponownie.");
      toast.error("Nie udało się zapisać wydarzenia.");
    } finally {
      setIsSaving(false);
    }
  }

  function deleteEntry(id: string) {
    if (!canManageEntries || isDeleting) return;

    const entry = entries.find((item) => item.id === id);

    if (!entry) return;

    setEntryToDelete(entry);
  }

  async function confirmDeleteEntry() {
    if (!entryToDelete || isDeleting || !canManageEntries) return;

    setIsDeleting(true);

    try {
      const result = await deleteCalendarEntry(entryToDelete.id);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      const updatedEntries = await getCalendarEntries();

      setEntries(updatedEntries);
      setEntryToDelete(null);

      toast.success(result.message);
    } catch (error) {
      console.error("Błąd podczas usuwania wydarzenia:", error);
      toast.error("Nie udało się usunąć wydarzenia. Spróbuj ponownie.");
    } finally {
      setIsDeleting(false);
    }
  }

  function selectUpcomingDate(dateKey: string) {
    const date = parseDateKey(dateKey);

    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));

    setSelectedDate(dateKey);
    setIsDayPanelOpen(true);
  }

  return (
    <div className="space-y-7 pb-8">
      <CalendarHeader
        onAdd={openAddModal}
        canManageEntries={canManageEntries}
      />

      <CalendarStats
        monthEntriesCount={monthEntries.length}
        occupiedDaysCount={
          new Set(monthEntries.map((entry) => entry.date)).size
        }
        todayEntriesCount={entriesByDate.get(todayKey)?.length ?? 0}
      />

      <section className="relative">
        {/* Kalendarz */}

        <MonthCalendar
          year={year}
          month={month}
          selectedDate={selectedDate}
          todayKey={todayKey}
          cells={cells}
          entriesByDate={entriesByDate}
          onSelectDate={handleSelectDate}
          onChangeMonth={changeMonth}
          onGoToToday={goToToday}
        />

        {/* Przyciemnione tło za panelem */}
        {isDayPanelOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 transition-opacity"
            onMouseDown={() => setIsDayPanelOpen(false)}
          />
        )}

        {/* Panel szczegółów */}
        {isDayPanelOpen && (
          <div className="fixed top-1/2 -translate-y-1/2 right-0 z-50 w-[400px] max-w-[90vw] animate-in slide-in-from-right duration-300">
            <SelectedDayPanel
              selectedDate={selectedDate}
              selectedEntries={selectedEntries}
              upcomingEntries={upcomingEntries}
              canManageEntries={canManageEntries}
              onAdd={openAddModal}
              onEdit={openEditModal}
              onDelete={deleteEntry}
              onSelectUpcoming={selectUpcomingDate}
              onClose={() => setIsDayPanelOpen(false)}
            />
          </div>
        )}
      </section>

      <CalendarEntryModal
        isOpen={isModalOpen}
        editingEntry={editingEntry}
        selectedDate={selectedDate}
        form={form}
        error={error}
        isSaving={isSaving}
        onClose={closeModal}
        onSubmit={handleSaveEntry}
        onFormChange={updateFormField}
      />

      {/* Modal potwierdzenia usunięcia */}
      {entryToDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#193C32]/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) {
              setEntryToDelete(null);
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-calendar-title"
            aria-describedby="delete-calendar-description"
            className="w-full max-w-md rounded-3xl border border-[#DCE4D9] bg-[#FEFEFA] p-6 shadow-xl sm:p-7"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8E6E2] text-[#BD6557]">
              <MdDeleteOutline size={25} />
            </div>

            <h2
              id="delete-calendar-title"
              className="mt-5 text-xl font-extrabold text-[#19483D]"
            >
              Usunąć wydarzenie?
            </h2>

            <p
              id="delete-calendar-description"
              className="mt-2 text-sm leading-6 text-[#718078]"
            >
              Czy na pewno chcesz usunąć wydarzenie{" "}
              <span className="font-bold text-[#38544A]">
                „{entryToDelete.title}”
              </span>
              ? Tej operacji nie można cofnąć.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setEntryToDelete(null)}
                className="cursor-pointer rounded-xl border border-[#DCE4D9] px-5 py-3 text-sm font-semibold text-[#38544A] transition hover:bg-[#F5F6EE] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anuluj
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteEntry}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#BD6557] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#A94F43] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <MdDeleteOutline size={19} />
                {isDeleting ? "Usuwanie..." : "Usuń wydarzenie"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
