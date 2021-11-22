import * as React from "react";
import { io, Socket } from "socket.io-client";
import { UserContextType } from "../types";
import { useUser } from "./UserContext";

export const defaultUser: UserContextType = {
  loggedIn: false,
};

interface Member {
  username: string;
  ftp: number;
  weight: number;
}
export interface Room {
  id: string;
  members: Member[];
  creator: string;
}

const WebsocketContext = React.createContext<{
  startGroupSession: (username: string) => void;
  activeGroupSession: Room | null;
  sendMessage: (message: string) => void;
  sendMessageToGroup: (message: string) => void;
  joinGroupSession: (groupId: string, username: string) => void;
  joinStatus: "NOT_ASKED" | "LOADING" | "ROOM_NOT_FOUND";
} | null>(null);

export const WebsocketContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [activeGroupSession, setActiveGroupSession] =
    React.useState<Room | null>(null);
  const [joinStatus, setJoinStatus] = React.useState<
    "NOT_ASKED" | "LOADING" | "ROOM_NOT_FOUND"
  >("NOT_ASKED");

  const { user } = useUser();

  const [username, setUsername] = React.useState("");

  React.useEffect(() => {
    const socket = io("ws://localhost:8092");
    setSocket(socket);

    socket.on(
      "member_joined",
      ({ newMember, room }: { newMember: Member; room: Room }) => {
        console.log("Member joined: ", newMember, " - members:", room.members);
        setActiveGroupSession(room);
      }
    );
    socket.on(
      "member_left",
      ({ leaver, room }: { leaver: string; room: Room }) => {
        console.log("Member joined: ", leaver, " - members:", room.members);
        setActiveGroupSession(room);
      }
    );

    socket.on("group_message", (msg) => {
      console.log("group_message", msg);
    });

    socket.on("update", (msg) => {
      console.log("msg", msg);
    });

    socket.on("group_session_joined", (room: Room) => {
      setJoinStatus("NOT_ASKED");
      console.log("group session with id joined:", room.id);
      setActiveGroupSession(room);
    });
    socket.on("failed_to_join_group_session", (room: Room) => {
      setJoinStatus("ROOM_NOT_FOUND");
      console.log("failed to join group session with id:", room.id);
    });

    socket.on("group_session_created", (room: Room) => {
      console.log("group session with id created:", room.id);
      setActiveGroupSession(room);
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
        startGroupSession: (username: string) => {
          console.log("startGroupSession", username);
          if (socket) {
            setUsername(username);
            socket.emit("create_group_session", {
              username,
              ftp: 200,
              weight: 85,
            });
          }
        },
        joinGroupSession: (roomId: string, username: string) => {
          if (socket) {
            setJoinStatus("LOADING");
            setUsername(username);
            socket.emit("join_group_session", {
              member: { username, ftp: 200, weight: 85 },
              roomId: roomId,
            });
          }
        },
        sendMessageToGroup: (message: string) => {
          if (!socket || !activeGroupSession) return;
          socket.emit("group_message", [username, message]);
        },
        joinStatus,
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
