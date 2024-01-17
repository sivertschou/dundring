import * as express from 'express';
import mailAuthRouter from './mail';

const router = express.Router();

router.use('/mail', mailAuthRouter);

export default router;
