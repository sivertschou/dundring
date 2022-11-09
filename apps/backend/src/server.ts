import * as messageService from './services/messageService';
import * as userService from './services/userService';
import * as groupSessionService from './services/groupSessionService';
import * as validationService from './services/validationService';
import * as slackService from './services/slackService';
import * as mailService from './services/mailService';
import * as express from 'express';
import * as core from 'express-serve-static-core';
import {
  ApiResponseBody,
  ApiStatus,
  ImportWorkoutResponseBody,
  LoginResponseBody,
  MessagesResponseBody,
  UserUpdateRequestBody,
  WorkoutRequestBody,
  WorkoutsResponseBody,
  UserRole,
  WebSocketRequest,
  WebSocketRequestType,
  MailLoginRequestBody,
  MailAuthenticationRequestBody,
  MailAuthenticationResponseBody,
  MailAuthenticationRegisterRequestBody,
} from '@dundring/types';
import * as WebSocket from 'ws';
import cors from 'cors';
import http from 'http';

require('dotenv').config();

// Create a new express app instance
const app = express.default();
const router = express.Router();

const httpPort = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

app.use('/api', router);

const httpServer = http.createServer(app);
const wss = new WebSocket.Server({ server: httpServer });

const checkEnvConfig = () => {
  if (!process.env.PORT) {
    console.log(
      '[.env]: No port provided; using 8080. Override this by setting the PORT in the environment config.'
    );
  }

  if (!process.env.DATA_PATH) {
    console.log(
      '[.env]: No path for the data directory provided; using ./data/. Override this by setting the DATA_PATH in the environment config.'
    );
  }

  if (!process.env.TOKEN_SECRET) {
    console.log(
      '[.env]: No token secret provided; using 12345. Override this by setting the TOKEN_SECRET in the environment config.'
    );
  }

  slackService.checkSlackConfig();
  mailService.checkMailConfig();
};

checkEnvConfig();

router.get<core.ParamsDictionary, ApiResponseBody<ImportWorkoutResponseBody>>(
  '/:username/workouts/:workoutId',
  (req, res) => {
    const username = req.params['username'];
    const workoutId = req.params['workoutId'];
    const response = userService.importWorkout(username, workoutId);

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
  (req, res) => {
    if (!validationService.authenticateToken(req, res)) return;

    const workouts = userService.getUserWorkouts(req.username);
    res.send({
      status: ApiStatus.SUCCESS,
      data: { workouts },
    });
  }
);

router.post<WorkoutRequestBody, ApiResponseBody<WorkoutsResponseBody>>(
  '/me/workout',
  (req, res) => {
    if (!validationService.authenticateToken(req, res)) return;
    const workout = req.body.workout;

    const ret = userService.saveWorkout(req.username, workout);

    switch (ret.status) {
      case 'SUCCESS':
        res.send({
          status: ApiStatus.SUCCESS,
          data: { workouts: ret.data },
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
  (req, res) => {
    if (!validationService.authenticateToken(req, res)) return;

    const { ftp } = req.body;

    const ret = userService.updateUserFtp(req.username, ftp);

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

    const username = req.username;
    const user = userService.getUser(username || '');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!user) {
      return;
    }

    const { roles, ftp } = user;
    res.send({
      status: ApiStatus.SUCCESS,
      data: { roles, ftp, token: token || '', username: user.username },
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

  const mailTokenRet = validationService.getMailTokenData(ticket);

  if (mailTokenRet.status === 'ERROR') {
    res.send({ status: ApiStatus.FAILURE, message: mailTokenRet.type });
    return;
  }

  const ret = userService.createUser({
    username: username,
    mail: mailTokenRet.data.mail,
    password: '',
    salt: '',
    roles: [UserRole.DEFAULT],
    workouts: [],
    ftp: 250,
  });

  if (ret.status === 'ERROR') {
    const message = ret.type;
    let statusMessage = 'Something went wrong.';
    let statusCode = 500;
    switch (message) {
      case 'User already exists':
        statusMessage = 'A user with that username already exists.';
        statusCode = 400;
        break;
      case 'Mail is already in use':
        statusMessage = 'The e-mail address is already in use.';
        statusCode = 400;
        break;
      case 'File not found':
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

  const token = validationService.generateAccessToken(username);
  const user = userService.getUser(username);
  if (user) {
    const { roles, ftp } = user;
    res.send({
      status: ApiStatus.SUCCESS,
      data: {
        username,
        token,
        roles,
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
  const ret = validationService.getMailTokenData(ticket);

  if (ret.status === 'ERROR') {
    res.send({ status: ApiStatus.FAILURE, message: ret.type });
    return;
  }
  const data = ret.data;
  const user = userService.getUserByMail(data.mail);
  if (!user) {
    res.send({
      status: ApiStatus.SUCCESS,
      data: { type: 'user_does_not_exist', mail: data.mail },
    });
    return;
  }
  const username = user.username;

  const token = validationService.generateAccessToken(username);
  const { roles, ftp } = user;

  res.send({
    status: ApiStatus.SUCCESS,
    data: {
      type: 'user_exists',
      data: {
        username,
        token,
        roles,
        ftp,
      },
    },
  });
  return;
});

router.get<null, ApiResponseBody<MessagesResponseBody>>(
  '/messages',
  (_req, res) => {
    const messages = messageService.getMessages();

    res.send({
      status: ApiStatus.SUCCESS,
      data: { messages },
    });
  }
);

// TODO: figure out why a connect is triggered several times.
//       This is probably due to some fishy rerender.
wss.on('connection', (ws) => {
  console.log('connection');
  let username = '';
  ws.on('message', (rawData) => {
    const req = JSON.parse(rawData.toString()) as WebSocketRequest;
    switch (req.type) {
      case WebSocketRequestType.createGroupSession: {
        const { member } = req;
        username = member.username;
        ws.send(
          JSON.stringify(
            groupSessionService.createRoom({ ...member, socket: ws })
          )
        );
        break;
      }
      case WebSocketRequestType.joinGroupSession: {
        const { roomId, member } = req;
        username = member.username;

        groupSessionService.joinRoom(ws, roomId, {
          ...member,
          socket: ws,
        });
        break;
      }
      case WebSocketRequestType.leaveGroupSession: {
        const { username } = req;
        groupSessionService.leaveRoom(username);
        break;
      }
      case WebSocketRequestType.sendData: {
        if (!username) {
          console.log('unknown tried to share workoutdata');
          return;
        }
        groupSessionService.sendWorkoutDataToRoom(username, req.data);
        break;
      }
    }
  });
  ws.on('close', () => {
    console.log('connection closed', username);
    if (username) {
      groupSessionService.leaveRoom(username);
      username = '';
    }
  });
});

httpServer.listen(httpPort, () => {
  console.log(`App is listening on port ${httpPort}!:)`);
});
