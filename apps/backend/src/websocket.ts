import { Status, WebSocketRequest, WebSocketResponse } from '@dundring/types';
import { WebSocketServer, WebSocket } from 'ws';
import { groupSessionService } from './services';
import * as redis from './redis';
import { error, isSuccess, success } from '@dundring/utils';
import { logger } from './logger';

const connections: { [username: string]: WebSocket } = {};

export const initWebsockets = (webSocketServer: WebSocketServer) => {
  webSocketServer.on('connection', (ws) => {
    console.log('connection');
    let username = '';
    let roomId = '';
    ws.on('message', async (rawData) => {
      const req = JSON.parse(rawData.toString()) as WebSocketRequest;
      switch (req.type) {
        case 'create-group-session': {
          username = req.member.username;
          addConnection(username, ws);

          const createRoomResponse = await groupSessionService.createRoom(
            req.member
          );
          roomId =
            createRoomResponse.type === 'created-group-session'
              ? createRoomResponse.room.id
              : '';

          ws.send(JSON.stringify(createRoomResponse));
          break;
        }
        case 'join-group-session': {
          username = req.member.username;
          roomId = req.roomId;
          addConnection(username, ws);

          groupSessionService.joinRoom(roomId, req.member);
          break;
        }
        case 'leave-group-session': {
          const { username } = req;
          groupSessionService.leaveRoom(username, roomId);
          break;
        }
        case 'send-data': {
          if (!username) {
            logger.warn('unknown tried to share workoutdata');
            return;
          }
          groupSessionService.sendWorkoutDataToRoom(username, req.data);
          break;
        }
      }
    });
    ws.on('close', () => {
      logger.info('connection closed', username);
      if (username && roomId) {
        groupSessionService.leaveRoom(username, roomId);
        username = '';
        roomId = '';
      }
    });
  });
};

export const addConnection = (username: string, socket: WebSocket) => {
  connections[username] = socket;
};

export const removeConnection = (username: string) => {
  delete connections[username];
};

export const sendMessageToRoom = async (
  roomId: string,
  message: WebSocketResponse
) => {
  const roomMembersStatus = await redis.getRoomMembers(roomId);
  if (isSuccess(roomMembersStatus)) {
    roomMembersStatus.data
      .map((member) => connections[member])
      .filter((socket) => socket)
      .map((socket) => socket.send(JSON.stringify(message)));
  } else {
    logger.error(`[websocket]: Could not send message to room ${roomId}`);
  }
};

export const sendMessage = (
  recipientUsername: string,
  message: WebSocketResponse
): Status<{}, 'Socket not found for username'> => {
  const socket = connections[recipientUsername];
  if (socket) {
    socket.send(JSON.stringify(message));
    return success({});
  } else {
    logger.error(
      `[websocket]: Socket not found for username ${recipientUsername}`
    );
    return error('Socket not found for username');
  }
};
