import {
  CreateGroupSession,
  JoinGroupSession,
  LeaveGroupSession,
  Member,
  SendDataRequest,
  WebSocketResponse,
} from '@dundring/types';
import * as React from 'react';
import { wsUrl } from '../api';
import { UserContextType } from '../types';
import { useLogs } from './LogContext';

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
  createStatus: 'NOT_ASKED' | 'LOADING' | 'ERROR';
  joinGroupSession: (groupId: string, username: string) => void;
  joinStatus: 'NOT_ASKED' | 'LOADING' | 'ROOM_NOT_FOUND';
  leaveGroupSession: () => void;
  sendData: (data: { heartRate?: number; power?: number }) => void;
  providedUsername: string;
  connect: () => void;
} | null>(null);

export const WebsocketContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // TODO: Handle reconnect
  const [socket, setSocket] = React.useState<WebSocket | null>(
    React.useCallback(() => new WebSocket(wsUrl), [])
  );
  const { logEvent } = useLogs();

  const [activeGroupSession, setActiveGroupSession] =
    React.useState<LocalRoom | null>(null);
  const [joinStatus, setJoinStatus] = React.useState<
    'NOT_ASKED' | 'LOADING' | 'ROOM_NOT_FOUND'
  >('NOT_ASKED');
  const [createStatus, setCreateStatus] = React.useState<
    'NOT_ASKED' | 'LOADING' | 'ERROR'
  >('NOT_ASKED');

  const [username, setUsername] = React.useState('');
  React.useEffect(() => {
    if (!socket) return;

    socket.onopen = () => {
      console.log('connected to ws-server');
    };

    socket.onclose = () => {
      console.log('disconnected from ws-server');
      setSocket(null);
    };

    socket.onmessage = (e) => {
      const message = JSON.parse(e.data) as WebSocketResponse;
      switch (message.type) {
        case 'created-group-session': {
          logEvent(`created group session with id: ${message.room.id}`);
          setActiveGroupSession({ ...message.room, workoutData: {} });
          setCreateStatus('NOT_ASKED');
          break;
        }
        case 'failed-to-create-group-session': {
          logEvent('failed to create group session');
          setCreateStatus('ERROR');
          break;
        }
        case 'joined-group-session': {
          logEvent(`joined group session with id: ${message.room.id}`);
          setActiveGroupSession({ ...message.room, workoutData: {} });
          setJoinStatus('NOT_ASKED');
          break;
        }
        case 'failed-to-join-group-session': {
          logEvent('failed to join group session');
          setJoinStatus('ROOM_NOT_FOUND');
          break;
        }
        case 'member-joined-group-session': {
          if (!activeGroupSession) return;
          logEvent(`${message.username} joined group session`);
          setActiveGroupSession({ ...activeGroupSession, ...message.room });
          break;
        }
        case 'member-left-group-session': {
          if (!activeGroupSession) return;
          logEvent(`${message.username} left group session`);
          setActiveGroupSession({ ...activeGroupSession, ...message.room });
          break;
        }
        case 'data-received': {
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
  }, [activeGroupSession, socket, logEvent]);

  return (
    <WebsocketContext.Provider
      value={{
        activeGroupSession,
        startGroupSession: (username: string) => {
          if (socket) {
            setCreateStatus('LOADING');
            setUsername(username);
            const data: CreateGroupSession = {
              type: 'create-group-session',
              member: { username, ftp: 300, weight: 85 },
            };
            socket.send(JSON.stringify(data));
          }
        },
        joinGroupSession: (roomId: string, username: string) => {
          if (socket && joinStatus !== 'LOADING') {
            setJoinStatus('LOADING');
            setUsername(username);
            const data: JoinGroupSession = {
              type: 'join-group-session',
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
              type: 'leave-group-session',
              username,
            };
            socket.send(JSON.stringify(data));
            logEvent('left group session');
          }
        },
        sendData: (data: { heartRate?: number; power?: number }) => {
          if (!activeGroupSession) return;
          if (!socket) return;
          if (!data.heartRate && !data.power) return;

          const request: SendDataRequest = {
            type: 'send-data',
            data,
            username,
          };
          socket.send(JSON.stringify(request));
        },
        joinStatus,
        createStatus,
        providedUsername: username,
        connect: () => {
          if (!socket) {
            setSocket(new WebSocket(wsUrl));
          }
        },
      }}
      children={children}
    />
  );
};

export const useWebsocket = () => {
  const context = React.useContext(WebsocketContext);
  if (context === null) {
    throw new Error(
      'useWebsocket must be used within a WebsocketContextProvider'
    );
  }
  return context;
};
