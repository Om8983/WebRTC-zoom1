import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import { RouteFallback } from "../Components/RouteFallback"
import { Protected } from "../Protected"

const Home = lazy(() => import("../Pages/Home").then(({ Home }) => ({ default: Home })))
const Login = lazy(() => import("../Pages/Auth").then(({ Login }) => ({ default: Login })))
const Signup = lazy(() => import("../Pages/Auth").then(({ Signup }) => ({ default: Signup })))

export const Approutes = () => {
    return (
        <Suspense fallback={<RouteFallback />}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route element={<Protected />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                </Route>
            </Routes>
        </Suspense>
    )
}