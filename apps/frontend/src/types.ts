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
}

export interface LoggedOutUser {
  loggedIn: false;
}

export type UserContextType = LoggedInUser | LoggedOutUser;

export interface EditableString {
  value: string;
  touched: boolean;
}
