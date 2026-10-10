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
    <div className="min-h-screen relative w-full overflow-x-hidden">
      {/* =====================================================
          TŁO
      ====================================================== */}

      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 -z-10 h-full w-full object-cover opacity-30"
      >
        <source src="/videos/bgVideo.mp4" type="video/mp4" />
      </video>

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      {/* <AppSidebar
        role={role}
        activePromotions={activePromotions}
        user={{
          name: userName,
          role,
        }}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      /> */}

      {/* =====================================================
          GŁÓWNA CZĘŚĆ
      ====================================================== */}

      <div className="min-h-screen lg:pl-[260px] w-full">
        <AppHeader
          user={{
            name: userName,
            role,
          }}
          onMobileMenuOpen={() => setIsMobileSidebarOpen(true)}
        />

        <main className="min-h-screen pt-16 lg:pt-20 w-full">{children}</main>
      </div>
      {/* =====================================================
          PORTFOLIO
      ====================================================== */}

      <a
        href="https://jarekjanas.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="
          absolute bottom-2 right-2 z-20
           items-center gap-2
          text-xs font-semibold lowercase
          text-zinc-700 transition duration-300
          hover:text-zinc-900
          flex
        "
      >
        Projekt i Wykonanie
        <Image
          src="/images/logoJarek.png"
          alt="logoJarek"
          width={20}
          height={20}
          className="h-5 w-5 object-cover transition duration-300 hover:invert"
        />
      </a>
    </div>
  );
}
