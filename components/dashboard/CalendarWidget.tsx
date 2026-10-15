import { MdOutlineCalendarMonth, MdOutlineArrowForward } from "react-icons/md";
import Link from "next/link";

type CalendarEvent = {
  id: number;
  title: string;
  time: string;
};

type CalendarWidgetProps = {
  events: CalendarEvent[];
};

export default function CalendarWidget({ events }: CalendarWidgetProps) {
  const visibleEvents = events.slice(0, 2);
  const remainingEvents = events.length - visibleEvents.length;

  return (
    <Link
      href="/calendar"
      className="
        group
        flex
        h-full
        flex-col
        rounded-4xl
        border
        border-border
        bg-card
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-primary/40
        hover:shadow-lg
      "
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MdOutlineCalendarMonth size={24} />
          </div>

          <div>
            <h2 className="font-semibold">Kalendarz</h2>

            <p className="text-sm text-muted-foreground">Dzisiaj</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {visibleEvents.length === 0 ? (
          <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            🎉 Brak wydarzeń na dziś.
          </div>
        ) : (
          visibleEvents.map((event) => (
            <div key={event.id} className="rounded-xl bg-muted/50 p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                {event.time}
              </div>

              <div className="mt-1 font-medium">{event.title}</div>
            </div>
          ))
        )}
      </div>

      {remainingEvents > 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          + {remainingEvents} kolejne wydarzenia
        </p>
      )}

      <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
        Zobacz kalendarz
        <MdOutlineArrowForward
          className="transition-transform duration-300 group-hover:translate-x-1"
          size={18}
        />
      </div>
    </Link>
  );
}
