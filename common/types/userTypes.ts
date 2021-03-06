import { Workout } from './workoutTypes';

export interface User {
  username: string;
  mail: string;
  roles: UserRole[];
  ftp: number;
}

export interface StoredUser {
  username: string;
  mail: string;
  roles: UserRole[];
  password: string;
  workouts: Workout[];
  salt: string;
  ftp: number;
}

export enum UserRole {
  DEFAULT = 'DEFAULT',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}
