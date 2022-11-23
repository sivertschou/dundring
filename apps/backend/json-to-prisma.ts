import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();

interface StoredUser {
  username: string;
  mail: string;
  workouts: Workout[];
  ftp: number;
}

interface Workout {
  name: string;
  id: string;
  parts: WorkoutPart[];
}

interface WorkoutPart {
  duration: number;
  targetPower: number;
  type: 'steady';
}

const dataPath = process.env.DATA_PATH || 'data';
const usersPath = `${dataPath}/users.json`;

const getUsers = (): StoredUser[] => {
  if (fs.existsSync(usersPath)) {
    const rawdata = fs.readFileSync(usersPath);
    return JSON.parse(rawdata.toString()) as StoredUser[];
  }

  return [];
};

export const createWorkout = async (userId: string, workout: Workout) => {
  const result = await prisma.workout.create({
    data: { name: workout.name, userId },
  });

  // Add all new parts
  await Promise.all(
    workout.parts.map(async (part, index) => {
      return await prisma.steadyWorkoutPart.create({
        data: {
          workoutId: result.id,
          index,
          duration: part.duration,
          power: Math.floor(part.targetPower * 10),
        },
      });
    })
  );

  const workoutResult = await prisma.workout.findUnique({
    where: { id: result.id },
    include: { parts: true },
  });

  if (!workoutResult) {
    throw new Error('Something went wrong when creating a workout');
  }
};

const createUser = async (user: StoredUser) => {
  const userResult = await prisma.user.create({
    data: {
      username: user.username,
      mail: user.mail,
      fitnessData: { create: { ftp: Math.floor(user.ftp) } },
    },
  });

  user.workouts.map(
    async (workout) => await createWorkout(userResult.id, workout)
  );
};

getUsers().map(createUser);
