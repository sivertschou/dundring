export interface Workout {
  name: string;
  id: string;
  parts: WorkoutPart[];
}

export type WorkoutPartType = 'steady' | 'interval';

export type WorkoutPart = SteadyWorkoutPart | IntervalWorkoutPart;

export interface SteadyWorkoutPart {
  duration: number;
  targetPower: number;
  type: 'steady';
}

export interface IntervalWorkoutPart {
  onDuration: number;
  onTargetPower: number;
  offDuration: number;
  offTargetPower: number;
  repeats: number;
  type: 'interval';
}

export interface WorkoutBase {
  name: string;
  parts: WorkoutPart[];
}
