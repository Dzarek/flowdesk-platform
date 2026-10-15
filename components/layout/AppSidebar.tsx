"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { FaDatabase, FaWindowClose } from "react-icons/fa";
import { MdLogout, MdSettings } from "react-icons/md";

import ThemeToggle from "./ThemeToggle";
import NavMain from "./NavMain";
import LogoNav from "./LogoNav";

type UserRole = "USER" | "ADMIN";

type ActivePromotion = {
  id: string;
  name: string;
  bank: {
    id: string;
    name: string;
    color: string;
  };
};

type AppSidebarProps = {
  role: UserRole;
  activePromotions: ActivePromotion[];

  user: {
    name: string;
    role: UserRole;
  };

  isMobileOpen: boolean;
  onMobileClose: () => void;
};

export default function AppSidebar({
  role,
  user,
  isMobileOpen,
  onMobileClose,
}: AppSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/",
    });
  };

  const handleNavigation = () => {
    onMobileClose();
  };

  return (
    <>
      {/* Mobile overlay */}

      {isMobileOpen && (
        <button
          type="button"
          aria-label="Zamknij menu"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Sidebar */}

      <aside
        className={`
    fixed left-0 top-0 z-50
    flex h-screen w-screen flex-col
    bg-[var(--greenBg)] pl-6 pr-0 py-6 text-slate-100
    transition-transform duration-300
    overflow-y-auto sidebar-scroll
    lg:z-30
    lg:w-[260px]
    lg:translate-x-0
    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
  `}
      >
        {/* Mobile header */}

        <div className="mb-8 flex items-center justify-between lg:hidden">
          <Link
            href="/dashboard"
            onClick={handleNavigation}
            className="flex items-center gap-3"
          >
            <LogoNav />
          </Link>

          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Zamknij menu"
            className="
              flex size-10 items-center justify-center
              rounded-xl text-slate-400
              transition hover:bg-white/10 hover:text-white
            "
          >
            <FaWindowClose size={21} />
          </button>
        </div>

        {/* Desktop logo */}

        <Link
          href="/dashboard"
          onClick={handleNavigation}
          className="mb-4 hidden items-center gap-3 px-2 lg:flex"
        >
          <LogoNav />
        </Link>

        {/* Navigation */}

        <NavMain />

        {/* Administracja */}
        <div className="">
          {role === "ADMIN" && (
            <div className="mt-8 pt-2 xl:mt-3 mb-2">
              <Link
                href="/admin"
                onClick={handleNavigation}
                className={`
                      flex items-center gap-3 rounded-lg
                      px-4 py-2 text-sm font-medium
                      transition-colors uppercase

                      ${
                        pathname === "/admin"
                          ? "bg-white/15 text-white"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }
                    `}
              >
                <FaDatabase size={18} />
                Panel Admina
              </Link>
            </div>
          )}
          {/* Mobile user */}

          <div className="flex flex-col items-start w-full justify-start mb-6 rounded-2xl border border-white/10 bg-white/5 p-3 lg:hidden mt-10 gap-2">
            <Link
              href="/konto"
              onClick={handleNavigation}
              className="flex items-center gap-2"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-white">
                <MdSettings size={18} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-zinc-200">
                  {user.name} - Edytuj Profil
                </p>
              </div>
            </Link>
            <div className="h-[2px] w-full bg-zinc-600"></div>
            <button
              type="button"
              onClick={handleLogout}
              className="
               flex items-center justify-end gap-5
              rounded-xl px-3 py-2.5
              text-sm font-semibold text-red-400
              transition hover:bg-red-500/10
            "
            >
              <MdLogout size={18} />
              Wyloguj się
            </button>
          </div>
          {/* Bottom */}

          <div className="border-t border-white/10 pt-3">
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
