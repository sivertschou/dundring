import { Status, Workout, WorkoutBase, WorkoutPart } from '@dundring/types';
import { isError, success, successMap } from '@dundring/utils';
import {
  SteadyWorkoutPart as PrismaSteadyWorkoutPart,
  Workout as PrismaWorkout,
} from '@prisma/client';
import * as db from '../db';

const fromPrismaWorkoutPart = (part: PrismaSteadyWorkoutPart): WorkoutPart => ({
  duration: part.duration,
  targetPower: part.power / 10,
  type: 'steady',
});

const fromPrismaWorkout = (
  workout: PrismaWorkout & { parts: PrismaSteadyWorkoutPart[] }
): Workout => ({
  name: workout.name,
  id: workout.id,
  parts: [...workout.parts]
    .sort((a, b) => a.index - b.index)
    .map(fromPrismaWorkoutPart),
});

const convertWorkoutPartPowerToInteger = (
  workoutPart: WorkoutPart
): WorkoutPart => ({
  ...workoutPart,
  targetPower: Math.floor(workoutPart.targetPower * 10),
});

const workoutPowerToInteger = (workout: WorkoutBase): WorkoutBase => ({
  ...workout,
  parts: workout.parts.map(convertWorkoutPartPowerToInteger),
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
    await db.upsertWorkout(userId, workoutPowerToInteger(workout), workoutId),
    fromPrismaWorkout
  );
};

export const deleteWorkout = async (
  workoutId: string
): Promise<Status<string, 'Something went wrong writing to database'>> => {
  return successMap(await db.deleteWorkout(workoutId), (x) => x);
};
