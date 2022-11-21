import { Status, UserBase } from '@dundring/types';

require('dotenv').config();
import * as db from '../db';
import { User } from '@prisma/client';
import { isSuccess } from '@dundring/utils';
import { slackService } from '.';

export const getUser = async (username: string) =>
  db.getUserByUsername(username);

export const getUserByMail = async (mail: string) => db.getUserByMail(mail);

export const getUserWorkoutsByUserId = async (userId: string) =>
  db.getUserWorkouts(userId);

export const updateUserFtp = async (userId: string, ftp: number) =>
  db.upsertFitnessData(userId, { ftp });

export const getUserFitnessData = async (userId: string) =>
  db.getFitnessData(userId);

export const createUser = async (
  user: UserBase
): Promise<
  Status<
    User,
    | 'Mail is already in use'
    | 'Username is already in use'
    | 'Something went wrong writing to database'
  >
> => {
  const ret = await db.createUser(user);

  if (isSuccess(ret)) {
    slackService.logUserCreation(ret.data);
  }

  return ret;
};
