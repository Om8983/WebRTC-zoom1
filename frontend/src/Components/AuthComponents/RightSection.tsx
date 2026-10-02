import { IconSparkles } from "@tabler/icons-react"
import { Brand } from '../Brand'
import { MeetingPreview } from '../MeetingPreview'

export const RightSection = () => {
    return (
        <section className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(ellipse_at_12%_95%,rgba(151,188,108,0.2),transparent_34%),linear-gradient(145deg,#234a43_0%,#1d3d3a_58%,#183438_100%)] px-[clamp(34px,5.2vw,76px)] py-[34px] text-[#f5f7ed] before:absolute before:inset-0 before:pointer-events-none before:bg-[radial-gradient(rgba(245,247,237,0.09)_0.65px,transparent_0.65px)] before:bg-[length:19px_19px] before:opacity-25 max-[900px]:px-8 max-[700px]:hidden" aria-label="Gather meeting preview">
            <div className="relative z-10 flex items-center justify-between">
                <Brand className="text-white" />
                <span className="text-[11px] text-white/65 max-[900px]:hidden">A little closer, wherever you are</span>
            </div>

            <div className="relative z-10 my-auto flex w-full max-w-[490px] flex-col self-center py-[58px]">
                <p className="mb-5 flex items-center gap-[9px] text-[10px] font-bold tracking-[1.4px] text-[#c5d6ba]"><span className="h-[7px] w-[7px] rounded-full bg-gather-lime shadow-[0_0_0_4px_rgba(185,227,107,0.13)]" /> GOOD CONVERSATIONS START HERE</p>
                <h1 className="m-0 font-display text-[56px] font-semibold leading-[1.02] max-[900px]:text-[48px]">Make room<br />for everyone.</h1>
                <p className="mb-[30px] mt-5 max-w-[390px] text-sm leading-[1.75] text-white/75">Clear calls. Easy hellos. A place for your people to meet, from wherever life happens.</p>

                <MeetingPreview />
                <div className="mt-5 flex items-center gap-[11px] text-[10px] leading-relaxed text-white/70"><IconSparkles aria-hidden="true" className="shrink-0 text-gather-lime" size={23} stroke={1.7} /><span><strong className="text-[11px] text-[#f5f7ed]">Good to see you.</strong><br />Your next favorite room is one click away.</span></div>
            </div>
            <div className="relative z-10 flex items-center justify-between text-[9px] tracking-[1.2px] text-white/45"><span>GATHER, OFTEN.</span><span>01 — 04</span></div>
        </section>

    )
}
