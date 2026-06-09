"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // Manejador para el color de acento
  React.useEffect(() => {
    const savedAccent = localStorage.getItem("accent-color");
    if (savedAccent) {
      document.documentElement.setAttribute("data-accent", savedAccent);
    }
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
