import { toast } from "sonner"
import { createPeerConnection, flushRemoteIceCandidates } from "./createPeerConnection"

export const handleIncomingAnswer = async ({ receiverId, peerMap, socket, meetingId, userId, localStream, onRemoteStream, sdp }: {
    receiverId: string,
    peerMap: React.RefObject<Map<string, RTCPeerConnection> | null>,
    socket: React.RefObject<WebSocket | null>,
    meetingId: string,
    userId: string,
    localStream: MediaStream,
    onRemoteStream: (userId: string, stream: MediaStream) => void,
    sdp: RTCSessionDescriptionInit
}) => {
    const pc = createPeerConnection({ receiverId, peerMap, socket, meetingId, userId, localStream, onRemoteStream })
    if (!pc) {
        toast.error("Err joining meeting")
        return
    }
    if (!sdp) {
        toast.error("Err joining meeting")
        return
    }

    await pc.setRemoteDescription(
        new RTCSessionDescription(sdp)
    )
    await flushRemoteIceCandidates(pc)

}