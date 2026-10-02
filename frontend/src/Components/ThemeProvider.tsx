import { createContext, useContext, useLayoutEffect, useState } from "react"
import type { ReactNode } from "react"

type Theme = "light" | "dark"

type ThemeContextValue = {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
const themeStorageKey = "gather-theme"

const getStoredTheme = (): Theme => {
    try {
        return window.localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light"
    } catch {
        return "light"
    }
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<Theme>(getStoredTheme)

    useLayoutEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark")
        document.documentElement.style.colorScheme = theme
        try {
            window.localStorage.setItem(themeStorageKey, theme)
        } catch {
            // Continue with the in-memory theme when storage is unavailable.
        }
    }, [theme])

    const toggleTheme = () => setTheme((currentTheme) => currentTheme === "light" ? "dark" : "light")

    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) throw new Error("useTheme must be used within ThemeProvider")
    return context
}