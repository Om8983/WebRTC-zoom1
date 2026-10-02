import React from 'react'
import { useTheme } from './ThemeProvider';

type BtnProps = {
    onClick: () => void;
    title: string;
    className?: string;
    children?: React.ReactElement;
    btnType?: "button" | "submit" | "reset";
    variant?: "primary" | "secondary" | "quiet" | "custom";
}

export const Button = ({ onClick, title, className = "", children, btnType = "button", variant = "secondary" }: BtnProps) => {
    const { theme } = useTheme()
    const isDark = theme === "dark"
    const buttonVariants = {
        primary: isDark
            ? "border-[#557064] bg-[#294f43] text-white hover:border-[#73917f] hover:bg-[#356252]"
            : "border-gather-forest bg-gather-forest text-white hover:border-gather-forest-deep hover:bg-gather-forest-deep",
        secondary: isDark
            ? "border-[#405148] bg-[#25332d] text-[#c9e79f] hover:border-[#617667] hover:bg-[#304038]"
            : "border-[#dfe4dc] bg-white text-gather-forest hover:border-[#b9ce9d] hover:bg-[#f5f8ef]",
        quiet: isDark
            ? "border-transparent bg-transparent text-[#c9e79f] hover:border-transparent hover:bg-[#25332d]"
            : "border-transparent bg-transparent text-gather-forest hover:border-transparent hover:bg-[#f5f8ef]",
        custom: "",
    }
    return (
        <button
            type={btnType}
            onClick={onClick}
            className={`inline-flex items-center justify-center gap-[7px] rounded-[5px] border px-[13px] py-[9px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gather-forest max-[380px]:px-[10px] max-[380px]:py-2 ${buttonVariants[variant]} ${className}`}>
            {title}
            {children}
        </button>
    )
}
