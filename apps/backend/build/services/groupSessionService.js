'use strict';
var __assign =
	(this && this.__assign) ||
	function () {
		__assign =
			Object.assign ||
			function (t) {
				for (var s, i = 1, n = arguments.length; i < n; i++) {
					s = arguments[i];
					for (var p in s)
						if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
				}
				return t;
			};
		return __assign.apply(this, arguments);
	};
var __spreadArray =
	(this && this.__spreadArray) ||
	function (to, from, pack) {
		if (pack || arguments.length === 2)
			for (var i = 0, l = from.length, ar; i < l; i++) {
				if (ar || !(i in from)) {
					if (!ar) ar = Array.prototype.slice.call(from, 0, i);
					ar[i] = from[i];
				}
			}
		return to.concat(ar || Array.prototype.slice.call(from));
	};
exports.__esModule = true;
exports.leaveRoom =
	exports.joinRoom =
	exports.createRoom =
	exports.sendWorkoutDataToRoom =
		void 0;
var utils_1 = require('@dundring/utils');
var _1 = require('.');
var rooms = {};
var usersAndActiveRooms = {};
var sendWorkoutDataToRoom = function (username, data) {
	var response = {
		type: 'data-received',
		data: data,
		username: username,
	};
	sendDataToRoom(username, response);
};
exports.sendWorkoutDataToRoom = sendWorkoutDataToRoom;
var generateRoomId = function (
	length,
	numRetriesPerLength,
	numLengthIncreasesLeft,
) {
	for (var i = 0; i < numRetriesPerLength; i++) {
		var id = (0, utils_1.generateRandomString)(length);
		if (!rooms[id]) {
			return id;
		}
	}
	if (numLengthIncreasesLeft > 0) {
		return generateRoomId(
			length + 1,
			numLengthIncreasesLeft,
			numLengthIncreasesLeft - 1,
		);
	} else {
		// could not find a free id - TODO: logging
		return null;
	}
};
var getAvailableRoomId = function () {
	return generateRoomId(4, 5, 20);
};
var sendDataToRoom = function (fromUsername, data) {
	var roomId = usersAndActiveRooms[fromUsername];
	if (!roomId) return;
	var room = rooms[roomId];
	if (!room) return;
	room.members
		.filter(function (member) {
			return member.username !== fromUsername;
		})
		.map(function (member) {
			member.socket.send(JSON.stringify(data));
		});
};
var createRoom = function (creator) {
	var roomId = getAvailableRoomId();
	if (roomId === null) {
		console.log(''.concat(creator.username, ' failed to create room.'));
		return {
			type: 'failed-to-create-group-session',
			message: 'Failed to create room.',
		};
	} else {
		console.log(''.concat(creator.username, ' created room #').concat(roomId));
		var room = {
			id: roomId,
			creator: creator.username,
			members: [creator],
		};
		_1.slackService.logRoomCreation(room);
		rooms[roomId] = room;
		usersAndActiveRooms[creator.username] = room.id;
		return {type: 'created-group-session', room: room};
	}
};
exports.createRoom = createRoom;
var toMember = function (serverMember) {
	return {
		username: serverMember.username,
		ftp: serverMember.ftp,
		weight: serverMember.weight,
	};
};
var toRoom = function (serverRoom) {
	return {
		id: serverRoom.id,
		creator: serverRoom.creator,
		members: serverRoom.members.map(function (serverMember) {
			return toMember(serverMember);
		}),
	};
};
var joinRoom = function (ws, roomId, member) {
	var room = rooms[roomId];
	if (room) {
		var updatedRoom_1 = __assign(__assign({}, room), {
			members: __spreadArray(
				__spreadArray([], room.members, true),
				[member],
				false,
			),
		});
		rooms[roomId] = updatedRoom_1;
		usersAndActiveRooms[member.username] = roomId;
		var response = {
			type: 'joined-group-session',
			room: toRoom(updatedRoom_1),
		};
		_1.slackService.logRoomJoin(member.username, room);
		ws.send(JSON.stringify(response));
		updatedRoom_1.members
			.filter(function (m) {
				return m.username !== member.username;
			})
			.map(function (m) {
				var message = {
					type: 'member-joined-group-session',
					room: toRoom(updatedRoom_1),
					username: member.username,
				};
				m.socket.send(JSON.stringify(message));
			});
	} else {
		var response = {
			type: 'failed-to-join-group-session',
			message: 'Failed to join room.',
		};
		ws.send(JSON.stringify(response));
	}
};
exports.joinRoom = joinRoom;
var leaveRoom = function (username) {
	var roomId = usersAndActiveRooms[username];
	var room = rooms[roomId];
	if (room) {
		var updatedRoom_2 = __assign(__assign({}, room), {
			members: __spreadArray([], room.members, true).filter(function (member) {
				return member.username !== username;
			}),
		});
		if (updatedRoom_2.members.length === 0) {
			_1.slackService.logRoomDeletion(username, room);
			delete rooms[roomId];
		} else {
			_1.slackService.logRoomLeave(username, room);
			rooms[roomId] = updatedRoom_2;
			delete usersAndActiveRooms[username];
			updatedRoom_2.members
				.filter(function (m) {
					return m.username !== username;
				})
				.map(function (m) {
					var message = {
						type: 'member-left-group-session',
						room: toRoom(updatedRoom_2),
						username: username,
					};
					m.socket.send(JSON.stringify(message));
				});
		}
	}
};
exports.leaveRoom = leaveRoom;
