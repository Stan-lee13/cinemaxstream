import React from "react"
import { Theme } from "./themeUtils"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const ThemeContext = React.createContext<ThemeContextType | undefined>(
  undefined
)

export const useTheme = () => {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export default useTheme
