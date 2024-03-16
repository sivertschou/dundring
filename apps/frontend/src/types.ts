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
  visible: boolean;
}

export type WorkoutType = 'local' | 'remote' | 'new' | 'library';

export type StoredWorkoutType = Exclude<WorkoutType, 'new'>;

export interface WorkoutPart {
  duration: number;
  targetPower: number;
  type: 'steady';
}

export interface ActiveWorkout {
  workout: Workout | null;
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
