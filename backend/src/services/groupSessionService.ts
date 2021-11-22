import { Status } from "../../../common/types/serviceTypes";
import { Socket, Server } from "socket.io";
interface Room {
  id: string;
  creator: string;
  members: Member[];
}

export interface Member {
  username: string;
  ftp: number;
  weight: number;
}

const rooms: { [roomId: string]: Room } = {};
const usersAndActiveRooms: { [username: string]: string } = {};
export const sendMessageToRoom = (
  socket: Socket,
  io: Server,
  message: string
) => {
  io.to(socket.data.room).emit("group_message", {
    message,
    sender: socket.data.username,
  });
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

export const createRoom = (socket: Socket, creator: Member) => {
  const roomId = getAvailableRoomId();
  if (roomId === null) {
    return null;
  } else {
    socket.join(roomId);
    const room = {
      id: roomId,
      creator: creator.username,
      members: [creator],
    };
    rooms[roomId] = room;
    usersAndActiveRooms[creator.username] = room.id;
    return room;
  }
};

export const joinRoom = (
  roomId: string,
  member: Member,
  socket: Socket,
  io: Server
): Status<Room, "Room not found"> => {
  const room = rooms[roomId];
  console.log(`rooms[${roomId}]: ${room} - username: ${member.username}`);
  if (room) {
    const updatedRoom = { ...room, members: [...room.members, member] };
    socket.join(roomId);
    rooms[roomId] = updatedRoom;
    io.to(roomId).emit("member_joined", {
      newMember: member,
      room: updatedRoom,
    });
    usersAndActiveRooms[member.username] = roomId;

    return { status: "SUCCESS", data: updatedRoom };
  } else {
    return { status: "ERROR", type: "Room not found" };
  }
};
export const leaveRoom = (username: string, socket: Socket, io: Server) => {
  const roomId = usersAndActiveRooms[username];
  const room = rooms[roomId];
  console.log(`rooms[${roomId}]: ${room} - username: ${username}`);
  if (room) {
    const updatedRoom = {
      ...room,
      members: [...room.members].filter(
        (member) => member.username !== username
      ),
    };
    socket.leave(roomId);
    rooms[roomId] = updatedRoom;
    delete usersAndActiveRooms[username];
    console.log("usersAndActiveRooms:", usersAndActiveRooms);
    io.to(roomId).emit("member_left", {
      leaver: username,
      room: updatedRoom,
    });
  }
};

export const generateRandomString = (length: number) => {
  const alphabet = "0123456789";
  const generatedString = new Array(length).fill(0).reduce((result) => {
    return result + alphabet.substr(Math.random() * alphabet.length, 1);
  }, "") as string;

  return generatedString;
};
