import * as core from 'express-serve-static-core';
import {
  ApiResponseBody,
  ApiStatus,
  GetWorkoutResponseBody,
} from '@dundring/types';
import * as express from 'express';
import { workoutService } from '../../services';

const router = express.Router();

router.get<core.ParamsDictionary, ApiResponseBody<GetWorkoutResponseBody>>(
  '/:workoutId',
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

export default router;
