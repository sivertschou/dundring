import * as React from "react";
import { wsUrl } from "../api";
import { UserContextType } from "../types";
export interface Room {
  id: string;
  creator: string;
  members: Member[];
}

export enum WebSocketRequestType {
  createGroupSession,
  joinGroupSession,
  leaveGroupSession,
  sendData,
}

export enum WebSocketResponseType {
  createdGroupSession,
  failedToCreateGroupSession,
  joinedGroupSession,
  failedToJoinGroupSession,
  memberJoinedGroupSession,
  memberLeftGroupSession,
  dataReceived,
}

export interface Member {
  username: string;
  ftp: number;
  weight: number;
}
export interface CreateGroupSession {
  type: WebSocketRequestType.createGroupSession;
  member: Member;
}
export interface JoinGroupSession {
  type: WebSocketRequestType.joinGroupSession;
  member: Member;
  roomId: string;
}
export interface LeaveGroupSession {
  type: WebSocketRequestType.leaveGroupSession;
  username: string;
}

// DATA RECEIVED FROM USER
export interface SendDataRequest {
  type: WebSocketRequestType.sendData;
  data: { heartRate?: number; power?: number };
  username: string;
}

export type WebSocketRequest =
  | CreateGroupSession
  | JoinGroupSession
  | LeaveGroupSession
  | SendDataRequest;

// CREATE GROUP SESSION
export interface CreateGroupSessionSuccessResponse {
  type: WebSocketResponseType.createdGroupSession;
  room: Room;
}
export interface CreateGroupSessionErrorResponse {
  type: WebSocketResponseType.failedToCreateGroupSession;
  message: "Failed to create room.";
}

export type CreateGroupSessionResponse =
  | CreateGroupSessionSuccessResponse
  | CreateGroupSessionErrorResponse;

// JOIN GROUP SESSION
export interface JoinGroupSessionSuccessResponse {
  type: WebSocketResponseType.joinedGroupSession;
  room: Room;
}
export interface JoinGroupSessionErrorResponse {
  type: WebSocketResponseType.failedToJoinGroupSession;
  message: "Failed to join room.";
}

export type JoinGroupSessionResponse =
  | JoinGroupSessionSuccessResponse
  | JoinGroupSessionErrorResponse;

// MEMBER JOINED GROUP SESSION
export interface MemberJoinedResponse {
  type: WebSocketResponseType.memberJoinedGroupSession;
  room: Room;
  username: string;
}

// MEMBER LEFT GROUP SESSION
export interface MemberLeftResponse {
  type: WebSocketResponseType.memberLeftGroupSession;
  room: Room;
  username: string;
}

// DATA RECEIVED FROM USER
export interface DataReceivedResponse {
  type: WebSocketResponseType.dataReceived;
  data: { heartRate?: number; power?: number };
  username: string;
}

// RESPONSES
export type WebSocketResponse =
  | CreateGroupSessionResponse
  | JoinGroupSessionResponse
  | MemberJoinedResponse
  | MemberLeftResponse
  | DataReceivedResponse;

export const defaultUser: UserContextType = {
  loggedIn: false,
};

export interface Room {
  id: string;
  members: Member[];
  creator: string;
}

export interface LocalRoom extends Room {
  workoutData: { [username: string]: { heartRate?: number; power?: number }[] };
}

const WebsocketContext = React.createContext<{
  activeGroupSession: LocalRoom | null;
  startGroupSession: (username: string) => void;
  createStatus: "NOT_ASKED" | "LOADING" | "ERROR";
  joinGroupSession: (groupId: string, username: string) => void;
  joinStatus: "NOT_ASKED" | "LOADING" | "ROOM_NOT_FOUND";
  leaveGroupSession: () => void;
  sendData: (data: { heartRate?: number; power?: number }) => void;
  providedUsername: string;
} | null>(null);

export const WebsocketContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // TODO: Handle reconnect
  const [socket] = React.useState(
    React.useCallback(() => new WebSocket(wsUrl), [])
  );

  const [activeGroupSession, setActiveGroupSession] =
    React.useState<LocalRoom | null>(null);
  const [joinStatus, setJoinStatus] = React.useState<
    "NOT_ASKED" | "LOADING" | "ROOM_NOT_FOUND"
  >("NOT_ASKED");
  const [createStatus, setCreateStatus] = React.useState<
    "NOT_ASKED" | "LOADING" | "ERROR"
  >("NOT_ASKED");

  const [username, setUsername] = React.useState("");
  React.useEffect(() => {
    socket.onopen = () => {
      console.log("connected");
    };
    socket.onclose = () => {
      console.log("disconnected");
    };
    socket.onmessage = (e) => {
      const message = JSON.parse(e.data) as WebSocketResponse;
      switch (message.type) {
        case WebSocketResponseType.createdGroupSession: {
          console.log("created group session with id:", message.room.id);
          setActiveGroupSession({ ...message.room, workoutData: {} });
          setCreateStatus("NOT_ASKED");
          break;
        }
        case WebSocketResponseType.failedToCreateGroupSession: {
          console.log("failed to create group session");
          setCreateStatus("ERROR");
          break;
        }
        case WebSocketResponseType.joinedGroupSession: {
          console.log("joined group session with id:", message.room.id);
          setActiveGroupSession({ ...message.room, workoutData: {} });
          setJoinStatus("NOT_ASKED");
          break;
        }
        case WebSocketResponseType.failedToJoinGroupSession: {
          console.log("failed to join group session");
          setJoinStatus("ROOM_NOT_FOUND");
          break;
        }
        case WebSocketResponseType.memberJoinedGroupSession: {
          if (!activeGroupSession) return;
          console.log(
            `${message.username} joined group session with id: ${message.room.id}`
          );
          setActiveGroupSession({ ...activeGroupSession, ...message.room });
          break;
        }
        case WebSocketResponseType.memberLeftGroupSession: {
          if (!activeGroupSession) return;
          console.log(
            `${message.username} left group session with id: ${message.room.id}`
          );
          setActiveGroupSession({ ...activeGroupSession, ...message.room });
          break;
        }
        case WebSocketResponseType.dataReceived: {
          const sender = message.username;
          const data = message.data;

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
      }
    };
  }, [activeGroupSession, socket]);

  return (
    <WebsocketContext.Provider
      value={{
        activeGroupSession,
        startGroupSession: (username: string) => {
          if (socket) {
            setCreateStatus("LOADING");
            setUsername(username);
            const data: CreateGroupSession = {
              type: WebSocketRequestType.createGroupSession,
              member: { username, ftp: 300, weight: 85 },
            };
            socket.send(JSON.stringify(data));
          }
        },
        joinGroupSession: (roomId: string, username: string) => {
          if (socket) {
            setJoinStatus("LOADING");
            setUsername(username);
            const data: JoinGroupSession = {
              type: WebSocketRequestType.joinGroupSession,
              member: { username, ftp: 300, weight: 85 },
              roomId,
            };
            socket.send(JSON.stringify(data));
          }
        },
        leaveGroupSession: () => {
          if (socket) {
            setActiveGroupSession(null);
            const data: LeaveGroupSession = {
              type: WebSocketRequestType.leaveGroupSession,
              username,
            };
            socket.send(JSON.stringify(data));
          }
        },
        sendData: (data: { heartRate?: number; power?: number }) => {
          if (!activeGroupSession) return;
          if (!data.heartRate && !data.power) {
            return;
          }
          const request: SendDataRequest = {
            type: WebSocketRequestType.sendData,
            data,
            username,
          };
          socket.send(JSON.stringify(request));
        },
        joinStatus,
        createStatus,
        providedUsername: username,
      }}
      children={children}
    />
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
