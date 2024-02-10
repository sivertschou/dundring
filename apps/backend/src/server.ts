import { mailService, slackService, workoutService } from './services';
import * as express from 'express';
import * as core from 'express-serve-static-core';
import {
  ApiResponseBody,
  ApiStatus,
  GetWorkoutResponseBody,
} from '@dundring/types';
import * as WebSocket from 'ws';
import cors from 'cors';
import http from 'http';
import { initRedis } from './redis';
import { initWebsockets } from './websocket';
import router from './routes';

require('dotenv').config();

// Create a new express app instance
const app = express.default();

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
