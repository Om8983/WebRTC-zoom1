import { Brand } from "../Brand"
import { AccountMenu } from "./AccountMenu.tsx"
import { ThemeToggle } from "../ThemeToggle"
import { useTheme } from "../ThemeProvider"

export const DashboardHeader = () => {
    const { theme } = useTheme()

    return (
        <header className={`mx-auto flex h-[78px] max-w-[1180px] items-center justify-between border-b max-[600px]:h-[68px] ${theme === "dark" ? "border-[#394a41]" : "border-[#dfe4dc]"}`}>
            <Brand className="text-[21px] text-gather-forest" to="/" />
            <div className="flex items-center gap-5 max-[520px]:gap-2">
                <ThemeToggle />
                <AccountMenu />
            </div>
        </header >
    )
}