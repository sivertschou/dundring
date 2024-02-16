'use strict';
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
exports.getMessages = void 0;
require('dotenv').config();
var fs = require('fs');
var messagePath = ''.concat(process.env.DATA_PATH, '/messages.json');
var getMessages = function () {
	if (fs.existsSync(messagePath)) {
		var rawdata = fs.readFileSync(messagePath);
		var parsedData = JSON.parse(rawdata);
		return __spreadArray([], parsedData, true);
	}
	return [];
};
exports.getMessages = getMessages;
