import Image from "next/image";
import { MdAdd, MdCalendarMonth } from "react-icons/md";

type Props = {
  onAdd: () => void;
  canManageEntries: boolean;
};

export default function CalendarHeader({ onAdd, canManageEntries }: Props) {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-[#F5F6EE] p-6 sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-[#E2EBD9]/60 -z-10" />
      <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-[#E2F0EB]/60 -z-10" />
      <div
        className={`z-10 flex flex-col xl:grid items-center gap-10 px-2 xl:px-5 lg:min-h-[250px] ${canManageEntries ? "lg:grid-cols-[2fr_1fr_2fr] " : "lg:grid-cols-2 "} `}
      >
        <div className="order-1">
          <div className="mb-10 flex items-center  xl:ml-0 gap-2 text-sm font-semibold text-[var(--greenTextLight)]">
            <MdCalendarMonth size={20} />
            <span>Organizacja rodziny</span>
          </div>

          <h1 className="text-2xl uppercase text-center xl:text-left font-bold xl:font-extrabold tracking-tight text-[var(--greenText)] sm:text-4xl">
            Kalendarz rodzinny
          </h1>

          <p className="mt-4 text-center xl:text-left max-w-lg mx-auto xl:mx-0 text-base leading-7 text-[#647069]">
            Ważne daty, rodzinne plany i codzienne sprawy. Wszystko w jednym
            miejscu, zawsze pod ręką.
          </p>
        </div>

        {canManageEntries && (
          <button
            type="button"
            onClick={onAdd}
            className="w-[180px] order-3 xl:order-2 mx-auto flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--greenText)] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--greenText)]/90"
          >
            <MdAdd size={22} />
            Dodaj wpis
          </button>
        )}
        <div className="relative h-[90%] lg:block ml-auto order-2 xl:order-3">
          <Image
            src="/images/calendarHeader.svg"
            alt="Ilustracja kalendarza"
            width={400}
            height={400}
            className="h-full w-4/5 xl:w-9/10 mx-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
}
