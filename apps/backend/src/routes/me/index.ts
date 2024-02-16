import {
	ApiResponseBody,
	ApiStatus,
	UserUpdateRequestBody,
} from '@dundring/types';
import * as express from 'express';
import {userService, validationService} from '../../services';

const router = express.Router();

router.use('/me', router);

router.post<UserUpdateRequestBody, ApiResponseBody<UserUpdateRequestBody>>(
	'/',
	async (req, res) => {
		if (!validationService.authenticateToken(req, res)) return;

		const {ftp} = req.body;

		const ret = await userService.updateUserFtp(req.userId, ftp);

		switch (ret.status) {
			case 'SUCCESS':
				res.send({
					status: ApiStatus.SUCCESS,
					data: {ftp},
				});
				return;
			default:
				res.send({
					status: ApiStatus.FAILURE,
					message: ret.type,
				});
				return;
		}
	},
);

export default router;
