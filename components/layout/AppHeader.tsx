"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";

import { FaChevronDown, FaUser } from "react-icons/fa";

import {
  MdArrowForward,
  MdClose,
  MdLogout,
  MdMenu,
  MdNotificationsNone,
  MdOutlineSearch,
  MdSettings,
} from "react-icons/md";

type AppHeaderProps = {
  user: {
    name: string;
    role: "USER" | "ADMIN";
  };
  onMobileMenuOpen: () => void;
};

const pageTitles: Record<string, string> = {
  "/dashboard": "Pulpit",
  "/historia": "Historia promocji",
  "/konto": "Ustawienia konta",
  "/admin/banki": "Lista banków",
  "/admin/promocje": "Lista promocji",
};

const mockNotifications = [
  {
    id: 1,
    title: "Witaj w LifeHub!",
    description: "Tutaj będą pojawiać się Twoje powiadomienia.",
    time: "Teraz",
  },
];

export default function AppHeader({ user, onMobileMenuOpen }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  let title = pageTitles[normalizedPath];

  if (!title && normalizedPath.startsWith("/promocje/")) {
    title = "Moja promocja";
  }

  if (!title && normalizedPath.startsWith("/cameras")) {
    title = "Kamery domowe";
  }

  if (!title) {
    title = "LifeHub";
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsNotificationsOpen(false);
        searchRef.current?.blur();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = search.trim();
    if (!query) return;

    // Interfejs przygotowany pod przyszłe wyszukiwanie.
    // Po utworzeniu strony wyszukiwania można użyć:
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="relative z-30 mb-4 flex h-16 items-center gap-3 rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA]  px-3 text-[#263C35] shadow-sm sm:px-5 lg:h-[72px] lg:px-10">
      <div className="absolute rounded-2xl inset-0 -z-10 bg-gradient-to-br from-[#244C3B]/20 via-[#E8E2D5]/60 to-[#244C3B]/20 " />

      {/* Lewa strona */}
      <div className="flex flex-1 min-w-0 shrink-0 items-center gap-3">
        {/* Wyszukiwarka */}
        <form
          onSubmit={handleSearch}
          role="search"
          className="hidden min-w-0 max-w-md flex-1 md:block"
        >
          <div className="group flex h-10 items-center gap-2 rounded-xl border border-[#DCE4D9] bg-[#F5F6EE] px-3 transition focus-within:border-[#287969] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#287969]/10">
            <MdOutlineSearch className="shrink-0 text-xl text-[#839087] transition group-focus-within:text-[#287969]" />

            <input
              ref={searchRef}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Szukaj..."
              aria-label="Szukaj w LifeHub"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#263C35] outline-none placeholder:text-[#839087]"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  searchRef.current?.focus();
                }}
                aria-label="Wyczyść wyszukiwanie"
                className="rounded-md p-1 text-[#839087] hover:bg-[#E2F0EB] hover:text-[#287969]"
              >
                <MdClose size={16} />
              </button>
            )}

            <kbd className="hidden rounded-md border border-[#DCE4D9] bg-white px-1.5 py-0.5 text-[10px] text-[#839087] lg:inline-block">
              Ctrl K
            </kbd>
          </div>
        </form>
      </div>

      {/* Prawa strona */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Powiadomienia */}
        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen((prev) => !prev);
              setIsUserMenuOpen(false);
            }}
            aria-label="Powiadomienia"
            aria-expanded={isNotificationsOpen}
            className={`relative flex size-10 items-center justify-center rounded-xl border transition ${
              isNotificationsOpen
                ? "border-[#B8CCB9] bg-[#E2F0EB] text-[#287969]"
                : "border-transparent text-[#52675D] hover:border-[#DCE4D9] hover:bg-[#F5F6EE]"
            }`}
          >
            <MdNotificationsNone size={23} />

            <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-[#FEFEFA] bg-[#D49B58]" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-3 w-[min(340px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] shadow-xl shadow-[#19483D]/10">
              <div className="flex items-center justify-between border-b border-[#DCE4D9] px-4 py-3">
                <h2 className="font-semibold text-[#19483D]">Powiadomienia</h2>
                <span className="rounded-full bg-[#E2F0EB] px-2 py-1 text-xs font-medium text-[#287969]">
                  {mockNotifications.length}
                </span>
              </div>

              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex gap-3 px-4 py-4 transition hover:bg-[#F5F6EE]"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#E2F0EB] text-[#287969]">
                    <MdNotificationsNone size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#263C35]">
                      {notification.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#839087]">
                      {notification.description}
                    </p>
                    <p className="mt-2 text-[11px] text-[#839087]">
                      {notification.time}
                    </p>
                  </div>
                </div>
              ))}

              <div className="border-t border-[#DCE4D9] p-2">
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-[#287969] transition hover:bg-[#E2F0EB]"
                >
                  Zamknij
                  <MdArrowForward size={17} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="hidden h-8 w-px bg-[#DCE4D9] sm:block" />

        {/* Menu użytkownika */}
        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setIsUserMenuOpen((prev) => !prev);
              setIsNotificationsOpen(false);
            }}
            aria-expanded={isUserMenuOpen}
            aria-label="Menu użytkownika"
            className="group flex items-center gap-2 rounded-xl border border-transparent px-1.5 py-1.5 transition hover:border-[#DCE4D9] hover:bg-[#F5F6EE] sm:gap-3 sm:px-2"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#E2F0EB] text-[#287969] ring-1 ring-[#287969]/10">
              <FaUser size={15} />
            </div>

            <div className="hidden max-w-36 text-left sm:block">
              <p className="truncate text-sm font-semibold text-[#263C35]">
                {user.name}
              </p>
              <p className="text-xs text-[#839087]">
                {user.role === "ADMIN" ? "Administrator" : "Użytkownik"}
              </p>
            </div>

            <FaChevronDown
              size={12}
              className={`hidden text-[#839087] transition-transform sm:block ${
                isUserMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-3 w-60 overflow-hidden rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] p-2 shadow-xl shadow-[#19483D]/10">
              <div className="border-b border-[#DCE4D9] px-3 py-3">
                <p className="truncate text-sm font-semibold text-[#19483D]">
                  {user.name}
                </p>
                <p className="mt-1 text-xs text-[#839087]">
                  {user.role === "ADMIN" ? "Administrator" : "Użytkownik"}
                </p>
              </div>

              <Link
                href="/konto"
                onClick={() => setIsUserMenuOpen(false)}
                className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#263C35] transition hover:bg-[#E2F0EB]"
              >
                <MdSettings size={20} className="text-[#287969]" />
                Ustawienia konta
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#A45D4D] transition hover:bg-[#F8ECE8]"
              >
                <MdLogout size={20} />
                Wyloguj się
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
