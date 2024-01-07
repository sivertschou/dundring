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
import { generateRandomString, isSuccess } from '@dundring/utils';
import { slackService } from '.';
import * as redis from '../redis';
import * as websocket from '../websocket';

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

const generateRoomId = async (
  length: number,
  numRetriesPerLength: number,
  numLengthIncreasesLeft: number
): Promise<string | null> => {
  for (let i = 0; i < numRetriesPerLength; i++) {
    const id = generateRandomString(length);
    const roomExists = await redis.roomExists(id);
    if (!roomExists) {
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

const getAvailableRoomId = async () => {
  return generateRoomId(4, 5, 20);
};

const sendDataToRoom = async (
  fromUsername: string,
  data: WebSocketResponse
) => {
  const roomIdStatus = await redis.getRoomFromUsername(fromUsername);
  if (isSuccess(roomIdStatus)) {
    redis.publishMessageToRoom(data, roomIdStatus.data);
  }
};

export const createRoom = async (
  user: Member
): Promise<CreateGroupSessionResponse> => {
  const roomId = await getAvailableRoomId();
  console.log('roomId:', roomId);
  if (roomId === null) {
    console.log(`${user.username} failed to create room.`);
    return {
      type: 'failed-to-create-group-session',
      message: 'Failed to create room.',
    };
  } else {
    console.log(
      `${user.username} created room #${roomId}. Add to connection pool`
    );

    const room: Room = {
      id: roomId,
      members: [user.username],
    };
    slackService.logRoomCreation(user.username, roomId);
    redis.createRoom(roomId, user);
    return { type: 'created-group-session', room };
  }
};

export const joinRoom = async (roomId: string, member: Member) => {
  console.log(
    `${member.username} tries to join ${roomId}. Add to connection pool`
  );
  const joinRoomResponse = await redis.joinRoom(roomId, member);

  if (isSuccess(joinRoomResponse)) {
    const room = joinRoomResponse.data;

    const response: JoinGroupSessionResponse = {
      type: 'joined-group-session',
      room,
    };
    slackService.logRoomJoin(member.username, roomId);

    // TODO: This is not needed as a broadcast is done to everyone including the sender
    websocket.sendMessage(member.username, response);

    redis.publishMessageToRoom(
      {
        type: 'member-joined-group-session',
        username: member.username,
        room,
      },
      roomId
    );
  } else {
    const response: JoinGroupSessionResponse = {
      type: 'failed-to-join-group-session',
      message: 'Failed to join room.',
    };
    websocket.sendMessage(member.username, response);
  }
};
export const leaveRoom = async (username: string, roomId: string) => {
  websocket.removeConnection(username);

  const leaveRoomStatus = await redis.leaveRoom(username, roomId);

  if (isSuccess(leaveRoomStatus)) {
    const usersLeftInRoom = leaveRoomStatus.data;

    if (usersLeftInRoom === 0) {
      slackService.logRoomDeletion(username, roomId);
    } else {
      slackService.logRoomLeave(username, roomId);

      const membersInRoom = await redis.getRoomMembers(roomId);

      if (isSuccess(membersInRoom)) {
        const message: MemberLeftResponse = {
          type: 'member-left-group-session',
          room: { id: roomId, members: membersInRoom.data },
          username,
        };
        redis.publishMessageToRoom(message, roomId);
      }
    }
  }
};
