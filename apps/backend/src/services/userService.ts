import { UserCreationStrava } from '@dundring/types';

require('dotenv').config();
import * as db from '../db';
import { isSuccess } from '@dundring/utils';
import { slackService } from '.';

export const getUser = async (query: { username: string } | { id: string }) =>
  db.getUser(query);

export const updateUser = async (
  userId: string,
  data: { username?: string; ftp?: number }
) => db.updateUser(userId, data);

export const getUserByMail = async (mail: string) => db.getUserByMail(mail);
export const getUserByStravaId = async (athleteId: number) =>
  db.getUserByStravaId(athleteId);

export const getUserWorkoutsByUserId = async (userId: string) =>
  db.getUserWorkouts(userId);

export const updateUserFtp = async (userId: string, ftp: number) =>
  db.upsertFitnessData(userId, { ftp });

export const getUserFitnessData = async (userId: string) =>
  db.getFitnessData(userId);

export const createUserFromStrava = async (body: UserCreationStrava) => {
  const ret = await db.createStravaUserWithRandomUsername(body);
  if (isSuccess(ret)) {
    slackService.log(
      `New user: *${ret.data.username}* created with Strava (athlete id: ${ret.data.stravaAuthentication?.athleteId})`
    );
  }
  return ret;
};

export const createUserFromMail = async (mail: string) => {
  const ret = await db.createMailUserWithRandomUsername(mail);
  if (isSuccess(ret)) {
    slackService.log(
      `New user: *${ret.data.username}* created with mail: ${ret.data.mailAuthentication?.mail}`
    );
  }
  return ret;
};
