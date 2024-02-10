import * as express from 'express';
import mailAuthRouter from './mail';
import tokenAuthRouter from './token';

const router = express.Router();

router.use('/mail', mailAuthRouter);
router.use('/token', tokenAuthRouter);

export default router;
