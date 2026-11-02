import { toast } from "sonner"
import { addRemoteIceCandidate, createPeerConnection } from "./createPeerConnection"

export const addIceCandidate = async ({ receiverId, peerMap, socket, meetingId, userId, localStream, onRemoteStream, candidate }: {
    receiverId: string,
    peerMap: React.RefObject<Map<string, RTCPeerConnection> | null>,
    socket: React.RefObject<WebSocket | null>,
    meetingId: string,
    userId: string,
    localStream: MediaStream,
    onRemoteStream: (userId: string, stream: MediaStream) => void,
    candidate: RTCIceCandidateInit
}) => {
    const pc = createPeerConnection({ receiverId, peerMap, socket, meetingId, userId, localStream, onRemoteStream })
    if (!pc) {
        toast.error("Err joining meeting")
        return
    }
    if (!candidate) {
        toast.error("Err joining meeting")
        return
    }

    await addRemoteIceCandidate(pc, candidate)
}