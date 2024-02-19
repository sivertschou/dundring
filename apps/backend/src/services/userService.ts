import { UserBase, UserCreationStrava } from '@dundring/types';

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

export const createUserFromStrava = async (body: UserCreationStrava) =>
  db.createStravaUserWithRandomUsername(body);

export const createUserFromMail = async (mail: string) =>
  db.createMailUserWithRandomUsername(mail);
