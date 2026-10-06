import { useCallback, useEffect, useState } from "react"
import axios, { AxiosError } from "axios"
import { toast } from "sonner"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "../../redux/store"
import { setUserCred } from "../../redux/userSlice"

export const useAuth = () => {
    console.log("starting auth check ")
    const [loading, setLoading] = useState(true)
    const [isVerified, setVerified] = useState<boolean>(false)
    const dispatch = useDispatch<AppDispatch>()
    console.log('isVerified initial step', isVerified)
    const handleAuthCheck = useCallback(async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/authCheck`, {
                withCredentials: true,
            })

            if (res.status === 200) {
                const userPayload = {
                    isLogin: true,
                    userId: res.data?.userId
                }
                console.log('dispatching userCredentials')
                dispatch(setUserCred(userPayload))
                console.log('usercreds dispatched')
                setVerified(true)
            } else {
                throw new Error("Auth check returned no user id")
            }
        } catch (error) {
            dispatch(setUserCred({ isLogin: false, userId: "" }))
            setVerified(false)
            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    toast.warning('Invalid User Credentials. Try login again')
                    return
                } else if (error.response?.status === 404) {
                    toast.error("No user found")
                    return
                } else {
                    console.log('error', error)
                    toast.error("Internal Server Error.")
                }
            }
        } finally {
            setLoading(false)
        }
    }, [dispatch])

    useEffect(() => {
        void handleAuthCheck()
    }, [handleAuthCheck])

    return { isVerified, loading }
}