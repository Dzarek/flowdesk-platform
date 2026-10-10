import Link from "next/link";
import {
  MdOutlineArrowForward,
  MdOutlineBolt,
  MdOutlineSolarPower,
} from "react-icons/md";

type EnergyDay = {
  day: string;
  value: number;
};

type EnergyWidgetProps = {
  production: number;
  consumption: number;
  change: number;
  history: EnergyDay[];
};

const EnergyWidget = ({
  production,
  consumption,
  change,
  history,
}: EnergyWidgetProps) => {
  const maxValue = Math.max(...history.map((item) => item.value));

  return (
    <Link
      href="/energy"
      className="
        group
        flex
        h-full
        flex-col
        rounded-2xl
        border
        border-border
        bg-card
        p-6
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-primary/30
        hover:shadow-md
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MdOutlineSolarPower size={25} />
          </div>

          <div>
            <h2 className="font-semibold">Energia</h2>

            <p className="text-sm text-muted-foreground">
              Produkcja z ostatnich 7 dni
            </p>
          </div>
        </div>

        <MdOutlineArrowForward
          size={20}
          className="
            text-muted-foreground
            transition-all
            duration-300
            group-hover:translate-x-1
            group-hover:text-primary
          "
        />
      </div>

      {/* Main stats */}
      <div className="mt-7 flex items-end justify-between gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Produkcja dzisiaj</p>

          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight">
              {production}
            </span>

            <span className="text-sm text-muted-foreground">kWh</span>
          </div>

          <div className="mt-2 flex items-center gap-1 text-xs">
            <span
              className={
                change >= 0
                  ? "font-semibold text-emerald-600 dark:text-emerald-400"
                  : "font-semibold text-red-600 dark:text-red-400"
              }
            >
              {change > 0 ? "+" : ""}
              {change}%
            </span>

            <span className="text-muted-foreground">vs wczoraj</span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-muted-foreground">Zużycie</p>

          <div className="mt-1 flex items-center justify-end gap-1.5">
            <MdOutlineBolt className="text-primary" size={18} />

            <span className="text-lg font-semibold">{consumption}</span>

            <span className="text-sm text-muted-foreground">kWh</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-8 flex h-36 items-end gap-3">
        {history.map((item) => {
          const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

          return (
            <div
              key={item.day}
              className="flex h-full flex-1 flex-col justify-end"
            >
              <div className="group/bar flex flex-1 items-end">
                <div
                  className="
                    relative
                    w-full
                    rounded-t-md
                    bg-primary/20
                    transition-all
                    duration-300
                    hover:bg-primary
                  "
                  style={{
                    height: `${height}%`,
                  }}
                >
                  {/* Tooltip */}
                  <div
                    className="
                      pointer-events-none
                      absolute
                      -top-8
                      left-1/2
                      -translate-x-1/2
                      rounded-md
                      bg-foreground
                      px-2
                      py-1
                      text-xs
                      text-background
                      opacity-0
                      transition-opacity
                      group-hover/bar:opacity-100
                    "
                  >
                    {item.value} kWh
                  </div>
                </div>
              </div>

              <span className="mt-2 text-center text-xs text-muted-foreground">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Fotowoltaika</span>

          <span className="text-sm font-medium text-primary">
            Zobacz szczegóły
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EnergyWidget;
