'use strict';
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : {default: mod};
	};
exports.__esModule = true;
exports.logAndReturn =
	exports.logRoomDeletion =
	exports.logRoomLeave =
	exports.logRoomCreation =
	exports.logRoomJoin =
	exports.logUserCreation =
	exports.checkSlackConfig =
		void 0;
var node_fetch_1 = __importDefault(require('node-fetch'));
require('dotenv').config();
var checkSlackConfig = function () {
	if (!process.env.SLACK_USER_CREATION) {
		console.log(
			'[.env]: No Slack service for user creation provided. Override this by setting the SLACK_USER_CREATION in the environment config.',
		);
	}
	if (!process.env.SLACK_ERRORS) {
		console.log(
			'[.env]: No Slack service for errors provided. Override this by setting the SLACK_ERRORS in the environment config.',
		);
	}
	if (!process.env.SLACK_GROUP_SESSION) {
		console.log(
			'[.env]: No Slack service for group session provided. Override this by setting the SLACK_GROUP_SESSION in the environment config.',
		);
	}
	if (!process.env.SLACK_FEEDBACK) {
		console.log(
			'[.env]: No Slack service for feedback provided. Override this by setting the SLACK_FEEDBACK in the environment config.',
		);
	}
};
exports.checkSlackConfig = checkSlackConfig;
var SlackService;
(function (SlackService) {
	SlackService[(SlackService['USER_CREATION'] = 0)] = 'USER_CREATION';
	SlackService[(SlackService['ERRORS'] = 1)] = 'ERRORS';
	SlackService[(SlackService['GROUP_SESSION'] = 2)] = 'GROUP_SESSION';
	SlackService[(SlackService['FEEDBACK'] = 3)] = 'FEEDBACK';
})(SlackService || (SlackService = {}));
var getServicePath = function (service) {
	switch (service) {
		case SlackService.USER_CREATION:
			return process.env.SLACK_USER_CREATION || null;
		case SlackService.ERRORS:
			return process.env.SLACK_ERRORS || null;
		case SlackService.GROUP_SESSION:
			return process.env.SLACK_GROUP_SESSION || null;
		case SlackService.FEEDBACK:
			return process.env.SLACK_FEEDBACK || null;
	}
};
var getServiceUrl = function (service) {
	var path = getServicePath(service);
	if (!path) return null;
	return 'https://hooks.slack.com/services/'.concat(path);
};
var sendSlackMessage = function (service, message) {
	var url = getServiceUrl(service);
	if (process.env.NODE_ENV !== 'production') {
		console.log('[slack]: '.concat(message));
		return;
	}
	if (!url) return;
	try {
		(0, node_fetch_1['default'])(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({text: message}),
		});
	} catch (e) {
		console.error('[sendSlackMessage]:', e);
	}
};
var logUserCreation = function (user) {
	var message = 'New user: *'
		.concat(user.username, '* (')
		.concat(user.mail, ')');
	sendSlackMessage(SlackService.USER_CREATION, message);
};
exports.logUserCreation = logUserCreation;
var logRoomJoin = function (username, room) {
	var message = '*'
		.concat(username, '* joined group session with id *#')
		.concat(room.id, '*');
	sendSlackMessage(SlackService.GROUP_SESSION, message);
};
exports.logRoomJoin = logRoomJoin;
var logRoomCreation = function (room) {
	var message = '*'
		.concat(room.creator, '* created group session with id *#')
		.concat(room.id, '*');
	sendSlackMessage(SlackService.GROUP_SESSION, message);
};
exports.logRoomCreation = logRoomCreation;
var logRoomLeave = function (username, room) {
	var message = '*'
		.concat(username, '* left group session with id *#')
		.concat(room.id, '*.');
	sendSlackMessage(SlackService.GROUP_SESSION, message);
};
exports.logRoomLeave = logRoomLeave;
var logRoomDeletion = function (username, room) {
	var message = '*'
		.concat(username, '* left group session with id *#')
		.concat(room.id, '*. No more users in group session; deleting it.');
	sendSlackMessage(SlackService.GROUP_SESSION, message);
};
exports.logRoomDeletion = logRoomDeletion;
var logAndReturn = function (message, data) {
	sendSlackMessage(SlackService.ERRORS, message);
	return data;
};
exports.logAndReturn = logAndReturn;
