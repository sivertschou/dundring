import { FeedbackRequestBody } from '@dundring/types';
import * as express from 'express';
import { monitoringService } from '../../services';
import { success } from '@dundring/utils';

const router = express.Router();

router.post<null, {}, FeedbackRequestBody>('/', (req, res) => {
  const { mail, message } = req.body;
  monitoringService.log(`*Feedback${mail ? ` from ${mail}` : ''}*\n${message}`);
  res.send(success({}));
});

export default router;
