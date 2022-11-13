export interface Room {
  id: string;
  creator: string;
  members: Member[];
}

export type WebSocketRequestType =
  | 'create-group-session'
  | 'join-group-session'
  | 'leave-group-session'
  | 'send-data';

export type WebSocketResponseType =
  | 'created-group-session'
  | 'failed-to-create-group-session'
  | 'joined-group-session'
  | 'failed-to-join-group-session'
  | 'member-joined-group-session'
  | 'member-left-group-session'
  | 'data-received';

export interface Member {
  username: string;
  ftp: number;
  weight: number;
}
export interface CreateGroupSession {
  type: 'create-group-session';
  member: Member;
}
export interface JoinGroupSession {
  type: 'join-group-session';
  member: Member;
  roomId: string;
}
export interface LeaveGroupSession {
  type: 'leave-group-session';
  username: string;
}

// DATA RECEIVED FROM USER
export interface SendDataRequest {
  type: 'send-data';
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
  type: 'created-group-session';
  room: Room;
}
export interface CreateGroupSessionErrorResponse {
  type: 'failed-to-create-group-session';
  message: 'Failed to create room.';
}

export type CreateGroupSessionResponse =
  | CreateGroupSessionSuccessResponse
  | CreateGroupSessionErrorResponse;

// JOIN GROUP SESSION
export interface JoinGroupSessionSuccessResponse {
  type: 'joined-group-session';
  room: Room;
}
export interface JoinGroupSessionErrorResponse {
  type: 'failed-to-join-group-session';
  message: 'Failed to join room.';
}

export type JoinGroupSessionResponse =
  | JoinGroupSessionSuccessResponse
  | JoinGroupSessionErrorResponse;

// MEMBER JOINED GROUP SESSION
export interface MemberJoinedResponse {
  type: 'member-joined-group-session';
  room: Room;
  username: string;
}

// MEMBER LEFT GROUP SESSION
export interface MemberLeftResponse {
  type: 'member-left-group-session';
  room: Room;
  username: string;
}

// DATA RECEIVED FROM USER
export interface DataReceivedResponse {
  type: 'data-received';
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
