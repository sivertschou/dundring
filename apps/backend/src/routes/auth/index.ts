import * as express from 'express';
import mailAuthRouter from './mail';
import stravaAuthRouter from './strava';
import tokenAuthRouter from './token';

const router = express.Router();

router.use('/mail', mailAuthRouter);
router.use('/strava', stravaAuthRouter);
router.use('/token', tokenAuthRouter);

export default router;
