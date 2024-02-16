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
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : {default: mod};
	};
exports.__esModule = true;
exports.sendLoginOrRegisterMail = exports.checkMailConfig = void 0;
var nodemailer_1 = __importDefault(require('nodemailer'));
var validationService_1 = require('../validationService');
var htmlTemplates_1 = require('./htmlTemplates');
var utils_1 = require('@dundring/utils');
var __1 = require('..');
require('dotenv').config();
var checkMailConfig = function () {
	var config = mailConfigFromEnv();
	if (!config.host) {
		console.log(
			'[.env]: No mail host provided. Override this by setting the MAIL_HOST in the environment config.',
		);
	}
	if (!config.port) {
		console.log(
			'[.env]: No mail port provided. Override this by setting the MAIL_PORT in the environment config.',
		);
	}
	if (!config.user) {
		console.log(
			'[.env]: No mail user provided. Override this by setting the MAIL_USER in the environment config.',
		);
	}
	if (!config.password) {
		console.log(
			'[.env]: No mail password provided. Override this by setting the MAIL_PASSWORD in the environment config.',
		);
	}
};
exports.checkMailConfig = checkMailConfig;
var mailConfigFromEnv = function () {
	return {
		host: process.env.MAIL_HOST,
		port: parseInt(process.env.MAIL_PORT || ''),
		user: process.env.MAIL_USER,
		password: process.env.MAIL_PASSWORD,
	};
};
var validMailConfigOrNull = function () {
	var _a = mailConfigFromEnv(),
		host = _a.host,
		port = _a.port,
		user = _a.user,
		password = _a.password;
	if (host && port && user && password) {
		return {host: host, port: port, auth: {user: user, pass: password}};
	}
	return null;
};
var config = validMailConfigOrNull();
var transporter = config && nodemailer_1['default'].createTransport(config);
var sendMail = function (_a) {
	var to = _a.to,
		subject = _a.subject,
		htmlContent = _a.htmlContent;
	return __awaiter(void 0, void 0, void 0, function () {
		var info, error_1;
		return __generator(this, function (_b) {
			switch (_b.label) {
				case 0:
					if (!transporter) {
						console.log(
							'[mail]: To: '
								.concat(to, '\n[mail]: Subject: ')
								.concat(subject, '\n[mail]: content: ')
								.concat(htmlContent),
						);
						return [2 /*return*/, {status: 'SUCCESS', data: ''}];
					}
					_b.label = 1;
				case 1:
					_b.trys.push([1, 3, , 4]);
					return [
						4 /*yield*/,
						transporter.sendMail({
							from: '"dundring.com" <no-reply@dundring.com>',
							to: to,
							subject: subject,
							html: htmlContent,
						}),
					];
				case 2:
					info = _b.sent();
					if (info.rejected.length) {
						return [
							2 /*return*/,
							{
								status: 'ERROR',
								type: 'Something went wrong while sending the e-mail',
							},
						];
					}
					return [2 /*return*/, {status: 'SUCCESS', data: ''}];
				case 3:
					error_1 = _b.sent();
					return [
						2 /*return*/,
						{
							status: 'ERROR',
							type: 'Something went wrong while sending the e-mail',
						},
					];
				case 4:
					return [2 /*return*/];
			}
		});
	});
};
var sendLoginOrRegisterMail = function (mail) {
	return __awaiter(void 0, void 0, void 0, function () {
		var token, frontendBaseUrl, loginLink, _a, _b, _c;
		return __generator(this, function (_d) {
			switch (_d.label) {
				case 0:
					token = (0, validationService_1.generateMailToken)(mail);
					frontendBaseUrl =
						process.env.FRONTEND_BASE_URL || 'https://dundring.com';
					loginLink = ''.concat(frontendBaseUrl, '/auth?ticket=').concat(token);
					_a = utils_1.isSuccess;
					return [4 /*yield*/, __1.userService.getUserByMail(mail)];
				case 1:
					if (!_a.apply(void 0, [_d.sent()])) return [3 /*break*/, 3];
					if (!transporter) {
						console.log(
							'[mail]: To: '
								.concat(mail, '\n[mail]: Login link: ')
								.concat(loginLink),
						);
						return [2 /*return*/, {status: 'SUCCESS', data: 'Login link sent'}];
					}
					_b = utils_1.successMap;
					return [
						4 /*yield*/,
						sendMail({
							to: mail,
							subject: 'Sign in link',
							htmlContent: (0, htmlTemplates_1.signInMailTemplate)(loginLink),
						}),
					];
				case 2:
					return [
						2 /*return*/,
						_b.apply(void 0, [
							_d.sent(),
							function (_) {
								return 'Login link sent';
							},
						]),
					];
				case 3:
					if (!transporter) {
						console.log(
							'[mail]: To: '
								.concat(mail, '\n[mail]: Register link: ')
								.concat(loginLink),
						);
						return [
							2 /*return*/,
							{status: 'SUCCESS', data: 'Register link sent'},
						];
					}
					_c = utils_1.successMap;
					return [
						4 /*yield*/,
						sendMail({
							to: mail,
							subject: 'Create a user for dundring.com',
							htmlContent: (0, htmlTemplates_1.registerMailTemplate)(loginLink),
						}),
					];
				case 4:
					return [
						2 /*return*/,
						_c.apply(void 0, [
							_d.sent(),
							function (_) {
								return 'Register link sent';
							},
						]),
					];
			}
		});
	});
};
exports.sendLoginOrRegisterMail = sendLoginOrRegisterMail;
