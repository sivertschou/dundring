import { AuthenticationType, Status } from '@dundring/types';

require('dotenv').config();
import * as db from '../db';
import { User } from '@dundring/database';
import { generateRandomString, isSuccess } from '@dundring/utils';
import { slackService } from '.';

export const getUser = async (opts: { id: string }) => db.getUser(opts);

export const getUserByUsername = async (username: string) =>
  db.getUser({ username });

export const getUserByMail = async (mail: string) => db.getUserByMail(mail);

export const getUserWorkoutsByUserId = async (userId: string) =>
  db.getUserWorkouts(userId);

export const updateUserFtp = async (userId: string, ftp: number) =>
  db.upsertFitnessData(userId, { ftp });

export const getUserFitnessData = async (userId: string) =>
  db.getFitnessData(userId);

export const createUser = async (
  authType: AuthenticationType
): Promise<
  Status<
    User,
    | 'Mail is already in use'
    | 'Username is already in use'
    | 'Something went wrong writing to database'
  >
> => {
  const ret = await db.createUser(authType);

  if (isSuccess(ret)) {
    slackService.logUserCreation(ret.data);
  }

  return ret;
};

export const getOrCreateUser = async (authType: AuthenticationType) => {
  return db.createUser(authType);
};

export const userExists = async (
  query: { username: string } | { mail: string }
) => db.userExists(query);

export const generateRandomTemporaryUsername = async () => {
  const BASE = 'dundrer#';
  const NUM_CHARACTERS = 4;
  const ATTEMPTS_PER_LENGTH = 10;
  const MAX_NUM_LENGTH_INCREASES = 3;

  for (let i = 0; i < MAX_NUM_LENGTH_INCREASES; i++) {
    for (let j = 0; j < ATTEMPTS_PER_LENGTH; j++) {
      const username = BASE + generateRandomString(NUM_CHARACTERS + i);
      if (!(await db.userExists({ username }))) {
        return username;
      }
    }
  }

  console.error('Could not generate an unused available username');
  throw new Error('Could not generate an unused available username');
};
