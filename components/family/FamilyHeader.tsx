import Image from "next/image";
import { MdFamilyRestroom } from "react-icons/md";
import FamilyStats from "./FamilyStats";

type Props = {
  familyName: string;
  total: number;
  adults: number;
  childrenF: number;
};

export default function FamilyHeader({
  familyName,
  total,
  adults,
  childrenF,
}: Props) {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-[#F5F6EE]">
      <div className=" relative z-10 grid items-center gap-5 px-5 lg:min-h-[330px] lg:grid-cols-2 lg:pl-10">
        <div className="py-8">
          <div className="mb-4 flex items-center ml-2 xl:ml-0 gap-2 text-sm font-semibold text-[var(--greenTextLight)]">
            <MdFamilyRestroom size={20} />
            <span>To my!</span>
          </div>
          <h1 className="text-2xl uppercase text-center xl:text-left font-bold tracking-tight text-[var(--greenText)] sm:text-4xl">
            Rodzina {familyName}
          </h1>
          <p className="mt-4 text-center xl:text-left max-w-lg mx-auto xl:mx-0 text-base leading-7 text-[#718078]">
            Wspólne obowiązki, plany i ważne chwile. Zarządzaj członkami rodziny
            i budujcie razem lepiej zorganizowany dom.
          </p>
          <FamilyStats total={total} adults={adults} childrenF={childrenF} />
        </div>
        <div className="relative hidden h-full lg:block">
          <Image
            src="/images/family-illustration.png"
            alt="Ilustracja rodziny spędzającej wspólnie czas"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 0px"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
