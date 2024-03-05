import { FeedbackRequestBody } from '@dundring/types';
import * as express from 'express';
import { slackService } from '../../services';
import { success } from '@dundring/utils';

const router = express.Router();

router.post<null, {}, FeedbackRequestBody>('/', (req, res) => {
  const { mail, message } = req.body;
  slackService.log(`*Feedback${mail ? ` from ${mail}` : ''}*\n${message}`);
  res.send(success({}));
});

export default router;
