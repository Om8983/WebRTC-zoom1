
const pendingIceCandidates = new WeakMap<RTCPeerConnection, RTCIceCandidateInit[]>()

export const createPeerConnection = ({ receiverId, peerMap, socket, meetingId, userId, localStream, onRemoteStream }: {
    receiverId: string,
    peerMap: React.RefObject<Map<string, RTCPeerConnection> | null>,
    socket: React.RefObject<WebSocket | null>,
    meetingId: string,
    userId: string,
    localStream: MediaStream,
    onRemoteStream: (userId: string, stream: MediaStream) => void
}) => {
    const existing = peerMap.current?.get(receiverId)
    if (existing) {
        return existing
    }

    const pc = new RTCPeerConnection({
        iceServers: [{
            urls: 'stun:stun.l.google.com:19302'
        }]
    })

    peerMap.current?.set(receiverId, pc)

    pc.onicecandidate = (event) => {
        const candidate = event.candidate;
        if (!candidate) return
        const payload = {
            type: "addIceCandidate",
            userId,
            meetingId: meetingId,
            targetId: receiverId,
            candidate: candidate
        }
        socket.current?.send(JSON.stringify(payload))
    }

    pc.ontrack = (event) => {
        const [stream] = event.streams
        if (stream) {
            onRemoteStream(receiverId, stream)
            return
        }

        const fallbackStream = new MediaStream([event.track])
        onRemoteStream(receiverId, fallbackStream)
    }

    localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream)
    })

    return pc

}

export const addRemoteIceCandidate = async (
    pc: RTCPeerConnection,
    candidate: RTCIceCandidateInit,
) => {
    if (!pc.remoteDescription) {
        const pending = pendingIceCandidates.get(pc) ?? []
        pending.push(candidate)
        pendingIceCandidates.set(pc, pending)
        return
    }

    await pc.addIceCandidate(candidate)
}

export const flushRemoteIceCandidates = async (pc: RTCPeerConnection) => {
    const pending = pendingIceCandidates.get(pc) ?? []
    pendingIceCandidates.delete(pc)

    for (const candidate of pending) {
        await pc.addIceCandidate(candidate)
    }
}