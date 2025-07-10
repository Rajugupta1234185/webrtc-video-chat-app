import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "../provider/socket";
import { usePeer } from "../provider/peer";

export default function Room() {
  const localstreamref = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null); // 💡 Store peer here per session

  const [remoteUserEmail, setRemoteUserEmail] = useState("");
  const [remoteSocketId, setRemoteSocketId] = useState("");

  const { socket } = useSocket();
  const { createPeer, createOffer, createAnswer } = usePeer();

  // 🧠 Helper: attach media stream to video tag
  const attachStreamToVideo = (stream, videoRef) => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  // 📞 Handle new user joining
  useEffect(() => {
    socket.on("New-joinee", async ({ emailId, socketId }) => {
      console.log("User: ", emailId, "joined your Room");
      setRemoteUserEmail(emailId);
      setRemoteSocketId(socketId);

      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localstreamref.current = localStream;
      attachStreamToVideo(localStream, localVideoRef);

      // 🔄 Create new peer
      const peer = createPeer();
      peerRef.current = peer;

      // 🧊 Handle ICE
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("icecandidate", { candidate: event.candidate, socketId });
        }
      };

      // 🔁 On remote stream
      peer.ontrack = (event) => {
        attachStreamToVideo(event.streams[0], remoteVideoRef);
      };

      // 📤 Add local tracks
      localStream.getTracks().forEach((track) => {
        peer.addTrack(track, localStream);
      });

      const offer = await createOffer(); // Will use peerRef.current internally
      socket.emit("callingnewuser", { socketId, offer });
    });

    return () => {
      socket.off("New-joinee");
    };
  }, [socket, createPeer, createOffer]);

  // 📥 Receive offer & send answer
  useEffect(() => {
    socket.on("calling-new-user", async ({ senderSocketId, offer }) => {
      console.log("Incoming call...");

      setRemoteSocketId(senderSocketId);

      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localstreamref.current = localStream;
      attachStreamToVideo(localStream, localVideoRef);

      const peer = createPeer();
      peerRef.current = peer;

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("icecandidate", { candidate: event.candidate, socketId: senderSocketId });
        }
      };

      peer.ontrack = (event) => {
        attachStreamToVideo(event.streams[0], remoteVideoRef);
      };

      localStream.getTracks().forEach((track) => {
        peer.addTrack(track, localStream);
      });

      const answer = await createAnswer(offer);
      socket.emit("callreply", { senderSocketId, answer });
    });

    return () => {
      socket.off("calling-new-user");
    };
  }, [socket, createPeer, createAnswer]);

  // 📬 Existing user receives answer
  useEffect(() => {
    socket.on("getcallanswer", async ({ answer }) => {
      console.log("Received answer");
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(answer);
      }
    });

    return () => {
      socket.off("getcallanswer");
    };
  }, [socket]);

  // 📩 Receive ICE
  useEffect(() => {
    socket.on("icecandidate", async ({ candidate }) => {
      try {
        if (peerRef.current) {
          await peerRef.current.addIceCandidate(candidate);
        }
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    });

    return () => {
      socket.off("icecandidate");
    };
  }, [socket]);

  // 🧼 Cleanup
  useEffect(() => {
    return () => {
      if (localstreamref.current) {
        localstreamref.current.getTracks().forEach((track) => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.close();
      }
    };
  }, []);

  return (
    <div>
      <h1>Room Page</h1>
      <p>Connected with: {remoteUserEmail || "Waiting..."}</p>
      <div style={{ display: "flex", gap: "20px" }}>
        <div>
          <h3>📹 You</h3>
          <video ref={localVideoRef} autoPlay playsInline muted style={{ width: "300px", border: "2px solid green" }} />
        </div>
        <div>
          <h3>📞 Remote</h3>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "300px", border: "2px solid red" }} />
        </div>
      </div>
    </div>
  );
}
