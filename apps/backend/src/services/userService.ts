import { StoredUser, UserRole, Status, Workout } from '@dundring/types';
import {} from '@dundring/types';
require('dotenv').config();
import * as fs from 'fs';
import * as validationService from './validationService';
import * as slackService from './slackService';
import { generateRandomString } from './groupSessionService';

const dataPath = process.env.DATA_PATH || 'data';
const usersPath = `${dataPath}/users.json`;

export const getUsers = (): StoredUser[] => {
  if (fs.existsSync(usersPath)) {
    const rawdata = fs.readFileSync(usersPath);
    return JSON.parse(rawdata.toString()) as StoredUser[];
  }

  return [];
};

export const getUser = (username: string): StoredUser | null =>
  getUsers().find((user) => user.username === username) || null;

export const getUserByMail = (mail: string): StoredUser | null =>
  getUsers().find((user) => user.mail === mail) || null;

export const validateUser = (username: string, password: string): boolean => {
  const user = getUser(username);
  if (!user) return false;

  const hashedPassword = validationService.hash(user.salt + password);

  return user?.password === hashedPassword;
};

export const getUserRoles = (username: string): UserRole[] => {
  const user = getUser(username);
  return user ? user.roles : [];
};

export const getUserWorkouts = (username: string): Workout[] => {
  const user = getUser(username);
  return user ? user.workouts : [];
};

export const updateUserFtp = (
  username: string,
  ftp: number
): Status<StoredUser, 'File not found' | 'User not found'> => {
  const user = getUser(username);

  if (!user) {
    return { status: 'ERROR', type: 'User not found' };
  }

  return setUser({ ...user, ftp });
};

export const importWorkout = (
  workoutOwnerUsername: string,
  workoutId: string
): Status<
  Workout,
  'User not found' | 'File not found' | 'Workout not found'
> => {
  const user = getUser(workoutOwnerUsername);
  if (!user) return { status: 'ERROR', type: 'User not found' };

  const workout = user.workouts.find((w) => w.id == workoutId);
  if (!workout) return { status: 'ERROR', type: 'Workout not found' };
  return { status: 'SUCCESS', data: workout };
};

const getNewWorkoutId = (workouts: Workout[]) => {
  const defaultLength = 5;
  const numRetriesPerLength = 20;
  const numLengthIncreases = 5;

  for (let i = 0; i < numLengthIncreases; i++) {
    for (let j = 0; j < numRetriesPerLength; j++) {
      const id = generateRandomString(defaultLength + i);
      if (!workouts.find((w) => w.id === id)) {
        return id;
      }
    }
  }

  return null;
};

const updateWorkoutOrAppendIfNotFound = (
  workouts: Workout[],
  workout: Workout
): Status<Workout[], 'Could not generate available id'> => {
  const workoutExists = workouts.find((w) => w.id === workout.id);
  if (workoutExists) {
    return {
      status: 'SUCCESS',
      data: [...workouts.map((w) => (w.id === workout.id ? workout : w))],
    };
  } else {
    const newId = getNewWorkoutId(workouts);
    if (newId === null)
      return { status: 'ERROR', type: 'Could not generate available id' };

    return {
      status: 'SUCCESS',
      data: [...workouts, { ...workout, id: newId }],
    };
  }
};

export const saveWorkout = (
  username: string,
  workout: Workout
): Status<
  Workout[],
  'User not found' | 'File not found' | 'Could not generate available id'
> => {
  const user = getUser(username);
  if (!user) {
    return { status: 'ERROR', type: 'User not found' };
  }
  const workouts = user.workouts;
  const updatedWorkouts = updateWorkoutOrAppendIfNotFound(workouts, workout);
  if (updatedWorkouts.status === 'ERROR') return updatedWorkouts;

  const ret = setUser({
    ...user,
    workouts: updatedWorkouts.data,
  });

  if (ret.status === 'ERROR') {
    return ret;
  } else {
    return { status: 'SUCCESS', data: workouts };
  }
};

export const createUser = (
  user: StoredUser
): Status<
  StoredUser,
  'User already exists' | 'Mail is already in use' | 'File not found'
> => {
  if (getUser(user.username)) {
    return { status: 'ERROR', type: 'User already exists' };
  }

  if (getUserByMail(user.mail)) {
    return { status: 'ERROR', type: 'Mail is already in use' };
  }

  if (fs.existsSync(usersPath)) {
    const rawdata = fs.readFileSync(usersPath);
    const parsedData = JSON.parse(rawdata.toString()) as StoredUser[];

    fs.writeFileSync(usersPath, JSON.stringify([...parsedData, user]));
    slackService.logUserCreation(user);

    return { status: 'SUCCESS', data: user };
  } else {
    console.error('File not found', usersPath);
    return { status: 'ERROR', type: 'File not found' };
  }
};

export const setUser = (
  updatedUser: StoredUser
): Status<StoredUser, 'File not found'> => {
  if (fs.existsSync(usersPath)) {
    const rawdata = fs.readFileSync(usersPath);
    const parsedData = JSON.parse(rawdata.toString()) as StoredUser[];

    const updatedUsers = parsedData.map((user) =>
      user.username === updatedUser.username ? updatedUser : user
    );

    fs.writeFileSync(usersPath, JSON.stringify([...updatedUsers]));
    return { status: 'SUCCESS', data: updatedUser };
  } else {
    console.error('File not found', usersPath);
    return { status: 'ERROR', type: 'File not found' };
  }
};
