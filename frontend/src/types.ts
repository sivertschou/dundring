import { UserRole } from '../../common/types/userTypes';

export interface Lap {
  dataPoints: DataPoint[];
}
export interface DataPoint {
  heartRate?: number;
  power?: number;
  cadence?: number;
  timeStamp: Date;
}

export interface Workout {
  id: string;
  name: string;
  parts: WorkoutPart[];
}

export interface WorkoutPart {
  duration: number;
  targetPower: number;
}

export interface ActiveWorkout {
  workout: Workout | null;
  partElapsedTime: number;
  activePart: number;
  isDone: boolean;
  isActive: boolean;
}

export interface LoggedInUser {
  loggedIn: true;
  token: string;
  username: string;
  roles: UserRole[];
  workouts: Workout[];
  ftp: number;
}

export interface LoggedOutUser {
  loggedIn: false;
}

export type UserContextType = LoggedInUser | LoggedOutUser;
