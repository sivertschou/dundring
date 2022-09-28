export interface Workout {
  name: string;
  id: string;
  parts: WorkoutPart[];
}

export interface WorkoutPart {
  duration: number;
  targetPower: number;
}
