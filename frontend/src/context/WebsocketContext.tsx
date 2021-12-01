import * as React from "react";
import { wsUrl } from "../api";
import { UserContextType } from "../types";
import { useUser } from "./UserContext";
export interface Room {
  id: string;
  creator: string;
  members: Member[];
}

export enum WebSocketRequestType {
  createGroupSession,
  joinGroupSession,
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

// DATA RECEIVED FROM USER
export interface SendDataRequest {
  type: WebSocketRequestType.sendData;
  data: { heartRate?: number; power?: number };
  username: string;
}

export type WebSocketRequest =
  | CreateGroupSession
  | JoinGroupSession
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

// export interface CreateGroupSession {
//   type: "create_group_session";
//   username: string;
// }
// export interface JoinGroupSession {
//   type: "join_group_session";
//   username: string;
//   id: string;
// }

// export type WebSocketRequest = CreateGroupSession | JoinGroupSession;

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
  startGroupSession: (username: string) => void;
  activeGroupSession: LocalRoom | null;
  sendMessageToGroup: (message: string) => void;
  joinGroupSession: (groupId: string, username: string) => void;
  joinStatus: "NOT_ASKED" | "LOADING" | "ROOM_NOT_FOUND";
  sendData: (data: { heartRate?: number; power?: number }) => void;
  providedUsername: string;
} | null>(null);

// const ws = new WebSocket(wsUrl);
// let ws = new WebSocket("ws://localhost:8092");

export const WebsocketContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  console.log("wsUrl:", wsUrl);
  const [socket, setSocket] = React.useState(
    React.useCallback(() => new WebSocket(wsUrl), [])
  );

  // const socket = React.useCallback(() => new WebSocket("ws://localhost:8092"), [])

  // const [socket, setSocket] = React.useState<Socket | null>(null);
  const [activeGroupSession, setActiveGroupSession] =
    React.useState<LocalRoom | null>(null);
  const [joinStatus, setJoinStatus] = React.useState<
    "NOT_ASKED" | "LOADING" | "ROOM_NOT_FOUND"
  >("NOT_ASKED");

  const { user } = useUser();

  const [username, setUsername] = React.useState("");
  React.useEffect(() => {
    // const websocket = new WebSocket("ws://localhost:8092");
    socket.onopen = () => {
      console.log("connected");
    };
    socket.onmessage = (e) => {
      const message = JSON.parse(e.data) as WebSocketResponse;
      console.log(message);
      switch (message.type) {
        case WebSocketResponseType.createdGroupSession: {
          console.log("created group session with id:", message.room.id);
          setActiveGroupSession({ ...message.room, workoutData: {} });
          break;
        }
        case WebSocketResponseType.failedToCreateGroupSession: {
          console.log("failed to create group session");
          break;
        }
        case WebSocketResponseType.joinedGroupSession: {
          console.log("joined group session with id:", message.room.id);
          setActiveGroupSession({ ...message.room, workoutData: {} });
          break;
        }
        case WebSocketResponseType.failedToJoinGroupSession: {
          console.log("failed to join group session");
          break;
        }
        case WebSocketResponseType.memberJoinedGroupSession: {
          console.log("activeGroupSession:", activeGroupSession);
          if (!activeGroupSession) return;
          console.log(
            `${message.username} joined group session with id: ${message.room.id}`
          );
          setActiveGroupSession({ ...activeGroupSession, ...message.room });
          break;
        }
        case WebSocketResponseType.memberLeftGroupSession: {
          console.log("activeGroupSession:", activeGroupSession);
          if (!activeGroupSession) return;
          console.log(
            `${message.username} left group session with id: ${message.room.id}`
          );
          setActiveGroupSession({ ...activeGroupSession, ...message.room });
          break;
        }
        case WebSocketResponseType.dataReceived: {
          console.log("workout data received");
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
    // setSocket(websocket);
  }, [activeGroupSession]);
  // React.useEffect(() => {
  // const socket = io(wsUrl);
  // setSocket(socket);

  // socket.on("connect_error", (err) => {
  //   console.error(`connect_error due to ${err.message}`);
  // });

  // socket.on(
  //   "member_joined",
  //   ({ newMember, room }: { newMember: Member; room: Room }) => {
  //     setActiveGroupSession({
  //       ...room,
  //       workoutData: activeGroupSession ? activeGroupSession.workoutData : {},
  //     });
  //   }
  // );
  // socket.on(
  //   "member_left",
  //   ({ leaver, room }: { leaver: string; room: Room }) => {
  //     setActiveGroupSession({
  //       ...room,
  //       workoutData: activeGroupSession ? activeGroupSession.workoutData : {},
  //     });
  //   }
  // );

  // socket.on("group_session_joined", (room: Room) => {
  //   setJoinStatus("NOT_ASKED");
  //   setActiveGroupSession({ ...room, workoutData: {} });
  // });
  // socket.on("failed_to_join_group_session", (room: Room) => {
  //   setJoinStatus("ROOM_NOT_FOUND");
  // });

  // socket.on("group_session_created", (room: Room) => {
  //   setActiveGroupSession({ ...room, workoutData: {} });
  // });
  // }, [setSocket, user, activeGroupSession, setActiveGroupSession]);
  return (
    <WebsocketContext.Provider
      value={{
        activeGroupSession,
        startGroupSession: (username: string) => {
          console.log("start group session as user", username);
          if (socket) {
            console.log("inside if");
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
        sendMessageToGroup: (message: string) => {
          // if (!socket || !activeGroupSession) return;
          // socket.emit("group_message", [username, message]);
        },
        sendData: (data: { heartRate?: number; power?: number }) => {
          if (!activeGroupSession) return;
          if (!data.heartRate && !data.power) {
            return;
          }
          console.log("send data");
          const request: SendDataRequest = {
            type: WebSocketRequestType.sendData,
            data,
            username,
          };
          socket.send(JSON.stringify(request));
        },
        joinStatus,
        providedUsername: username,
      }}
      children={children}
    />
  );
  // return (
  //   <WebsocketContext.Provider
  //     value={{
  //       activeGroupSession,
  //       startGroupSession: (username: string) => {
  //         console.log("start group session as user", username);
  //         if (socket) {
  //           console.log("inside if");
  //           setUsername(username);
  //           socket.emit("create_group_session", {
  //             username,
  //             ftp: 200,
  //             weight: 85,
  //           });
  //         }
  //       },
  //       joinGroupSession: (roomId: string, username: string) => {
  //         if (socket) {
  //           setJoinStatus("LOADING");
  //           setUsername(username);
  //           socket.emit("join_group_session", {
  //             member: { username, ftp: 200, weight: 85 },
  //             roomId: roomId,
  //           });
  //         }
  //       },
  //       sendMessageToGroup: (message: string) => {
  //         if (!socket || !activeGroupSession) return;
  //         socket.emit("group_message", [username, message]);
  //       },
  //       sendData: (data: { heartRate?: number; power?: number }) => {
  //         if (!activeGroupSession) return;
  //         if (!data.heartRate && !data.power) {
  //           return;
  //         }
  //         console.log("send data");
  //         socket?.emit("workout_data", { ...data, username });
  //       },
  //       joinStatus,
  //       providedUsername: username,
  //     }}
  //   >
  //     {children}
  //   </WebsocketContext.Provider>
  // );
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
