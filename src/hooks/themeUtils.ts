export type Theme = "default" | "light" | "midnight" | "neon" | "sunrise" | "forest";

export const THEME_STORAGE_KEY = "cinemax-theme";

export const VALID_THEMES: Theme[] = ["default", "light", "midnight", "neon", "sunrise", "forest"];

export const isValidTheme = (theme: string): theme is Theme => {
  return VALID_THEMES.includes(theme as Theme);
};
