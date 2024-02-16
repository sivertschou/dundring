import {Room, UserBase} from '@dundring/types';
export declare const checkSlackConfig: () => void;
export declare const logUserCreation: (user: UserBase) => void;
export declare const logRoomJoin: (username: string, room: Room) => void;
export declare const logRoomCreation: (room: Room) => void;
export declare const logRoomLeave: (username: string, room: Room) => void;
export declare const logRoomDeletion: (username: string, room: Room) => void;
export declare const logAndReturn: <T>(message: string, data: T) => T;
//# sourceMappingURL=slackService.d.ts.map
