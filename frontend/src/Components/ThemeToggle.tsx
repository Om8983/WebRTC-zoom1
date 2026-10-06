import { IconMoon, IconSun } from "@tabler/icons-react"
import { useTheme } from "./ThemeProvider"

export const ThemeToggle = ({ disabled = false }: { disabled?: boolean }) => {
    const { theme, toggleTheme } = useTheme()
    const nextTheme = theme === "light" ? "dark" : "light"
    const themeClasses = theme === "dark"
        ? "border-[#405148] bg-[#25332d] text-[#c9e79f] hover:bg-[#304038]"
        : "border-[#dfe4dc] bg-white/70 text-gather-forest hover:bg-[#f1f5ec]"
    return (
        <button
            aria-label={`Switch to ${nextTheme} mode`}
            className={`grid h-9 w-9 place-items-center rounded-full border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gather-forest disabled:cursor-not-allowed disabled:opacity-50 ${themeClasses}`}
            onClick={toggleTheme}
            title={`Switch to ${nextTheme} mode`}
            disabled={disabled}
            type="button"
        >
            {theme === "light"
                ? <IconMoon aria-hidden="true" className="h-[17px] w-[17px]" stroke={1.7} />
                : <IconSun aria-hidden="true" className="h-[17px] w-[17px]" stroke={1.7} />}
        </button>
    )
}