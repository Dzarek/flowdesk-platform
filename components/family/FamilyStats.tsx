import type { IconType } from "react-icons";
import {
  MdPeopleOutline,
  MdOutlinePerson,
  MdOutlineChildCare,
} from "react-icons/md";

type StatCardProps = {
  icon: IconType;
  value: number;
  label: string;
  iconBg: string;
  iconColor: string;
};

function StatCard({
  icon: Icon,
  value,
  label,
  iconBg,
  iconColor,
}: StatCardProps) {
  return (
    <div className="flex min-w-0 items-center justify-center gap-2 xl:gap-3 rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] p-3 xl:p-4">
      <div
        className={`flex h-10 w-10 xl:h-12 xl:w-12 shrink-0 items-center justify-center rounded-full ${iconBg} ${iconColor}`}
      >
        <Icon className="size-5 xl:size-6" />
      </div>
      <p className="text-xl xl:text-xl font-extrabold leading-none text-[#263C35]">
        {value}
      </p>
      <div className="min-w-0">
        <p className="mt-1 text-sm text-[#839087]">{label}</p>
      </div>
    </div>
  );
}

export default function FamilyStats({
  total,
  adults,
  childrenF,
}: {
  total: number;
  adults: number;
  childrenF: number;
}) {
  return (
    <div className="mt-6 flex flex-wrap justify-center xl:justify-start gap-2 xl:gap-3">
      <div className="w-[60%] xl:w-auto">
        <StatCard
          icon={MdPeopleOutline}
          value={total}
          label="Osoby"
          iconBg="bg-[#E4EEDC]"
          iconColor="text-[var(--greenText)]"
        />
      </div>
      <StatCard
        icon={MdOutlinePerson}
        value={adults}
        label="Dorosłych"
        iconBg="bg-[#FBE9E2]"
        iconColor="text-[#C86F53]"
      />
      <StatCard
        icon={MdOutlineChildCare}
        value={childrenF}
        label="Dzieci"
        iconBg="bg-[#E4EDF8]"
        iconColor="text-[#5876A5]"
      />
    </div>
  );
}
