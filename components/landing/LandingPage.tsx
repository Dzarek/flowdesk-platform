import Image from "next/image";
import {
  FiActivity,
  FiCalendar,
  FiCheckCircle,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import { FaLeaf, FaShoppingBasket } from "react-icons/fa";

import AuthForm from "./AuthForm";
import LoginScrollButton from "./LoginScrollButton";
import Link from "next/link";
import Logo from "../layout/Logo";
import FloatingIcons from "./FloatingIcons";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen scroll-smooth overflow-hidden bg-[#F5F0E7] text-[#29372E]">
      {/* TŁO */}

      <div className="pointer-events-none fixed inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-[0.2]"
        >
          <source src="/videos/videoBg4.webm" type="video/webm" />
        </video>
      </div>

      {/* GŁÓWNY UKŁAD */}

      <div className="relative z-10 mx-auto grid grid-cols-1 min-h-screen w-full lg:grid-cols-[1.25fr_0.75fr]">
        {/* LEWA STRONA */}

        <section className="relative isolate flex flex-col justify-center pb-[70px] lg:pb-0 pr-4 pl-4 py-8 sm:pr-10 sm:pl-[5vw] xl:pr-20 [1600px]:pl-[7vw]">
          <div className="absolute z-0 inset-0 bg-gradient-to-br from-[#223630] via-[#223630]/80 to-[#223630]/90 rounded-b-[100px] lg:rounded-b-none lg:rounded-tr-[600px]" />

          <FloatingIcons />
          {/* Logo */}
          <div className="relative z-20">
            <Link href="/" className="group flex w-fit items-center gap-3">
              <Logo />
            </Link>

            {/* Nagłówek */}

            <div className="mt-10 lg:mt-6 [1600px]:mt-10">
              <div className="mb-6 flex w-4/5 lg:w-auto mx-auto lg:inline-flex justify-center items-center gap-2 rounded-full border border-[#244C3B]/15 bg-[#FFFEFA] px-4 py-2 text-xs font-semibold text-[#42634D] backdrop-blur">
                <FaLeaf size={15} />
                <span>Więcej harmonii na co dzień</span>
              </div>

              <h1 className="text-3xl font-semibold leading-[1.12] tracking-wider text-[#acc39e] sm:text-5xl [1600px]:text-6xl text-center lg:text-left">
                Wszystko, co ważne.
                <span className="mt-2 block font-serif font-medium tracking-tight italic text-[#eae3d0]">
                  W jednym miejscu.
                </span>
              </h1>
              {/* text-[#819B72] */}
              <p className="mt-4 [1600px]:mt-7 ml-2 text-base leading-8 text-[#FFFEFA] font-medium [1600px]:text-lg text-justify lg:text-left">
                Rodzina, codzienne obowiązki, wspólne plany i Twój dom. Life Hub
                pomaga Ci uporządkować codzienność, żeby mieć więcej czasu na
                to, co naprawdę się liczy.
              </p>
            </div>

            {/* CTA */}

            <LoginScrollButton />

            {/* KORZYŚCI */}

            <div className="mt-4 px-3 lg:px-0 [1600px]:mt-10 grid grid-cols-1 gap-y-3 lg:pr-14 gap-x-3 sm:grid-cols-2">
              <Feature
                icon={FiCalendar}
                title="Wspólny kalendarz"
                description="Ważne daty i plany całej rodziny."
              />

              <Feature
                icon={FiCheckCircle}
                title="Codzienne zadania"
                description="Obowiązki, terminy i domowe sprawy."
              />

              <Feature
                icon={FaShoppingBasket}
                title="Lista zakupów"
                description="Wszystko, czego potrzebujecie, pod ręką."
              />

              <Feature
                icon={FiActivity}
                title="Inteligentny dom"
                description="Energia, urządzenia i domowe statystyki."
              />
            </div>

            {/* DODATKOWY AKCENT */}

            <div className="hidden [1600px]:flex items-center gap-3 text-sm text-[#827C6F]">
              <div className="flex -space-x-2">
                <div className="flex size-8 items-center justify-center rounded-full border-2 border-[#F5F0E7] bg-[#D7B978]">
                  <FiUsers size={14} className="text-[#453F34]" />
                </div>

                <div className="flex size-8 items-center justify-center rounded-full border-2 border-[#F5F0E7] bg-[#DDE5D9]">
                  <FiShield size={14} className="text-[#244C3B]" />
                </div>
              </div>

              <p className="text-[#53554d] font-medium">
                Jedna przestrzeń.{" "}
                <span className="text-[#244C3B]">Cała rodzina.</span>
              </p>
            </div>
          </div>
        </section>

        {/* PRAWA STRONA — LOGOWANIE */}

        <section
          id="logowanie"
          className="relative flex items-center justify-center px-5 pt-10 pb-16 sm:px-10 lg:px-12 [1600px]:pt-16"
        >
          <div className="relative w-full max-w-md">
            <div className="mb-8 text-center">
              <h2 className="mt-3 uppercase text-xl tracking-[0.2em] [1600px]:text-3xl font-semibold text-[var(--greenText)]">
                Dobrze, że jesteś.
              </h2>
            </div>
            <div className="w-full lg:w-[400px] mx-auto [1600px]:w-auto">
              <AuthForm />
            </div>
            <p className="hidden [1600px]:block mt-6 text-center text-sm text-[#524d43]">
              Twoja rodzina. Wasze plany. Wasz dom.
            </p>
          </div>
        </section>
      </div>

      {/* STOPKA */}

      <a
        href="https://jarekjanas.com/"
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-3 right-4 z-20 flex items-center gap-2 text-xs text-[#524d43] transition hover:text-[#244C3B]"
      >
        Projekt i wykonanie
        <Image
          src="https://jarekjanas.com/logo192.png"
          alt="Logo autora"
          width={20}
          height={20}
          className="size-5 object-cover"
        />
      </a>
    </main>
  );
}

/* ==========================================================
   FEATURE
========================================================== */

type FeatureProps = {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
  description: string;
};

function Feature({ icon: Icon, title, description }: FeatureProps) {
  return (
    <div className="group relative isolate overflow-hidden rounded-[24px] border border-[#244C3B]/8 bg-[#FFFEFA] p-4 [1600px]:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#244C3B]/15 hover:bg-[#FFFEFA] hover:shadow-[0_16px_40px_-24px_rgba(36,76,59,0.3)]">
      {/* Organiczny akcent w tle */}
      <div className="pointer-events-none absolute -right-8 -top-8 -z-10 size-28 rounded-full bg-[#DCE7D9]/70 transition-transform duration-500 group-hover:scale-125" />

      <div className="flex items-start justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A806F]">
          {title === "Wspólny kalendarz"
            ? "01 / Plan"
            : title === "Codzienne zadania"
              ? "02 / Dzień"
              : title === "Lista zakupów"
                ? "03 / Dom"
                : "04 / Energia"}
        </span>
        <div className="text-[#42634D] transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110">
          <Icon size={23} strokeWidth={1.5} />
        </div>
      </div>

      <div className="[1600px]:mt-2">
        <h3 className="text-base font-semibold tracking-tight text-[#29372E] [1600px]:text-lg">
          {title}
        </h3>

        <p className="mt-1 text-xs [1600px]:text-sm leading-6 text-[#77766C]">
          {description}
        </p>
      </div>
    </div>
  );
}
