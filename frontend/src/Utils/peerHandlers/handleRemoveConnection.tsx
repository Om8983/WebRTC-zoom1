export const handleRemoveConnection = ({ receiverId, peerMap }: { receiverId: string, peerMap: React.RefObject<Map<string, RTCPeerConnection> | null> }) => {
    const pc = peerMap.current?.get(receiverId)
    if (!pc) return
    pc.close();
    peerMap.current?.delete(receiverId)
    return
}