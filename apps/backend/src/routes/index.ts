import * as express from 'express';
import authRouter from './auth';
import meRouter from './me';
import workoutsRouter from './workouts';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/me', meRouter);
router.use('/workouts', workoutsRouter);

export default router;
