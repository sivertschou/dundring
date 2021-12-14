import { Workout } from './workoutTypes';

export interface User {
  username: string;
  mail: string;
  roles: UserRole[];
}

export interface StoredUser {
  username: string;
  mail: string;
  roles: UserRole[];
  password: string;
  workouts: Workout[];
  salt: string;
}

export enum UserRole {
  DEFAULT = 'DEFAULT',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}
