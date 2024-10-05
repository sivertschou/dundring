import {
  ApiResponseBody,
  ApiStatus,
  StravaAuthenticationRequestBody,
  AuthenticationResponseBody,
  Scopes,
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
  StravaAuthenticationRequestBody
>('/authenticate', async (req, res) => {
  const { code, scope } = req.body;
  const tokenData = await stravaService.getStravaTokenFromAuthCode(code);

  if (isError(tokenData)) {
    res.send({ status: ApiStatus.FAILURE, message: tokenData.type });
    return;
  }

  const stravaId = tokenData.data.athlete.id;

  const scopes = parseScopes(scope);

  await userService.updateRefreshTokenAndScopes({
    athleteId: stravaId,
    refreshToken: tokenData.data.refresh_token,
    scopes,
  });

  const existingUser = await userService.getUserByStravaId(stravaId);

  const user =
    isError(existingUser) && existingUser.type === 'User not found'
      ? await userService.createUserFromStrava({
          athleteId: stravaId,
          refreshToken: tokenData.data.refresh_token,
          scopes,
        })
      : existingUser;

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
  } else {
    await userService.createUserFromStrava({
      athleteId: tokenData.data.athlete.id,
      refreshToken: tokenData.data.refresh_token,
      scopes,
    });

    res.send({
      status: ApiStatus.FAILURE,
      message:
        'Something went wrong when authenticating user based on Strava session',
    });
  }
});

const parseScopes = (scopeString: string): Scopes => {
  const scopes = scopeString.split(',');
  const read = scopes.some((s) => s === 'read');
  const activityWrite = scopes.some((s) => s === 'activity:write');
  return { read, activityWrite };
};

export default router;
