import Link from "next/link";
import {
  MdOutlineArrowForward,
  MdOutlineFavoriteBorder,
  MdOutlineCalendarMonth,
  MdOutlinePerson,
} from "react-icons/md";

type HealthEvent = {
  id: number;
  title: string;
  person: string;
  date: string;
  time?: string;
};

type HealthWidgetProps = {
  events: HealthEvent[];
};

export default function HealthWidget({ events }: HealthWidgetProps) {
  const visibleEvents = events.slice(0, 3);
  const remainingEvents = events.length - visibleEvents.length;

  return (
    <Link
      href="/health"
      className="
        group
        flex
        h-full
        flex-col
        rounded-3xl
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
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MdOutlineFavoriteBorder size={24} />
        </div>

        <div>
          <h2 className="font-semibold">Zdrowie</h2>

          <p className="text-sm text-muted-foreground">
            Najbliższe wizyty i badania
          </p>
        </div>
      </div>

      {/* Events */}
      <div className="flex-1 space-y-3">
        {visibleEvents.length === 0 ? (
          <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            Brak zaplanowanych wizyt 🎉
          </div>
        ) : (
          visibleEvents.map((event) => (
            <div key={event.id} className="rounded-xl bg-muted/50 p-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{event.title}</p>

                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <MdOutlinePerson size={15} />

                    <span>{event.person}</span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="flex items-center justify-end gap-1 text-xs font-medium text-primary">
                    <MdOutlineCalendarMonth size={15} />

                    {event.date}
                  </div>

                  {event.time && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.time}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Remaining */}
      {remainingEvents > 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          + {remainingEvents} kolejnych wydarzeń
        </p>
      )}

      {/* Footer */}
      <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
        Przejdź do zdrowia
        <MdOutlineArrowForward
          size={18}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}
