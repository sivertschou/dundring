import { Workout } from '@dundring/types';
import { getPowerToSpeedMap } from './speed';

export const getTotalWorkoutTime = (workout: Workout) =>
  workout.parts.reduce((sum, part) => sum + part.duration, 0);

export const getTotalWorkoutPartsTime = (workout: Workout) =>
  workout.parts.reduce((sum, part) => sum + part.duration, 0);

export const getTotalWorkoutDistance = (workout: Workout, ftp: number) => {
  const powerToSpeed = getPowerToSpeedMap(80);
  return (
    workout.parts
      .map(
        ({ duration, targetPower }) =>
          duration * powerToSpeed[Math.round((targetPower * ftp) / 100)]
      )
      .reduce((prev, cur) => prev + cur, 0) / 1000
  );
};
