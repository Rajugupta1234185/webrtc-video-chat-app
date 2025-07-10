import https from "https";
import express from "express";
import { Server } from "socket.io";
import fs from "fs";

const app=express();
const options = {
  key: fs.readFileSync('./localhost+1-key.pem'),
  cert: fs.readFileSync('./localhost+1.pem'),
};

const server=https.createServer(options,app);

const io=new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
});

//now making map functuon to use socket in future use
const emailtosocket=new Map();
const sockettoemail=new Map();

io.on("connection",(socket)=>{
    socket.on("join-room",(data)=>{
        const{roomId,emailId}=data;
        console.log("User: ",emailId," joined room: ",roomId);
        emailtosocket.set(emailId,socket.id);
        sockettoemail.set(socket.id,emailId);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("New-joinee",{emailId,socketId:socket.id});//sending new user emialId to the existing user in the room
        socket.emit("room-joined");//msg for frontedn that room joins complete.now navigate to room page
    });


    socket.on("callingnewuser",(data)=>{
        const {socketId,offer}=data;
        console.log("calling user to socketid:",socketId);
        socket.to(socketId).emit("calling-new-user",{senderSocketId:socket.id,offer});
    });

    socket.on("callreply",(data)=>{
        const {senderSocketId,answer}=data;
        console.log("replying back to existing user");
        socket.to(senderSocketId).emit("getcallanswer",{senderSocketId,answer});
    });


    socket.on("icecandidate",(data)=>{
        const{candidate,socketId}=data;
        console.log("sending ice candidate to remote user");
        socket.to(socketId).emit("icecandidate",{candidate});
    })
})

server.listen(5001,"0.0.0.0",()=>{
    console.log("Socket server listened at 5001");
})
