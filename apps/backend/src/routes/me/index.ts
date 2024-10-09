import {
  ApiResponseBody,
  ApiStatus,
  StravaUpload,
  UserUpdateRequestBody,
  UserUpdateResponseBody,
} from '@dundring/types';
import { isError } from '@dundring/utils';
import * as express from 'express';
import { userService, validationService, stravaService } from '../../services';
import { getUser } from '../../services/userService';
import multer from 'multer';

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

const fileUpload = multer().single('file');

router.post<any, ApiResponseBody<StravaUpload>>(
  '/upload',
  fileUpload,
  async (req, res) => {
    if (!req.file) {
      return res.status(400).send({
        status: ApiStatus.FAILURE,
        message: 'No file provided',
      });
    }
    const fileContent = req.file.buffer.toString();
    const activityName = (req.query.name || 'dundring.com workout') as string;

    if (!validationService.authenticateToken(req, res)) {
      return;
    }

    const user = await getUser({ id: req.userId });
    if (isError(user)) {
      return res.status(404).send({
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
    const accessTokenResponse =
      await stravaService.getStravaTokenFromRefreshToken(
        stravaAuth.refreshToken
      );
    if (isError(accessTokenResponse)) {
      return res.status(500).send({
        status: ApiStatus.FAILURE,
        message: accessTokenResponse.status,
      });
    }

    const uploadResponse = await stravaService.uploadFileToStrava(
      fileContent,
      activityName,
      accessTokenResponse.data.access_token
    );
    if (isError(uploadResponse)) {
      return res.status(500).send({
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
