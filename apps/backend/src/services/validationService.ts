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

export const generateSalt = () =>
  new Array(10)
    .fill(0)
    .map((_) => Math.floor(Math.random() * 10))
    .join('');

export const generateAccessToken = (username: string) => {
  return jwt.sign({ username }, tokenSecret, {
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
  jwtPayload: JwtExpPayload;
} & Request<T>;

interface UnauthenticatedRequest<T> extends Request<T> {
  username?: string;
  jwtPayload?: JwtExpPayload;
}

interface UserPayload {
  username: string;
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
    const jwtPayload = jwt.decode(
      req.header('authorization')!
    ) as JwtExpPayload;

    req.jwtPayload = jwtPayload;

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      const statusMessage = 'No token provided.';
      res.statusMessage = statusMessage;
      res.statusCode = 401;
      res.send({
        status: ApiStatus.FAILURE,
        message: statusMessage,
      });
      return false;
    }

    const user = jwt.verify(token, tokenSecret) as UserPayload;

    req.username = user.username;

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
