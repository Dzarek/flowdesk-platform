"use client";

import { FaMoon, FaSun } from "react-icons/fa";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      className="flex justify-start items-center gap-3 rounded-lg
                      px-4 py-2 cursor-pointer text-sm font-medium
                      transition-colors text-slate-300 bg-transparent hover:bg-white/10 hover:text-white w-full"
      onClick={toggleTheme}
    >
      {resolvedTheme === "dark" ? (
        <FaSun className="mr-2 h-2 w-2" />
      ) : (
        <FaMoon className="mr-2 h-2 w-2" />
      )}
      {resolvedTheme === "dark" ? "Jasny Motyw" : "Ciemny Motyw"}
    </Button>
  );
};

export default ThemeToggle;
