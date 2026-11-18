import {
  MdAdd,
  MdDeleteOutline,
  MdEdit,
  MdEventNote,
  MdOutlineAccessTime,
  MdClose,
} from "react-icons/md";
import type { SelectedDayPanelProps } from "./types";
import {
  formatEntryCount,
  formatFullDate,
  formatTime,
  parseDateKey,
} from "./utils";

export default function SelectedDayPanel({
  selectedDate,
  selectedEntries,
  upcomingEntries,
  canManageEntries,
  onAdd,
  onEdit,
  onDelete,
  onSelectUpcoming,
  onClose,
}: SelectedDayPanelProps) {
  return (
    <aside className="flex h-screen w-full min-h-0 flex-col overflow-hidden rounded-3xl xl:rounded-r-none border border-[#DCE4D9] bg-[#FEFEFA] p-5 shadow-2xl sm:p-6">
      <div className="flex flex-col-reverse items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#287969]">Wybrany dzień</p>
          <h2 className="mt-1 text-lg font-extrabold capitalize leading-6 text-[#19483D]">
            {formatFullDate(selectedDate)}
          </h2>
        </div>

        <div className="flex w-full shrink-0 items-center justify-end gap-2">
          {canManageEntries && (
            <button
              type="button"
              onClick={onAdd}
              aria-label="Dodaj wpis w wybranym dniu"
              title="Dodaj wpis"
              className="cursor-pointer rounded-xl bg-[#287969] p-2.5 text-white transition hover:bg-[#19483D] font-semibold uppercase flex items-center justify-center gap-1 text-xs"
            >
              <MdAdd size={22} />
              Dodaj wpis
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij panel"
            title="Zamknij"
            className="cursor-pointer rounded-xl border border-[#DCE4D9] p-2.5 text-[#718078] transition hover:bg-[#F5F6EE] hover:text-[#19483D]"
          >
            <MdClose size={22} />
          </button>
        </div>
      </div>

      <p className="mt-2 text-sm text-[#839087]">
        {selectedEntries.length === 0
          ? "Brak wpisów na ten dzień."
          : formatEntryCount(selectedEntries.length)}
      </p>

      {selectedEntries.length > 0 ? (
        <div className="mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain space-y-3 pl-3 [direction:rtl] thin-scrollbar">
          <div className="space-y-3 [direction:ltr]">
            {selectedEntries.map((entry) => (
              <article
                key={entry.id}
                className="rounded-2xl border border-[#E1E7DE] bg-[#F8F9F4] p-4"
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 h-9 w-1 shrink-0 rounded-full bg-[#287969]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`break-words font-bold ${
                          entry.type === "TASK" && entry.completed
                            ? "text-[#839087] line-through"
                            : "text-[#263C35]"
                        }`}
                      >
                        {entry.title}
                      </h3>

                      {entry.type === "TASK" ? (
                        <span className="rounded-md bg-[#F8EBD8] px-2 py-0.5 text-[10px] font-bold text-[#A87532]">
                          Zadanie
                        </span>
                      ) : (
                        <span className="rounded-md bg-[#E2F0EB] px-2 py-0.5 text-[10px] font-bold text-[#287969]">
                          Wydarzenie
                        </span>
                      )}
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[#839087]">
                      <MdOutlineAccessTime size={16} />
                      {formatTime(entry.time)}
                    </p>
                    {entry.type === "TASK" && (
                      <p className="mt-1 text-xs text-[#839087]">
                        {entry.completed ? "Ukończone" : "Do wykonania"}
                        {entry.assigneeName && ` · ${entry.assigneeName}`}
                      </p>
                    )}
                  </div>
                </div>

                {entry.description && (
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#718078]">
                    {entry.description}
                  </p>
                )}
                {canManageEntries && entry.type === "EVENT" && (
                  <div className="mt-3 flex justify-end gap-1 border-t border-[#E5EAE2] pt-3">
                    <button
                      type="button"
                      onClick={() => onEdit(entry)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-[#287969] transition hover:bg-[#E2F0EB]"
                    >
                      <MdEdit size={16} /> Edytuj
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(entry.id)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-[#9C6259] transition hover:bg-red-50"
                    >
                      <MdDeleteOutline size={17} /> Usuń
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
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
          {canManageEntries && (
            <button
              type="button"
              onClick={onAdd}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#E2F0EB] px-4 py-2.5 text-sm font-bold text-[#287969] hover:bg-[#D4E8DE]"
            >
              <MdAdd size={18} />
            </button>
          )}
        </div>
      )}

      {/* <div className="mt-7 border-t border-[#E8ECE5] pt-5">
        <h3 className="font-extrabold text-[#263C35]">Najbliższe wydarzenia</h3>
        {upcomingEntries.length > 0 ? (
          <div className="mt-3 space-y-3">
            {upcomingEntries.map((entry) => {
              const date = parseDateKey(entry.date);
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onSelectUpcoming(entry.date)}
                  className="flex w-full min-w-0 cursor-pointer items-start gap-3 rounded-xl p-2 text-left transition hover:bg-[#F5F6EE]"
                >
                  <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-[#E2F0EB] text-[#287969]">
                    <span className="text-sm font-extrabold leading-4">
                      {date.getDate()}
                    </span>
                    <span className="text-[9px] font-semibold uppercase">
                      {new Intl.DateTimeFormat("pl-PL", {
                        month: "short",
                      }).format(date)}
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
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm text-[#839087]">
            Brak nadchodzących wydarzeń.
          </p>
        )}
      </div> */}
    </aside>
  );
}
