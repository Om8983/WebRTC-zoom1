import { Brand } from "./Brand"

export const RouteFallback = () => (
    <main className="grid min-h-screen place-items-center bg-gather-canvas font-body text-gather-forest" role="status" aria-label="Loading page">
        <Brand className="animate-pulse text-[21px]" to="/" />
    </main>
)