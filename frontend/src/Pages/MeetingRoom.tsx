import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { IconPhoneOff, IconVideo } from "@tabler/icons-react"
import { useSelector } from "react-redux"
import axios from "axios"
import { toast } from "sonner"
import { Button } from "../Components/Button"
import { useTheme } from "../Components/ThemeProvider"
import type { Rootstate } from "../redux/store"
import { BACKEND_URL, WEBSOCKET_URL } from "../Utils/config"
import { addIceCandidate } from "../Utils/peerHandlers/addIceCandidate"
import { createOfferFor } from "../Utils/peerHandlers/createOffer"
import { handleIncomingAnswer } from "../Utils/peerHandlers/handleIncomingAnswer"
import { handleIncomingoffer } from "../Utils/peerHandlers/handleIncomingOffer"
import { handleRemoveConnection } from "../Utils/peerHandlers/handleRemoveConnection"

type VideoTileProps = {
    label: string
    stream: MediaStream | null
    isLocal?: boolean
}

const VideoTile = ({ label, stream, isLocal = false }: VideoTileProps) => {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (videoRef.current) videoRef.current.srcObject = stream
        return () => {
            if (videoRef.current) videoRef.current.srcObject = null
        }
    }, [stream])

    return (
        <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-[#17221e] shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
            {stream ? (
                <video
                    autoPlay
                    className={`h-full w-full object-cover -scale-x-100 `}
                    playsInline
                    ref={videoRef}
                    muted={isLocal}
                />
            ) : (
                <div className="grid h-full place-items-center text-[#c9e79f]">
                    <IconVideo aria-hidden="true" size={36} stroke={1.3} />
                </div>
            )}
            <span className="absolute bottom-3 left-3 rounded bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
                {label}{isLocal ? " (You)" : ""}
            </span>
        </div>
    )
}

export const MeetingRoom = () => {
    const { meetingId = "" } = useParams()
    const navigate = useNavigate()
    const { theme } = useTheme()
    const isDark = theme === "dark"
    const userId = useSelector((root: Rootstate) => root.user.userId)
    const [isHost, setIsHost] = useState(false)
    const socket = useRef<WebSocket | null>(null)
    const peerMap = useRef(new Map<string, RTCPeerConnection>())
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
        () => new Map(),
    )
    const [isEnding, setIsEnding] = useState(false)

    const getParticipants = async (disposed: boolean) => {
        try {

            const res = await axios.get(`${BACKEND_URL}/api/v1/users/viewParticipants?meetingId=${meetingId}`, { withCredentials: true },)

            if (!disposed) {
                setIsHost(res.data.host[0].participantId === userId && res.data.host[0].role === "HOST" ? true : false)
            }
        } catch (error) {
            console.error("Unable to determine meeting host.", error)
            toast.error("Unable to verify your role in this meeting.")
        }
    }
    useEffect(() => {
        if (!meetingId || !userId) return
        let disposed = false
        getParticipants(disposed)
        return () => {
            disposed = true
        }
    }, [meetingId, userId])

    useEffect(() => {
        if (!meetingId || !userId) return

        let disposed = false
        let stream: MediaStream | null = null
        let connection: WebSocket | null = null

        const handleRemoteStream = (remoteUserId: string, remoteStream: MediaStream) => {
            setRemoteStreams((current) => {
                const updated = new Map(current)
                updated.set(remoteUserId, remoteStream)
                return updated
            })
        }

        const connect = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: { width: 600, height: 600, frameRate: { ideal: 30 } },
                })
                if (disposed) {
                    stream.getTracks().forEach((track) => track.stop())
                    return
                }

                setLocalStream(stream)
                connection = new WebSocket(WEBSOCKET_URL)
                socket.current = connection

                connection.onopen = () => {
                    connection?.send(JSON.stringify({
                        type: "join",
                        userId,
                        meetingId,
                    }))
                }

                connection.onmessage = async (event) => {
                    try {
                        const message = JSON.parse(event.data)
                        if (message.type === "join") {
                            const existingUsers = message.existingUsers as string[]
                            for (const existingUserId of existingUsers) {
                                await createOfferFor({
                                    receiverId: existingUserId,
                                    meetingId,
                                    userId,
                                    socket,
                                    peerMap,
                                    localStream: stream!,
                                    onRemoteStream: handleRemoteStream,
                                })
                            }
                        } else if (message.type === "createOffer") {
                            await handleIncomingoffer({
                                receiverId: message.from,
                                meetingId,
                                userId,
                                socket,
                                peerMap,
                                localStream: stream!,
                                onRemoteStream: handleRemoteStream,
                                sdp: message.sdp,
                            })
                        } else if (message.type === "createAnswer") {
                            await handleIncomingAnswer({
                                receiverId: message.from,
                                meetingId,
                                userId,
                                socket,
                                peerMap,
                                localStream: stream!,
                                onRemoteStream: handleRemoteStream,
                                sdp: message.sdp,
                            })
                        } else if (message.type === "addIceCandidate") {
                            await addIceCandidate({
                                receiverId: message.from,
                                meetingId,
                                userId,
                                socket,
                                peerMap,
                                localStream: stream!,
                                onRemoteStream: handleRemoteStream,
                                candidate: message.candidate,
                            })
                        } else if (message.type === "participantLeft") {
                            handleRemoveConnection({
                                receiverId: message.userId,
                                peerMap,
                            })
                            setRemoteStreams((current) => {
                                const updated = new Map(current)
                                updated.delete(message.userId)
                                return updated
                            })
                        } else if (message.type === "meetingEnded") {
                            toast.info("The meeting has ended.")
                            navigate("/home", { replace: true })
                        } else if (message.type === "endMeetingResult" && !message.success) {
                            setIsEnding(false)
                            toast.error(message.msg ?? "Unable to end the meeting.")
                        } else if (message.type === "signalingError") {
                            toast.error(message.msg)
                        }
                    } catch (error) {
                        console.error("Failed to handle meeting signaling message.", error)
                        toast.error("A meeting connection error occurred.")
                    }
                }

                connection.onerror = () => {
                    toast.error("Unable to connect to the meeting signaling server.")
                }
            } catch (error) {
                console.error("Unable to initialize meeting media or signaling.", error)
                toast.error("Unable to start your camera and microphone. Check browser permissions and try again.")
            }
        }

        void connect()

        return () => {
            disposed = true
            if (connection) {
                connection.onmessage = null
                connection.close()
            }
            if (socket.current === connection) socket.current = null
            peerMap.current.forEach((peerConnection) => peerConnection.close())
            peerMap.current.clear()
            stream?.getTracks().forEach((track) => track.stop())
        }
    }, [meetingId, userId])

    const endMeeting = () => {
        if (socket.current?.readyState !== WebSocket.OPEN) {
            toast.error("The meeting connection is not ready.")
            return
        }

        setIsEnding(true)
        socket.current.send(JSON.stringify({
            type: "endMeeting",
            userId,
            meetingId,
        }))
    }

    const tiles = Array.from(remoteStreams.entries())
    const surface = isDark ? "bg-[#17221e] text-[#e8efea]" : "bg-[#f5f7f1] text-[#202a2a]"

    return (
        <main className={`flex min-h-screen flex-col ${surface}`}>
            <header className="flex items-center justify-between border-b border-white/10 px-6 py-4 sm:px-8">
                <div>
                    <p className="m-0 text-sm font-bold tracking-wide">Gather</p>
                    <p className="mb-0 mt-1 text-xs text-gather-muted">Meeting room</p>
                </div>
                {isHost && (
                    <Button
                        disabled={isEnding}
                        onClick={endMeeting}
                        title={isEnding ? "Ending meeting..." : "End meeting"}
                        variant="custom"
                        className="border-red-500 bg-red-600 text-white hover:bg-red-700"
                    >
                        <IconPhoneOff aria-hidden="true" size={16} />
                    </Button>
                )}
            </header>

            <section className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 py-6 sm:px-8 sm:py-10">
                <div className="mb-6">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#71905b]">Live meeting</p>
                    <h1 className="m-0 font-display text-2xl font-semibold sm:text-3xl">You’re in the room</h1>
                </div>
                <div className="grid flex-1 content-start grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <VideoTile label="You" stream={localStream} isLocal />
                    {tiles.map(([remoteUserId, remoteStream]) => (
                        <VideoTile key={remoteUserId} label="Participant" stream={remoteStream} />
                    ))}
                </div>
                {tiles.length === 0 && (
                    <p className="mt-5 text-center text-sm text-gather-muted">
                        Your video is ready. Other participants will appear here when they join.
                    </p>
                )}
            </section>
        </main>
    )
}
