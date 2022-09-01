import * as messageService from './services/messageService';
import * as userService from './services/userService';
import * as groupSessionService from './services/groupSessionService';
import * as validationService from './services/validationService';
import * as slackService from './services/slackService';
import * as express from 'express';
import * as core from 'express-serve-static-core';
import fetch from 'node-fetch';
import {
  ApiResponseBody,
  ApiStatus,
  ImportWorkoutResponseBody,
  LoginRequestBody,
  LoginResponseBody,
  MessagesResponseBody,
  RegisterRequestBody,
  UserUpdateRequestBody,
  WorkoutRequestBody,
  WorkoutsResponseBody,
} from '../../common/types/apiTypes';
import { UserRole } from '../../common/types/userTypes';
import {
  WebSocketRequest,
  WebSocketRequestType,
} from '../../common/types/wsTypes';
import * as WebSocket from 'ws';
import cors from 'cors';
import http from 'http';
import { default as strava, Strava } from 'strava-v3';
import fs from 'fs';

require('dotenv').config();

//let codes = ""

// Create a new express app instance
const app = express.default();
const router = express.Router();

const httpPort = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

app.use('/api', router);

const httpServer = http.createServer(app);
const wss = new WebSocket.Server({ server: httpServer });

const tokens: Record<string, StravaTokenResponse> = {};

type StravaTokenResponse = {
  token_type: string;
  expires_at: string;
  expires_in: string;
  refresh_token: string;
  access_token: string;
};

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
  validationService.authenticateToken,
  (req: validationService.AuthenticatedRequest<null>, res) => {
    const workouts = userService.getUserWorkouts(req.username || '');
    res.send({
      status: ApiStatus.SUCCESS,
      data: { workouts },
    });
  }
);

router.post<WorkoutRequestBody, ApiResponseBody<WorkoutsResponseBody>>(
  '/me/workout',
  validationService.authenticateToken,
  (req: validationService.AuthenticatedRequest<WorkoutRequestBody>, res) => {
    const workout = req.body.workout;
    if (!req.username) {
      res.send({
        status: ApiStatus.FAILURE,
        message: 'Unathorized',
      });
      return;
    }

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
  validationService.authenticateToken,
  (req: validationService.AuthenticatedRequest<UserUpdateRequestBody>, res) => {
    if (!req.username) {
      res.send({
        status: ApiStatus.FAILURE,
        message: 'Unathorized',
      });
      return;
    }
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
  validationService.authenticateToken,
  async (req: validationService.AuthenticatedRequest<null>, res) => {
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

router.get<null, ApiResponseBody<MessagesResponseBody>>(
  '/messages',
  (req, res) => {
    const messages = messageService.getMessages();

    res.send({
      status: ApiStatus.SUCCESS,
      data: { messages },
    });
  }
);

const conf = {
  client_id: process.env.STRAVA_CLIENT_ID || 'NOO',
  client_secret: process.env.STRAVA_CLIENT_SECRET || 'NOO',
  redirect_uri: 'http://localhost:8092/api/strava/red',
};

console.log(conf);

router.get<null>('/strava/auth', (req, res) => {
  const url = `http://www.strava.com/oauth/authorize?client_id=${conf.client_id}&response_type=code&redirect_uri=${conf.redirect_uri}&approval_prompt=force&scope=read`;
  res.redirect(url);
});

router.get<null>('/strava/red', (req, res) => {
  const code = (req.query.code || 'noo') as string;

  const url = `https://www.strava.com/oauth/token`;

  console.log(':)))', {
    client_id: conf.client_id,
    client_secret: conf.client_secret,
    grant_type: 'authorization_code',
    code: code,
  });

  fetch(url, {
    method: 'POST',
    headers: {
      // "client_secret": conf.client_secret,
      // "grant_type": "authorization_code",
      // "code": code
    },
  })
    .then((resp) => {
      console.log(resp);
      return resp.json();
    })
    .then((json) => {
      tokens['token'] = json as StravaTokenResponse;
      console.log('added token : ', json);
      res.send({
        status: ApiStatus.SUCCESS,
        data: json,
      });
    });
});

router.get<null>('/strava/upload', (req, res) => {
  const file = fs.readFileSync('data/mak.tcx');
  console.log(file);

  strava.uploads
    .post({
      data_type: 'tcx',
      file: 'data/mak.tcx' as unknown as Buffer,
      name: 'Epic times',
      external_id: 'external',
    })
    .then((w) => {
      console.log(w);
      res.send({
        status: ApiStatus.SUCCESS,
        data: {},
      });
    });
});

router.post<null, ApiResponseBody<LoginResponseBody>, LoginRequestBody>(
  '/login',
  async (req, res) => {
    const { username, password } = req.body;

    if (userService.validateUser(username, password)) {
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
    }

    res.statusMessage = 'Invalid username or password.';
    res.statusCode = 401;
    res.send({
      status: ApiStatus.FAILURE,
      message: 'Invalid username or password',
    });
  }
);

router.post<null, ApiResponseBody<LoginResponseBody>, RegisterRequestBody>(
  '/register',
  async (req, res) => {
    const { username, password, mail } = req.body;

    const salt = validationService.generateSalt();

    const hashedPassword = validationService.hash(salt + password);

    const ret = userService.createUser({
      username: username,
      mail: mail,
      password: hashedPassword,
      salt,
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
          statusMessage = 'User already exists';
          statusCode = 400;
          break;
        case 'Mail is already in use':
          statusMessage = 'Mail is already in use';
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

    if (userService.validateUser(username, password)) {
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
    }

    res.statusMessage = 'Invalid username or password.';
    res.statusCode = 401;
    res.send({
      status: ApiStatus.FAILURE,
      message: 'Invalid username or password',
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

console.log('HEIHEI');
