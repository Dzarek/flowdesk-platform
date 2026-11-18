import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import type { MonthCalendarProps } from "./types";
import { MONTHS, WEEKDAYS, toDateKey } from "./utils";

export default function MonthCalendar({
  year,
  month,
  selectedDate,
  todayKey,
  cells,
  entriesByDate,
  onSelectDate,
  onChangeMonth,
  onGoToToday,
}: MonthCalendarProps) {
  return (
    <div className="min-w-0 rounded-3xl border border-[#E4E9E0] bg-[#FEFEFA] p-4 sm:p-6">
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
            onClick={onGoToToday}
            className="cursor-pointer rounded-xl border border-[#DCE4D9] px-3 py-2 text-sm font-semibold text-[#38544A] transition hover:bg-[#F5F6EE]"
          >
            Dzisiaj
          </button>
          <button
            type="button"
            onClick={() => onChangeMonth(-1)}
            aria-label="Poprzedni miesiąc"
            className="cursor-pointer rounded-xl border border-[#DCE4D9] p-2.5 text-[#38544A] transition hover:bg-[#F5F6EE]"
          >
            <MdChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={() => onChangeMonth(1)}
            aria-label="Następny miesiąc"
            className="cursor-pointer rounded-xl border border-[#DCE4D9] p-2.5 text-[#38544A] transition hover:bg-[#F5F6EE]"
          >
            <MdChevronRight size={22} />
          </button>
        </div>
      </div>

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
          if (day === null) return <div key={`empty-${index}`} />;

          const date = toDateKey(new Date(year, month, day));
          const dayEntries = entriesByDate.get(date) ?? [];
          const isSelected = date === selectedDate;
          const isToday = date === todayKey;

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              aria-label={`${day} ${MONTHS[month]}, ${dayEntries.length} wpisów`}
              aria-pressed={isSelected}
              className={`group flex min-h-[92px] min-w-0 cursor-pointer flex-col items-stretch overflow-hidden rounded-xl border p-1.5 text-left transition sm:min-h-[118px] sm:p-2 ${
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
                {dayEntries.slice(0, 2).map((entry) => {
                  const isTask = entry.type === "TASK";
                  const isCompleted = isTask && entry.completed;

                  return (
                    <div
                      key={entry.id}
                      className={`truncate rounded-md px-1 py-1 text-[9px] font-semibold leading-tight sm:text-[11px] ${
                        isCompleted
                          ? "bg-[#EEF0EA] text-[#929B91] line-through"
                          : isTask
                            ? "bg-[#F8EBD8] text-[#A87532]"
                            : "bg-[#DDECE0] text-[#285D49]"
                      }`}
                      title={`${isTask ? "Zadanie" : "Wydarzenie"}: ${entry.title}`}
                    >
                      {entry.time && (
                        <span className="hidden sm:inline">{entry.time} </span>
                      )}
                      {entry.title}
                    </div>
                  );
                })}
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
          <span className="h-3 w-3 rounded-full bg-[#287969]" /> Dzisiaj
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-[#287969] bg-[#EAF3E9]" />{" "}
          Wybrany dzień
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-[#DDECE0]" />
          Wydarzenie
        </span>

        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-[#F8EBD8]" />
          Zadanie
        </span>
      </div>
    </div>
  );
}
