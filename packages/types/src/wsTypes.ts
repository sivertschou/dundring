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
  message: 'Failed to create room.';
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
  message: 'Failed to join room.';
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
