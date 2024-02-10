import {
  ApiResponseBody,
  ApiStatus,
  UpdateWorkoutResponseBody,
  UserUpdateRequestBody,
  WorkoutRequestBody,
  WorkoutsResponseBody,
} from '@dundring/types';
import { isError } from '@dundring/utils';
import * as express from 'express';
import { userService, validationService, workoutService } from '../../services';

const router = express.Router();

router.use('/me', router);

router.get<null, ApiResponseBody<WorkoutsResponseBody>>(
  '/workouts',
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
  '/workout',
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
  '/',
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

export default router;
