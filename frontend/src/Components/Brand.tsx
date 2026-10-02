import { Link } from "react-router-dom"

type BrandProps = {
    className?: string
    to?: string
}

export const Brand = ({ className = "", to = "/login" }: BrandProps) => (
    <Link className={`inline-flex items-center gap-[9px] font-display text-[23px] font-extrabold leading-none tracking-normal text-inherit no-underline ${className}`} to={to} aria-label="Gather home">
        <span className="flex h-[23px] w-[23px] rotate-[-5deg] items-end justify-center gap-0.5 rounded-[8px_8px_8px_3px] border-[1.5px] border-current p-1" aria-hidden="true">
            <span className="h-[6px] w-[3px] rotate-[5deg] rounded-[3px] bg-gather-lime" />
            <span className="h-[10px] w-[3px] rotate-[5deg] rounded-[3px] bg-gather-lime" />
            <span className="h-[7px] w-[3px] rotate-[5deg] rounded-[3px] bg-gather-lime" />
        </span>
        gather<span className="-ml-[9px] text-gather-lime">.</span>
    </Link>
)