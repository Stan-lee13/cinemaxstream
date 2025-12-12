import React, { useState, useEffect, ReactNode } from "react";
import { THEME_STORAGE_KEY, Theme } from "./themeUtils";
import { ThemeContext } from "./themeContext";

// ThemeProvider is a component-only module (no named helpers exported from here)
// It reads/writes the theme to localStorage and sets the data-theme attribute.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      return (saved as Theme) || "default";
    } catch {
      // localStorage may be unavailable in some environments; fall back to default
      return "default";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      document.documentElement.setAttribute("data-theme", theme);
    } catch {
      // ignore storage errors silently (server/SSR or strict privacy settings)
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
