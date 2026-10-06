import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { IconChevronDown, IconLogout } from "@tabler/icons-react"
import { useTheme } from "../ThemeProvider"
import axios, { AxiosError } from "axios"
import { toast } from "sonner"

export const AccountMenu = () => {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const logoutRef = useRef<HTMLButtonElement>(null)
    const navigate = useNavigate()
    const { theme } = useTheme()
    const isDark = theme === "dark"
    const triggerTheme = isDark
        ? "border-[#405148] bg-[#25332d] text-[#c9e79f] hover:bg-[#304038]"
        : "border-[#dce5d7] bg-white/70 text-[#234a43] hover:bg-[#f1f5ec]"
    const avatarTheme = isDark ? "bg-[#304038]" : "bg-[#edf2e8]"
    const dropdownTheme = isDark
        ? "border-[#405148] bg-[#202d27]"
        : "border-[#e2e7df] bg-white"
    const dividerTheme = isDark ? "border-[#394a41]" : "border-[#e8ece6]"
    const logoutTheme = isDark
        ? "text-[#f0a196] hover:bg-[#3a2a28] focus-visible:bg-[#3a2a28]"
        : "text-[#a14c43] hover:bg-[#fbf2f0] focus-visible:bg-[#fbf2f0]"

    useEffect(() => {
        if (!isOpen) return

        logoutRef.current?.focus()

        const handlePointerDown = (event: PointerEvent) => {
            if (event.target instanceof Node && !menuRef.current?.contains(event.target)) {
                setIsOpen(false)
            }
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false)
                triggerRef.current?.focus()
            }
        }

        document.addEventListener("pointerdown", handlePointerDown)
        document.addEventListener("keydown", handleKeyDown)
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown)
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [isOpen])

    const handleLogout = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {}, { withCredentials: true })
            if (res.status === 200) {
                setIsOpen(false)
                navigate("/login")
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error?.response?.status === 500) {
                    toast.error("Internal Server Error! Please try again.")
                }
            }
        }
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                aria-controls="account-menu"
                aria-expanded={isOpen}
                aria-haspopup="menu"
                aria-label="Open account menu"
                className={`flex h-10 items-center gap-2 rounded-full border p-1 pr-2.5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gather-forest ${triggerTheme}`}
                onClick={() => setIsOpen((open) => !open)}
                ref={triggerRef}
                type="button"
            >
                <span aria-hidden="true" className={`grid h-7 w-7 place-items-center rounded-full font-display text-xs font-bold ${avatarTheme}`}>G</span>
                <IconChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} stroke={1.8} />
            </button>

            {isOpen && (
                <div className={`absolute right-0 top-[calc(100%+10px)] z-40 w-[220px] overflow-hidden rounded-[7px] border py-1 shadow-[0_16px_40px_rgba(28,54,46,0.14)] ${dropdownTheme}`} id="account-menu" role="menu">
                    <div className={`border-b px-4 py-3 ${dividerTheme}`}>
                        <p className="m-0 text-xs font-semibold text-gather-ink">Your account</p>
                        <p className="mb-0 mt-1 text-[10px] text-gather-muted">Guest profile</p>
                    </div>
                    <button
                        className={`flex min-h-10 w-full items-center gap-2.5 px-4 text-left text-xs font-medium transition focus-visible:outline-none ${logoutTheme}`}
                        onClick={handleLogout}
                        ref={logoutRef}
                        role="menuitem"
                        type="button"
                    >
                        <IconLogout aria-hidden="true" className="h-4 w-4" stroke={1.8} />
                        Log out
                    </button>
                </div>
            )}
        </div>
    )
}