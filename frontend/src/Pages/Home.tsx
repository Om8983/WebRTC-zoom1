import { useState } from "react"
import { DashboardHeader } from "../Components/Dashboard/DashboardHeader"
import { MeetingActionCard } from "../Components/Dashboard/MeetingActionCard"
import type { MeetingAction } from "../Components/Dashboard/MeetingActionCard"
import { MeetingDialog, type MeetingFormData } from "../Components/Dashboard/MeetingDialog"
import { Button } from "../Components/Button"
import { IconArrowUpRight, IconCalendarEvent, IconPlus } from "@tabler/icons-react"
import { useTheme } from "../Components/ThemeProvider"
import { useSelector } from "react-redux"
import type { Rootstate } from "../redux/store"
import axios, { AxiosError } from "axios"
import { toast } from "sonner"
import { BACKEND_URL } from "../Utils/config"

export const Home = () => {
    const [activeAction, setActiveAction] = useState<MeetingAction | null>(null)
    const { theme } = useTheme()
    const isDark = theme === "dark"
    const today = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date())

    const userCred = useSelector(
        (state: Rootstate) => state.user
    )

    const handleMeetingSubmit = async (action: MeetingAction, data: MeetingFormData) => {
        if (action !== "create") return

        try {
            const shortId = crypto.randomUUID().replace(/-/g, "").slice(0, 5)
            const meetingPayload = {
                creatorId: userCred.userId,
                meetingStatus: "ACTIVE",
                meetingCode: shortId,
                invitees: data.invitees,
            }

            const res = await axios.post(`${BACKEND_URL}/createMeeting`, meetingPayload, { withCredentials: true })
            if (res.status === 200) {
                toast.success("Meeting created successfully.")
                setActiveAction(null)
                return
            }
            return false
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error?.response?.status === 404) {
                    toast.error("Invalid request.")
                    return false
                }
                toast.error("Internal server error.")
                return false
            }
            return false
        }
    }
    return (
        <main className={`min-h-screen bg-gather-canvas bg-[length:21px_21px] bg-[-8px_-8px] px-6 font-body text-gather-ink max-[420px]:px-[18px] sm:px-8 lg:px-[6vw] ${isDark ? "bg-[radial-gradient(#344239_0.65px,transparent_0.65px)]" : "bg-[radial-gradient(#dfe6d8_0.65px,transparent_0.65px)]"}`}>
            <DashboardHeader />
            <section className="mx-auto max-w-[1180px] pb-12 pt-[clamp(42px,8vh,84px)]">
                <div className="mb-9 flex items-end justify-between gap-5 max-[600px]:mb-7 max-[600px]:items-start">
                    <div>
                        <p className={`mb-3 flex items-center gap-2 text-[9px] font-bold tracking-[1.2px] ${isDark ? "text-[#c9e79f]" : "text-[#71905b]"}`}><span className="h-[7px] w-[7px] rounded-full bg-gather-lime shadow-[0_0_0_4px_rgba(185,227,107,0.16)]" /> YOUR GATHER SPACE</p>
                        <h1 className="m-0 font-display text-[clamp(34px,4.5vw,54px)] font-semibold leading-[1.08]">Make room for a good conversation.</h1>
                        <p className="mb-0 mt-3 text-[13px] leading-relaxed text-gather-muted">Bring people together, wherever they are.</p>
                    </div>
                    <span className="mb-1 shrink-0 text-[10px] text-gather-muted max-[600px]:hidden">{today}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 max-[760px]:grid-cols-2 max-[520px]:grid-cols-1">
                    <MeetingActionCard
                        action="create"
                        title="Start a Meeting"
                        description="Open a room now and bring your people together."
                        buttonLabel="Create Meeting"
                        featured={true}
                        icon={<IconPlus aria-hidden="true" size={20} stroke={1.7} />}
                        onSelect={setActiveAction}
                    />
                    <MeetingActionCard
                        action="join"
                        title="Join a meeting"
                        description="Have an invite code? Enter it and find your way into the room."
                        buttonLabel="Enter a code"
                        icon={<IconArrowUpRight aria-hidden="true" size={20} stroke={1.7} />}
                        onSelect={setActiveAction}
                    />
                    <MeetingActionCard
                        action="schedule"
                        title="Schedule for later"
                        description="Pick a time that works for everyone and plan your next catch-up."
                        buttonLabel="Schedule meeting"
                        icon={<IconCalendarEvent aria-hidden="true" size={20} stroke={1.7} />}
                        onSelect={setActiveAction}
                    />
                </div>

                <section className={`mt-12 border-t pt-7 max-[600px]:mt-9 ${isDark ? "border-[#394a41]" : "border-[#dfe4dc]"}`} aria-labelledby="upcoming-heading">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className={`mb-2 text-[9px] font-bold tracking-[1.1px] ${isDark ? "text-[#c9e79f]" : "text-[#71905b]"}`}>ON YOUR CALENDAR</p>
                            <h2 className="m-0 font-display text-xl font-bold" id="upcoming-heading">Upcoming meetings</h2>
                        </div>
                        <Button onClick={() => setActiveAction("schedule")} title="Schedule" variant="quiet" className="text-[11px]">
                            <IconPlus aria-hidden="true" size={17} stroke={1.8} />
                        </Button>
                    </div>
                    <div className={`mt-5 flex min-h-[108px] items-center gap-4 rounded-[5px] border border-dashed px-5 py-4 max-[420px]:items-start ${isDark ? "border-[#394a41] bg-[#202d27]" : "border-[#dce3d8] bg-white/60"}`}>
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${isDark ? "bg-[#304038] text-[#c9e79f]" : "bg-[#eff4e9] text-gather-forest"}`}><IconCalendarEvent aria-hidden="true" size={18} stroke={1.6} /></span>
                        <div>
                            <p className="mb-1 text-[12px] font-semibold text-gather-ink">A little space for what’s next.</p>
                            <p className="m-0 text-[10px] leading-relaxed text-gather-muted">Your scheduled conversations will show up here.</p>
                        </div>
                    </div>
                </section>
                <footer className={`mt-12 flex justify-between text-[8px] tracking-[0.8px] ${isDark ? "text-[#84938a]" : "text-[#939b95]"}`}>
                    <span>© 2026 Gather</span>
                    <span className="max-[420px]:hidden">GOOD CONVERSATIONS START HERE</span>
                </footer>
            </section>

            {
                activeAction &&
                <MeetingDialog
                    action={activeAction}
                    onSubmit={handleMeetingSubmit}
                    onClose={() => setActiveAction(null)}
                />
            }
        </main>
    )
}