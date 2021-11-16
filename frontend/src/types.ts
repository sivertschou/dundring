import { UserRole } from "../../common/types/userTypes";

export interface DataPoint {
  heartRate?: number;
  power?: number;
  timeStamp: Date;
}

export interface Workout {
  id?: string;
  name: string;
  parts: WorkoutPart[];
}

export interface WorkoutPart {
  duration: number;
  targetPower: number;
}

export interface ActiveWorkout {
  workout: Workout;
  partElapsedTime: number;
  activePart: number;
  isDone: boolean;
}

export interface LoggedInUser {
  loggedIn: true;
  token: string;
  username: string;
  roles: UserRole[];
  workouts: Workout[];
}

export interface LoggedOutUser {
  loggedIn: false;
}

export type UserContextType = LoggedInUser | LoggedOutUser;
