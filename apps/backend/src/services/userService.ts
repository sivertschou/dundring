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
) => {
  const ret = await db.updateUser(userId, data);
  if (isSuccess(ret)) {
    slackService.log(
      `User *${ret.data.id}* updated profile ${
        data.username ? `username=*${data.username}* ` : ''
      }${data.ftp ? `ftp=*${data.ftp}*` : ''}`
    );
  }
  return ret;
};

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
    const athleteId = ret.data.stravaAuthentication?.athleteId;
    slackService.log(
      `New user: *${ret.data.id}* created with Strava: athlete id: https://strava.com/athletes/${athleteId}`
    );
  }
  return ret;
};

export const createUserFromMail = async (mail: string) => {
  const ret = await db.createMailUserWithRandomUsername(mail);
  if (isSuccess(ret)) {
    slackService.log(
      `New user: *${ret.data.id}* created with mail: ${ret.data.mailAuthentication?.mail}`
    );
  }
  return ret;
};

export const updateRefreshToken = async (data: {
  athleteId: number;
  refreshToken: string;
}) => {
  db.updateStravaRefreshToken(data);
};
