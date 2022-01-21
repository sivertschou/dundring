import { NextFunction, Request, Response } from 'express';
import { ApiResponseBody, ApiStatus } from '../../../common/types/apiTypes';
import * as core from 'express-serve-static-core';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const tokenSecret = process.env.TOKEN_SECRET || '12345';

export const hash = (message: string) => {
  return crypto.createHash('md5').update(message).digest('hex');
};

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
export interface AuthenticatedRequest<T = core.ParamsDictionary>
  extends Request<T> {
  username?: string;
}
export const authenticateToken = <T, R>(
  req: AuthenticatedRequest<T>,
  res: Response<ApiResponseBody<R>>,
  next: NextFunction
) => {
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
    return;
  }

  jwt.verify(token, tokenSecret, (err: Error, user: { username: string }) => {
    if (err) {
      const statusMessage = 'Could not verify token.';
      res.statusMessage = statusMessage;
      res.statusCode = 401;
      res.send({
        status: ApiStatus.FAILURE,
        message: statusMessage,
      });
      return;
    }
    req.username = user.username;
    next();
  });
};
