import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import { IconCheck, IconX } from "@tabler/icons-react"
import type { MeetingAction } from "./MeetingActionCard"
import { Button } from "../Button"
import { useTheme } from "../ThemeProvider"

type MeetingDialogProps = {
    action: MeetingAction
    onClose: () => void
}

const dialogCopy = {
    create: { eyebrow: "A NEW GATHERING", title: "Create a meeting", description: "Set a name for your room. You can invite everyone once it’s ready.", submit: "Create meeting" },
    join: { eyebrow: "COME ON IN", title: "Join a meeting", description: "Enter the meeting code shared with you to continue.", submit: "Join meeting" },
    schedule: { eyebrow: "MAKE A LITTLE TIME", title: "Schedule a meeting", description: "Pick a time that works for your people.", submit: "Schedule meeting" },
}

export const MeetingDialog = ({ action, onClose }: MeetingDialogProps) => {
    const [submitted, setSubmitted] = useState(false)
    const closeButtonRef = useRef<HTMLButtonElement>(null)
    const copy = dialogCopy[action]
    const { theme } = useTheme()
    const isDark = theme === "dark"
    const surfaceTheme = isDark ? "border-[#394a41] bg-[#17221e]" : "border-[#e2e7df] bg-white"
    const eyebrowTheme = isDark ? "text-[#c9e79f]" : "text-[#71905b]"
    const closeTheme = isDark ? "hover:bg-[#304038] hover:text-[#c9e79f]" : "hover:bg-[#f0f4ec] hover:text-gather-forest"
    const successTheme = isDark
        ? "border-[#405148] bg-[#25332d] text-[#c9e79f]"
        : "border-[#dce5d7] bg-[#f2f6ed] text-gather-forest"
    const successIconTheme = isDark ? "bg-[#304038] text-[#c9e79f]" : "bg-white text-[#71905b]"
    const fieldLabelTheme = isDark ? "text-[#e8efea]" : "text-[#3b4540]"
    const fieldTheme = isDark
        ? "border-[#405148] bg-[#202d27] text-[#e8efea] placeholder:text-[#84938a]"
        : "border-gather-line bg-white text-[#27332d] placeholder:text-[#a6ada7]"

    useEffect(() => {
        closeButtonRef.current?.focus()
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose()
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [onClose])

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSubmitted(true)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#17352f]/55 p-4 backdrop-blur-[3px]" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
            <section aria-labelledby="meeting-dialog-title" aria-modal="true" className={`my-auto w-full max-w-[450px] rounded-[8px] border p-7 shadow-[0_28px_80px_rgba(13,33,28,0.25)] max-[420px]:p-5 ${surfaceTheme}`} role="dialog">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <p className={`mb-2 text-[9px] font-bold tracking-[1.2px] ${eyebrowTheme}`}>{copy.eyebrow}</p>
                        <h2 className="m-0 font-display text-[24px] font-bold text-gather-ink" id="meeting-dialog-title">{submitted ? "You’re all set" : copy.title}</h2>
                        <p className="mb-0 mt-2 text-[11px] leading-relaxed text-gather-muted">{submitted ? "Your meeting details are ready in this preview." : copy.description}</p>
                    </div>
                    <button aria-label="Close dialog" className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-gather-muted transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-gather-forest ${closeTheme}`} onClick={onClose} ref={closeButtonRef} type="button"><IconX aria-hidden="true" size={18} stroke={1.8} /></button>
                </div>

                {submitted ? (
                    <div className={`flex items-center gap-3 rounded-[5px] border p-4 text-[11px] ${successTheme}`}><span className={`grid h-8 w-8 place-items-center rounded-full ${successIconTheme}`}><IconCheck aria-hidden="true" size={17} stroke={1.9} /></span><span className="text-gather-ink">Meeting information saved locally for this preview.</span></div>
                ) : (
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        {action === "join" ? (
                            <label className={`flex flex-col gap-2 text-[10px] font-semibold ${fieldLabelTheme}`} htmlFor="meeting-code">Meeting code
                                <input autoComplete="off" autoFocus className={`h-11 rounded border px-3 text-xs font-normal outline-none placeholder:text-[#a6ada7] focus:border-[#789b62] focus:ring-[3px] focus:ring-[#789b62]/10 ${fieldTheme}`} id="meeting-code" name="meetingCode" placeholder="e.g. oak-river-24" required />
                            </label>
                        ) : (
                            <label className={`flex flex-col gap-2 text-[10px] font-semibold ${fieldLabelTheme}`} htmlFor="meeting-title">Meeting name
                                <input autoFocus className={`h-11 rounded border px-3 text-xs font-normal outline-none placeholder:text-[#a6ada7] focus:border-[#789b62] focus:ring-[3px] focus:ring-[#789b62]/10 ${fieldTheme}`} id="meeting-title" name="meetingTitle" placeholder="A catch-up with the team" required />
                            </label>
                        )}
                        {action === "schedule" && <div className="grid grid-cols-2 gap-3 max-[360px]:grid-cols-1">
                            <label className={`flex flex-col gap-2 text-[10px] font-semibold ${fieldLabelTheme}`} htmlFor="meeting-date">Date<input className={`h-11 min-w-0 rounded border px-3 text-xs font-normal outline-none focus:border-[#789b62] ${fieldTheme}`} id="meeting-date" name="meetingDate" type="date" required /></label>
                            <label className={`flex flex-col gap-2 text-[10px] font-semibold ${fieldLabelTheme}`} htmlFor="meeting-time">Time<input className={`h-11 min-w-0 rounded border px-3 text-xs font-normal outline-none focus:border-[#789b62] ${fieldTheme}`} id="meeting-time" name="meetingTime" type="time" required /></label>
                        </div>}
                        {action !== "join" && <label className={`flex flex-col gap-2 text-[10px] font-semibold ${fieldLabelTheme}`} htmlFor="meeting-guests">Invite people <span className="font-normal text-gather-muted">Optional</span>
                            <input className={`h-11 rounded border px-3 text-xs font-normal outline-none placeholder:text-[#a6ada7] focus:border-[#789b62] focus:ring-[3px] focus:ring-[#789b62]/10 ${fieldTheme}`} id="meeting-guests" name="meetingGuests" placeholder="Email addresses" type="text" />
                        </label>}
                        <div className="mt-2 flex justify-end gap-2">
                            <Button onClick={onClose} title="Cancel" />
                            <Button btnType="submit" onClick={() => undefined} title={copy.submit} variant="primary" />
                        </div>
                    </form>
                )}
                {submitted && <div className="mt-6 flex justify-end"><Button onClick={onClose} title="Done" variant="primary" /></div>}
            </section>
        </div>
    )
}