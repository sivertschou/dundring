'use strict';
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : {default: mod};
	};
Object.defineProperty(exports, '__esModule', {value: true});
const react_1 = __importDefault(require('react'));
const chalk_1 = __importDefault(require('chalk'));
const ava_1 = __importDefault(require('ava'));
const ink_testing_library_1 = require('ink-testing-library');
const app_js_1 = __importDefault(require('./source/app.js'));
(0, ava_1.default)('greet unknown user', t => {
	const {lastFrame} = (0, ink_testing_library_1.render)(
		<app_js_1.default name={undefined} />,
	);
	t.is(lastFrame(), `Hello, ${chalk_1.default.green('Stranger')}`);
});
(0, ava_1.default)('greet user with a name', t => {
	const {lastFrame} = (0, ink_testing_library_1.render)(
		<app_js_1.default name="Jane" />,
	);
	t.is(lastFrame(), `Hello, ${chalk_1.default.green('Jane')}`);
});
