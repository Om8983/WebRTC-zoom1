import { RightSection } from "../Components/AuthComponents/RightSection"
import { LoginSection } from "../Components/AuthComponents/LoginSection"

type AuthPageProps = {
    mode: "login" | "signup"
}



const AuthPage = ({ mode }: AuthPageProps) => {
    const isSignup = mode === "signup"

    return (
        <main className="grid min-h-screen grid-cols-1 bg-gather-canvas font-body text-gather-ink min-[701px]:grid-cols-[minmax(340px,0.95fr)_minmax(380px,1.05fr)] lg:grid-cols-[minmax(420px,1.05fr)_minmax(450px,0.95fr)]">
            <RightSection />
            <LoginSection isSignup={isSignup} />
        </main>
    )
}

export const Login = () => <AuthPage mode="login" />
export const Signup = () => <AuthPage mode="signup" />