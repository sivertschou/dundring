import {
  ApiResponseBody,
  ApiStatus,
  AuthenticationRequestBody,
  AuthenticationResponseBody,
} from '@dundring/types';
import { isError, isSuccess } from '@dundring/utils';
import * as express from 'express';
import {
  slackService,
  stravaService,
  userService,
  validationService,
} from '../../services';

const router = express.Router();

router.post<
  null,
  ApiResponseBody<AuthenticationResponseBody>,
  AuthenticationRequestBody
>('/authenticate', async (req, res) => {
  const { code } = req.body;
  const tokenData = await stravaService.getStravaTokenFromAuthCode(code);

  if (isError(tokenData)) {
    res.send({ status: ApiStatus.FAILURE, message: tokenData.type });
    return;
  }

  const stravaId = tokenData.data.athlete.id;

  const existingUser = await userService.getUserByStravaId(stravaId);

  const updateRefreshTokenAndGiveExistingUser = async () => {
    await stravaService.updateRefreshToken({
      athleteId: stravaId,
      refreshToken: tokenData.data.refresh_token,
    });
    return existingUser;
  };

  const user =
    isError(existingUser) && existingUser.type === 'User not found'
      ? await userService.createUserFromStrava({
          athleteId: stravaId,
          refreshToken: tokenData.data.refresh_token,
          scopes: [],
        })
      : await updateRefreshTokenAndGiveExistingUser();

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
          200
        );

    const athleteId = user.data.stravaAuthentication?.athleteId ?? null;

    res.send({
      status: ApiStatus.SUCCESS,
      data: {
        user_created: !isSuccess(existingUser),
        data: {
          userId,
          username,
          token,
          ftp,
          stravaData: athleteId ? { athleteId } : null,
        },
      },
    });
    return;
  }

  await userService.createUserFromStrava({
    athleteId: tokenData.data.athlete.id,
    refreshToken: tokenData.data.refresh_token,
    scopes: [],
  });

  res.send({
    status: ApiStatus.FAILURE,
    message:
      'Something went wrong when authenticating user based on Strava session',
  });
});

export default router;
