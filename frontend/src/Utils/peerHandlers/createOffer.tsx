import { toast } from "sonner"
import { createPeerConnection } from "./createPeerConnection"

export const createOfferFor = async ({ receiverId, peerMap, socket, meetingId, userId, localStream, onRemoteStream }: {
    receiverId: string,
    peerMap: React.RefObject<Map<string, RTCPeerConnection> | null>,
    socket: React.RefObject<WebSocket | null>,
    meetingId: string,
    userId: string,
    localStream: MediaStream,
    onRemoteStream: (userId: string, stream: MediaStream) => void
}) => {
    const pc = createPeerConnection({ receiverId, peerMap, socket, meetingId, userId, localStream, onRemoteStream })
    if (!pc) {
        toast.error("Error while joinig.")
        return
    }
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    const payload = {
        type: 'createOffer',
        userId,
        meetingId: meetingId,
        targetId: receiverId,
        sdp: pc.localDescription
    }
    socket.current?.send(JSON.stringify(payload))

}