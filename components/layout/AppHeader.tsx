"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { FaChevronDown, FaUser } from "react-icons/fa";
import { MdLogout, MdMenu, MdSettings } from "react-icons/md";

import Link from "next/link";
// import NotificationBell from "../notifications/NotificationBell";

type AppHeaderProps = {
  user: {
    name: string;
    role: "USER" | "ADMIN";
  };

  onMobileMenuOpen: () => void;
};

const pageTitles: Record<string, string> = {
  "/dashboard/": "Pulpit",
  "/historia/": "Historia promocji",
  "/konto/": "Ustawienia konta",
  "/admin/banki/": "Lista Banków",
  "/admin/promocje/": "Lista Promocji",
};

export default function AppHeader({ user, onMobileMenuOpen }: AppHeaderProps) {
  const pathname = usePathname();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  let title = pageTitles[pathname];

  if (!title && pathname.startsWith("/promocje/")) {
    title = "Moja promocja";
  }

  if (!title) {
    title = "BankoŁowca";
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/",
    });
  };

  return (
    <header className="mb-2 rounded-2xl flex h-16 items-center justify-between bg-[#F7F8F7] px-4 text-[#191C1A] lg:left-[276px] lg:h-18 lg:px-0 lg:pr-8 lg:pl-2">
      {" "}
      {/* Lewa strona */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Hamburger mobile */}

        <button
          type="button"
          onClick={onMobileMenuOpen}
          aria-label="Otwórz menu"
          className="
            flex size-10 shrink-0 items-center justify-center
            rounded-xl text-slate-300
            transition hover:bg-white/10 hover:text-white
            lg:hidden
          "
        >
          <MdMenu size={21} />
        </button>

        {/* Separator desktop */}

        <div className="hidden h-8 w-[2px] mr-4 bg-white/10 lg:block" />

        {/* Tytuł */}

        <h2 className="truncate text-sm font-medium uppercase  sm:text-lg">
          {title}
        </h2>
      </div>
      {/* Prawa strona */}
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        {/* Powiadomienia */}

        {/* <NotificationBell /> */}

        {/* Separator desktop */}

        <div className="hidden h-8 w-px bg-white/10 sm:block" />

        {/* User dropdown desktop */}

        <div ref={userMenuRef} className="relative hidden lg:block">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            aria-expanded={isUserMenuOpen}
            className="
              group flex cursor-pointer items-center gap-3
              rounded-xl px-2 py-1.5
              transition-colors hover:bg-white/10
            "
          >
            {/* Avatar */}

            <div className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-zinc-800 text-white">
              <FaUser size={19} />
            </div>

            {/* Dane */}

            <div className="text-left">
              <p className="text-sm font-semibold text-[#191C1A] ">
                {user.name}
              </p>

              {/* <p className="text-xs text-slate-500">
                {user.role === "ADMIN" ? "Administrator" : "Użytkownik"}
              </p> */}
            </div>

            <FaChevronDown
              size={16}
              className={`text-slate-400 transition-transform ${
                isUserMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Menu */}

          {isUserMenuOpen && (
            <div className="absolute z-20 right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-black/20">
              <Link
                href="/konto"
                className="flex w-full cursor-pointer
                  items-center gap-1 rounded-lg py-1
                  text-sm font-medium hover:bg-zinc-100"
              >
                <div className="flex size-10 shrink-0 items-center justify-center  text-zinc-900">
                  <MdSettings size={18} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-800">
                    Edytuj Profil
                  </p>

                  {/* <p className="text-sm text-zinc-500">
                    {user.role === "ADMIN" ? "Administrator" : "Użytkownik"}
                  </p> */}
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="
                  mt-1 flex w-full cursor-pointer
                  items-center gap-3 rounded-lg px-3 py-2.5
                  text-sm font-medium text-red-600
                  transition-colors hover:bg-red-50
                "
              >
                <MdLogout size={18} />
                Wyloguj się
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
