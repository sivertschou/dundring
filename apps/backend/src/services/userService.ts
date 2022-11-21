import {
  Status,
  Workout,
  WorkoutBase,
  UserBase,
  isError,
  success,
  successMap,
  WorkoutPart,
  isSuccess,
} from '@dundring/types';

import {
  SteadyWorkoutPart as PrismaSteadyWorkoutPart,
  Workout as PrismaWorkout,
} from '@prisma/client';
import {} from '@dundring/types';
require('dotenv').config();
import * as slackService from './slackService';
import * as db from '../db';
import { PrismaClient, SteadyWorkoutPart, User } from '@prisma/client';

export const getUser = async (username: string) =>
  db.getUserByUsername(username);

export const getUserByMail = async (mail: string) => db.getUserByMail(mail);

export const getUserWorkoutsByUserId = async (userId: string) =>
  db.getUserWorkouts(userId);

export const updateUserFtp = async (userId: string, ftp: number) =>
  db.upsertFitnessData(userId, { ftp });

export const getUserFitnessData = async (userId: string) =>
  db.getFitnessData(userId);

export const fromPrismaWorkoutPart = (
  part: PrismaSteadyWorkoutPart
): WorkoutPart => ({
  duration: part.duration,
  targetPower: part.power,
  type: 'steady',
});

export const fromPrismaWorkout = (
  workout: PrismaWorkout & { parts: PrismaSteadyWorkoutPart[] }
): Workout => ({
  name: workout.name,
  id: workout.id,
  parts: [...workout.parts]
    .sort((a, b) => a.index - b.index)
    .map(fromPrismaWorkoutPart),
});

export const getWorkout = async (
  workoutId: string
): Promise<
  Status<
    Workout,
    'Workout not found' | 'Something went wrong reading from database'
  >
> => {
  const workoutResult = await db.getWorkout(workoutId);

  if (isError(workoutResult)) {
    return workoutResult;
  }

  return success(fromPrismaWorkout(workoutResult.data));
};

export const getUserWorkouts = async (
  userId: string
): Promise<
  Status<Workout[], 'Something went wrong while reading workouts from database'>
> => {
  const workoutResult = await db.getUserWorkouts(userId);

  if (isError(workoutResult)) {
    return workoutResult;
  }

  return success(workoutResult.data.map(fromPrismaWorkout));
};

export const upsertWorkout = async (
  userId: string,
  workout: WorkoutBase,
  workoutId?: string
): Promise<Status<Workout, 'Something went wrong while upserting workout'>> => {
  return successMap(
    await db.upsertWorkout(userId, workout, workoutId),
    fromPrismaWorkout
  );
};

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
  // TODO: Do this check when trying to add the user to the database
  // if (await getUser(user.username)) {
  //   return { status: 'ERROR', type: 'User already exists' };
  // }

  // if (await getUserByMail(user.mail)) {
  //   return { status: 'ERROR', type: 'Mail is already in use' };
  // }

  const ret = await db.createUser(user);

  if (isSuccess(ret)) {
    slackService.logUserCreation(ret.data);
  }

  return ret;
};
