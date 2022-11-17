import { Request, Response } from 'express';
import { ApiResponseBody, ApiStatus, Status } from '@dundring/types';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { days } from '@dundring/utils';

const tokenSecret = process.env.TOKEN_SECRET || '12345';

export const hash = (message: string) => {
  return crypto.createHash('md5').update(message).digest('hex');
};

interface Mailtoken {
  timestamp: Date;
  mail: string;
}

const mailtokens: { [token: string]: Mailtoken } = {};

export const generateAccessToken = (user: UserPayload) => {
  return jwt.sign(user, tokenSecret, {
    expiresIn: '120d',
  });
};

export const generateMailToken = (mail: string) => {
  const token = crypto.randomUUID();
  mailtokens[token] = { mail, timestamp: new Date() };
  return token;
};

export const getMailTokenData = (
  token: string
): Status<Mailtoken, 'Token expired' | 'Token not found'> => {
  const data = mailtokens[token];
  if (!data) {
    return { status: 'ERROR', type: 'Token not found' };
  }

  if (Date.now() - data.timestamp.getTime() > days(1)) {
    return { status: 'ERROR', type: 'Token expired' };
  }

  return { status: 'SUCCESS', data };
};

export type AuthenticatedRequest<T> = {
  username: string;
  userId: string;
  jwtPayload: JwtExpPayload;
} & Request<T>;

interface UnauthenticatedRequest<T> extends Request<T> {
  username?: string;
  userId?: string;
  jwtPayload?: JwtExpPayload;
}

interface UserPayload {
  username: string;
  userId: string;
}
interface JwtExpPayload {
  expiresIn: string;
  exp: number;
}
export const authenticateToken = <Res, Req>(
  req: UnauthenticatedRequest<Req>,
  res: Response<ApiResponseBody<Res>>
): req is AuthenticatedRequest<Req> => {
  try {
    console.log('authenticateToken');
    console.log('req.header');

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('token:', token);

    if (!token) {
      console.log('no token provided');
      const statusMessage = 'No token provided.';
      res.statusMessage = statusMessage;
      res.statusCode = 401;
      res.send({
        status: ApiStatus.FAILURE,
        message: statusMessage,
      });
      return false;
    }

    const jwtPayload = jwt.decode(token) as JwtExpPayload;

    req.jwtPayload = jwtPayload;
    console.log('jwtPayload:', jwtPayload);

    const user = jwt.verify(token, tokenSecret) as UserPayload;
    console.log('user:', user);

    req.username = user.username;
    req.userId = user.userId;

    return true;
  } catch (error) {
    const statusMessage = 'Could not verify token.';
    res.statusMessage = statusMessage;
    res.statusCode = 401;
    res.send({
      status: ApiStatus.FAILURE,
      message: statusMessage,
    });
    return false;
  }
};
