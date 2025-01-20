import {
  ApiResponseBody,
  ApiStatus,
  MailAuthenticationRequestBody,
  AuthenticationResponseBody,
  MailLoginRequestBody,
} from '@dundring/types';
import { isError, isSuccess } from '@dundring/utils';
import * as express from 'express';
import {
  mailService,
  monitoringService,
  userService,
  validationService,
} from '../../services';
const router = express.Router();

router.post<null, ApiResponseBody<string>, MailLoginRequestBody>(
  '/login',
  async (req, res) => {
    const { mail } = req.body;

    const ret = await mailService.sendLoginOrRegisterMail(mail);

    switch (ret.status) {
      case 'SUCCESS':
        res.send({ status: ApiStatus.SUCCESS, data: ret.data });
        return;
      case 'ERROR':
        res.send({ status: ApiStatus.FAILURE, message: ret.type });
        return;
    }
  }
);
router.post<
  null,
  ApiResponseBody<AuthenticationResponseBody>,
  MailAuthenticationRequestBody
>('/authenticate', async (req, res) => {
  const { code } = req.body;
  const ret = await validationService.getMailTokenData(code);

  if (isError(ret)) {
    res.send({ status: ApiStatus.FAILURE, message: ret.type });
    return;
  }
  const mail = ret.data;
  const existingUser = await userService.getUserByMail(mail);

  const user =
    isError(existingUser) && existingUser.type === 'User not found'
      ? await userService.createUserFromMail(mail)
      : existingUser;

  if (isError(existingUser) && existingUser.type !== 'User not found') {
    res.send({ status: ApiStatus.FAILURE, message: existingUser.type });
    return;
  }

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
      : monitoringService.logAndReturn(
          `user [${userId}] does not have any fitnessData stored. Returning {ftp: 200}`,
          200
        );

    const stravaData = user.data.stravaAuthentication
      ? {
          athleteId: user.data.stravaAuthentication.athleteId,
          scopes: {
            read: user.data.stravaAuthentication.readScope,
            activityWrite: user.data.stravaAuthentication.activityWriteScope,
          },
        }
      : null;

    res.send({
      status: ApiStatus.SUCCESS,
      data: {
        user_created: !isSuccess(existingUser),
        data: {
          userId,
          username,
          token,
          ftp,
          stravaData,
        },
      },
    });
    return;
  }

  res.send({
    status: ApiStatus.FAILURE,
    message: 'Something went wrong when authenticating user based on mail',
  });
  return;
});

export default router;
