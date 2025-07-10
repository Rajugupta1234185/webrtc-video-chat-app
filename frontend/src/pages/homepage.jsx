import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../provider/socket";

export default function HomePage() {
  const [roomId, setRoomId] = useState("");
  const [emailId, setEmailId] = useState("");
  const {socket} =useSocket();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("join-room",{roomId,emailId});
    
  };

  useEffect(()=>{
    socket.on("room-joined",()=>{
        navigate(`/room/${roomId}`);
    });

    return()=>{
        socket.off("room-joined");
    }
  },[socket,roomId,navigate]);

  return (
    <div style={styles.container}>
      <h2>Join Video Call</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          placeholder="Enter Email ID"
          value={emailId}
          onChange={(e) => setEmailId(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>
          Join Room
        </button>
      </form>
    </div>
  );
}

const styles = {
container: {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",   // vertical centering
  alignItems: "center",       // horizontal centering
  height: "100vh", 
  width:"100vw",           // THIS IS THE MISSING PIECE
  fontFamily: "Arial, sans-serif",
},

  form: {
    display: "flex",
    flexDirection: "column",
    width: "300px",
    gap: "20px",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
};
