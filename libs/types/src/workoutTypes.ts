export interface Workout {
  name: string;
  id: string;
  parts: WorkoutPart[];
  visible: boolean;
}

export interface WorkoutPart {
  duration: number;
  targetPower: number;
  type: 'steady';
}

export interface WorkoutBase {
  name: string;
  parts: WorkoutPart[];
}
