'use strict';
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : {default: mod};
	};
exports.__esModule = true;
exports.authenticateToken =
	exports.getMailTokenData =
	exports.generateMailToken =
	exports.generateAccessToken =
	exports.hash =
		void 0;
var types_1 = require('@dundring/types');
var jsonwebtoken_1 = __importDefault(require('jsonwebtoken'));
var crypto_1 = __importDefault(require('crypto'));
var utils_1 = require('@dundring/utils');
var tokenSecret = process.env.TOKEN_SECRET || '12345';
var hash = function (message) {
	return crypto_1['default'].createHash('md5').update(message).digest('hex');
};
exports.hash = hash;
var mailtokens = {};
var generateAccessToken = function (user) {
	return jsonwebtoken_1['default'].sign(user, tokenSecret, {
		expiresIn: '120d',
	});
};
exports.generateAccessToken = generateAccessToken;
var generateMailToken = function (mail) {
	var token = crypto_1['default'].randomUUID();
	mailtokens[token] = {mail: mail, timestamp: new Date()};
	return token;
};
exports.generateMailToken = generateMailToken;
var getMailTokenData = function (token) {
	var data = mailtokens[token];
	if (!data) {
		return {status: 'ERROR', type: 'Token not found'};
	}
	if (Date.now() - data.timestamp.getTime() > (0, utils_1.days)(1)) {
		return {status: 'ERROR', type: 'Token expired'};
	}
	return {status: 'SUCCESS', data: data};
};
exports.getMailTokenData = getMailTokenData;
var authenticateToken = function (req, res) {
	try {
		var authHeader = req.headers['authorization'];
		var token = authHeader && authHeader.split(' ')[1];
		if (!token) {
			var statusMessage = 'No token provided.';
			res.statusMessage = statusMessage;
			res.statusCode = 401;
			res.send({
				status: types_1.ApiStatus.FAILURE,
				message: statusMessage,
			});
			return false;
		}
		var jwtPayload = jsonwebtoken_1['default'].decode(token);
		req.jwtPayload = jwtPayload;
		var user = jsonwebtoken_1['default'].verify(token, tokenSecret);
		req.username = user.username;
		req.userId = user.userId;
		return true;
	} catch (error) {
		var statusMessage = 'Could not verify token.';
		res.statusMessage = statusMessage;
		res.statusCode = 401;
		res.send({
			status: types_1.ApiStatus.FAILURE,
			message: statusMessage,
		});
		return false;
	}
};
exports.authenticateToken = authenticateToken;
