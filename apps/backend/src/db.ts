import { Status, UserBase, WorkoutBase } from '@dundring/types';
import { error, success } from '@dundring/utils';
import {
  FitnessData,
  MailAuthentication,
  PrismaClient,
  SteadyWorkoutPart,
  User,
  Workout,
} from '@dundring/database';
export const prisma = new PrismaClient();

export const getUser = async (
  query: { username: string } | { id: string }
): Promise<
  Status<
    User & { fitnessData: FitnessData | null },
    'User not found' | 'Something went wrong reading from database'
  >
> => {
  try {
    const result = await prisma.user.findUnique({
      where: query,
      include: { fitnessData: true },
    });

    if (!result) {
      return error('User not found');
    }

    return success(result);
  } catch (e) {
    console.error('[db.getUser]', e);
    return error('Something went wrong reading from database');
  }
};

export const getUserByMail = async (
  mail: string
): Promise<
  Status<User, 'User not found' | 'Something went wrong reading from database'>
> => {
  try {
    const result = await prisma.mailAuthentication.findUnique({
      where: { mail },
      select: { user: true },
    });

    if (!result) {
      return error('User not found');
    }

    return success(result.user);
  } catch (e) {
    console.error('[db.getUserByMail]', e);
    return error('Something went wrong reading from database');
  }
};

export const createUser = async (
  user: UserBase
): Promise<
  Status<
    User & { mailAuthentication: MailAuthentication | null },
    | 'Username is already in use'
    | 'Mail is already in use'
    | 'Something went wrong writing to database'
  >
> => {
  try {
    const result = await prisma.user.create({
      data: {
        username: user.username,
        fitnessData: { create: { ftp: 200 } },
        mailAuthentication: {
          create: {
            mail: user.mail,
          },
        },
      },
      select: {
        id: true,
        username: true,
        mailAuthentication: true,
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
  console.debug(`[db.upsertWorkout] user ${userId} tries to upsert workout`);
  try {
    /* TODO: Fix this to first upsert the workout and its parts, and then delete the potentially unused workout parts. */
    const workoutInDB = await prisma.workout.findFirst({
      where: { id: workoutId },
    });
    if (workoutInDB && workoutInDB.userId !== userId) {
      console.debug(
        `[db.upsertWorkout]: User tries to update workout not owned by themselves. User id ${userId} – user id on workout: ${workoutInDB?.userId}.`
      );
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
