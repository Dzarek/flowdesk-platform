import { MdCheck, MdClose } from "react-icons/md";
import type { CalendarEntryModalProps } from "./types";
import { formatFullDate } from "./utils";

export default function CalendarEntryModal({
  isOpen,
  editingEntry,
  selectedDate,
  form,
  error,
  isSaving,
  onClose,
  onSubmit,
  onFormChange,
}: CalendarEntryModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#193C32]/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) {
          onClose();
        }
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
            onClick={onClose}
            disabled={isSaving}
            aria-label="Zamknij"
            className="cursor-pointer rounded-xl p-2 text-[#718078] hover:bg-[#F0F3EB]"
          >
            <MdClose size={22} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-7 space-y-5">
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
              maxLength={120}
              value={form.title}
              onChange={(event) => onFormChange("title", event.target.value)}
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
              <span className="font-normal text-[#839087]">(opcjonalnie)</span>
            </label>
            <textarea
              id="calendar-description"
              rows={4}
              maxLength={2000}
              value={form.description}
              onChange={(event) =>
                onFormChange("description", event.target.value)
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
              <span className="font-normal text-[#839087]">(opcjonalnie)</span>
            </label>
            <input
              id="calendar-time"
              type="time"
              value={form.time}
              onChange={(event) => onFormChange("time", event.target.value)}
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
              onClick={onClose}
              disabled={isSaving}
              className="cursor-pointer rounded-xl border border-[#DCE4D9] px-5 py-3 text-sm font-semibold text-[#38544A] hover:bg-[#F5F6EE]"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#287969] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#19483D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MdCheck size={20} />
              {isSaving
                ? "Zapisywanie..."
                : editingEntry
                  ? "Zapisz zmiany"
                  : "Dodaj wpis"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
