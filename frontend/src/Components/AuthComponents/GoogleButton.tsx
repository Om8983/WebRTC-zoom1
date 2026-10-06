import { useTheme } from "../ThemeProvider"

const GoogleMark = () => (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-[17px] w-[17px]">
        <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" />
        <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" />
        <path fill="#FBBC05" d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z" />
        <path fill="#EA4335" d="M24 12c3 0 5.6 1 7.7 3.1l5.8-5.8A19.3 19.3 0 0 0 24 4 20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z" />
    </svg>
)

export const GoogleButton = ({ disabled = false }: { disabled?: boolean }) => {
    const { theme } = useTheme()
    const themeClasses = theme === "dark"
        ? "border-[#405148] bg-[#202d27] text-gather-ink hover:border-[#617667] hover:bg-[#293831]"
        : "border-gather-line bg-white text-[#303a35] hover:border-[#b9c7b2] hover:bg-[#fbfcf8]"

    return (
        <button
            className={`flex min-h-11 w-full items-center justify-center gap-[11px] rounded-[5px] border text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gather-forest disabled:cursor-not-allowed disabled:opacity-60 ${themeClasses}`}
            type="button"
            aria-label="Continue with Google"
            disabled={disabled}
            onClick={() => window.open(`${import.meta.env.VITE_BACKEND_GOOGLE_AUTH_URL}`, "_self")}
        >
            <GoogleMark />
            <span>Continue with Google</span>
        </button>
    )
}