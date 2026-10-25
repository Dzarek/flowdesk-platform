"use client";

import React, { useState } from "react";
import {
  JEDZENIE,
  CHEMIA,
  PopularProductIconItem,
} from "@/constants/popularProducts";
import Image from "next/image";

interface QuickAddGridProps {
  onAddProduct: (
    name: string,
    category: "spożywcze" | "chemia" | "inne",
  ) => void;
}

const SUBCATEGORY_BORDERS: Record<string, string> = {
  pieczywo:
    "border-amber-200 hover:border-amber-400 bg-amber-50/50 text-amber-900",
  nabiał: "border-sky-200 hover:border-sky-400 bg-sky-50/50 text-sky-900",
  owoce:
    "border-orange-200 hover:border-orange-400 bg-orange-50/50 text-orange-900",
  warzywa:
    "border-green-200 hover:border-green-400 bg-green-50/50 text-green-900",
  mięso: "border-red-200 hover:border-red-400 bg-red-50/50 text-red-900",
  przekąski:
    "border-purple-200 hover:border-purple-400 bg-purple-50/50 text-purple-900",
  napoje: "border-gray-200 hover:border-gray-400 bg-gray-50/80 text-gray-900",
  inne: "border-zinc-200 hover:border-zinc-400 bg-zinc-400/20 text-zinc-900",
  higiena:
    "border-purple-200 hover:border-purple-400 bg-purple-50/20 text-purple-900",
  sprzątanie:
    "border-rose-200 hover:border-rose-400 bg-rose-50/20 text-rose-900",
};

export const QuickAddGrid: React.FC<QuickAddGridProps> = ({ onAddProduct }) => {
  // Aktywna zakładka główna: 'jedzenie' lub 'chemia'
  const [activeTab, setActiveTab] = useState<"jedzenie" | "chemia">("jedzenie");

  const currentProducts = activeTab === "jedzenie" ? JEDZENIE : CHEMIA;
  const mainCategoryParam = activeTab === "jedzenie" ? "spożywcze" : "chemia";

  // Funkcja grupująca produkty po kluczu 'category' (podkategorii)
  const groupedProducts = currentProducts.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, PopularProductIconItem[]>,
  );

  return (
    <div className="space-y-4 overflow-hidden rounded-3xl border border-[#DCE4D9] bg-[#FEFEFA]">
      {/* ZAKŁADKI GŁÓWNE */}
      <div className="flex gap-3 border-b border-[#DCE4D9] bg-[#F5F6EE] p-4">
        <button
          onClick={() => setActiveTab("jedzenie")}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
            activeTab === "jedzenie"
              ? "bg-[#287969] text-white"
              : "border border-[#DCE4D9] bg-[#FEFEFA] text-[#839087] hover:bg-[#E2F0EB]"
          }`}
        >
          Jedzenie
        </button>
        <button
          onClick={() => setActiveTab("chemia")}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
            activeTab === "chemia"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-slate-50 border border-zinc-500 text-slate-500 hover:bg-slate-100"
          }`}
        >
          Chemia
        </button>
      </div>

      {/* DYNAMICZNE SEKCJE PODKATEGORII */}
      <div className="space-y-5 p-4 ">
        {Object.entries(groupedProducts).map(([subCategory, items]) => {
          const borderClass =
            SUBCATEGORY_BORDERS[subCategory] ||
            "border-slate-200 hover:border-slate-400 bg-slate-50/20";

          return (
            <div key={subCategory} className="space-y-2">
              {/* Mały podnagłówek podkategorii */}
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">
                {subCategory}
              </h4>

              {/* Siatka kafelków wewnątrz podkategorii */}
              <div className="grid grid-cols-6 gap-2">
                {items.map((product, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAddProduct(product.alt, mainCategoryParam)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border border-dashed transition-all active:scale-90 active:saturate-0 text-center min-h-[76px] ${borderClass}`}
                  >
                    <Image
                      src={product.src}
                      alt={product.alt}
                      width={40}
                      height={40}
                      className="w-8 h-8 object-contain mb-1 drop-shadow-sm"
                      loading="lazy"
                    />
                    <span className="text-[11px] font-semibold leading-tight capitalize truncate w-full">
                      {product.alt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <footer className="bg-[var(--greenBg)] text-white text-center text-xs p-2">
        <p>Ikony produktów: https://icons8.com</p>
      </footer>
    </div>
  );
};

export default QuickAddGrid;
