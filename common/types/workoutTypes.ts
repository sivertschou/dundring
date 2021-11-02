export interface Workout {
  name: string;
  parts: WorkoutPart[];
}

export interface WorkoutPart {
  duration: number;
  targetPower: number;
}
