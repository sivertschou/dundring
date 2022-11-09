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
  workouts: Workout[];
  ftp: number;
}

export enum UserRole {
  DEFAULT = 'DEFAULT',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}
