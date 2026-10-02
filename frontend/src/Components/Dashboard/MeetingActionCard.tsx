import type { ReactNode } from "react"
import { IconArrowRight } from "@tabler/icons-react"
import { Button } from "../Button"
import { useTheme } from "../ThemeProvider"

export type MeetingAction = "create" | "join" | "schedule"

type MeetingActionCardProps = {
    action: MeetingAction
    title: string
    description: string
    buttonLabel: string
    icon: ReactNode
    onSelect: (action: MeetingAction) => void
    featured?: boolean
}

export const MeetingActionCard = ({ action, title, description, buttonLabel, icon, onSelect, featured = false }: MeetingActionCardProps) => {
    const { theme } = useTheme()
    const isDark = theme === "dark"
    const cardTheme = featured
        ? isDark
            ? "border-[#405148] bg-[#20352d] text-white"
            : "border-gather-forest bg-gather-forest text-white"
        : isDark
            ? "border-[#394a41] bg-[#202d27] text-gather-ink"
            : "border-[#e2e7df] bg-white text-gather-ink"
    const iconTheme = featured
        ? "bg-white/10 text-gather-lime"
        : isDark
            ? "bg-[#304038] text-[#c9e79f]"
            : "bg-[#f0f4ec] text-gather-forest"
    const actionButtonTheme = featured
        ? isDark
            ? "border-[#c9e79f] bg-[#c9e79f] text-[#1c2b23] hover:border-[#d9efbb] hover:bg-[#d9efbb]"
            : "border-white/20 bg-white text-gather-forest hover:border-white hover:bg-[#f2f5ec]"
        : isDark
            ? "border-[#405148] bg-[#25332d] text-[#c9e79f] hover:border-[#617667] hover:bg-[#304038]"
            : "border-[#dfe4dc] bg-white text-gather-forest hover:border-[#b9ce9d] hover:bg-[#f5f8ef]"

    return (
        <article
            className={`
                flex min-h-[240px] flex-col rounded-[7px] border p-6 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(28,54,46,0.09)] max-[600px]:min-h-0 
                ${cardTheme}`
            }
        >
            <span className={`mb-5 grid h-11 w-11 place-items-center rounded-[5px] ${iconTheme}`}>{icon}</span>
            <h2 className="m-0 font-display text-[19px] font-bold leading-tight">{title}</h2>
            <p className={`mb-5 mt-2 text-[11px] leading-[1.65] ${featured ? "text-white/75" : "text-gather-muted"}`}>{description}</p>
            <Button
                onClick={() => onSelect(action)}
                title={buttonLabel}
                variant="custom"
                className={`mt-auto min-h-10 w-full text-[11px] ${actionButtonTheme}`}
            >
                <IconArrowRight aria-hidden="true" size={16} stroke={1.8} />
            </Button>
        </article >
    )
}