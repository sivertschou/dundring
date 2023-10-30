import { Status, UserBase, WorkoutBase } from '@dundring/types';
import { error, success } from '@dundring/utils';
import {
  FitnessData,
  PrismaClient,
  SteadyWorkoutPart,
  User,
  Workout,
} from '@prisma/client';
export const prisma = new PrismaClient();

export const getUserByUsername = async (
  username: string
): Promise<
  Status<
    User & { fitnessData: FitnessData | null },
    'User not found' | 'Something went wrong reading from database'
  >
> => {
  try {
    const result = await prisma.user.findUnique({
      where: { username },
      include: { fitnessData: true },
    });

    if (!result) {
      return error('User not found');
    }

    return success(result);
  } catch (e) {
    console.error('[db.getUserByUsername]', e);
    return error('Something went wrong reading from database');
  }
};

export const getUserByMail = async (
  mail: string
): Promise<
  Status<User, 'User not found' | 'Something went wrong reading from database'>
> => {
  try {
    const result = await prisma.user.findUnique({
      where: { mail },
    });

    if (!result) {
      return error('User not found');
    }

    return success(result);
  } catch (e) {
    console.error('[db.getUserByMail]', e);
    return error('Something went wrong reading from database');
  }
};

export const createUser = async (
  user: UserBase
): Promise<
  Status<
    User,
    | 'Username is already in use'
    | 'Mail is already in use'
    | 'Something went wrong writing to database'
  >
> => {
  try {
    const result = await prisma.user.create({
      data: {
        username: user.username,
        mail: user.mail,
        fitnessData: { create: { ftp: 200 } },
      },
    });

    return success(result);
  } catch (e) {
    // TODO: Figure out if it failed due to username or mail being in use
    console.error('[db.createUser]', e);
    return error('Something went wrong writing to database');
  }
};

export const getUserWorkouts = async (
  userId: string
): Promise<
  Status<
    (Workout & { parts: SteadyWorkoutPart[] })[],
    'Something went wrong while reading workouts from database'
  >
> => {
  try {
    const result = await prisma.workout.findMany({
      where: { userId },
      include: { parts: true },
    });

    return success(result);
  } catch (e) {
    console.error('[db.getUserWorkouts]', e);
    return error('Something went wrong while reading workouts from database');
  }
};

export const getWorkout = async (
  id: string
): Promise<
  Status<
    Workout & { parts: SteadyWorkoutPart[] },
    'Workout not found' | 'Something went wrong reading from database'
  >
> => {
  try {
    const result = await prisma.workout.findUnique({
      where: { id },
      include: { parts: true },
    });

    if (!result) {
      return error('Workout not found');
    }

    return success(result);
  } catch (e) {
    console.error('[db.getWorkout]', e);
    return error('Something went wrong reading from database');
  }
};

export const upsertFitnessData = async (
  userId: string,
  fitnessData: { ftp: number }
): Promise<
  Status<FitnessData, 'Something went wrong while writing to database'>
> => {
  try {
    const result = await prisma.fitnessData.upsert({
      create: { userId, ftp: fitnessData.ftp },
      update: { ftp: fitnessData.ftp },
      where: { userId },
    });

    return success(result);
  } catch (e) {
    console.error('[db.upsertFitnessData]:', e);
    return error('Something went wrong while writing to database');
  }
};

export const getFitnessData = async (
  userId: string
): Promise<
  Status<
    FitnessData,
    'Something went wrong while reading from database' | 'No data found'
  >
> => {
  try {
    const result = await prisma.fitnessData.findUnique({
      where: { userId },
    });

    if (!result) {
      return error('No data found');
    }

    return success(result);
  } catch (e) {
    console.error('[db.getFitnessData]', e);
    return error('Something went wrong while reading from database');
  }
};

export const upsertWorkout = async (
  userId: string,
  workout: WorkoutBase,
  workoutId?: string
): Promise<
  Status<
    Workout & { parts: SteadyWorkoutPart[] },
    'Something went wrong while upserting workout'
  >
> => {
  try {
    /* TODO: Fix this to first upsert the workout and its parts, and then delete the potentially unused workout parts. */
    const workoutInDB = await prisma.workout.findFirst({
      where: { id: workoutId },
    });
    if (!(workoutInDB?.userId === userId)) {
      return error('Something went wrong while upserting workout');
    }

    const result = await (workoutId
      ? prisma.workout.update({
          data: { name: workout.name },
          where: { id: workoutId },
        })
      : prisma.workout.create({ data: { name: workout.name, userId } }));

    // Delete all parts
    await prisma.steadyWorkoutPart.deleteMany({
      where: { workoutId: result.id },
    });

    // Add all new parts
    await Promise.all(
      workout.parts.map(async (part, index) => {
        return await prisma.steadyWorkoutPart.create({
          data: {
            workoutId: result.id,
            index,
            duration: part.duration,
            power: part.targetPower,
          },
        });
      })
    );

    const workoutResult = await prisma.workout.findUnique({
      where: { id: result.id },
      include: { parts: true },
    });

    if (!workoutResult) {
      return error('Something went wrong while upserting workout');
    }

    return success(workoutResult);
  } catch (e) {
    console.error('[db.upsertWorkout]', e);
    return error('Something went wrong while upserting workout');
  }
};
