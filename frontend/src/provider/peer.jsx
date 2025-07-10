import React, { useRef, useCallback, createContext, useContext } from "react";

const peerContext = createContext();

export const usePeer = () => useContext(peerContext);

export const PeerProvider = ({ children }) => {
  const peerRef = useRef(null);

  const createPeer = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    });

    peerRef.current = pc;
    return pc;
  }, []);

  const getPeer = () => {
    if (!peerRef.current || peerRef.current.signalingState === "closed") {
      return createPeer();
    }
    return peerRef.current;
  };

  const createOffer = async () => {
    const peer = getPeer();
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  };

  const createAnswer = async (offer) => {
    const peer = getPeer();
    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    return answer;
  };

  return (
    <peerContext.Provider value={{ peerRef, createPeer, createOffer, createAnswer }}>
      {children}
    </peerContext.Provider>
  );
};
