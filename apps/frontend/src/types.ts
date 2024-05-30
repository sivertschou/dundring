import * as types from '@dundring/types';

export interface Lap {
  dataPoints: DataPoint[];
  distance: number;
}
export interface DataPoint {
  heartRate?: number;
  power?: number;
  cadence?: number;
  timeStamp: Date;
  position?: Waypoint;
}

export interface Waypoint {
  lat: number;
  lon: number;
  distance: number;
}

export interface Workout {
  id: string;
  name: string;
  parts: WorkoutPart[];
}

export type WorkoutType = 'local' | 'remote' | 'new' | 'library';

export type StoredWorkoutType = Exclude<WorkoutType, 'new'>;

export type WorkoutPart = types.WorkoutPart;

export type WorkoutPartBase = {
  duration: number;
  targetPower: number;
  partIndex: number;
  index: number;
  part: types.SteadyWorkoutPart | ExtendedIntervalWorkoutPart;
};

export type ExtendedIntervalWorkoutPart = types.IntervalWorkoutPart & {
  repeatNumber: number;
  internalIndex: number;
};

export type WorkoutWithParts = Workout & { baseParts: WorkoutPartBase[] };

export interface ActiveWorkout {
  workout: WorkoutWithParts | null;
  partElapsedTime: number;
  activePart: number;
  status: 'not_started' | 'paused' | 'active' | 'finished';
}

export interface LoggedInUser {
  loggedIn: true;
  token: string;
  username: string;
  workouts: Workout[];
  ftp: number;
  stravaData: { athleteId: number } | null;
}

export interface LoggedOutUser {
  loggedIn: false;
}

export type UserContextType = LoggedInUser | LoggedOutUser;

export interface Editable<T> {
  touched: boolean;
  data: T;
  error?: string;
}
