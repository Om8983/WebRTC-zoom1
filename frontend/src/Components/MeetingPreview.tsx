import { IconMicrophone, IconPhoneOff, IconSparkles, IconUsers, IconVideo } from "@tabler/icons-react"

type MeetingPreviewProps = {
    size?: "compact" | "large"
    title?: string
}

const people = [
    { name: "Maya", initial: "M", tile: "bg-[linear-gradient(145deg,#d6bd93,#8f967a)]" },
    { name: "Jordan", initial: "J", tile: "bg-[linear-gradient(145deg,#d3a88e,#856c62)]" },
    { name: "Alex", initial: "A", tile: "bg-[linear-gradient(145deg,#a9bcad,#65796a)]" },
    { name: "Sam", initial: "S", tile: "bg-[linear-gradient(145deg,#c4a594,#806960)]" },
]

export const MeetingPreview = ({ size = "compact", title = "Sunday catch-up" }: MeetingPreviewProps) => {
    const isCompact = size === "compact"

    return (
        <div className={`relative flex flex-col justify-between overflow-hidden border border-white/15 bg-[radial-gradient(ellipse_at_85%_10%,rgba(151,188,108,0.18),transparent_34%),linear-gradient(145deg,#234a43,#1d3d3a)] text-[#f5f7ed] ${isCompact ? "min-h-0 rounded-[10px] p-[15px] shadow-[0_24px_70px_rgba(10,28,26,0.24)]" : "min-h-[390px] rounded-l-[7px] p-6 max-[760px]:min-h-[330px] max-[420px]:min-h-[300px] max-[420px]:p-4"}`}>
            <div className={`flex items-center justify-between text-[10px] ${isCompact ? "pb-3 text-white/70" : "text-white/60"}`}>
                <span className="inline-flex items-center gap-[7px] font-semibold text-[#f6f6ee]">
                    <span className={`h-[6px] w-[6px] rounded-full ${isCompact ? "bg-[#e89978]" : "bg-gather-lime"}`} />
                    {title}
                </span>
                <span className="text-[9px]">{isCompact ? "09:41" : "GATHER / 01"}</span>
            </div>

            <div className={`grid w-full grid-cols-2 gap-[7px] ${isCompact ? "" : "my-6 max-w-[420px] self-center"}`}>
                {people.map((person, index) => (
                    <div className={`relative grid place-items-center overflow-hidden rounded-[5px] ${person.tile} ${isCompact ? "min-h-[91px]" : "min-h-[118px] max-[760px]:min-h-[105px] max-[420px]:min-h-[88px]"}`} key={person.name}>
                        {index === 0 && <span className="absolute right-[14px] top-3 h-[35px] w-[35px] rounded-full bg-[rgba(255,225,163,0.55)] blur-[1px]" />}
                        <span className="grid h-[37px] w-[37px] place-items-center rounded-full border border-white/65 bg-[rgba(44,58,48,0.4)] font-display text-sm font-semibold text-white shadow-[0_4px_12px_rgba(20,30,24,0.15)]">
                            {person.initial}
                        </span>
                        <span className="absolute bottom-[7px] left-2 text-[9px] font-semibold text-white [text-shadow:0_1px_5px_rgba(0,0,0,0.3)]">{person.name}</span>
                    </div>
                ))}
            </div>

            <div className={`flex items-center justify-between text-[9px] text-white/75 ${isCompact ? "pt-[11px]" : ""}`}>
                <span className="inline-flex items-center gap-1.5">{isCompact ? <><IconUsers aria-hidden="true" className="text-gather-lime" size={13} stroke={1.8} />4 people here</> : "Good to see you."}</span>
                {isCompact ? (
                    <span className="flex items-center gap-[6px]" aria-hidden="true">
                        <span className="grid h-[21px] w-[21px] place-items-center rounded-full bg-white/10"><IconMicrophone aria-hidden="true" size={11} stroke={1.7} /></span>
                        <span className="grid h-[21px] w-[21px] place-items-center rounded-full bg-white/10"><IconVideo aria-hidden="true" size={11} stroke={1.7} /></span>
                        <span className="grid h-[21px] w-[21px] place-items-center rounded-full bg-[#c36d52]"><IconPhoneOff aria-hidden="true" size={11} stroke={1.7} /></span>
                    </span>
                ) : <IconSparkles aria-hidden="true" className="text-gather-lime" size={20} stroke={1.7} />}
            </div>
        </div>
    )
}