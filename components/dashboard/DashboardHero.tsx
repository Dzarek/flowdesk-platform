import { MdOutlineAutoAwesome } from "react-icons/md";

type DashboardHeroProps = {
  data: {
    user: {
      firstName: string;
    };
    ai: {
      text: string;
    };
  };
};

export default function DashboardHero({ data }: DashboardHeroProps) {
  return (
    <div className="flex min-w-0 flex-col">
      <section className="px-4 py-2">
        <div className="mb-4 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--greenText)]">
              Dzień dobry, {data.user.firstName}!{" "}
              <span className="mr-2">👋</span>
            </h1>
          </div>
        </div>
      </section>

      <div className="mb-4 flex flex-1 flex-col rounded-4xl border border-[var(--greenText)] bg-card px-8 py-4 text-[var(--greenText)] shadow-sm">
        {" "}
        <div className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <MdOutlineAutoAwesome className="text-2xl" />
          Podsumowanie AI
        </div>
        <p className="flex-1 leading-7 text-muted-foreground">{data.ai.text}</p>
      </div>
    </div>
  );
}
