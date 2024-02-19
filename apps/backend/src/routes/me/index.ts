import {
  ApiResponseBody,
  ApiStatus,
  UserUpdateRequestBody,
  UserUpdateResponseBody,
} from '@dundring/types';
import { isError } from '@dundring/utils';
import * as express from 'express';
import { userService, validationService } from '../../services';

const router = express.Router();

router.use('/me', router);

router.post<UserUpdateRequestBody, ApiResponseBody<UserUpdateResponseBody>>(
  '/',
  async (req, res) => {
    if (!validationService.authenticateToken(req, res)) return;

    const ret = await userService.updateUser(req.userId, {
      username: req.body.username,
      ftp: req.body.ftp,
    });

    if (isError(ret)) {
      return res.send({
        status: ApiStatus.FAILURE,
        message: ret.type,
      });
    }

    const { username, id, fitnessData } = ret.data;
    const accessToken = validationService.generateAccessToken({
      username,
      userId: id,
    });

    res.send({
      status: ApiStatus.SUCCESS,
      data: {
        accessToken,
        username,
        ftp: fitnessData?.ftp || req.body.ftp,
      },
    });
  }
);

export default router;
