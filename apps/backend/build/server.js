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
var __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? function (o, m, k, k2) {
				if (k2 === undefined) k2 = k;
				var desc = Object.getOwnPropertyDescriptor(m, k);
				if (
					!desc ||
					('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
				) {
					desc = {
						enumerable: true,
						get: function () {
							return m[k];
						},
					};
				}
				Object.defineProperty(o, k2, desc);
		  }
		: function (o, m, k, k2) {
				if (k2 === undefined) k2 = k;
				o[k2] = m[k];
		  });
var __setModuleDefault =
	(this && this.__setModuleDefault) ||
	(Object.create
		? function (o, v) {
				Object.defineProperty(o, 'default', {enumerable: true, value: v});
		  }
		: function (o, v) {
				o['default'] = v;
		  });
var __importStar =
	(this && this.__importStar) ||
	function (mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null)
			for (var k in mod)
				if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
					__createBinding(result, mod, k);
		__setModuleDefault(result, mod);
		return result;
	};
var __awaiter =
	(this && this.__awaiter) ||
	function (thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P(function (resolve) {
						resolve(value);
				  });
		}
		return new (P || (P = Promise))(function (resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator['throw'](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
var __generator =
	(this && this.__generator) ||
	function (thisArg, body) {
		var _ = {
				label: 0,
				sent: function () {
					if (t[0] & 1) throw t[1];
					return t[1];
				},
				trys: [],
				ops: [],
			},
			f,
			y,
			t,
			g;
		return (
			(g = {next: verb(0), throw: verb(1), return: verb(2)}),
			typeof Symbol === 'function' &&
				(g[Symbol.iterator] = function () {
					return this;
				}),
			g
		);
		function verb(n) {
			return function (v) {
				return step([n, v]);
			};
		}
		function step(op) {
			if (f) throw new TypeError('Generator is already executing.');
			while (_)
				try {
					if (
						((f = 1),
						y &&
							(t =
								op[0] & 2
									? y['return']
									: op[0]
									? y['throw'] || ((t = y['return']) && t.call(y), 0)
									: y.next) &&
							!(t = t.call(y, op[1])).done)
					)
						return t;
					if (((y = 0), t)) op = [op[0] & 2, t.value];
					switch (op[0]) {
						case 0:
						case 1:
							t = op;
							break;
						case 4:
							_.label++;
							return {value: op[1], done: false};
						case 5:
							_.label++;
							y = op[1];
							op = [0];
							continue;
						case 7:
							op = _.ops.pop();
							_.trys.pop();
							continue;
						default:
							if (
								!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
								(op[0] === 6 || op[0] === 2)
							) {
								_ = 0;
								continue;
							}
							if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
								_.label = op[1];
								break;
							}
							if (op[0] === 6 && _.label < t[1]) {
								_.label = t[1];
								t = op;
								break;
							}
							if (t && _.label < t[2]) {
								_.label = t[2];
								_.ops.push(op);
								break;
							}
							if (t[2]) _.ops.pop();
							_.trys.pop();
							continue;
					}
					op = body.call(thisArg, _);
				} catch (e) {
					op = [6, e];
					y = 0;
				} finally {
					f = t = 0;
				}
			if (op[0] & 5) throw op[1];
			return {value: op[0] ? op[1] : void 0, done: true};
		}
	};
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : {default: mod};
	};
exports.__esModule = true;
var services_1 = require('./services');
var express = __importStar(require('express'));
var types_1 = require('@dundring/types');
var WebSocket = __importStar(require('ws'));
var cors_1 = __importDefault(require('cors'));
var http_1 = __importDefault(require('http'));
var utils_1 = require('@dundring/utils');
require('dotenv').config();
// Create a new express app instance
var app = express['default']();
var router = express.Router();
var httpPort = process.env.PORT || 8080;
app.use(express.json());
app.use((0, cors_1['default'])());
app.use('/api', router);
var httpServer = http_1['default'].createServer(app);
var wss = new WebSocket.Server({server: httpServer});
var checkEnvConfig = function () {
	if (!process.env.PORT) {
		console.log(
			'[.env]: No port provided; using 8080. Override this by setting the PORT in the environment config.',
		);
	}
	if (!process.env.DATA_PATH) {
		console.log(
			'[.env]: No path for the data directory provided; using ./data/. Override this by setting the DATA_PATH in the environment config.',
		);
	}
	if (!process.env.TOKEN_SECRET) {
		console.log(
			'[.env]: No token secret provided; using 12345. Override this by setting the TOKEN_SECRET in the environment config.',
		);
	}
	services_1.slackService.checkSlackConfig();
	services_1.mailService.checkMailConfig();
};
checkEnvConfig();
router.get('/workouts/:workoutId', function (req, res) {
	return __awaiter(void 0, void 0, void 0, function () {
		var workoutId, response;
		return __generator(this, function (_a) {
			switch (_a.label) {
				case 0:
					workoutId = req.params['workoutId'];
					return [4 /*yield*/, services_1.workoutService.getWorkout(workoutId)];
				case 1:
					response = _a.sent();
					switch (response.status) {
						case 'SUCCESS':
							res.send({
								status: types_1.ApiStatus.SUCCESS,
								data: {workout: response.data},
							});
							return [2 /*return*/];
						default:
							res.send({
								status: types_1.ApiStatus.FAILURE,
								message: response.type,
							});
							return [2 /*return*/];
					}
					return [2 /*return*/];
			}
		});
	});
});
router.get('/me/workouts', function (req, res) {
	return __awaiter(void 0, void 0, void 0, function () {
		var workouts;
		return __generator(this, function (_a) {
			switch (_a.label) {
				case 0:
					if (!services_1.validationService.authenticateToken(req, res))
						return [2 /*return*/];
					return [
						4 /*yield*/,
						services_1.workoutService.getUserWorkouts(req.userId),
					];
				case 1:
					workouts = _a.sent();
					if ((0, utils_1.isError)(workouts)) {
						res.send({
							status: types_1.ApiStatus.FAILURE,
							message: workouts.type,
						});
						return [2 /*return*/];
					}
					res.send({
						status: types_1.ApiStatus.SUCCESS,
						data: {workouts: workouts.data},
					});
					return [2 /*return*/];
			}
		});
	});
});
router.post('/me/workout', function (req, res) {
	return __awaiter(void 0, void 0, void 0, function () {
		var workout, ret;
		return __generator(this, function (_a) {
			switch (_a.label) {
				case 0:
					if (!services_1.validationService.authenticateToken(req, res))
						return [2 /*return*/];
					workout = req.body.workout;
					return [
						4 /*yield*/,
						services_1.workoutService.upsertWorkout(
							req.userId,
							workout,
							workout.id,
						),
					];
				case 1:
					ret = _a.sent();
					switch (ret.status) {
						case 'SUCCESS':
							res.send({
								status: types_1.ApiStatus.SUCCESS,
								data: {workout: ret.data},
							});
							return [2 /*return*/];
						default:
							res.send({
								status: types_1.ApiStatus.FAILURE,
								message: ret.type,
							});
							return [2 /*return*/];
					}
					return [2 /*return*/];
			}
		});
	});
});
router.post('/me', function (req, res) {
	return __awaiter(void 0, void 0, void 0, function () {
		var ftp, ret;
		return __generator(this, function (_a) {
			switch (_a.label) {
				case 0:
					if (!services_1.validationService.authenticateToken(req, res))
						return [2 /*return*/];
					ftp = req.body.ftp;
					return [
						4 /*yield*/,
						services_1.userService.updateUserFtp(req.userId, ftp),
					];
				case 1:
					ret = _a.sent();
					switch (ret.status) {
						case 'SUCCESS':
							res.send({
								status: types_1.ApiStatus.SUCCESS,
								data: {ftp: ftp},
							});
							return [2 /*return*/];
						default:
							res.send({
								status: types_1.ApiStatus.FAILURE,
								message: ret.type,
							});
							return [2 /*return*/];
					}
					return [2 /*return*/];
			}
		});
	});
});
router.post('/validate', function (req, res) {
	return __awaiter(void 0, void 0, void 0, function () {
		var username, userId, user, authHeader, token;
		var _a;
		return __generator(this, function (_b) {
			switch (_b.label) {
				case 0:
					if (!services_1.validationService.authenticateToken(req, res))
						return [2 /*return*/];
					(username = req.username), (userId = req.userId);
					return [4 /*yield*/, services_1.userService.getUser(username || '')];
				case 1:
					user = _b.sent();
					authHeader = req.headers['authorization'];
					token = authHeader && authHeader.split(' ')[1];
					if ((0, utils_1.isError)(user)) {
						return [2 /*return*/];
					}
					res.send({
						status: types_1.ApiStatus.SUCCESS,
						data: {
							ftp:
								((_a = user.data.fitnessData) === null || _a === void 0
									? void 0
									: _a.ftp) || 200,
							token: token || '',
							username: username,
							userId: userId,
						},
					});
					return [2 /*return*/];
			}
		});
	});
});
router.post('/login/mail', function (req, res) {
	return __awaiter(void 0, void 0, void 0, function () {
		var mail, ret;
		return __generator(this, function (_a) {
			switch (_a.label) {
				case 0:
					mail = req.body.mail;
					return [
						4 /*yield*/,
						services_1.mailService.sendLoginOrRegisterMail(mail),
					];
				case 1:
					ret = _a.sent();
					switch (ret.status) {
						case 'SUCCESS':
							res.send({status: types_1.ApiStatus.SUCCESS, data: ret.data});
							return [2 /*return*/];
						case 'ERROR':
							res.send({status: types_1.ApiStatus.FAILURE, message: ret.type});
							return [2 /*return*/];
					}
					return [2 /*return*/];
			}
		});
	});
});
router.post('/register/mail', function (req, res) {
	return __awaiter(void 0, void 0, void 0, function () {
		var _a,
			username,
			ticket,
			mailTokenRet,
			ret,
			message,
			statusMessage,
			statusCode,
			token,
			_b,
			user,
			fitnessData,
			ftp;
		return __generator(this, function (_c) {
			switch (_c.label) {
				case 0:
					(_a = req.body), (username = _a.username), (ticket = _a.ticket);
					mailTokenRet = services_1.validationService.getMailTokenData(ticket);
					if (mailTokenRet.status === 'ERROR') {
						res.send({
							status: types_1.ApiStatus.FAILURE,
							message: mailTokenRet.type,
						});
						return [2 /*return*/];
					}
					return [
						4 /*yield*/,
						services_1.userService.createUser({
							username: username,
							mail: mailTokenRet.data.mail,
						}),
					];
				case 1:
					ret = _c.sent();
					if ((0, utils_1.isError)(ret)) {
						message = ret.type;
						statusMessage = 'Something went wrong.';
						statusCode = 500;
						switch (message) {
							case 'Username is already in use':
								statusMessage = 'The username is already in use.';
								statusCode = 400;
								break;
							case 'Mail is already in use':
								statusMessage = 'The e-mail address is already in use.';
								statusCode = 400;
								break;
							default:
								break;
						}
						res.statusMessage = statusMessage;
						res.statusCode = statusCode;
						res.send({
							status: types_1.ApiStatus.FAILURE,
							message: statusMessage,
						});
						return [2 /*return*/];
					}
					token = services_1.validationService.generateAccessToken({
						userId: ret.data.id,
						username: ret.data.username,
					});
					return [
						4 /*yield*/,
						Promise.all([
							services_1.userService.getUser(username),
							services_1.userService.getUserFitnessData(ret.data.id),
						]),
					];
				case 2:
					(_b = _c.sent()), (user = _b[0]), (fitnessData = _b[1]);
					if (
						(0, utils_1.isSuccess)(user) &&
						(0, utils_1.isSuccess)(fitnessData)
					) {
						ftp = fitnessData.data.ftp;
						res.send({
							status: types_1.ApiStatus.SUCCESS,
							data: {
								userId: user.data.id,
								username: username,
								token: token,
								ftp: ftp,
							},
						});
						return [2 /*return*/];
					}
					res.statusMessage = 'Something went wrong. Try again later.';
					res.statusCode = 401;
					res.send({
						status: types_1.ApiStatus.FAILURE,
						message: 'Something went wrong. Try again later.',
					});
					return [2 /*return*/];
			}
		});
	});
});
router.post('/auth/mail', function (req, res) {
	return __awaiter(void 0, void 0, void 0, function () {
		var ticket, ret, data, user, username, userId, token, fitnessData, ftp;
		return __generator(this, function (_a) {
			switch (_a.label) {
				case 0:
					ticket = req.body.ticket;
					ret = services_1.validationService.getMailTokenData(ticket);
					if (ret.status === 'ERROR') {
						res.send({status: types_1.ApiStatus.FAILURE, message: ret.type});
						return [2 /*return*/];
					}
					data = ret.data;
					return [4 /*yield*/, services_1.userService.getUserByMail(data.mail)];
				case 1:
					user = _a.sent();
					if (!(0, utils_1.isSuccess)(user)) return [3 /*break*/, 3];
					username = user.data.username;
					userId = user.data.id;
					token = services_1.validationService.generateAccessToken({
						userId: userId,
						username: username,
					});
					return [
						4 /*yield*/,
						services_1.userService.getUserFitnessData(userId),
					];
				case 2:
					fitnessData = _a.sent();
					ftp = (0, utils_1.isSuccess)(fitnessData)
						? fitnessData.data.ftp
						: services_1.slackService.logAndReturn(
								'user ['.concat(
									userId,
									'] does not have any fitnessData stored. Returning {ftp: 200}',
								),
								200,
						  );
					res.send({
						status: types_1.ApiStatus.SUCCESS,
						data: {
							type: 'user_exists',
							data: {
								userId: userId,
								username: username,
								token: token,
								ftp: ftp,
							},
						},
					});
					return [2 /*return*/];
				case 3:
					res.send({
						status: types_1.ApiStatus.SUCCESS,
						data: {type: 'user_does_not_exist', mail: data.mail},
					});
					return [2 /*return*/];
			}
		});
	});
});
router.get('/messages', function (_req, res) {
	var messages = services_1.messageService.getMessages();
	res.send({
		status: types_1.ApiStatus.SUCCESS,
		data: {messages: messages},
	});
});
// TODO: figure out why a connect is triggered several times.
//       This is probably due to some fishy rerender.
wss.on('connection', function (ws) {
	console.log('connection');
	var username = '';
	ws.on('message', function (rawData) {
		var req = JSON.parse(rawData.toString());
		switch (req.type) {
			case 'create-group-session': {
				var member = req.member;
				username = member.username;
				ws.send(
					JSON.stringify(
						services_1.groupSessionService.createRoom(
							__assign(__assign({}, member), {socket: ws}),
						),
					),
				);
				break;
			}
			case 'join-group-session': {
				var roomId = req.roomId,
					member = req.member;
				username = member.username;
				services_1.groupSessionService.joinRoom(
					ws,
					roomId,
					__assign(__assign({}, member), {socket: ws}),
				);
				break;
			}
			case 'leave-group-session': {
				var username_1 = req.username;
				services_1.groupSessionService.leaveRoom(username_1);
				break;
			}
			case 'send-data': {
				if (!username) {
					console.log('unknown tried to share workoutdata');
					return;
				}
				services_1.groupSessionService.sendWorkoutDataToRoom(
					username,
					req.data,
				);
				break;
			}
		}
	});
	ws.on('close', function () {
		console.log('connection closed', username);
		if (username) {
			services_1.groupSessionService.leaveRoom(username);
			username = '';
		}
	});
});
httpServer.listen(httpPort, function () {
	console.log('App is listening on port '.concat(httpPort, '!:)'));
});
