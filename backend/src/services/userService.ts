import { StoredUser, UserRole } from '../../../common/types/userTypes';
import { Status } from '../../../common/types/serviceTypes';
require('dotenv').config();
import * as fs from 'fs';
import { Workout } from '../../../common/types/workoutTypes';
import * as validationService from './validationService';
import * as slackService from './slackService';

const usersPath = `${process.env.DATA_PATH}/users.json`;

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

const updateWorkoutOrAppendIfNotFound = (
  workouts: Workout[],
  workout: Workout
) => {
  const workoutExists = workouts.find((w) => w.id === workout.id);
  if (workoutExists) {
    return [...workouts.map((w) => (w.id === workout.id ? workout : w))];
  } else {
    const newId = `${workouts.length + 1}`;
    return [...workouts, { ...workout, id: newId }];
  }
};

export const saveWorkout = (
  username: string,
  workout: Workout
): Status<Workout[], 'User not found' | 'File not found'> => {
  const user = getUser(username);
  if (!user) {
    return { status: 'ERROR', type: 'User not found' };
  }
  const workouts = user.workouts;
  const newId = `${workouts.length + 1}`;

  const ret = workout.id
    ? setUser({
        ...user,
        workouts: updateWorkoutOrAppendIfNotFound(workouts, workout),
      })
    : setUser({
        ...user,
        workouts: [...workouts, { ...workout, id: newId }],
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
