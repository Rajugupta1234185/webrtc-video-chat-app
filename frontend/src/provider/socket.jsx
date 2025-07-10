import React ,{useMemo} from "react";
import {io} from "socket.io-client";

const socketcontext=React.createContext();

export const useSocket=()=>{
    return React.useContext(socketcontext);
}

export const SocketProvider=(props)=>{
    const socket=useMemo(()=>io("https://192.168.1.75:5001"),[])//it runs only once when component mounts or unmount
    return(
        <socketcontext.Provider value={{socket}}>
            {props.children}
        </socketcontext.Provider>
    );
}