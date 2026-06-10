"use client";

import { useEffect, useState } from "react";
import { Coffee } from "lucide-react";

export function WeekendToggle() {
  const [isWeekend, setIsWeekend] = useState(false);

  useEffect(() => {
    // Load preference from localStorage or auto-detect weekend
    const saved = localStorage.getItem("nine_weekend_mode");
    if (saved !== null) {
      setIsWeekend(saved === "true");
    } else {
      const day = new Date().getDay();
      setIsWeekend(day === 0 || day === 6);
    }
  }, []);

  useEffect(() => {
    if (isWeekend) {
      document.documentElement.setAttribute("data-weekend", "true");
      localStorage.setItem("nine_weekend_mode", "true");
    } else {
      document.documentElement.removeAttribute("data-weekend");
      localStorage.setItem("nine_weekend_mode", "false");
    }
  }, [isWeekend]);

  return (
    <button
      onClick={() => setIsWeekend(!isWeekend)}
      className={`p-2 rounded-xl border transition-colors shadow-sm flex items-center justify-center gap-2 ${
        isWeekend 
          ? "bg-muted text-muted-foreground border-border" 
          : "bg-card hover:bg-muted text-muted-foreground"
      }`}
      title={isWeekend ? "Desactivar Modo Fin de Semana" : "Activar Modo Fin de Semana (Calma visual)"}
    >
      <Coffee className="h-4 w-4" />
      <span className="sr-only">Toggle Weekend Mode</span>
    </button>
  );
}
