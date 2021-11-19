import * as React from "react";
import { io, Socket } from "socket.io-client";
import { httpUrl, wsUrl } from "../api";
import { UserContextType } from "../types";

export const defaultUser: UserContextType = {
  loggedIn: false,
};

interface GroupSession {
  id: string;
}

const WebsocketContext = React.createContext<{
  startGroupSession: () => void;
  activeGroupSession: GroupSession | null;
  sendMessage: (message: string) => void;
} | null>(null);

export const WebsocketContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [activeGroupSession, setActiveGroupSession] =
    React.useState<GroupSession | null>(null);
  // const socket = io(httpUrl);
  // socket.on("connect", () => {
  // console.log(socket.id); // x8WIv7-mJelg7on_ALbx
  // // });
  // const socket = new WebSocket("ws://localhost:8092");

  // socket.onopen = () => {
  //   socket.send("Hello!");
  // };

  // socket.onmessage = (data) => {
  //   console.log(data);
  // };

  React.useEffect(() => {
    const socket = io("ws://localhost:8092");
    setSocket(socket);

    socket.on("connect", () => {
      // either with send()
      // socket.emit("chat message", "HALLA");
      socket.emit("create_group_session");
    });

    socket.on("update", (msg) => {
      console.log("msg", msg);
    });

    socket.on("group_session_created", (msg) => {
      console.log("group session with id created:", msg);
    });
  }, [setSocket]);
  // const socket = io("ws://localhost:8092");

  // socket.on("connect", () => {
  //   // either with send()
  //   socket.emit("chat message", "HALLA");
  // });

  // ws.onopen = () => {
  //   console.log("WS connected");
  // };
  return (
    <WebsocketContext.Provider
      value={{
        sendMessage: (msg) => console.log("msg", msg),
        activeGroupSession,
        startGroupSession: () => {
          if (socket) {
            socket.emit("create_group_session");
          }
        },
      }}
    >
      {children}
    </WebsocketContext.Provider>
  );
};

export const useWebsocket = () => {
  const context = React.useContext(WebsocketContext);
  if (context === null) {
    throw new Error(
      "useWebsocket must be used within a WebsocketContextProvider"
    );
  }
  return context;
};
