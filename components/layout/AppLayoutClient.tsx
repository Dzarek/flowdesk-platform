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
  activePromotions: ActivePromotion[];
};

export default function AppLayoutClient({
  children,
  role,
  userName,
  activePromotions,
}: AppLayoutClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen relative w-full overflow-x-hidden bg-[var(--greenBg)] text-[#191C1A] p-4">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <AppSidebar
        role={role}
        activePromotions={activePromotions}
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

        <main className="relative min-h-screen py-16 lg:pt-10 w-full px-10 bg-[#F7F8F7] rounded-2xl overflow-hidden">
          {/* <div className="absolute inset-0 bg-gradient-to-br from-[#E8E2D5]/90 via-[#E8E2D5]/10 to-[#D9C6A6]/90 " />

          <div className="absolute  h-[500px] w-[500px] rounded-full bg-[#78917A]/20 blur-[120px]" />

          <div className="absolute  h-[500px] w-[500px] rounded-full bg-[#C47B5A]/15 blur-[120px]" /> */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover opacity-[0.5]"
          >
            <source src="/videos/videoBg4.webm" type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-[#244C3B]/20 via-[#E8E2D5]/60 to-[#244C3B]/60 " />

          <div className="z-10 relative">{children}</div>
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
          flex
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
