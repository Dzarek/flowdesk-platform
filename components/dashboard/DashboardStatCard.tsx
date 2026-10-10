import Link from "next/link";
import { IconType } from "react-icons";

type DashboardStatCardProps = {
  title: string;
  value: string | number;
  description: string;
  href: string;
  icon: IconType;

  trend?: {
    value: string;
    label?: string;
    positive?: boolean;
  };

  progress?: number;
  progressLabel?: string;
};

const DashboardStatCard = ({
  title,
  value,
  description,
  href,
  icon: Icon,
  trend,
  progress,
  progressLabel,
}: DashboardStatCardProps) => {
  return (
    <Link
      href={href}
      className="
        group
        flex
        min-h-36
        gap-4
        rounded-2xl
        border
        border-border
        bg-card
        p-5
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-primary/30
        hover:shadow-md
      "
    >
      {/* Icon */}
      <div
        className="
          flex
          h-full
          w-15
          shrink-0
          items-center
          justify-center
       
        "
      >
        <div
          className=" h-18
          w-15
          shrink-0 flex   items-center
          justify-center
          rounded-xl
          bg-green-100
          text-green-900
             transition-colors
          duration-300
          group-hover:bg-primary
          group-hover:text-primary-foreground
          "
        >
          <Icon size={28} />
        </div>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col ">
        <p className="text-sm font-medium text-muted-foreground mb-2">
          {title}
        </p>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight">{value}</span>

          <span className="text-sm text-muted-foreground">{description}</span>
        </div>

        {/* Trend */}
        {trend && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            <span
              className={
                trend.positive
                  ? "font-semibold text-emerald-600 dark:text-emerald-400"
                  : "font-semibold text-red-600 dark:text-red-400"
              }
            >
              {trend.value}
            </span>

            {trend.label && (
              <span className="text-muted-foreground">{trend.label}</span>
            )}
          </div>
        )}

        {/* Progress */}
        {progress !== undefined && (
          <div className="mt-auto pt-3">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                {progressLabel}
              </span>

              <span className="text-xs font-semibold text-primary">
                {progress}%
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-800 transition-all duration-500"
                style={{
                  width: `${Math.min(Math.max(progress, 0), 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default DashboardStatCard;
