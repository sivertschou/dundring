import {
	ApiResponseBody,
	ApiStatus,
	LoginResponseBody,
	MailAuthenticationRegisterRequestBody,
	MailAuthenticationRequestBody,
	MailAuthenticationResponseBody,
	MailLoginRequestBody,
} from '@dundring/types';
import {isError, isSuccess} from '@dundring/utils';
import * as express from 'express';
import {
	mailService,
	slackService,
	userService,
	validationService,
} from '../../services';
const router = express.Router();

router.post<null, ApiResponseBody<string>, MailLoginRequestBody>(
	'/login',
	async (req, res) => {
		const {mail} = req.body;

		const ret = await mailService.sendLoginOrRegisterMail(mail);

		switch (ret.status) {
			case 'SUCCESS':
				res.send({status: ApiStatus.SUCCESS, data: ret.data});
				return;
			case 'ERROR':
				res.send({status: ApiStatus.FAILURE, message: ret.type});
				return;
		}
	},
);

router.post<
	null,
	ApiResponseBody<LoginResponseBody>,
	MailAuthenticationRegisterRequestBody
>('/register', async (req, res) => {
	const {username, ticket} = req.body;

	const mailTokenRet = await validationService.getMailTokenData(ticket);

	if (isError(mailTokenRet)) {
		res.send({status: ApiStatus.FAILURE, message: mailTokenRet.type});
		return;
	}

	const ret = await userService.createUser({
		username: username,
		mail: mailTokenRet.data,
	});

	if (isError(ret)) {
		const message = ret.type;
		let statusMessage = 'Something went wrong.';
		let statusCode = 500;
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
			status: ApiStatus.FAILURE,
			message: statusMessage,
		});
		return;
	}

	const token = validationService.generateAccessToken({
		userId: ret.data.id,
		username: ret.data.username,
	});
	const [user, fitnessData] = await Promise.all([
		userService.getUser({username}),
		userService.getUserFitnessData(ret.data.id),
	]);

	if (isSuccess(user) && isSuccess(fitnessData)) {
		const {ftp} = fitnessData.data;
		res.send({
			status: ApiStatus.SUCCESS,
			data: {
				userId: user.data.id,
				username,
				token,
				ftp,
			},
		});
		return;
	}

	res.statusMessage = 'Something went wrong. Try again later.';
	res.statusCode = 401;
	res.send({
		status: ApiStatus.FAILURE,
		message: 'Something went wrong. Try again later.',
	});
});

router.post<
	null,
	ApiResponseBody<MailAuthenticationResponseBody>,
	MailAuthenticationRequestBody
>('/authenticate', async (req, res) => {
	const {ticket} = req.body;
	const ret = await validationService.getMailTokenData(ticket);

	if (isError(ret)) {
		res.send({status: ApiStatus.FAILURE, message: ret.type});
		return;
	}
	const user = await userService.getUserByMail(ret.data);
	if (isSuccess(user)) {
		const username = user.data.username;
		const userId = user.data.id;

		const token = validationService.generateAccessToken({
			userId,
			username,
		});
		const fitnessData = await userService.getUserFitnessData(userId);
		const ftp = isSuccess(fitnessData)
			? fitnessData.data.ftp
			: slackService.logAndReturn(
					`user [${userId}] does not have any fitnessData stored. Returning {ftp: 200}`,
					200,
			  );

		res.send({
			status: ApiStatus.SUCCESS,
			data: {
				type: 'user_exists',
				data: {
					userId,
					username,
					token,
					ftp,
				},
			},
		});
		return;
	}

	res.send({
		status: ApiStatus.SUCCESS,
		data: {type: 'user_does_not_exist', mail: ret.data},
	});
	return;
});

export default router;
