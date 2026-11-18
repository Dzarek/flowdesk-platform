import { MdCalendarMonth, MdEventNote, MdToday } from "react-icons/md";
import type { CalendarStatsProps } from "./types";

export default function CalendarStats({
  monthEntriesCount,
  occupiedDaysCount,
  todayEntriesCount,
}: CalendarStatsProps) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="flex items-center gap-3 rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E2F0EB] text-[#287969]">
          <MdEventNote size={25} />
        </div>
        <div>
          <p className="text-2xl font-extrabold text-[#263C35]">{monthEntriesCount}</p>
          <p className="text-sm text-[#839087]">Wpisów w miesiącu</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5ECF8] text-[#5876A5]">
          <MdCalendarMonth size={25} />
        </div>
        <div>
          <p className="text-2xl font-extrabold text-[#263C35]">{occupiedDaysCount}</p>
          <p className="text-sm text-[#839087]">Zajętych dni</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F8EBDD] text-[#A56F43]">
          <MdToday size={25} />
        </div>
        <div>
          <p className="text-2xl font-extrabold text-[#263C35]">{todayEntriesCount}</p>
          <p className="text-sm text-[#839087]">Wpisów na dziś</p>
        </div>
      </div>
    </section>
  );
}
