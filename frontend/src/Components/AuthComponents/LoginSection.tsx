import { useState } from "react"
import type { InputHTMLAttributes } from "react"
import { IconArrowRight, IconArrowUpRight, IconLoader2, IconLock } from "@tabler/icons-react"
import { GoogleButton } from './GoogleButton'
import { useNavigate } from 'react-router-dom'
import { Brand } from '../Brand'
import { Button } from "../Button"
import { ThemeToggle } from "../ThemeToggle"
import { useTheme } from "../ThemeProvider"
import axios, { AxiosError } from "axios"
import { toast } from "sonner"

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string
}

const AuthField = ({ label, ...inputProps }: AuthFieldProps) => {
    const { theme } = useTheme()
    const themeClasses = theme === "dark"
        ? "border-[#405148] bg-[#202d27] text-[#e8efea] placeholder:text-[#84938a] focus:border-[#8eaa7b]"
        : "border-gather-line bg-white text-[#27332d] placeholder:text-[#a6ada7] focus:border-[#789b62]"

    return (
        <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#3b4540] dark:text-gather-ink" htmlFor={inputProps.id}>
            <span className="text-[12px]">{label}</span>
            <input
                className={`h-[43px] w-full rounded border px-3 text-[11px] font-normal outline-none transition focus:ring-[3px] focus:ring-[#789b62]/10 ${themeClasses}`}
                style={{ colorScheme: theme }}
                {...inputProps}
            />
        </label>
    )
}
export const LoginSection = ({ isSignup }: { isSignup: boolean }) => {
    const navigate = useNavigate()
    const [userName, setUserName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [keepSignedIn, setKeepSignedIn] = useState(false)
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleLogin = async () => {
        const loginPayload = { email, password }
        setIsSubmitting(true)
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, loginPayload, { withCredentials: true })
            if (res.status === 200) {
                navigate('/home')
                toast.success("User Login Successfull.")
            }
        } catch (e) {
            if (e instanceof AxiosError) {
                if (e.response?.status === 403) {
                    toast.warning('Invalid Credentials!')
                } else if (e.response?.status === 404) {
                    toast.error("User Doesn't Exist. Please Signup!! ")
                    navigate("/signup")
                } else {
                    toast.error("Internal Server Error. Please Try Again!")
                }
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSignup = async () => {
        const signUpPayload = {
            userName,
            email,
            password
        }
        setIsSubmitting(true)
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/signup`, signUpPayload, { withCredentials: true })
            console.log('res', res)
            if (res.status === 200) {
                toast.success("User SignUp Successfull.")
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.status === 409) {
                    toast('User already exist. Please login!')
                    navigate("/login")
                } else if (error.response?.status === 403) {
                    toast.warning("Invalid credentials! Try again.")
                } else {
                    toast.error("Internal Server Error. Please Try Again!")
                }
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="flex min-h-screen flex-col px-[clamp(28px,5vw,72px)] pb-[23px] pt-[31px] max-[700px]:px-[25px] max-[700px]:pb-[18px] max-[700px]:pt-5 max-[380px]:px-[19px]">
            <div className="flex items-center justify-end gap-3 text-[11px] text-[#818983] max-[700px]:text-[10px] max-[380px]:gap-[7px]">
                <ThemeToggle disabled={isSubmitting} />
                <span className="max-[380px]:max-w-[150px]">
                    {isSignup ? "Already part of the conversation?" : "New around here?"}
                </span>
                <Button
                    onClick={() => isSignup ? navigate("/login") : navigate("/signup")}
                    title={isSignup ? "Log in" : "Create account"}
                    disabled={isSubmitting}
                >
                    <IconArrowUpRight aria-hidden="true" size={14} stroke={1.8} />
                </Button>
            </div>

            <div className="my-auto flex w-full max-w-[390px] flex-col self-center py-12 max-[700px]:max-w-[410px] max-[700px]:py-9">
                <Brand className="mb-[39px] hidden text-[21px] text-gather-forest max-[700px]:inline-flex" />
                <p className="mb-3 text-[9px] font-bold tracking-[1.3px] text-[#71905b]">
                    {isSignup ? "YOUR PEOPLE ARE HERE" : "WELCOME BACK"}
                </p>
                <h2 className="m-0 font-display text-[29px] font-bold leading-tight">
                    {isSignup ? "Create your account" : "Good to have you back."}
                </h2>
                <p className="mb-[23px] mt-[9px] text-xs leading-[1.65] text-gather-muted">
                    {
                        isSignup ?
                            "A few details and you're in. It only takes a moment."
                            : "Sign in and pick up right where the conversation left off."
                    }
                </p>

                <GoogleButton disabled={isSubmitting} />

                <div className="my-[21px] flex items-center gap-[11px] whitespace-nowrap text-[8px] font-bold tracking-[0.9px] text-[#9aa19a]">
                    <span className="h-px flex-1 bg-[#e9ebe6]" />
                    <span>OR CONTINUE WITH EMAIL</span>
                    <span className="h-px flex-1 bg-[#e9ebe6]" />
                </div>

                <form className="flex flex-col gap-[15px]" onSubmit={(event) => event.preventDefault()}>
                    {
                        isSignup &&
                        <AuthField
                            label="Full name"
                            id="full-name"
                            name="name"
                            type="text"
                            placeholder="Your name"
                            autoComplete="name"
                            required
                            value={userName}
                            onChange={(event) => setUserName(event.currentTarget.value)}
                        />
                    }
                    <AuthField
                        label="Email address"
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.currentTarget.value)}
                    />
                    <AuthField
                        label="Password"
                        id="password"
                        name="password"
                        type="password"
                        placeholder={isSignup ? "At least 8 characters" : "Enter your password"}
                        autoComplete={isSignup ? "new-password" : "current-password"}
                        minLength={isSignup ? 8 : undefined}
                        required
                        value={password}
                        onChange={(event) => setPassword(event.currentTarget.value)}
                    />
                    {isSignup ? (
                        <label className="flex items-start gap-[7px] text-[10px] leading-relaxed text-[#737d76]">
                            <input className="mt-0.5 h-[13px] w-[13px] shrink-0 accent-[#547a4a] dark:accent-[#8eaa7b]" type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.currentTarget.checked)} required />
                            <span>I agree to the <a className="font-semibold text-[#507344] hover:underline dark:text-gather-lime" href="#terms">Terms of Service</a>
                                {" " + "and" + " "}
                                <a className="font-semibold text-[#507344] hover:underline dark:text-gather-lime" href="#privacy">Privacy Policy</a>
                                .
                            </span>
                        </label>
                    ) : (
                        <div className="flex items-center justify-between max-[380px]:items-start max-[380px]:gap-2">
                            <label className="flex items-center gap-[7px] text-[10px] text-[#737d76] max-[380px]:text-[9px]">
                                <input className="h-[13px] w-[13px] accent-[#547a4a] dark:accent-[#8eaa7b]" type="checkbox" checked={keepSignedIn} onChange={(event) => setKeepSignedIn(event.currentTarget.checked)} />
                                <span className="text-[12px]">Keep me signed in</span>
                            </label>
                            <a href="#forgot-password" className="text-[12px] font-semibold text-[#507344] hover:underline dark:text-gather-lime max-[380px]:text-[9px]">
                                Forgot password?
                            </a>
                        </div>
                    )}
                    <Button
                        // btnType="submit"
                        title={isSubmitting ? (isSignup ? "Creating account..." : "Logging in...") : (isSignup ? "Create account" : "Log in")}
                        variant="primary"
                        disabled={isSubmitting}
                        onClick={() => {
                            if (!isSubmitting) {
                                isSignup ? handleSignup() : handleLogin()
                            }
                        }}
                        className="mt-[3px] flex min-h-[45px] w-full items-center justify-center gap-2.5 rounded bg-gather-forest font-body text-xs font-semibold text-[#f8f8ef] transition hover:-translate-y-px hover:bg-gather-forest-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gather-forest"
                    >
                        {isSubmitting
                            ? <IconLoader2 aria-hidden="true" className="animate-spin" size={16} stroke={1.8} />
                            : <IconArrowRight aria-hidden="true" size={16} stroke={1.8} />}
                    </Button>
                </form>

                <p className="mt-8 flex items-center justify-center gap-[6px] text-[9px] text-[#929a94] max-[700px]:mt-[27px]">
                    <IconLock aria-hidden="true" className="text-[#71905b]" size={15} stroke={1.7} />
                    <span className="text-[12px]">Your conversations belong to you.</span>
                </p>
            </div>
            <div className="flex items-center justify-between text-[9px] text-[#939b95]">
                <span>© 2026 Gather</span>
                <a className="hover:text-[#507344]" href="#help">
                    Need a hand?
                </a>
            </div>
        </section>
    )
}
