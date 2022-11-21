import {
  CreateGroupSessionResponse,
  DataReceivedResponse,
  JoinGroupSessionResponse,
  Member,
  MemberJoinedResponse,
  MemberLeftResponse,
  Room,
  WebSocketResponse,
} from '@dundring/types';
import { generateRandomString } from '@dundring/utils';
import { WebSocket } from 'ws';
import { slackService } from '.';

export interface ServerMember {
  username: string;
  ftp: number;
  weight: number;
  socket: WebSocket;
}

interface ServerRoom extends Room {
  members: ServerMember[];
}

const rooms: { [roomId: string]: ServerRoom } = {};
const usersAndActiveRooms: { [username: string]: string } = {};

export const sendWorkoutDataToRoom = (
  username: string,
  data: { heartRata?: number; power?: number }
) => {
  const response: DataReceivedResponse = {
    type: 'data-received',
    data,
    username,
  };
  sendDataToRoom(username, response);
};

const generateRoomId = (
  length: number,
  numRetriesPerLength: number,
  numLengthIncreasesLeft: number
): string | null => {
  for (let i = 0; i < numRetriesPerLength; i++) {
    const id = generateRandomString(length);
    if (!rooms[id]) {
      return id;
    }
  }
  if (numLengthIncreasesLeft > 0) {
    return generateRoomId(
      length + 1,
      numLengthIncreasesLeft,
      numLengthIncreasesLeft - 1
    );
  } else {
    // could not find a free id - TODO: logging
    return null;
  }
};

const getAvailableRoomId = () => {
  return generateRoomId(4, 5, 20);
};
const sendDataToRoom = (fromUsername: string, data: WebSocketResponse) => {
  const roomId = usersAndActiveRooms[fromUsername];
  if (!roomId) return;
  const room = rooms[roomId];
  if (!room) return;
  room.members
    .filter((member) => member.username !== fromUsername)
    .map((member) => {
      member.socket.send(JSON.stringify(data));
    });
};

export const createRoom = (
  creator: ServerMember
): CreateGroupSessionResponse => {
  const roomId = getAvailableRoomId();
  if (roomId === null) {
    console.log(`${creator.username} failed to create room.`);
    return {
      type: 'failed-to-create-group-session',
      message: 'Failed to create room.',
    };
  } else {
    console.log(`${creator.username} created room #${roomId}`);
    const room: ServerRoom = {
      id: roomId,
      creator: creator.username,
      members: [creator],
    };
    slackService.logRoomCreation(room);
    rooms[roomId] = room;
    usersAndActiveRooms[creator.username] = room.id;
    return { type: 'created-group-session', room };
  }
};
const toMember = (serverMember: ServerMember): Member => ({
  username: serverMember.username,
  ftp: serverMember.ftp,
  weight: serverMember.weight,
});
const toRoom = (serverRoom: ServerRoom): Room => ({
  id: serverRoom.id,
  creator: serverRoom.creator,
  members: serverRoom.members.map((serverMember) => toMember(serverMember)),
});
export const joinRoom = (
  ws: WebSocket,
  roomId: string,
  member: ServerMember
) => {
  const room = rooms[roomId];

  if (room) {
    const updatedRoom = { ...room, members: [...room.members, member] };
    rooms[roomId] = updatedRoom;
    usersAndActiveRooms[member.username] = roomId;

    const response: JoinGroupSessionResponse = {
      type: 'joined-group-session',
      room: toRoom(updatedRoom),
    };
    slackService.logRoomJoin(member.username, room);

    ws.send(JSON.stringify(response));

    updatedRoom.members
      .filter((m) => m.username !== member.username)
      .map((m) => {
        const message: MemberJoinedResponse = {
          type: 'member-joined-group-session',
          room: toRoom(updatedRoom),
          username: member.username,
        };
        m.socket.send(JSON.stringify(message));
      });
  } else {
    const response: JoinGroupSessionResponse = {
      type: 'failed-to-join-group-session',
      message: 'Failed to join room.',
    };
    ws.send(JSON.stringify(response));
  }
};
export const leaveRoom = (username: string) => {
  const roomId = usersAndActiveRooms[username];
  const room = rooms[roomId];
  if (room) {
    const updatedRoom = {
      ...room,
      members: [...room.members].filter(
        (member) => member.username !== username
      ),
    };

    if (updatedRoom.members.length === 0) {
      slackService.logRoomDeletion(username, room);
      delete rooms[roomId];
    } else {
      slackService.logRoomLeave(username, room);
      rooms[roomId] = updatedRoom;

      delete usersAndActiveRooms[username];

      updatedRoom.members
        .filter((m) => m.username !== username)
        .map((m) => {
          const message: MemberLeftResponse = {
            type: 'member-left-group-session',
            room: toRoom(updatedRoom),
            username,
          };
          m.socket.send(JSON.stringify(message));
        });
    }
  }
};
