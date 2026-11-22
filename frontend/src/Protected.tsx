import { Navigate, Outlet } from "react-router-dom"
import { RouteFallback } from "./Components/RouteFallback"
import { useAuth } from "./Utils/hooks/useAuth"

export const Protected = () => {
    const { isVerified, loading } = useAuth()

    if (loading) return <RouteFallback />
    if (!isVerified) return <Navigate to="/login" replace />

    return <Outlet />
}
