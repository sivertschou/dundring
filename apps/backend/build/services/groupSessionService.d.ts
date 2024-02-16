import {CreateGroupSessionResponse} from '@dundring/types';
import {WebSocket} from 'ws';
export interface ServerMember {
	username: string;
	ftp: number;
	weight: number;
	socket: WebSocket;
}
export declare const sendWorkoutDataToRoom: (
	username: string,
	data: {
		heartRata?: number;
		power?: number;
	},
) => void;
export declare const createRoom: (
	creator: ServerMember,
) => CreateGroupSessionResponse;
export declare const joinRoom: (
	ws: WebSocket,
	roomId: string,
	member: ServerMember,
) => void;
export declare const leaveRoom: (username: string) => void;
//# sourceMappingURL=groupSessionService.d.ts.map
