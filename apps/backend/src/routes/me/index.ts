import {
  ApiResponseBody,
  ApiStatus,
  StravaUpload,
  UserUpdateRequestBody,
  UserUpdateResponseBody,
  TcxFileUpload,
} from '@dundring/types';
import { isError } from '@dundring/utils';
import * as express from 'express';
import { userService, validationService, stravaService } from '../../services';
import { getUser } from '../../services/userService';

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

router.post<TcxFileUpload, ApiResponseBody<StravaUpload>>(
  '/upload',
  async (req, res) => {
    if (!validationService.authenticateToken(req, res)) {
      return;
    }
    const tcxFile = req.body.tcxFile as string;
    if (!tcxFile) {
      return res.send({
        status: ApiStatus.FAILURE,
        message: 'BAD REQUEST : MISSING tcxFile',
      });
    }

    const user = await getUser({ id: req.userId });
    if (isError(user)) {
      return res.send({
        status: ApiStatus.FAILURE,
        message: 'User not found',
      });
    }
    const stravaAuth = user.data.stravaAuthentication;
    if (!stravaAuth || !stravaAuth.refreshToken) {
      return res.send({
        status: ApiStatus.FAILURE,
        message: 'User not a strava user or missing refresh token',
      });
    }
    const accesTokenResponse =
      await stravaService.getStravaTokenFromRefreshToken(
        stravaAuth.refreshToken
      );
    if (isError(accesTokenResponse)) {
      return res.send({
        status: ApiStatus.FAILURE,
        message: accesTokenResponse.status,
      });
    }

    const uploadResponse = await stravaService.uploadFileToStrava(
      req.body,
      accesTokenResponse.data.access_token
    );
    if (isError(uploadResponse)) {
      return res.send({
        status: ApiStatus.FAILURE,
        message: uploadResponse.status,
      });
    }
    res.send({
      status: ApiStatus.SUCCESS,
      data: uploadResponse.data,
    });
  }
);

export default router;
