'use strict';
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
exports.__esModule = true;
exports.upsertWorkout =
	exports.getFitnessData =
	exports.upsertFitnessData =
	exports.getWorkout =
	exports.getUserWorkouts =
	exports.createUser =
	exports.getUserByMail =
	exports.getUserByUsername =
	exports.prisma =
		void 0;
var utils_1 = require('@dundring/utils');
var client_1 = require('@prisma/client');
exports.prisma = new client_1.PrismaClient();
var getUserByUsername = function (username) {
	return __awaiter(void 0, void 0, void 0, function () {
		var result, e_1;
		return __generator(this, function (_a) {
			switch (_a.label) {
				case 0:
					_a.trys.push([0, 2, , 3]);
					return [
						4 /*yield*/,
						exports.prisma.user.findUnique({
							where: {username: username},
							include: {fitnessData: true},
						}),
					];
				case 1:
					result = _a.sent();
					if (!result) {
						return [2 /*return*/, (0, utils_1.error)('User not found')];
					}
					return [2 /*return*/, (0, utils_1.success)(result)];
				case 2:
					e_1 = _a.sent();
					console.error('[db.getUserByUsername]', e_1);
					return [
						2 /*return*/,
						(0, utils_1.error)('Something went wrong reading from database'),
					];
				case 3:
					return [2 /*return*/];
			}
		});
	});
};
exports.getUserByUsername = getUserByUsername;
var getUserByMail = function (mail) {
	return __awaiter(void 0, void 0, void 0, function () {
		var result, e_2;
		return __generator(this, function (_a) {
			switch (_a.label) {
				case 0:
					_a.trys.push([0, 2, , 3]);
					return [
						4 /*yield*/,
						exports.prisma.user.findUnique({
							where: {mail: mail},
						}),
					];
				case 1:
					result = _a.sent();
					if (!result) {
						return [2 /*return*/, (0, utils_1.error)('User not found')];
					}
					return [2 /*return*/, (0, utils_1.success)(result)];
				case 2:
					e_2 = _a.sent();
					console.error('[db.getUserByMail]', e_2);
					return [
						2 /*return*/,
						(0, utils_1.error)('Something went wrong reading from database'),
					];
				case 3:
					return [2 /*return*/];
			}
		});
	});
};
exports.getUserByMail = getUserByMail;
var createUser = function (user) {
	return __awaiter(void 0, void 0, void 0, function () {
		var result, e_3;
		return __generator(this, function (_a) {
			switch (_a.label) {
				case 0:
					_a.trys.push([0, 2, , 3]);
					return [
						4 /*yield*/,
						exports.prisma.user.create({
							data: {
								username: user.username,
								mail: user.mail,
								fitnessData: {create: {ftp: 200}},
							},
						}),
					];
				case 1:
					result = _a.sent();
					return [2 /*return*/, (0, utils_1.success)(result)];
				case 2:
					e_3 = _a.sent();
					// TODO: Figure out if it failed due to username or mail being in use
					console.error('[db.createUser]', e_3);
					return [
						2 /*return*/,
						(0, utils_1.error)('Something went wrong writing to database'),
					];
				case 3:
					return [2 /*return*/];
			}
		});
	});
};
exports.createUser = createUser;
var getUserWorkouts = function (userId) {
	return __awaiter(void 0, void 0, void 0, function () {
		var result, e_4;
		return __generator(this, function (_a) {
			switch (_a.label) {
				case 0:
					_a.trys.push([0, 2, , 3]);
					return [
						4 /*yield*/,
						exports.prisma.workout.findMany({
							where: {userId: userId},
							include: {parts: true},
						}),
					];
				case 1:
					result = _a.sent();
					return [2 /*return*/, (0, utils_1.success)(result)];
				case 2:
					e_4 = _a.sent();
					console.error('[db.getUserWorkouts]', e_4);
					return [
						2 /*return*/,
						(0, utils_1.error)(
							'Something went wrong while reading workouts from database',
						),
					];
				case 3:
					return [2 /*return*/];
			}
		});
	});
};
exports.getUserWorkouts = getUserWorkouts;
var getWorkout = function (id) {
	return __awaiter(void 0, void 0, void 0, function () {
		var result, e_5;
		return __generator(this, function (_a) {
			switch (_a.label) {
				case 0:
					_a.trys.push([0, 2, , 3]);
					return [
						4 /*yield*/,
						exports.prisma.workout.findUnique({
							where: {id: id},
							include: {parts: true},
						}),
					];
				case 1:
					result = _a.sent();
					if (!result) {
						return [2 /*return*/, (0, utils_1.error)('Workout not found')];
					}
					return [2 /*return*/, (0, utils_1.success)(result)];
				case 2:
					e_5 = _a.sent();
					console.error('[db.getWorkout]', e_5);
					return [
						2 /*return*/,
						(0, utils_1.error)('Something went wrong reading from database'),
					];
				case 3:
					return [2 /*return*/];
			}
		});
	});
};
exports.getWorkout = getWorkout;
var upsertFitnessData = function (userId, fitnessData) {
	return __awaiter(void 0, void 0, void 0, function () {
		var result, e_6;
		return __generator(this, function (_a) {
			switch (_a.label) {
				case 0:
					_a.trys.push([0, 2, , 3]);
					return [
						4 /*yield*/,
						exports.prisma.fitnessData.upsert({
							create: {userId: userId, ftp: fitnessData.ftp},
							update: {ftp: fitnessData.ftp},
							where: {userId: userId},
						}),
					];
				case 1:
					result = _a.sent();
					return [2 /*return*/, (0, utils_1.success)(result)];
				case 2:
					e_6 = _a.sent();
					console.error('[db.upsertFitnessData]:', e_6);
					return [
						2 /*return*/,
						(0, utils_1.error)(
							'Something went wrong while writing to database',
						),
					];
				case 3:
					return [2 /*return*/];
			}
		});
	});
};
exports.upsertFitnessData = upsertFitnessData;
var getFitnessData = function (userId) {
	return __awaiter(void 0, void 0, void 0, function () {
		var result, e_7;
		return __generator(this, function (_a) {
			switch (_a.label) {
				case 0:
					_a.trys.push([0, 2, , 3]);
					return [
						4 /*yield*/,
						exports.prisma.fitnessData.findUnique({
							where: {userId: userId},
						}),
					];
				case 1:
					result = _a.sent();
					if (!result) {
						return [2 /*return*/, (0, utils_1.error)('No data found')];
					}
					return [2 /*return*/, (0, utils_1.success)(result)];
				case 2:
					e_7 = _a.sent();
					console.error('[db.getFitnessData]', e_7);
					return [
						2 /*return*/,
						(0, utils_1.error)(
							'Something went wrong while reading from database',
						),
					];
				case 3:
					return [2 /*return*/];
			}
		});
	});
};
exports.getFitnessData = getFitnessData;
var upsertWorkout = function (userId, workout, workoutId) {
	return __awaiter(void 0, void 0, void 0, function () {
		var workoutInDB, result_1, workoutResult, e_8;
		return __generator(this, function (_a) {
			switch (_a.label) {
				case 0:
					_a.trys.push([0, 6, , 7]);
					return [
						4 /*yield*/,
						exports.prisma.workout.findFirst({
							where: {id: workoutId},
						}),
					];
				case 1:
					workoutInDB = _a.sent();
					if (
						!(
							(workoutInDB === null || workoutInDB === void 0
								? void 0
								: workoutInDB.userId) === userId
						)
					) {
						return [
							2 /*return*/,
							(0, utils_1.error)(
								'Something went wrong while upserting workout',
							),
						];
					}
					return [
						4 /*yield*/,
						workoutId
							? exports.prisma.workout.update({
									data: {name: workout.name},
									where: {id: workoutId},
							  })
							: exports.prisma.workout.create({
									data: {name: workout.name, userId: userId},
							  }),
					];
				case 2:
					result_1 = _a.sent();
					// Delete all parts
					return [
						4 /*yield*/,
						exports.prisma.steadyWorkoutPart.deleteMany({
							where: {workoutId: result_1.id},
						}),
					];
				case 3:
					// Delete all parts
					_a.sent();
					// Add all new parts
					return [
						4 /*yield*/,
						Promise.all(
							workout.parts.map(function (part, index) {
								return __awaiter(void 0, void 0, void 0, function () {
									return __generator(this, function (_a) {
										switch (_a.label) {
											case 0:
												return [
													4 /*yield*/,
													exports.prisma.steadyWorkoutPart.create({
														data: {
															workoutId: result_1.id,
															index: index,
															duration: part.duration,
															power: part.targetPower,
														},
													}),
												];
											case 1:
												return [2 /*return*/, _a.sent()];
										}
									});
								});
							}),
						),
					];
				case 4:
					// Add all new parts
					_a.sent();
					return [
						4 /*yield*/,
						exports.prisma.workout.findUnique({
							where: {id: result_1.id},
							include: {parts: true},
						}),
					];
				case 5:
					workoutResult = _a.sent();
					if (!workoutResult) {
						return [
							2 /*return*/,
							(0, utils_1.error)(
								'Something went wrong while upserting workout',
							),
						];
					}
					return [2 /*return*/, (0, utils_1.success)(workoutResult)];
				case 6:
					e_8 = _a.sent();
					console.error('[db.upsertWorkout]', e_8);
					return [
						2 /*return*/,
						(0, utils_1.error)('Something went wrong while upserting workout'),
					];
				case 7:
					return [2 /*return*/];
			}
		});
	});
};
exports.upsertWorkout = upsertWorkout;
