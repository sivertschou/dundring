import {
  ApiResponseBody,
  LoginResponseBody,
  ApiStatus,
  MailLoginRequestBody,
} from '@dundring/types';
import { isError, isSuccess } from '@dundring/utils';
import * as express from 'express';
import { userExists } from '../../db';
import { validationService, userService, mailService } from '../../services';

const router = express.Router();
router.get('/health', (req, res) => res.send({ mail: 'healthy' }));

// router.get<null, ApiResponseBody<LoginResponseBody>>(
//   '/token',
//   async (req, res) => {
//     if (!validationService.authenticateToken(req, res)) return;
//
//     const { username, userId } = req;
//
//     const user = await userService.getUserByUsername(username || '');
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
//
//     if (isError(user)) {
//       return;
//     }
//
//     res.send({
//       status: ApiStatus.SUCCESS,
//       data: {
//         ftp: user.data.fitnessData?.ftp || 200,
//         token: token || '',
//         username,
//         userId,
//       },
//     });
//     return;
//   }
// );

router.post<null, ApiResponseBody<string>, MailLoginRequestBody>(
  '/login',
  async (req, res) => {
    const { mail } = req.body;

    const ret = await mailService.sendLoginOrRegisterMail(mail);

    switch (ret.status) {
      case 'SUCCESS':
        res.send({ status: ApiStatus.SUCCESS, data: ret.data });
        return;
      case 'ERROR':
        res.send({ status: ApiStatus.FAILURE, message: ret.type });
        return;
    }
  }
);

router.get<{ ticket: string }, ApiResponseBody<LoginResponseBody>>(
  '/token',
  async (req, res) => {
    const { ticket } = req.params;

    const mailTokenRet = await validationService.getMailTokenData(ticket);

    if (isError(mailTokenRet)) {
      res.send({ status: ApiStatus.FAILURE, message: mailTokenRet.type });
      return;
    }

    if (await userService.userExists({ mail: mailTokenRet.data })) {
      // Create new user
    }

    const ret = await userService.createUser({
      type: 'mail',
      mail: mailTokenRet.data,
    });

    if (isError(ret)) {
      const message = ret.type;
      let statusMessage = 'Something went wrong.';
      let statusCode = 500;
      switch (message) {
        case 'Username is already in use':
          statusMessage = 'The username is already in use.';
          statusCode = 400;
          break;
        case 'Mail is already in use':
          statusMessage = 'The e-mail address is already in use.';
          statusCode = 400;
          break;
        default:
          break;
      }
      res.statusMessage = statusMessage;
      res.statusCode = statusCode;
      res.send({
        status: ApiStatus.FAILURE,
        message: statusMessage,
      });
      return;
    }

    const token = validationService.generateAccessToken({
      id: ret.data.id,
    });
    const [user, fitnessData] = await Promise.all([
      userService.getUser({ id: ret.data.id }),
      userService.getUserFitnessData(ret.data.id),
    ]);

    if (isSuccess(user) && isSuccess(fitnessData)) {
      const { ftp } = fitnessData.data;
      res.send({
        status: ApiStatus.SUCCESS,
        data: {
          userId: user.data.id,
          username: user.data.username,
          token,
          ftp,
        },
      });
      return;
    }

    res.statusMessage = 'Something went wrong. Try again later.';
    res.statusCode = 401;
    res.send({
      status: ApiStatus.FAILURE,
      message: 'Something went wrong. Try again later.',
    });
  }
);

// router.post<
//   null,
//   ApiResponseBody<MailAuthenticationResponseBody>,
//   MailAuthenticationRequestBody
// >('/auth/mail', async (req, res) => {
//   const { ticket } = req.body;
//   const ret = await validationService.getMailTokenData(ticket);
//
//   if (isError(ret)) {
//     res.send({ status: ApiStatus.FAILURE, message: ret.type });
//     return;
//   }
//   const user = await userService.getUserByMail(ret.data);
//   if (isSuccess(user)) {
//     const username = user.data.username;
//     const userId = user.data.id;
//
//     const token = validationService.generateAccessToken({
//       id: userId,
//     });
//     const fitnessData = await userService.getUserFitnessData(userId);
//     const ftp = isSuccess(fitnessData)
//       ? fitnessData.data.ftp
//       : slackService.logAndReturn(
//           `user [${userId}] does not have any fitnessData stored. Returning {ftp: 200}`,
//           200
//         );
//
//     res.send({
//       status: ApiStatus.SUCCESS,
//       data: {
//         type: 'user_exists',
//         data: {
//           userId,
//           username,
//           token,
//           ftp,
//         },
//       },
//     });
//     return;
//   }
//
//   res.send({
//     status: ApiStatus.SUCCESS,
//     data: { type: 'user_does_not_exist', mail: ret.data },
//   });
//   return;
// });
export default router;
