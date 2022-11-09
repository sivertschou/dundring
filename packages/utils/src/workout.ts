import { Workout } from '@dundring/types';

export const getTotalWorkoutTime = (workout: Workout) =>
  workout.parts.reduce((sum, part) => sum + part.duration, 0);
