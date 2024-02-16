import {UserBase} from '@dundring/types';

require('dotenv').config();
import * as db from '../db';
import {isSuccess} from '@dundring/utils';
import {slackService} from '.';

export const getUser = async (query: {username: string} | {id: string}) =>
	db.getUser(query);

export const getUserByMail = async (mail: string) => db.getUserByMail(mail);

export const getUserWorkoutsByUserId = async (userId: string) =>
	db.getUserWorkouts(userId);

export const updateUserFtp = async (userId: string, ftp: number) =>
	db.upsertFitnessData(userId, {ftp});

export const getUserFitnessData = async (userId: string) =>
	db.getFitnessData(userId);

export const createUser = async (user: UserBase) => {
	const ret = await db.createUser(user);

	if (isSuccess(ret)) {
		slackService.logUserCreation({username: user.username, mail: user.mail});
	}

	return ret;
};
