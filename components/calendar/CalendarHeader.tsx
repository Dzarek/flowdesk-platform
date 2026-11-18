import Image from "next/image";
import { MdAdd, MdCalendarMonth } from "react-icons/md";

type Props = {
  onAdd: () => void;
  canManageEntries: boolean;
};

export default function CalendarHeader({ onAdd, canManageEntries }: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#F5F6EE] p-6 sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-[#E2EBD9]" />
      <div className="pointer-events-none absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-[#E2F0EB]" />

      <div className="relative flex h-[230px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="z-10 max-w-2xl">
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

        {canManageEntries && (
          <button
            type="button"
            onClick={onAdd}
            className="absolute left-1/2 top-1/2 z-20 inline-flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#287969] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#19483D]"
          >
            <MdAdd size={22} />
            Dodaj wpis
          </button>
        )}

        <Image
          src="/images/calendarHeader.svg"
          alt="Ilustracja kalendarza"
          width={400}
          height={400}
          className="h-full object-contain"
        />
      </div>
    </section>
  );
}
