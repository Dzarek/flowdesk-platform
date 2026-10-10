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
      variant="ghost"
      className="justify-start text-white text-lg px-4"
      onClick={toggleTheme}
    >
      {resolvedTheme === "dark" ? (
        <FaSun className="mr-2 h-4 w-4" />
      ) : (
        <FaMoon className="mr-2 h-4 w-4" />
      )}
      {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
    </Button>
  );
};

export default ThemeToggle;
