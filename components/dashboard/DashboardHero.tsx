import {
  MdOutlineCalendarMonth,
  MdOutlineChecklist,
  MdOutlineShoppingCart,
  MdOutlineWbSunny,
  MdOutlineAutoAwesome,
} from "react-icons/md";

type DashboardHeroProps = {
  data: {
    user: {
      firstName: string;
    };
    weather: {
      temperature: number;
    };
    summary: {
      events: number;
      tasks: number;
      shopping: number;
    };
    ai: {
      text: string;
    };
  };
};

export const welcomeData = {
  user: {
    firstName: "Jarek",
  },

  weather: {
    temperature: 24,
    icon: "sun",
  },

  summary: {
    events: 2,
    tasks: 5,
    shopping: 8,
  },

  ai: {
    text: "Great weather for cycling. High PV production expected. Don't forget your dentist appointment at 15:30.",
  },
};

export default function DashboardHero({ data }: DashboardHeroProps) {
  const today = new Date().toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <section className="px-4 py-2">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-4">
          <div>
            <h1 className="text-2xl text-[var(--greenText)] font-semibold tracking-tight">
              Dzień dobry, {data.user.firstName} !{" "}
              <span className="mr-2">👋</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
            <p className="text-muted-foreground capitalize">{today}</p>
            <MdOutlineWbSunny className="text-2xl text-yellow-500" />

            <span className="font-semibold">{data.weather.temperature}°C</span>
          </div>
        </div>
      </section>
      <div className="rounded-4xl border text-[var(--greenText)] border-border bg-card py-4 px-8 shadow-sm mb-4">
        <div className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <MdOutlineAutoAwesome className="text-2xl" />
          Podsumowanie AI
        </div>

        <p className="leading-7 text-muted-foreground">{data.ai.text}</p>
      </div>
    </div>
  );
}

type StatCardProps = {
  icon: React.ReactNode;
  value: number;
  label: string;
};

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="rounded-2xl border bg-background p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>

      <div className="text-3xl font-bold">{value}</div>

      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
