import {
  mailService,
  slackService,
  userService,
  validationService,
  workoutService,
} from './services';
import * as express from 'express';
import * as core from 'express-serve-static-core';
import {
  ApiResponseBody,
  ApiStatus,
  LoginResponseBody,
  UserUpdateRequestBody,
  WorkoutRequestBody,
  WorkoutsResponseBody,
  MailLoginRequestBody,
  MailAuthenticationRequestBody,
  MailAuthenticationResponseBody,
  MailAuthenticationRegisterRequestBody,
  UpdateWorkoutResponseBody,
  GetWorkoutResponseBody,
} from '@dundring/types';
import * as WebSocket from 'ws';
import cors from 'cors';
import http from 'http';
import { isError, isSuccess } from '@dundring/utils';
import { initRedis } from './redis';
import { initWebsockets } from './websocket';

require('dotenv').config();

// Create a new express app instance
const app = express.default();
const router = express.Router();

const httpPort = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

app.use('/api', router);

const httpServer = http.createServer(app);
const wss = new WebSocket.Server({ server: httpServer, path: '/api' });

const checkEnvConfig = () => {
  if (!process.env.PORT) {
    console.log(
      '[.env]: No port provided; using 8080. Override this by setting the PORT in the environment config.'
    );
  }

  if (!process.env.TOKEN_SECRET) {
    console.log(
      '[.env]: No token secret provided; using 12345. Override this by setting the TOKEN_SECRET in the environment config.'
    );
  }

  if (!process.env.REDIS_URL) {
    console.log(
      '[.env]: No Redis URL provided; using `redis://127.0.0.1:6380`:. Override this by setting the PORT in the environment config.'
    );
  }

  slackService.checkSlackConfig();
  mailService.checkMailConfig();
};

checkEnvConfig();

router.get<core.ParamsDictionary, ApiResponseBody<GetWorkoutResponseBody>>(
  '/workouts/:workoutId',
  async (req, res) => {
    const workoutId = req.params['workoutId'];
    const response = await workoutService.getWorkout(workoutId);

    switch (response.status) {
      case 'SUCCESS':
        res.send({
          status: ApiStatus.SUCCESS,
          data: { workout: response.data },
        });
        return;
      default:
        res.send({
          status: ApiStatus.FAILURE,
          message: response.type,
        });
        return;
    }
  }
);

router.get<null, ApiResponseBody<WorkoutsResponseBody>>(
  '/me/workouts',
  async (req, res) => {
    if (!validationService.authenticateToken(req, res)) return;

    const workouts = await workoutService.getUserWorkouts(req.userId);

    if (isError(workouts)) {
      res.send({ status: ApiStatus.FAILURE, message: workouts.type });
      return;
    }

    res.send({
      status: ApiStatus.SUCCESS,
      data: { workouts: workouts.data },
    });
  }
);

router.post<WorkoutRequestBody, ApiResponseBody<UpdateWorkoutResponseBody>>(
  '/me/workout',
  async (req, res) => {
    if (!validationService.authenticateToken(req, res)) return;

    const workout = req.body.workout;

    const ret = await workoutService.upsertWorkout(
      req.userId,
      workout,
      workout.id
    );

    switch (ret.status) {
      case 'SUCCESS':
        res.send({
          status: ApiStatus.SUCCESS,
          data: { workout: ret.data },
        });
        return;
      default:
        res.send({
          status: ApiStatus.FAILURE,
          message: ret.type,
        });
        return;
    }
  }
);

router.post<UserUpdateRequestBody, ApiResponseBody<UserUpdateRequestBody>>(
  '/me',
  async (req, res) => {
    if (!validationService.authenticateToken(req, res)) return;

    const { ftp } = req.body;

    const ret = await userService.updateUserFtp(req.userId, ftp);

    switch (ret.status) {
      case 'SUCCESS':
        res.send({
          status: ApiStatus.SUCCESS,
          data: { ftp },
        });
        return;
      default:
        res.send({
          status: ApiStatus.FAILURE,
          message: ret.type,
        });
        return;
    }
  }
);

router.post<null, ApiResponseBody<LoginResponseBody>>(
  '/validate',
  async (req, res) => {
    if (!validationService.authenticateToken(req, res)) return;

    const { username, userId } = req;

    const user = await userService.getUser(username || '');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (isError(user)) {
      return;
    }

    res.send({
      status: ApiStatus.SUCCESS,
      data: {
        ftp: user.data.fitnessData?.ftp || 200,
        token: token || '',
        username,
        userId,
      },
    });
    return;
  }
);

router.post<null, ApiResponseBody<string>, MailLoginRequestBody>(
  '/login/mail',
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
  ApiResponseBody<LoginResponseBody>,
  MailAuthenticationRegisterRequestBody
>('/register/mail', async (req, res) => {
  const { username, ticket } = req.body;

  const mailTokenRet = await validationService.getMailTokenData(ticket);

  if (isError(mailTokenRet)) {
    res.send({ status: ApiStatus.FAILURE, message: mailTokenRet.type });
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
    userService.getUser(username),
    userService.getUserFitnessData(ret.data.id),
  ]);

  if (isSuccess(user) && isSuccess(fitnessData)) {
    const { ftp } = fitnessData.data;
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
>('/auth/mail', async (req, res) => {
  const { ticket } = req.body;
  const ret = await validationService.getMailTokenData(ticket);

  if (isError(ret)) {
    res.send({ status: ApiStatus.FAILURE, message: ret.type });
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
          200
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
    data: { type: 'user_does_not_exist', mail: ret.data },
  });
  return;
});

router.get<null, {}>('/health', (_req, res) => {
  res.send({
    status: 'ok',
    info: {
      pod: process.env.POD,
      version: process.env.TAG,
    },
  });
});

initWebsockets(wss);
initRedis();

// TODO: figure out why a connect is triggered several times.
//       This is probably due to some fishy rerender.

httpServer.listen(httpPort, () => {
  console.log(`App is listening on port ${httpPort}!:)`);
});
