import { Link } from "react-router-dom"
import { IconArrowRight, IconArrowUpRight, IconSparkles } from "@tabler/icons-react"
import { Brand } from "../Components/Brand"
import { MeetingPreview } from "../Components/MeetingPreview"

type RoomPageProps = {
    mode: "sender" | "receiver"
}

export const RoomPage = ({ mode }: RoomPageProps) => {
    const isSender = mode === "sender"

    return (
        <main className="min-h-screen bg-gather-canvas bg-[radial-gradient(#dfe6d8_0.65px,transparent_0.65px)] bg-[length:21px_21px] bg-[-8px_-8px] px-6 font-body text-gather-ink max-[420px]:px-[18px] sm:px-8 lg:px-[6vw]">
            <header className="mx-auto flex h-[86px] max-w-[1240px] items-center justify-between border-b border-[#dfe4dc] max-[760px]:h-[72px]">
                <Brand className="text-[21px] text-gather-forest" />
                <span className="text-[11px] text-gather-muted max-[760px]:hidden">A little closer, wherever you are</span>
                <Link className="inline-flex items-center gap-[9px] rounded-[5px] border border-[#dfe4dc] bg-white/80 px-[14px] py-2.5 text-[11px] font-semibold text-gather-forest transition-colors hover:border-[#b9ce9d] hover:bg-[#f5f8ef] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gather-forest" to="/login">Log in <IconArrowUpRight aria-hidden="true" size={14} stroke={1.8} /></Link>
            </header>

            <section className="mx-auto w-full max-w-[1080px] pb-6 pt-[8vh] max-[760px]:pt-[45px]">
                <div className="mb-[34px] max-w-[650px]">
                    <p className="mb-[15px] flex items-center gap-[9px] text-[9px] font-bold tracking-[1.3px] text-[#71905b]"><span className="h-[7px] w-[7px] rounded-full bg-gather-lime shadow-[0_0_0_4px_rgba(185,227,107,0.16)]" /> YOUR GATHER SPACE</p>
                    <h1 className="m-0 max-w-[630px] font-display text-[56px] font-semibold leading-[1.08] max-[420px]:text-[36px] max-[760px]:text-[42px]">{isSender ? "Bring everyone a little closer." : "Your people are just around the corner."}</h1>
                    <p className="mb-0 mt-[15px] max-w-[450px] text-[13px] leading-[1.7] text-gather-muted">{isSender ? "A familiar face can make any day better. Your meeting space is ready." : "Step into a calmer kind of video call. Your meeting space is ready."}</p>
                </div>

                <section className="grid overflow-hidden rounded-lg border border-[#e0e5db] bg-gather-canvas shadow-[0_22px_55px_rgba(28,54,46,0.08)] min-[761px]:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]" aria-label="Gather meeting space preview">
                    <MeetingPreview size="large" title={isSender ? "HOST SPACE" : "GUEST SPACE"} />
                    <div className="flex flex-col items-start justify-center p-[clamp(26px,4vw,51px)] max-[760px]:p-[29px]">
                        <p className="mb-3 text-[8px] font-bold tracking-[1.3px] text-[#71905b]">{isSender ? "START A CONVERSATION" : "JOIN THE CONVERSATION"}</p>
                        <h2 className="m-0 font-display text-[25px] font-bold leading-tight">{isSender ? "Make this room yours." : "There’s a seat for you."}</h2>
                        <p className="mb-6 mt-[11px] text-[11px] leading-[1.7] text-gather-muted">{isSender ? "Share the moment, not another meeting link to remember." : "Get together with clear calls and a little more room to connect."}</p>
                        <div className="flex w-full items-center gap-3 rounded-[5px] border border-[#e6eae2] bg-[#fbfcf8] p-[13px] text-[9px] leading-[1.7] text-[#818983]"><IconSparkles aria-hidden="true" className="text-xl text-[#71905b]" size={20} stroke={1.7} /><span><strong className="text-[10px] text-gather-forest">{isSender ? "Your host space" : "Your guest space"}</strong><br />Ready for your next conversation</span></div>
                        <Link className="mt-[23px] inline-flex items-center gap-[9px] text-[11px] font-semibold text-gather-forest hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gather-forest" to="/login">Back to your account <IconArrowRight aria-hidden="true" size={15} stroke={1.8} /></Link>
                    </div>
                </section>

                <footer className="mt-7 flex justify-between text-[8px] tracking-[0.8px] text-[#939b95]"><span>© 2026 Gather</span><span className="max-[420px]:hidden">GOOD CONVERSATIONS START HERE</span></footer>
            </section>
        </main>
    )
}