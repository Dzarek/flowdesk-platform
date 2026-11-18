"use client";

import { ReactNode, useState } from "react";

import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";

import Image from "next/image";

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

type AppLayoutClientProps = {
  children: ReactNode;
  role: UserRole;
  userName: string;
};

export default function AppLayoutClient({
  children,
  role,
  userName,
}: AppLayoutClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen relative w-full overflow-x-hidden bg-[var(--greenBg)] text-[#191C1A] p-2 xl:p-4">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <AppSidebar
        role={role}
        user={{
          name: userName,
          role,
        }}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* =====================================================
          GŁÓWNA CZĘŚĆ
      ====================================================== */}

      <div className="min-h-screen lg:pl-[260px] w-full bg-[var(--greenBg)]">
        <AppHeader
          user={{
            name: userName,
            role,
          }}
          onMobileMenuOpen={() => setIsMobileSidebarOpen(true)}
        />

        <main className="relative min-h-screen xl:py-10 lg:pt-10 w-full xl:px-10 xl:pb-8 rounded-2xl overflow-hidden bg-[#F5F0E7]">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover opacity-[0.2] rounded-2xl"
          >
            <source src="/videos/videoBg4.webm" type="video/webm" />
          </video>

          <div className="relative ">{children}</div>
        </main>
      </div>
      {/* =====================================================
          PORTFOLIO
      ====================================================== */}

      <a
        href="https://jarekjanas.com"
        target="_blank"
        rel="noopener noreferrer"
        className="
          absolute bottom-6 right-8 z-20
           items-center gap-2
          text-xs font-semibold lowercase
          text-zinc-700 transition duration-300
          hover:text-zinc-900
          hidden xl:flex
        "
      >
        Projekt i Wykonanie
        <Image
          src="https://jarekjanas.com/logo192.png"
          alt="logoJarek"
          width={20}
          height={20}
          className="h-5 w-5 object-cover transition duration-300 hover:invert"
        />
      </a>
    </div>
  );
}
