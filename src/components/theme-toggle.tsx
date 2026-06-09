"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Palette } from "lucide-react";

const accents = [
  { name: "blue", color: "bg-blue-600" },
  { name: "purple", color: "bg-purple-600" },
  { name: "green", color: "bg-green-600" },
  { name: "rose", color: "bg-rose-600" },
  { name: "amber", color: "bg-amber-500" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const setAccent = (name: string) => {
    document.documentElement.setAttribute("data-accent", name);
    localStorage.setItem("accent-color", name);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="relative flex items-center justify-center w-9 h-9 rounded-full border bg-card hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shadow-sm"
          title="Alternar tema"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full border bg-card hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shadow-sm"
          title="Elegir color de acento"
        >
          <Palette className="h-4 w-4" />
          <span className="sr-only">Elegir color</span>
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 p-2 bg-card border rounded-xl shadow-lg flex gap-2 z-50 animate-in fade-in slide-in-from-top-2">
          {accents.map((accent) => (
            <button
              key={accent.name}
              onClick={() => setAccent(accent.name)}
              className={`w-6 h-6 rounded-full ${accent.color} border-2 border-transparent hover:scale-110 transition-transform`}
              title={accent.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
