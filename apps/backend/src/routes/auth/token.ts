import { ApiResponseBody, ApiStatus, LoginResponseBody } from '@dundring/types';
import { isError } from '@dundring/utils';
import * as express from 'express';
import { userService, validationService } from '../../services';

const router = express.Router();

router.post<null, ApiResponseBody<LoginResponseBody>>(
  '/validate',
  async (req, res) => {
    if (!validationService.authenticateToken(req, res)) return;

    const { username, userId } = req;

    const user = await userService.getUser({ username });
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (isError(user)) {
      return;
    }

    const athleteId = user.data.stravaAuthentication?.athleteId ?? null;

    res.send({
      status: ApiStatus.SUCCESS,
      data: {
        ftp: user.data.fitnessData?.ftp || 200,
        token: token || '',
        username,
        userId,
        stravaData: athleteId ? { athleteId } : null,
      },
    });
    return;
  }
);

export default router;
