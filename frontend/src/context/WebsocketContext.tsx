import * as React from "react";
import { io, Socket } from "socket.io-client";
import { wsUrl } from "../api";
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

interface LocalRoom extends Room {
  workoutData: { [username: string]: { heartRate: number; power: number }[] };
}

const WebsocketContext = React.createContext<{
  startGroupSession: (username: string) => void;
  activeGroupSession: LocalRoom | null;
  sendMessageToGroup: (message: string) => void;
  joinGroupSession: (groupId: string, username: string) => void;
  joinStatus: "NOT_ASKED" | "LOADING" | "ROOM_NOT_FOUND";
  sendData: (data: { heartRate?: number; power?: number }) => void;
  providedUsername: string;
} | null>(null);

export const WebsocketContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [activeGroupSession, setActiveGroupSession] =
    React.useState<LocalRoom | null>(null);
  const [joinStatus, setJoinStatus] = React.useState<
    "NOT_ASKED" | "LOADING" | "ROOM_NOT_FOUND"
  >("NOT_ASKED");

  const { user } = useUser();

  const [username, setUsername] = React.useState("");

  React.useEffect(() => {
    const socket = io(wsUrl);
    setSocket(socket);

    socket.on(
      "member_joined",
      ({ newMember, room }: { newMember: Member; room: Room }) => {
        setActiveGroupSession({
          ...room,
          workoutData: activeGroupSession ? activeGroupSession.workoutData : {},
        });
      }
    );
    socket.on(
      "member_left",
      ({ leaver, room }: { leaver: string; room: Room }) => {
        setActiveGroupSession({
          ...room,
          workoutData: activeGroupSession ? activeGroupSession.workoutData : {},
        });
      }
    );

    socket.on(
      "workout_data",
      ({
        data,
        sender,
      }: {
        data: { heartRate: number; power: number };
        sender: string;
      }) => {
        setActiveGroupSession((activeGroupSession) => {
          if (!activeGroupSession) {
            return null;
          }
          const prevWorkoutValues =
            activeGroupSession.workoutData[sender] || [];
          return {
            ...activeGroupSession,
            workoutData: {
              ...activeGroupSession.workoutData,
              [sender]: [data, ...prevWorkoutValues],
            },
          };
        });
      }
    );

    socket.on("group_session_joined", (room: Room) => {
      setJoinStatus("NOT_ASKED");
      setActiveGroupSession({ ...room, workoutData: {} });
    });
    socket.on("failed_to_join_group_session", (room: Room) => {
      setJoinStatus("ROOM_NOT_FOUND");
    });

    socket.on("group_session_created", (room: Room) => {
      setActiveGroupSession({ ...room, workoutData: {} });
    });
  }, [setSocket, user, setActiveGroupSession]);

  return (
    <WebsocketContext.Provider
      value={{
        activeGroupSession,
        startGroupSession: (username: string) => {
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
        sendData: (data: { heartRate?: number; power?: number }) => {
          if (!data.heartRate && !data.power) {
            return;
          }
          socket?.emit("workout_data", data);
        },
        joinStatus,
        providedUsername: username,
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
