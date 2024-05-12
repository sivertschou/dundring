import { Status, UserCreationStrava, WorkoutBase } from '@dundring/types';
import {
  error,
  generateRandomString,
  isSuccess,
  retry,
  success,
} from '@dundring/utils';
import * as Prisma from '@dundring/database';
export const prismaClient = new Prisma.PrismaClient();

export const getUser = async (
  query: { username: string } | { id: string }
): Promise<
  Status<
    Prisma.User & {
      fitnessData: Prisma.FitnessData | null;
      stravaAuthentication: Prisma.StravaAuthentication | null;
      mailAuthentication: Prisma.MailAuthentication | null;
    },
    'User not found' | 'Something went wrong reading from database'
  >
> => {
  try {
    const result = await prismaClient.user.findUnique({
      where: query,
      include: {
        fitnessData: true,
        stravaAuthentication: true,
        mailAuthentication: true,
      },
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

export const updateUser = async (
  userId: string,
  data: { username?: string; ftp?: number }
): Promise<
  Status<
    Prisma.User & { fitnessData: Prisma.FitnessData | null },
    | 'User not found'
    | 'Username is already taken'
    | 'Something went wrong writing to database'
  >
> => {
  try {
    const result = await prismaClient.user.update({
      where: { id: userId },
      data: {
        username: data.username,
        fitnessData: {
          update: { data: { ftp: data.ftp } },
        },
      },
      include: { fitnessData: true },
    });

    if (!result) {
      return error('User not found');
    }

    return success(result);
  } catch (e) {
    console.error('[db.updateUser]', e);
    // if (e instanceof PrismaClientKnownRequestError) {
    //   if (e.code === 'P2002') {
    //     return error('Username is already taken');
    //   }
    // }
    return error('Something went wrong writing to database');
  }
};

export const getUserByMail = async (
  mail: string
): Promise<
  Status<
    Prisma.User & {
      stravaAuthentication: Prisma.StravaAuthentication | null;
      mailAuthentication: Prisma.MailAuthentication | null;
    },
    'User not found' | 'Something went wrong reading from database'
  >
> => {
  try {
    const result = await prismaClient.mailAuthentication.findUnique({
      where: { mail },
      select: {
        user: {
          include: { stravaAuthentication: true, mailAuthentication: true },
        },
      },
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

export const getUserByStravaId = async (
  athleteId: number
): Promise<
  Status<
    Prisma.User & {
      stravaAuthentication: Prisma.StravaAuthentication | null;
      mailAuthentication: Prisma.MailAuthentication | null;
    },
    'User not found' | 'Something went wrong reading from database'
  >
> => {
  try {
    const result = await prismaClient.stravaAuthentication.findUnique({
      where: { athleteId },
      select: {
        user: {
          include: { stravaAuthentication: true, mailAuthentication: true },
        },
      },
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

const createUserFromMail = async (
  mail: string,
  username: string
): Promise<
  Status<
    Prisma.User & {
      mailAuthentication: Prisma.MailAuthentication | null;
      stravaAuthentication: Prisma.StravaAuthentication | null;
    },
    | 'MailAuthentication not included in data'
    | 'Could not create user from mail'
  >
> => {
  const result = await prismaClient.user.create({
    data: {
      username: username,
      fitnessData: { create: { ftp: 200 } },
      mailAuthentication: {
        create: {
          mail: mail,
        },
      },
    },
    select: {
      id: true,
      username: true,
      mailAuthentication: true,
      stravaAuthentication: true,
    },
  });

  if (!result.mailAuthentication)
    return error('MailAuthentication not included in data');

  if (result) {
    return success(result);
  }

  return error('Could not create user from mail');
};
const createUserFromStrava = async (
  body: UserCreationStrava,
  username: string
): Promise<
  Status<
    Prisma.User & { stravaAuthentication: Prisma.StravaAuthentication | null },
    | 'StravaAuthentication not included in data'
    | 'Could not create user from Strava id'
  >
> => {
  const result = await prismaClient.user.create({
    data: {
      username: username,
      fitnessData: { create: { ftp: 200 } },
      stravaAuthentication: {
        create: {
          athleteId: body.athleteId,
          refreshToken: body.refreshToken,
          readScope: true,
        },
      },
    },
    select: {
      id: true,
      username: true,
      stravaAuthentication: true,
    },
  });

  if (!result.stravaAuthentication)
    return error('StravaAuthentication not included in data');

  if (result) {
    return success(result);
  }

  return error('Could not create user from Strava id');
};

export const createStravaUserWithRandomUsername = async (
  body: UserCreationStrava
) =>
  retry(async () => {
    const ret = await createUserFromStrava(
      body,
      `dundrer#${generateRandomString(4)}`
    );
    if (isSuccess(ret)) return ret;

    return error('Could not create user based on Strava id');
  }, 5);

export const createMailUserWithRandomUsername = async (mail: string) =>
  retry(async () => {
    const ret = await createUserFromMail(
      mail,
      `dundrer#${generateRandomString(4)}`
    );
    if (isSuccess(ret)) return ret;

    return error('Could not create user based on mail');
  }, 5);

export const getUserWorkouts = async (
  userId: string
): Promise<
  Status<
    (Prisma.Workout & { parts: Prisma.SteadyWorkoutPart[] })[],
    'Something went wrong while reading workouts from database'
  >
> => {
  try {
    const result = await prismaClient.workout.findMany({
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
    Prisma.Workout & { parts: Prisma.SteadyWorkoutPart[] },
    'Workout not found' | 'Something went wrong reading from database'
  >
> => {
  try {
    const result = await prismaClient.workout.findUnique({
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
  Status<Prisma.FitnessData, 'Something went wrong while writing to database'>
> => {
  try {
    const result = await prismaClient.fitnessData.upsert({
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
    Prisma.FitnessData,
    'Something went wrong while reading from database' | 'No data found'
  >
> => {
  try {
    const result = await prismaClient.fitnessData.findUnique({
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

export const deleteWorkout = async (
  userId: string,
  workoutId: string
): Promise<Status<{}, 'Something went wrong while deleting workout'>> => {
  console.debug(`[db.deleteWorkout] user ${userId} tries to delete workout`);
  try {
    const result = await prismaClient.workout.delete({
      where: { id: workoutId, userId },
    });

    if (!result) {
      console.error('[db.deleteWorkout]');
      return error('Something went wrong while deleting workout');
    }
    return success({});
  } catch (e) {
    console.error('[db.deleteWorkout]', e);
    return error('Something went wrong while deleting workout');
  }
};

export const upsertWorkout = async (
  userId: string,
  workout: WorkoutBase,
  workoutId?: string
): Promise<
  Status<
    Prisma.Workout & { parts: Prisma.SteadyWorkoutPart[] },
    'Something went wrong while upserting workout'
  >
> => {
  console.debug(`[db.upsertWorkout] user ${userId} tries to upsert workout`);
  try {
    /* TODO: Fix this to first upsert the workout and its parts, and then delete the potentially unused workout parts. */
    const workoutInDB = await prismaClient.workout.findFirst({
      where: { id: workoutId },
    });
    if (workoutInDB && workoutInDB.userId !== userId) {
      console.debug(
        `[db.upsertWorkout]: User tries to update workout not owned by themselves. User id ${userId} – user id on workout: ${workoutInDB?.userId}.`
      );
      return error('Something went wrong while upserting workout');
    }

    const result = await (workoutId
      ? prismaClient.workout.update({
          data: { name: workout.name },
          where: { id: workoutId },
        })
      : prismaClient.workout.create({ data: { name: workout.name, userId } }));

    // Delete all parts
    await prismaClient.steadyWorkoutPart.deleteMany({
      where: { workoutId: result.id },
    });

    // Add all new parts
    await Promise.all(
      workout.parts.map(async (part, index) => {
        return await prismaClient.steadyWorkoutPart.create({
          data: {
            workoutId: result.id,
            index,
            duration: part.duration,
            power: part.targetPower,
          },
        });
      })
    );

    const workoutResult = await prismaClient.workout.findUnique({
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

export const updateStravaRefreshToken = async (data: {
  athleteId: number;
  refreshToken: string;
}): Promise<
  Status<
    Prisma.StravaAuthentication,
    'Something went wrong while writing to database'
  >
> => {
  try {
    const result = await prismaClient.stravaAuthentication.update({
      data: { refreshToken: data.refreshToken },
      where: { athleteId: data.athleteId },
    });

    return success(result);
  } catch (e) {
    console.error('[db.updateStravaRefreshToken]:', e);
    return error('Something went wrong while writing to database');
  }
};
