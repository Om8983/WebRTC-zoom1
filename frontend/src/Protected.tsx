import { Navigate, Outlet } from "react-router-dom"
import { RouteFallback } from "./Components/RouteFallback"
import { useAuth } from "./Utils/hooks/useAuth"

export const Protected = () => {
    console.log("on the protected route and navigating for authentication")
    const { isVerified, loading } = useAuth()

    console.log('isVerified from protected', isVerified)
    if (loading) return <RouteFallback />
    if (!isVerified) return <Navigate to="/login" replace />

    return <Outlet />
}
