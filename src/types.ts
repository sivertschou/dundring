export interface DataPoint {
  heartRate?: number;
  power?: number;
  timeStamp: Date;
}

export interface Workout {
  name: string;
  parts: WorkoutPart[];
}

export interface WorkoutPart {
  duration: number;
  targetPower: number;
}

export interface WorkoutContextType {
  workout: Workout;
  partElapsedTime: number;
  activePart: number;
  isDone: boolean;
}
